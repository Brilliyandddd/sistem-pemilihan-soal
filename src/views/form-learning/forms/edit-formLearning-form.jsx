import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditFormLearningForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(currentRowData);
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Edit Bentuk Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
            form.resetFields();
          })
          .catch((info) => {
            console.error("Validasi gagal:", info);
          });
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Bentuk Pembelajaran" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama Bentuk Pembelajaran"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama bentuk pembelajaran" }]}
        >
          <Input placeholder="Nama Bentuk Pembelajaran" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Bentuk Pembelajaran"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi bentuk pembelajaran" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Bentuk Pembelajaran" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFormLearningForm;