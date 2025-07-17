import { REACT_ELEMENT } from "./constants.js";
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

const React = {
  createElement,
};
export default React;
