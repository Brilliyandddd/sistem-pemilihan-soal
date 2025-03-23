import React from "react";
import { Form, Input, Modal } from "antd";

const AddLearningMethodForm = ({ visible, onCancel, onOk, confirmLoading, form }) => {
  return (
    <Modal
      title="Tambah Metode Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Metode Pembelajaran"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama metode pembelajaran" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Deskripsi"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi metode pembelajaran" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLearningMethodForm;
