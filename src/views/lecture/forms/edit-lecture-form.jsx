import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Select, Modal } from "antd";

const { TextArea } = Input;

const EditLectureForm = ({
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
        role: currentRowData.role,
        description: currentRowData.description,
      });
    }
  }, [currentRowData, form]);

  return (
    <Modal
      title="Mengedit"
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
        <Form.Item label="ID Dosen:" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Masukkan Nama!" }]}
        >
          <Input placeholder="Masukkan Nama" />
        </Form.Item>

        <Form.Item label="Peran:" name="role">
          <Select style={{ width: 120 }} disabled={currentRowData?.id === "admin"}>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="lecture">Editor</Select.Option>
            <Select.Option value="student">Guest</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Deskripsi Dosen:" name="description">
          <TextArea rows={4} placeholder="Masukkan Deskripsi Dosen" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditLectureForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default EditLectureForm;