/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Modal, Select, Upload, Switch } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Dragger } = Upload;

const AddAnswerForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  initialValues = {},
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        title: "",
        description: "This is the default value",
        is_right: false,
        type: "NORMAL",
        ...initialValues,
      });
    }
  }, [visible, form, initialValues]);

  const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="Tambah Jawaban"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        encType="multipart/form-data"
      >
        <Form.Item
          label="Jawaban"
          name="title"
          rules={[{ required: true, message: "Silahkan isikan pertanyaan" }]}
        >
          <Input placeholder="Jawaban" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Jawaban"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi pertanyaan" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Jawaban Benar / Salah"
          name="is_right"
          valuePropName="checked"
          rules={[{ required: true, message: "Silahkan isikan benar / salah" }]}
        >
          <Switch checkedChildren="Benar" unCheckedChildren="Salah" />
        </Form.Item>

        <Form.Item
          label="Tipe Jawaban"
          name="type"
          rules={[{ required: true, message: "Silahkan pilih tipe pertanyaan" }]}
        >
          <Select placeholder="Pilih tipe pertanyaan">
            <Select.Option value="IMAGE">Gambar</Select.Option>
            <Select.Option value="AUDIO">Musik / Audio</Select.Option>
            <Select.Option value="VIDEO">Video</Select.Option>
            <Select.Option value="NORMAL">Normal</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
  label="File"
  name="file"
  valuePropName="fileList"
  getValueFromEvent={normFile}
>
  <Dragger
    name="file"
    beforeUpload={() => false}
    maxCount={1}
  >
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Klik atau Seret file ke sini</p>
    <p className="ant-upload-hint">Support semua file</p>
  </Dragger>
</Form.Item>

      </Form>
    </Modal>
  );
};

export default AddAnswerForm;
