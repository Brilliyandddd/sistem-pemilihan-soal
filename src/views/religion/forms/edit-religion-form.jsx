import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const EditReligionForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm(); // Gunakan useForm()

  useEffect(() => {
    form.setFieldsValue(currentRowData); // Set data awal saat modal dibuka
  }, [currentRowData, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onOk(values);
      })
      .catch(info => {
        console.log("Validasi gagal:", info);
      });
  };

  return (
    <Modal
      title="Edit Agama"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form}>
        <Form.Item label="ID Agama:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Agama:" name="name" rules={[{ required: true, message: "Silahkan isikan nama agama" }]}>
          <Input placeholder="Nama Agama" />
        </Form.Item>
        <Form.Item label="Deskripsi Agama:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi agama" }]}>
          <TextArea rows={4} placeholder="Deskripsi Agama" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditReligionForm;
