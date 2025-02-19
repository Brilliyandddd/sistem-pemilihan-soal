import React from "react";
import { Form, Input, Select, Modal } from "antd";
const { TextArea } = Input;

const EditStudentForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm(); // Gunakan useForm untuk mendapatkan instance form
  const { id, name, role, description } = currentRowData;

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Kirim nilai form saat Ok diklik
    });
  };

  return (
    <Modal
      title="Mengedit Mahasiswa"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" initialValues={{ id, name, role, description }}>
        <Form.Item label="ID Mahasiswa" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "请输入Nama!" }]}
        >
          <Input placeholder="请输入Nama" />
        </Form.Item>
        <Form.Item label="Peran" name="role">
          <Select style={{ width: 120 }} disabled={id === "admin"}>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="student">Editor</Select.Option>
            <Select.Option value="guest">Guest</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Deskripsi Mahasiswa" name="description">
          <TextArea rows={4} placeholder="请输入Deskripsi Mahasiswa" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStudentForm;
