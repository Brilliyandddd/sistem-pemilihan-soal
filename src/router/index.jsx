import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { getUserInfo } from "@/store/actions";
import Layout from "@/views/layout";
import Login from "@/views/login";

class Router extends React.Component {
  render() {
    const { token, role, getUserInfo } = this.props;
    return (
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              !token ? (
                <Navigate to="/login" />
              ) : role ? (
                <Layout />
              ) : (
                getUserInfo(token).then(() => <Layout />)
              )
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default connect((state) => state.user, { getUserInfo })(Router);
