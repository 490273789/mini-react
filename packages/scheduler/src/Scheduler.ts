import { getCurrentTime, isObject } from "shared/utils";
import {
  PriorityLevel,
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  NoPriority,
} from "./SchedulerPriorities";
import { peek, pop, push } from "./SchedulerMinHeap";

type Callback = any;

export type Task = {
  id: number;
  callback: Callback | null;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
};

const maxSigned31BitInt = 1073741823;
// Times out immediately
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

/** 任务队列（最小堆）
 * 存储待执行的任务。任务按 expirationTime（过期时间）排序，过期时间越早，优先级越高。
 */
const taskQueue: Array<Task> = []; // 没有延迟的任务
/**
 * 存储延迟执行的任务。任务按 startTime（开始时间）排序。
 * 当任务到达 startTime 时，会从 timerQueue 移到 taskQueue 中。
 */
const timerQueue: Array<Task> = []; // 有延迟的任务

/** 任务id - 自增 */
let taskIdCounter = 1;

/** 当前执行的任务 */
let currentTask: Task | null = null;
/** 当前执行任务的优先级 */
let currentPriorityLevel: PriorityLevel = NoPriority;

/** 时间切片的起始值 */
let startTime = -1;

/** 时间切片的大小 */
let frameInterval = 5;

/** 锁  是否有work在执行 */
let isPerformingWork = false;

/** 主线程是否正在调度 */
let isHostCallbackScheduled = false;

/** 是否在工作循环中 */
let isMessageLoopRunning = false;

// 在计时
let isHostTimeoutScheduled: boolean = false;

let taskTimeoutID: number = -1;

function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

function requestHostTimeout(callback: Callback, ms: number) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

/**
 * 如果当前时间切片的执行时间超出的时间切片大小，则应该让出时间片
 * @returns 是否应该让出时间片
 */
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) {
    return false;
  }
  return true;
}

/**
 * 外部 API，用于安排一个新任务。
 * 1. 该方法会创建一个新的任务对象，包括回调函数、优先级、开始时间（任务被加入队列的时间）、过期时间（根据优先级计算的截止时间）等。
 * 2. 将任务推入任务队列（最小堆）。
 * @param priorityLevel 任务优先级
 * @param callback 任务回调
 * @param options 任务选项
 */
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  options?: { delay?: number }
) {
  const currentTime = getCurrentTime();
  let startTime: number;

  if (isObject(options) && options !== null) {
    let delay = options?.delay;
    if (typeof delay === "number" && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  let timeout: number;

  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  const expirationTime = startTime + timeout;
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // 有延迟的任务
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
}

/**
 * 请求一个时间片以开始处理任务队列。
 * 通过requestHostCallback（内部使用MessageChannel或setTimeout）来启动调度循环，
 * 在循环中执行任务，直到任务完成或时间用完。
 */
function requestHostCallback(callback: Callback) {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

/**
 * 工作循环的入口。
 * 由宏任务触发，保证了在当前事件循环添加的任务能在下一个事件循环中执行，而不是来一个任务执行一个任务，会导致频繁的更新
 * 1. 定义一个时间切片（本次work）的起始时间
 */
function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    // 一个work的起始时间，也就是一个时间切片的起始时间
    startTime = currentTime;
    let hasMoreWork: boolean | undefined = true;
    try {
      hasMoreWork = flushWork(currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }
}

function flushWork(initialTime: number) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  // 使用闭包缓存当前任务的优先级
  let previousPriorityLevel = currentPriorityLevel;
  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

/**
 * 会根据环境选择最佳的宏任务调度方式：setImmediate > MessageChannel > setTimeout。
 * 这确保了任务回调 performWorkUntilDeadline 能在当前事件循环结束后尽快执行。
 */
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

/**
 * 由于我是使用的是优先队列，所以不能从队列中删除任务，所以先将task 的callback置为null，当执行到这个任务的时候在，进行处理
 */
function cancelCallback() {
  currentTask && (currentTask.callback = null);
}

/** 获取当前任务的优先级 */
function getCurrentPriorityLevel(): PriorityLevel {
  return currentPriorityLevel;
}

// 检查timerQueue中的任务，是否有任务到期了呢，到期了就把当前有效任务移动到taskQueue
function advanceTimers(currentTime: number) {
  let timer: Task = peek(timerQueue) as Task;
  while (timer !== null) {
    if (timer.callback === null) {
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue) as Task;
  }
}

// 倒计时到点了
function handleTimeout(currentTime: number) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer: Task = peek(timerQueue) as Task;
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

/**
 * 开启任务循环,内部循环，负责执行任务队列中的任务
 * @param initialTime
 * @returns
 */
function workLoop(initialTime: number) {
  let currentTime = initialTime;
  currentTask = peek(taskQueue);
  while (currentTask !== null) {
    // 1.有更高优先级的浏览器任务
    // 2.当前帧的分配时间（默认为 5ms）已用完
    // 3. currentTask.expirationTime > currentTime 任务未过期
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      // 当前任务还没有过期，并且没有剩余时间了
      break;
    }

    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true;
      } else {
        // 如果任务还在堆顶了，清除任务，不再堆顶则会通过下一个else清除
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      // 无效任务
      pop(taskQueue);
    }
    currentTask = peek(taskQueue) as Task;
  }

  // 判断还有没有其他的任务
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue) as Task;
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

export {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  scheduleCallback,
  cancelCallback,
  getCurrentPriorityLevel,
  shouldYieldToHost,
};
