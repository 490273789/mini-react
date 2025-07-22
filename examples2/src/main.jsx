import ReactDom from "./react-dom.js";
import React from "./react.js";

function MyFunctionComponent(props) {
  return (
    <div key="key" class="class" kk="kk" style={{ color: "red" }}>
      {props.title} <span>World1</span>
      <span>World2</span>
    </div>
  );
}

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: "Hello" };
  }
  render() {
    return (
      <div key="key" class="class" kk="kk" style={{ color: "red" }}>
        {this.state.title} <span>World1</span>
        <span>World2</span>
      </div>
    );
  }
}
ReactDom.render(
  <MyClassComponent title="Hello" />,
  document.getElementById("root")
);

console.log(
  <div key="key" class="class" kk="kk" style={{ color: "red" }}>
    Hello <span>World1</span>
    <span>World2</span>
  </div>
);

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

// React.createElement(
//   "div",
//   null,
//   "Hello ",
//   React.createElement("span", null, "World1"),
//   React.createElement("span", null, "World2")
// );
