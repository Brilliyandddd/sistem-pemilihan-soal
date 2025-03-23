import React from "react";
import { Form, Input, Modal } from "antd";

const EditLearningMethodForm = ({ visible, onCancel, onOk, confirmLoading, form }) => {
  return (
    <Modal
      title="Edit Metode Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID" name="id">
          <Input disabled />
        </Form.Item>
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

export default EditLearningMethodForm;
