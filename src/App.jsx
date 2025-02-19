import React, { Component } from "react";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { HelmetProvider } from "react-helmet-async";
import idID from "antd/es/locale/id_ID";
import store from "./store";
import Router from "./router";

class App extends Component {
  render() {
    return (
      <ConfigProvider locale={idID}>
        <Provider store={store}>
          <HelmetProvider>
            <Router />
          </HelmetProvider>
        </Provider>
      </ConfigProvider>
    );
  }
}

export default App;
