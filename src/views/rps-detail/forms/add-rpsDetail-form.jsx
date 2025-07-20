/* eslint-disable no-unused-vars */
// forms/add-rpsDetail-form.jsx
/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, InputNumber, Modal, Select, Input } from "antd";

const { TextArea } = Input;

const AddRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  formLearnings = [], // Only keep props that are actually used by the form fields below
  // Removed learningMethods, assessmentCriterias, appraisalForms props as they are no longer needed here
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
    // No need to log props here unless actively debugging prop passing
  }, [visible, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // 'values' will now only contain 'week', 'sub_cp_mk', 'form_learning_id', 'weight'
        // 'rps_id' will be added in the parent component before sending
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      width={600}
      title="Tambah RPS"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        labelCol={{ xs: { span: 24 }, sm: { span: 8 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }}
      >
        <Form.Item
          label="Minggu Ke:"
          name="week"
          rules={[{ required: true, message: "Minggu wajib diisi" }]}
        >
          <InputNumber min={1} style={{ width: 300 }} placeholder="Minggu ke" />
        </Form.Item>

        <Form.Item
          label="Sub CP MK:"
          name="sub_cp_mk"
          rules={[{ required: true, message: "Sub CP MK wajib diisi" }]}
        >
          <TextArea style={{ width: 300 }} placeholder="Sub CP MK" />
        </Form.Item>

        <Form.Item
          label="Pokok Bahasan:"
          name="learning_materials"
          rules={[{ required: true, message: "Pokok Bahasan wajib diisi" }]}
        >
          <TextArea style={{ width: 300 }} placeholder="Sub CP MK" />
        </Form.Item>

        <Form.Item
          label="Bentuk Pembelajaran:"
          name="form_learning_id"
          rules={[{ required: true, message: "Silahkan pilih bentuk pembelajaran" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih Bentuk Pembelajaran">
            {formLearnings.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Removed Learning Methods, Assessment Criterias, and Appraisal Forms */}
        {/* If your backend truly does not need these for creation, remove them */}

        <Form.Item
          label="Bobot:"
          name="weight"
          rules={[{ required: true, message: "Bobot wajib diisi" }]}
        >
          <InputNumber min={1} style={{ width: 300 }} placeholder="Bobot" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRPSForm;