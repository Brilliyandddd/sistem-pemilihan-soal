/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Select, Modal, InputNumber } from "antd";

const { TextArea } = Input;

const EditRPSDetailForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  initialValues,
  formLearnings = [],
  learningMethods = [],
  assessmentCriterias = [],
  appraisalForms = []
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      // Transform initial values for form
      const formValues = {
        ...initialValues,
        learning_methods: initialValues.learning_methods?.map(method => method.id) || [],
        assessment_criterias: initialValues.assessment_criterias?.map(criteria => criteria.id) || [],
        appraisal_forms: initialValues.appraisal_forms?.map(form => form.id) || []
      };
      form.setFieldsValue(formValues);
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onOk(values);
      })
      .catch(info => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      width={800}
      title="Edit RPS Detail"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          label="Minggu Ke"
          name="week"
          rules={[{ required: true, message: "Minggu wajib diisi" }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Sub CP MK"
          name="sub_cp_mk"
          rules={[{ required: true, message: "Sub CP MK wajib diisi" }]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Materi Pembelajaran"
          name="learning_materials"
          rules={[{ required: true, message: "Materi pembelajaran wajib diisi" }]}
        >
          <Select mode="tags" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item
          label="Bentuk Pembelajaran"
          name="form_learning_id"
          rules={[{ required: true, message: "Bentuk pembelajaran wajib dipilih" }]}
        >
          <Select>
            {formLearnings.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Metode Pembelajaran"
          name="learning_methods"
          rules={[{ required: true, message: "Metode pembelajaran wajib dipilih" }]}
        >
          <Select mode="multiple">
            {learningMethods.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Penugasan"
          name="assignments"
          rules={[{ required: true, message: "Penugasan wajib diisi" }]}
        >
          <Select mode="tags" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item
          label="Estimasi Waktu"
          name="estimated_times"
          rules={[{ required: true, message: "Estimasi waktu wajib diisi" }]}
        >
          <Select mode="tags" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item
          label="Pengalaman Belajar Mahasiswa"
          name="student_learning_experiences"
          rules={[{ required: true, message: "Pengalaman belajar wajib diisi" }]}
        >
          <Select mode="tags" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item
          label="Kriteria Penilaian"
          name="assessment_criterias"
          rules={[{ required: true, message: "Kriteria penilaian wajib dipilih" }]}
        >
          <Select mode="multiple">
            {assessmentCriterias.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Bentuk Penilaian"
          name="appraisal_forms"
          rules={[{ required: true, message: "Bentuk penilaian wajib dipilih" }]}
        >
          <Select mode="multiple">
            {appraisalForms.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Indikator Penilaian"
          name="assessment_indicators"
          rules={[{ required: true, message: "Indikator penilaian wajib diisi" }]}
        >
          <Select mode="tags" tokenSeparators={[',']} />
        </Form.Item>

        <Form.Item
          label="Bobot"
          name="weight"
          rules={[{ required: true, message: "Bobot wajib diisi" }]}
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditRPSDetailForm;