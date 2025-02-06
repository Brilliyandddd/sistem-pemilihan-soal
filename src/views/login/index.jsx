import React, { useTransition } from "react";
import { Navigate } from "react-router-dom"; 
import { Form, Input, Button, message, Spin } from "antd";
import { connect } from "react-redux";
import { Helmet } from "react-helmet-async";
import { login, getUserInfo } from "@/store/actions";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./index.less";

const Login = (props) => {
  const { token, login, getUserInfo } = props;
  const [loading, setLoading] = useTransition(false);
  const [form] = Form.useForm(); // Gunakan Ant Design Hooks

  const handleLogin = (username, password) => {
    setLoading(true);
    login(username, password)
      .then((data) => {
        message.success("Selamat Datang di Website Kampus");
        handleUserInfo(data.accessToken);
      })
      .catch(() => {
        setLoading(false);
        message.error("Gagal Login, mohon cek kembali username dan password");
      });
  };

  const handleUserInfo = (token) => {
    getUserInfo(token).catch((error) => {
      message.error(error);
    });
  };

  const handleSubmit = (values) => {
    const { username, password } = values;
    handleLogin(username, password);
  };

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Helmet>
        <title>Login Pengguna</title>
      </Helmet>
      <div className="login-container">
        <Form form={form} onFinish={handleSubmit} className="content">
          <div className="title">
            <h2>Login Pengguna</h2>
          </div>
          <Spin spinning={loading} tip="Mohon tunggu...">
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
};

export default connect((state) => state.user, { login, getUserInfo })(Login);
