import React from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddLearningMediaForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm(); // Menggunakan useForm

  return (
    <Modal
      title="Tambah Media Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={() => onOk(form)} // Kirim form sebagai parameter
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Media Pembelajaran"
          name="name"
          rules={[
            { required: true, message: "Silahkan isikan nama media pembelajaran" },
          ]}
        >
          <Input placeholder="Nama Media Pembelajaran" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Media Pembelajaran"
          name="description"
          rules={[
            { required: true, message: "Silahkan isikan deskripsi media pembelajaran" },
          ]}
        >
          <TextArea rows={4} placeholder="Deskripsi Pengguna" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLearningMediaForm;
