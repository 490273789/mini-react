import { updaterQueue, flushUpdateQueue } from "./Component";
/**
 * 添加事件监听入口
 * @param {*} dom
 * @param {*} eventName
 * @param {*} bindFunction
 * @returns
 */
export function addEvent(dom, eventName, bindFunction) {
  dom.attach = dom.attach ?? {};
  // 将事件函数绑定到dom的attach对象上
  dom.attach[eventName] = bindFunction;
  // 事件代理，在document上添加事件监听
  if (document[eventName]) return;
  document[eventName] = dispatchEvent;
}

/**
 * 事件分发
 * @param {*} nativeEvent
 */
function dispatchEvent(nativeEvent) {
  // debugger;
  // 开启批量更新
  updaterQueue.isBatch = true;
  // 创建合成事件对象
  let syntheticEvent = createSyntheticEvent(nativeEvent);
  // 获取事件源开始冒泡
  let target = nativeEvent.target;
  while (target) {
    let eventName = `on${nativeEvent.type}`;
    let bindFunction = target.attach && target.attach[eventName];
    bindFunction && bindFunction(syntheticEvent);
    if (nativeEvent.isPropagationStopped) break;
    target = target.parentNode;
  }
  flushUpdateQueue();
}

/**
 * 创建合成事件对象
 * @param {*} nativeEvent
 * @returns
 */
function createSyntheticEvent(nativeEvent) {
  let nativeEventKeyValues = {};
  for (let key in nativeEvent) {
    nativeEventKeyValues[key] =
      typeof nativeEvent[key] === "function"
        ? nativeEvent[key].bind(nativeEvent)
        : nativeEvent[key];
  }

  let syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false,
    isPropagationStopped: false,
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagation = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });

  return syntheticEvent;
}
