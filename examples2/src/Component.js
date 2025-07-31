import { findDomByVNode, updateDomTree } from "./react-dom";

export let updaterQueue = {
  isBatch: false,
  updaters: new Set(),
};

export function flushUpdateQueue() {
  updaterQueue.isBatch = false;
  for (let updater of updaterQueue.updaters) {
    updater.launchUpdate();
  }
  updaterQueue.updaters.clear();
}

class Updater {
  constructor(ClassComponentInstance) {
    this.ClassComponentInstance = ClassComponentInstance;
    this.pendingStates = [];
  }

  addState(partialState) {
    this.pendingStates.push(partialState);
    this.preHandleForUpdate();
  }

  /**
   * 判断是否需要批量更新
   * 如果是批量更新，则将当前的updater添加到队列中
   * 如果不是批量更新，则直接执行更新
   * @returns {void}
   */
  preHandleForUpdate() {
    if (updaterQueue.isBatch) {
      updaterQueue.updaters.add(this);
    } else {
      this.launchUpdate();
    }
  }

  /**
   * 开始更新
   * @returns {void}
   */
  launchUpdate() {
    const { ClassComponentInstance, pendingStates } = this;
    if (pendingStates.length === 0) return;
    ClassComponentInstance.state = this.pendingStates.reduce(
      (preState, newState) => {
        return { ...preState, ...newState };
      },
      ClassComponentInstance.state
    );
    this.pendingStates.length = 0;
    ClassComponentInstance.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true;
  constructor(props) {
    this.updater = new Updater(this);
    this.state = {};
    this.props = props;
  }

  /**
   * 1. 合并属性
   * 2. 重新渲染进行更新
   * @param {*} partialState
   */
  setState(partialState) {
    this.updater.addState(partialState);
  }

  /**
   * 1. 获取重新执行render函数后的虚拟DOM
   * 2. 根据新的虚拟DOM生成真实DOM
   * 3. 将真实DOM挂在在页面上
   */
  update() {
    let oldVNode = this.oldVNode;
    let oldDom = findDomByVNode(oldVNode);
    let newVNode = this.render();
    updateDomTree(oldDom, newVNode);
    this.oldVNode = newVNode;
  }
}
