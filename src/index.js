import React from "react";
import { render } from "react-dom";
import App from "./App";

class ChartComponent extends React.Component {
  render() {
    return <App />;
  }
}

render(<ChartComponent />, document.getElementById("root"));
