import React from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const AddReligionForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm(); // Gunakan useForm untuk mendapatkan instance form

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Kirim nilai form saat Ok diklik
    });
  };

  return (
    <Modal
      title="Tambah Agama"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Agama"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama agama" }]}
        >
          <Input placeholder="Nama Agama" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Agama"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi agama" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Agama" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddReligionForm;
