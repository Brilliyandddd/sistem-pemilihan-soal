/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddDepartmentForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields(); // Reset form saat modal ditutup
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields(); // Reset form setelah submit sukses
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title="Tambah Jurusan"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()} // Pastikan form selalu reset saat modal tertutup
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Jurusan:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama jurusan" }]}
        >
          <Input placeholder="Nama Jurusan" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Jurusan:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi jurusan" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Jurusan" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartmentForm;
