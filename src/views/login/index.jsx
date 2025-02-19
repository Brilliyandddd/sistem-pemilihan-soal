import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { Form, Input, Button, message, Spin } from "antd";
import { connect } from "react-redux";
import { Helmet } from "react-helmet-async";
import { login, getUserInfo } from "@/store/actions";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./index.less";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.formRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.token && this.props.token !== prevProps.token) {
      this.handleUserInfo(this.props.token);
    }
  }

  handleLogin = (username, password) => {
    if (!username.trim() || !password.trim()) {
      message.error("Username dan password tidak boleh kosong!");
      return;
    }
    
    this.setState({ loading: true });
    this.props.login(username, password)
      .then((data) => {
        message.success("Selamat Datang di Website Kampus");
        this.handleUserInfo(data.accessToken);
      })
      .catch(() => {
        message.error("Gagal Login, mohon cek kembali username dan password");
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleUserInfo = (token) => {
    this.props.getUserInfo(token).catch((error) => {
      message.error(error);
    });
  };

  handleSubmit = (values) => {
    const { username, password } = values;
    this.handleLogin(username, password);
  };

  render() {
    if (this.props.token) {
      return <Navigate to="/dashboard" />;
    }

    return (
      <>
        <Helmet>
          <title>Login Pengguna</title>
        </Helmet>
        <div className="login-container">
          <Form ref={this.formRef} onFinish={this.handleSubmit} className="content">
            <div className="title">
              <h2>Login Pengguna</h2>
            </div>
            <Spin spinning={this.state.loading} tip="Mohon tunggu...">
              <Form.Item
                name="username"
                rules={[{ required: true, message: "Username wajib diisi!" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Kata sandi wajib diisi!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Kata sandi"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Masuk
                </Button>
              </Form.Item>
            </Spin>
          </Form>
        </div>
      </>
    );
  }
}

export default connect((state) => state.user, { login, getUserInfo })(Login);