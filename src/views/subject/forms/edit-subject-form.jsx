import React from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditSubjectForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm(); // Use the useForm hook to get the form instance
  const { id, name, description } = currentRowData;

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Pass the form values to the parent component
    });
  };

  return (
    <Modal
      title="Edit Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Mata Kuliah:" name="id" initialValue={id}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama Mata Kuliah:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama mata kuliah" }]}
          initialValue={name}
        >
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Mata Kuliah:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi mata kuliah" }]}
          initialValue={description}
        >
          <TextArea rows={4} placeholder="Deskripsi Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSubjectForm;
