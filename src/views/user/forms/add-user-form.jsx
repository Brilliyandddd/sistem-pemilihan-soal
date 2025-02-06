import React, { Component } from "react";
import { Form, Input, Select, Modal } from "antd";

class AddUserForm extends Component {
  render() {
    const { visible, onCancel, onOk, form, confirmLoading } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal
        title="Tambah Pengguna"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
      >
        <Form {...formItemLayout}>
          <Form.Item label="Na  ma:">
            {getFieldDecorator("name", {
              rules: [
                { required: true, message: "Silahkan isi nama pengguna!" },
              ],
            })(<Input placeholder="Nama Pengguna" />)}
          </Form.Item>
          <Form.Item label="Username:">
            {getFieldDecorator("username", {
              rules: [
                { required: true, message: "Silahkan isi username pengguna!" },
              ],
            })(<Input placeholder="Username Pengguna" />)}
          </Form.Item>
          <Form.Item label="Email:">
            {getFieldDecorator("email", {
              rules: [
                {
                  required: true,
                  type: "email",
                  message: "Silahkan isi email pengguna!",
                },
              ],
            })(<Input placeholder="Email Pengguna" />)}
          </Form.Item>
          <Form.Item label="Kata sandi:">
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "Silahkan isi kata sandi pengguna!",
                },
              ],
            })(<Input type="password" placeholder="Kata sandi" />)}
          </Form.Item>
          <Form.Item label="Peran:">
            {getFieldDecorator("roles", {
              initialValue: "3",
            })(
              <Select style={{ width: 120 }}>
                <Select.Option value="1">Administrator</Select.Option>
                <Select.Option value="2">Dosen</Select.Option>
                <Select.Option value="3">Mahasiswa</Select.Option>
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddUserForm" })(AddUserForm);
