/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditDepartmentForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData) {
      form.setFieldsValue({
        id: currentRowData.id, // Tambahkan ID ke dalam form
        name: currentRowData.name,
        description: currentRowData.description,
      });
    }
  }, [currentRowData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk({ ...values, id: currentRowData.id }); // Kirim ID ke `onOk`
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Jurusan"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical">
        {/* Field ID (hidden, tetapi tetap dikirim) */}
        <Form.Item label="ID" name="id">
                  <Input disabled />
                </Form.Item>
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

export default EditDepartmentForm;
