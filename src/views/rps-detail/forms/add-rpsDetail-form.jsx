/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, InputNumber, Modal, Select, Input } from "antd";

const { TextArea } = Input;

const AddRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  formLearnings,
  learningMethods,
  assessmentCriterias,
  appraisalForms,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      width={1000}
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
          label="Materi Pembelajaran:"
          name="learning_materials"
          rules={[{ required: true, message: "Silahkan isikan materi pembelajaran" }]}
        >
          <Select mode="tags" style={{ width: 300 }} placeholder="Isikan Materi Pembelajaran" />
        </Form.Item>

        <Form.Item
          label="Bentuk Pembelajaran:"
          name="form_learning_id"
          rules={[{ required: true, message: "Silahkan pilih bentuk pembelajaran" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih Bentuk Pembelajaran">
            {formLearnings.map((item, idx) => (
              <Select.Option key={`form-learning-${idx}`} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Metode Pembelajaran:"
          name="learning_methods"
          rules={[{ required: true, message: "Silahkan pilih metode pembelajaran" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Metode Pembelajaran">
            {learningMethods.map((item, idx) => (
              <Select.Option key={`learning-method-${idx}`} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Penugasan:"
          name="assignments"
          rules={[{ required: true, message: "Silahkan isikan penugasan" }]}
        >
          <Select mode="tags" style={{ width: 300 }} placeholder="Isikan Penugasan" />
        </Form.Item>

        <Form.Item
          label="Estimasi Waktu:"
          name="estimated_times"
          rules={[{ required: true, message: "Silahkan isi estimasi waktu" }]}
        >
          <Select mode="tags" style={{ width: 300 }} placeholder="Isikan Estimasi Waktu" />
        </Form.Item>

        <Form.Item
          label="Pengalaman Belajar Mahasiswa:"
          name="student_learning_experiences"
          rules={[{ required: true, message: "Silahkan isi pengalaman belajar mahasiswa" }]}
        >
          <Select mode="tags" style={{ width: 300 }} placeholder="Isikan Pengalaman Belajar Mahasiswa" />
        </Form.Item>

        <Form.Item
          label="Kriteria Penilaian:"
          name="assessment_criterias"
          rules={[{ required: true, message: "Silahkan pilih kriteria penilaian" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Kriteria Penilaian">
            {assessmentCriterias.map((item, idx) => (
              <Select.Option key={`assessment-criteria-${idx}`} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Bentuk Penilaian:"
          name="appraisal_forms"
          rules={[{ required: true, message: "Silahkan pilih bentuk penilaian" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Bentuk Penilaian">
            {appraisalForms.map((item, idx) => (
              <Select.Option key={`appraisal-form-${idx}`} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Indikator Penilaian:"
          name="assessment_indicators"
          rules={[{ required: true, message: "Silahkan isi indikator penilaian" }]}
        >
          <Select mode="tags" style={{ width: 300 }} placeholder="Isikan Indikator Penilaian" />
        </Form.Item>

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
