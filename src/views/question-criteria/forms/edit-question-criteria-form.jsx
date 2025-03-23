import React, { useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditQuestionCriteriaForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData) {
      form.setFieldsValue(currentRowData);
    }
  }, [currentRowData, form]);

  return (
    <Modal
      title="Mengedit"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
            form.resetFields();
          })
          .catch((info) => console.log("Validate Failed:", info));
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Dosen:" name="id" initialValue={currentRowData?.id}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Masukkan Nama!" }]}
          initialValue={currentRowData?.name}
        >
          <Input placeholder="Masukkan Nama" />
        </Form.Item>
        <Form.Item
          label="Deskripsi:"
          name="description"
          rules={[{ required: true, message: "Masukkan Deskripsi!" }]}
          initialValue={currentRowData?.description}
        >
          <TextArea rows={4} placeholder="Masukkan Deskripsi" />
        </Form.Item>
        <Form.Item
          label="Kategori:"
          name="category"
          rules={[{ required: true, message: "Pilih Kategori!" }]}
          initialValue={currentRowData?.category}
        >
          <Select placeholder="Pilih Kategori">
            <Option value="Cognitive">Cognitive</Option>
            <Option value="Non Cognitive">Non Cognitive</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQuestionCriteriaForm;
