import React from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const AddSubjectGroupForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm(); // Gunakan useForm untuk mendapatkan instance form

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Kirim nilai form saat Ok diklik
    });
  };

  return (
    <Modal
      title="Tambah Rumpun Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama rumpun mata kuliah" }]}
        >
          <Input placeholder="Nama Rumpun Mata Kuliah" />
        </Form.Item>
        <Form.Item
          label="Deskripsi"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi rumpun mata kuliah" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Rumpun Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectGroupForm;
