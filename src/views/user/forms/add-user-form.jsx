import React from "react";
import { Form, Input, Select, Modal } from "antd";
import { useForm } from "antd/es/form/Form";

const AddUserForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = useForm();

  return (
    <Modal
      title="Tambah Pengguna"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form 
        form={form} 
        layout="vertical"
        onFinish={onOk}
      >
        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama pengguna!" }]}
        >
          <Input placeholder="Nama Pengguna" />
        </Form.Item>
        <Form.Item
          label="Username:"
          name="username"
          rules={[{ required: true, message: "Silahkan isi username pengguna!" }]}
        >
          <Input placeholder="Username Pengguna" />
        </Form.Item>
        <Form.Item
          label="Email:"
          name="email"
          rules={[{ required: true, type: "email", message: "Silahkan isi email pengguna!" }]}
        >
          <Input placeholder="Email Pengguna" />
        </Form.Item>
        <Form.Item
          label="Kata sandi:"
          name="password"
          rules={[{ required: true, message: "Silahkan isi kata sandi pengguna!" }]}
        >
          <Input type="password" placeholder="Kata sandi" />
        </Form.Item>
        <Form.Item label="Peran:" name="roles" initialValue="3">
          <Select style={{ width: 120 }}>
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