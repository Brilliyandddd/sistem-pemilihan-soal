import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditAppraisalForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData) {
      form.setFieldsValue({
        id: currentRowData.id,
        name: currentRowData.name,
        description: currentRowData.description,
      });
    }
  }, [currentRowData, form]);

  return (
    <Modal
      title="Edit Formulir Penilaian"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onOk}
      >
        <Form.Item label="ID Formulir Penilaian" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama Formulir Penilaian"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama formulir penilaian" }]}
        >
          <Input placeholder="Nama Formulir Penilaian" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Formulir Penilaian"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi formulir penilaian" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Formulir Penilaian" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAppraisalForm;