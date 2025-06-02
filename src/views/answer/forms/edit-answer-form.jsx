/* eslint-disable react/prop-types */
import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";

const { TextArea } = Input;

const EditAnswerForm = forwardRef(({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    getForm: () => form,
  }));

  useEffect(() => {
    if (visible && currentRowData) {
      form.setFieldsValue({
        idAnswer: currentRowData.idAnswer,
        title: currentRowData.title,
        description: currentRowData.description,
        is_right: currentRowData.is_right || false,
        type: currentRowData.type || 'NORMAL',
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
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="Edit Jawaban"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Jawaban:" name="idAnswer">
          <Input disabled />
        </Form.Item>
        
        <Form.Item
          label="Jawaban:"
          name="title"
          rules={[{ required: true, message: "Silahkan isikan jawaban" }]}
        >
          <Input placeholder="Jawaban" />
        </Form.Item>
        
        <Form.Item
          label="Deskripsi Jawaban:"
          name="description"
          rules={[
            { required: true, message: "Silahkan isikan deskripsi jawaban" },
          ]}
        >
          <TextArea rows={4} placeholder="Deskripsi Jawaban" />
        </Form.Item>

        <Form.Item
          label="Jawaban Benar / Salah:"
          name="is_right"
          valuePropName="checked"
        >
          <Switch checkedChildren="Benar" unCheckedChildren="Salah" />
        </Form.Item>

        <Form.Item
          label="Tipe Jawaban:"
          name="type"
          rules={[{ required: true, message: "Silahkan pilih tipe jawaban" }]}
        >
          <Select placeholder="Pilih tipe jawaban">
            <Select.Option value="IMAGE">Gambar</Select.Option>
            <Select.Option value="AUDIO">Musik / Audio</Select.Option>
            <Select.Option value="VIDEO">Video</Select.Option>
            <Select.Option value="NORMAL">Normal</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
});

EditAnswerForm.displayName = 'EditAnswerForm';

export default EditAnswerForm;