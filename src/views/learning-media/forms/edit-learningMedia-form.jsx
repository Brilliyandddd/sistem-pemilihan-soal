import React from "react";
import { Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;
const {Option} = Select;

const EditLearningMediaForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  return (
    <Modal
      title="Edit Media Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()} // Reset form setelah modal ditutup
    >
      <Form form={form} layout="vertical" initialValues={currentRowData}>
        <Form.Item label="ID Media Pembelajaran:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Media Pembelajaran:" name="name" rules={[{ required: true, message: "Silahkan isikan nama media pembelajaran" }]}> 
          <Input placeholder="Nama Media Pembelajaran" />
        </Form.Item>
        <Form.Item label="Deskripsi Media Pembelajaran:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi media pembelajaran" }]}> 
          <TextArea rows={4} placeholder="Deskripsi Media Pembelajaran" />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true, message: "Silahkan isikan deskripsi media pembelajaran" }]}> 
        <Select showSearch style={{ width: 300 }} placeholder="Pilih Tahun Ajaran">
                      <Option value="1">Software</Option>
                      <Option value="2">Hardware</Option>
                    </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditLearningMediaForm;