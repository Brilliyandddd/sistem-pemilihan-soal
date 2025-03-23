import React, { useState } from "react";
import { Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;

const AddQuestionCriteriaForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Tambah Kriteria Pertanyaan"
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
            console.log("Validation failed:", info);
          });
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Kriteria Pertanyaan:"
          name="name"
          rules={[{ required: true, message: "Kriteria Pertanyaan wajib diisi" }]}
        >
          <Input placeholder="Kriteria Pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Kriteria Pertanyaan:"
          name="description"
          rules={[{ required: true, message: "Deskripsi Kriteria Pertanyaan wajib diisi" }]}
        >
          <TextArea placeholder="Deskripsi Kriteria Pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Kategori:"
          name="category"
          rules={[{ required: true, message: "Kategori wajib diisi" }]}
        >
          <Select placeholder="Pilih Kategori">
            <Select.Option value="Cognitive">Cognitive</Select.Option>
            <Select.Option value="Non Cognitive">Non Cognitive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddQuestionCriteriaForm;