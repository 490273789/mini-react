import { REACT_ELEMENT } from "./constants";

function render(VNode, containerDOM) {
  // 虚拟DOM转化为真实DOM
  // 将得到的DOM挂在到containerDOM中
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  let newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  // 1. 创建元素；2. 处理子元素；3. 处理属性值
  const { type, props } = VNode;
  let dom;
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
  VNode.dom = dom;
  return dom;
}

function setPropsForDOM(dom, VNodeProps) {
  if (!dom) return;
  for (let key in VNodeProps) {
    if (key === "children") continue;
    if (/^on[A-Z].*/.test(key)) {
      // TODO: Event handle
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
 * 处理函数组件
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
 * @param {*} VNode
 * @returns
 */
function getDomByClassComponent(VNode) {
  const { type, props } = VNode;
  const instance = new type(props);
  let renderVNode = instance.render();
  instance.oldVNode = renderVNode;
  setTimeout(() => {
    instance.setState({ title: "你好" });
  }, 3000);
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
