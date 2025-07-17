export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const NoPriority = 0; // 没有优先级
export const ImmediatePriority = 1; // 必须立即执行，会同步执行。
export const UserBlockingPriority = 2; // 用户交互相关的任务，如点击事件，必须在短时间内完成。
export const NormalPriority = 3; //  默认优先级，不需要立即响应的任务
export const LowPriority = 4; // 可以被推迟的任务。
export const IdlePriority = 5; // 只有在浏览器空闲时才执行的任务。
