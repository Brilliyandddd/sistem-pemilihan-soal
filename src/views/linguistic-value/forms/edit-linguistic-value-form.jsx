import React, { useState, useEffect } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditLinguisticValueForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  file_path,
}) => {
  const [form] = Form.useForm();
  const BASE_URL = "http://hadoop-primary:9870/";

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        id: currentRowData.id,
        name: currentRowData.name,
        value1: currentRowData.value1,
        value2: currentRowData.value2,
        value3: currentRowData.value3,
        value4: currentRowData.value4,
      });
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Edit Linguistic Value"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values);
        });
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Tabel Linguistic:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Name:"
          name="name"
          rules={[{ required: true, message: "Please input name" }]}
        >
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item
          label="Value 1:"
          name="value1"
          rules={[{ required: true, message: "Please input value 1" }]}
        >
          <Input placeholder="Value 1" />
        </Form.Item>
        <Form.Item
          label="Value 2:"
          name="value2"
          rules={[{ required: true, message: "Please input value 2" }]}
        >
          <Input placeholder="Value 2" />
        </Form.Item>
        <Form.Item
          label="Value 3:"
          name="value3"
          rules={[{ required: true, message: "Please input value 3" }]}
        >
          <Input placeholder="Value 3" />
        </Form.Item>
        <Form.Item
          label="Value 4:"
          name="value4"
          rules={[{ required: true, message: "Please input value 4" }]}
        >
          <Input placeholder="Value 4" />
        </Form.Item>
        {file_path && (
          <img
            src={`${BASE_URL}${file_path}`}
            alt="Linguistic Value"
            style={{ width: "200px", height: "200px", marginLeft: "10px" }}
          />
        )}
      </Form>
    </Modal>
  );
};

export default EditLinguisticValueForm;