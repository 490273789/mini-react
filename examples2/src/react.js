import { REACT_ELEMENT, REACT_FORWARD_REF } from "./constants.js";
import { Component } from "./Component.js";
// jsx被编译后的结果
// React.createElement(
//   "div",
//   {
//     key: "1",
//     ref: "ref",
//     kk: "kk",
//     class: "class",
//   },
//   "Hello ",
//   React.createElement("span", null, "World1"),
//   React.createElement("span", null, "World2")
// );
export function createElement(type, properties, children) {
  console.log("properties:", properties);
  const key = properties.key ?? null;
  const ref = properties.ref ?? null;
  ["key", "ref", "_self", "_source"].forEach((prop) => {
    if (prop in properties) {
      delete properties[prop];
    }
  });
  const props = { ...properties };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2);
  } else {
    props.children = children;
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    key,
    ref,
    props,
  };
}
export function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

function createRef() {
  return {
    current: null,
  };
}
const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
};
export default React;
