import { REACT_ELEMENT, REACT_FORWARD_REF } from "./constants";
import { addEvent } from "./event";

function render(VNode, containerDOM) {
  // 虚拟DOM转化为真实DOM
  // 将得到的DOM挂在到containerDOM中
  // debugger;
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  let newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  // 1. 创建元素；2. 处理子元素；3. 处理属性值
  const { type, props, ref } = VNode;
  let dom;
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }
  if (
    typeof type === "function" &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.IS_CLASS_COMPONENT
  ) {
    return getDomByClassComponent(VNode);
  }
  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }
  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === "string") {
      dom.appendChild(document.createTextNode(props.children));
    }
  }
  setPropsForDOM(dom, props);
  ref && (ref.current = dom);
  VNode.dom = dom;
  return dom;
}

function setPropsForDOM(dom, VNodeProps) {
  if (!dom) return;
  for (let key in VNodeProps) {
    if (key === "children") continue;
    if (/^on[A-Z].*/.test(key)) {
      addEvent(dom, key.toLowerCase(), VNodeProps[key]);
    } else if (key === "style") {
      Object.keys(VNodeProps[key]).forEach((styleName) => {
        dom.style[styleName] = VNodeProps[key][styleName];
      });
    } else {
      dom[key] = VNodeProps[key];
    }
  }
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      mount(children[i], parent);
    }
  }
}

/**
 * 处理forWardRef
 * @param {*} VNode
 * @returns
 */
function getDomByForwardRefFunction(VNode) {
  const { type, props, ref } = VNode;
  let renderVNode = type.render(props, ref);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}
/**
 * 处理函数组件
 * 先获取虚拟DOM，再将虚拟DOM转化为真实DOM
 * @param {*} VNode
 * @returns
 */
function getDomByFunctionComponent(VNode) {
  const { type, props } = VNode;
  let renderVNode = type(props);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

/**
 * 处理类组件
 * 1、获取类组件实例
 * 2、执行render函数获取虚拟DOM
 * 3、绑定oldVNode
 * 4、将虚拟DOM转化为真实DOM
 * @param {*} VNode
 * @returns
 */
function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  const instance = new type(props);
  ref && (ref.current = instance);
  let renderVNode = instance.render();
  instance.oldVNode = renderVNode;
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldDom, newVNode) {
  let parentNode = oldDom.parentNode;
  parentNode.removeChild(oldDom);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDom = { render };
export default ReactDom;
