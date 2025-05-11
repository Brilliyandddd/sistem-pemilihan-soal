import React from "react";
import { Form, Input, Select, Modal } from "antd";
import { useForm } from "antd/es/form/Form";

const AddUserForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values);
        let roleString;
        switch (values.roles) {
          case "1":
            roleString = "ROLE_ADMIN";
            break;
          case "2":
            roleString = "ROLE_LECTURER";
            break;
          case "3":
          default:
            roleString = "ROLE_STUDENT";
            break;
        }
  
        const payload = {
          ...values,
          roles: roleString, // ubah ini jadi string
        };
  
        onOk(payload);
        form.resetFields();
      })
      .catch((info) => {
        console.error("Validasi gagal:", info);
      });
  };
  
  return (
    <Modal
      title="Tambah Pengguna"
      open={visible}
      onCancel={() => {
        form.resetFields(); // reset saat dibatalkan
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama pengguna!" }]}
        >
          <Input placeholder="Nama Pengguna" />
        </Form.Item>

        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Silahkan isi username pengguna!" }]}
        >
          <Input placeholder="Username Pengguna" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Silahkan isi email pengguna!" },
            { type: "email", message: "Email tidak valid!" },
          ]}
        >
          <Input placeholder="Email Pengguna" />
        </Form.Item>

        <Form.Item
          label="Kata Sandi"
          name="password"
          rules={[{ required: true, message: "Silahkan isi kata sandi pengguna!" }]}
        >
          <Input.Password placeholder="Kata Sandi" />
        </Form.Item>

        <Form.Item label="Peran" name="roles" initialValue="3">
          <Select placeholder="Pilih Peran">
            <Select.Option value="1">Administrator</Select.Option>
            <Select.Option value="2">Dosen</Select.Option>
            <Select.Option value="3">Mahasiswa</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserForm;
