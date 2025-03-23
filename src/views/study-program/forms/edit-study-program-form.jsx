import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditStudyProgramForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        id: currentRowData.id,
        name: currentRowData.name,
        role: currentRowData.role,
        description: currentRowData.description,
      });
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Edit Program Studi"
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
        <Form.Item label="ID Program Studi:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Peran:" name="role">
          <Select style={{ width: "100%" }} disabled={currentRowData.id === "admin"}>
            <Option value="admin">Jurusan Teknologi Informasi</Option>
            <Option value="lecture">Jurusan Sipil</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Nama Prodi:"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama program studi" }]}
        >
          <Input placeholder="Nama program studi" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Prodi:"
          name="description"
          rules={[{ required: true, message: "Silahkan isi deskripsi program studi" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi program studi" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStudyProgramForm;