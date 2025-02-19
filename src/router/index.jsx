import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { getUserInfo } from "../store/actions";
import Layout from "../views/layout";
import Login from "../views/login";

class Router extends React.Component {
  componentDidMount() {
    const { token, getUserInfo } = this.props;
    if (token) {
      getUserInfo(token);
    }
  }

  render() {
    const { token, role } = this.props;

    return (
      <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
        <Routes>
          {!token ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Layout />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    );
  }
}

export default connect((state) => state.user, { getUserInfo })(Router);


// future={{
//   v7_startTransition: true,
//   v7_relativeSplatPath: true,
// }}>