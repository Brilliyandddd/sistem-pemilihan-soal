import React from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const EditSubjectGroupForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm(); // Gunakan useForm untuk mendapatkan instance form
  const { id, name, description } = currentRowData;

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Kirim nilai form saat Ok diklik
    });
  };

  return (
    <Modal
      title="Edit Rumpun Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" initialValues={{ id, name, description }}>
        <Form.Item label="ID Rumpun Mata Kuliah" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama Rumpun Mata Kuliah"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama rumpun mata kuliah" }]}
        >
          <Input placeholder="Nama Rumpun Mata Kuliah" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Rumpun Mata Kuliah"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi rumpun mata kuliah" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Rumpun Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSubjectGroupForm;
