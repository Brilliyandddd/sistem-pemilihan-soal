import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const AddSubjectForm = ({ visible, onCancel, onOk, confirmLoading, subjectGroups, studyPrograms }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields(); // Reset form saat modal ditutup
    }
  }, [visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validasi gagal:", error);
    }
  };

  return (
    <Modal
      title="Tambah Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama" name="name" rules={[{ required: true, message: "Silahkan isikan nama mata kuliah" }]}> 
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Deskripsi" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi mata kuliah" }]}> 
          <TextArea rows={4} placeholder="Deskripsi Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectForm;
