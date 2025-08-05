import ReactDom from "./react-dom.js";
import React from "./react.js";

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

const MyForwardRefFunctionComponent = React.forwardRef((props, ref) => {
  return <div ref={ref}></div>;
});
function MyFunctionComponent() {
  let textInput = React.createRef();
  let counterComponentRef = React.createRef();
  let functionRef = React.createRef();
  const focusInput = () => {
    textInput.current.focus();
  };
  const show100 = () => {
    counterComponentRef.current.updateCount(100);
  };

  return (
    <div>
      <input type="text" ref={textInput} />
      <input type="button" value="Focus the text input" onClick={focusInput} />
      <div onClick={() => show100()}>show100</div>
      <MyClassComponent title="Hello" ref={counterComponentRef} />
      <MyForwardRefFunctionComponent ref={functionRef} />
    </div>
  );
}

ReactDom.render(<MyFunctionComponent />, document.getElementById("root"));

console.log(<MyForwardRefFunctionComponentMyF />);

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
