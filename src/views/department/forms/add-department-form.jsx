import React from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddDepartmentForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Tambah Jurusan"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
            form.resetFields(); // Reset form setelah submit
          })
          .catch((info) => console.log("Validation Failed:", info));
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Jurusan:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama jurusan" }]}
        >
          <Input placeholder="Nama Jurusan" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Jurusan:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi jurusan" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Jurusan" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartmentForm;
