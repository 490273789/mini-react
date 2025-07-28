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
    this.state = { title: "Hello", count: "0" };
  }
  updateCount(count) {
    this.setState({ ...this.state, count: count + "" });
  }
  render() {
    return (
      <div key="key" class="class" kk="kk" style={{ color: "red" }}>
        {this.state.title} <span>World1</span>
        <div
          style={{
            border: "1px solid grey",
            borderRadius: "3px",
            padding: "3px 5px",
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={() => this.updateCount(++this.state.count)}
        >
          {this.state.count}
        </div>
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
