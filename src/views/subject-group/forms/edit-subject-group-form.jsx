import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const EditSubjectGroupForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        id: currentRowData?.id,
        name: currentRowData?.name,
        description: currentRowData?.description,
      });
    }
  }, [visible, currentRowData, form]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="Edit Rumpun Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Rumpun Mata Kuliah" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama Rumpun Mata Kuliah"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama rumpun mata kuliah" }]}
        >
          <Input placeholder="Nama Rumpun Mata Kuliah" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Rumpun Mata Kuliah"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi rumpun mata kuliah" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Rumpun Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSubjectGroupForm;