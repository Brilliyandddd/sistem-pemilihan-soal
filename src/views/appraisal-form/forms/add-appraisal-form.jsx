import React from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddAppraisalForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Tambah Formulir Penilaian"
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
        <Form.Item
          label="Nama Formulir Penilaian:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama formulir penilaian" }]}
        >
          <Input placeholder="Nama Formulir Penilaian" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Formulir Penilaian:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi formulir penilaian" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Formulir Penilaian" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAppraisalForm;