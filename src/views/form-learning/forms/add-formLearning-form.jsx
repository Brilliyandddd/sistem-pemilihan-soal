import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddFormLearningForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields(); // Reset form ketika modal ditutup
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values); // Kirim data yang tervalidasi
      form.resetFields();
    } catch (error) {
      console.error("Validasi gagal:", error);
    }
  };

  return (
    <Modal
      title="Tambah Bentuk Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Bentuk Pembelajaran:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama bentuk pembelajaran" }]}
        >
          <Input placeholder="Nama Bentuk Pembelajaran" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Bentuk Pembelajaran:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi bentuk pembelajaran" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Pengguna" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFormLearningForm;
