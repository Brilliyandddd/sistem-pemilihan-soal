/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";

const { TextArea } = Input;

const EditCriteriaValueForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();
  const { id, name, role, description } = currentRowData || {};

  // Set initial values when modal opens or data changes
 useEffect(() => {
  if (visible && currentRowData) {
    const { id, name, role, description } = currentRowData;
    form.setFieldsValue({
      id,
      name,
      role,
      description,
    });
  }
}, [visible, currentRowData, form]);


  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Mengedit"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        labelCol={{ sm: { span: 4 } }}
        wrapperCol={{ sm: { span: 16 } }}
      >
        <Form.Item label="ID Pengguna:" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi!" }]}
        >
          <Input placeholder="Masukkan Nama" />
        </Form.Item>

        <Form.Item label="Peran:" name="role">
          <Select style={{ width: 120 }} disabled={id === "admin"}>
            <Select.Option value="admin">admin</Select.Option>
            <Select.Option value="lecture">editor</Select.Option>
            <Select.Option value="student">guest</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Deskripsi Pengguna:" name="description">
          <TextArea rows={4} placeholder="Masukkan Deskripsi Pengguna" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCriteriaValueForm;
