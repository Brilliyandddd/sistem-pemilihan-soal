/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Select, Modal, InputNumber } from "antd";

const { TextArea } = Input;

const EditRPSDetailForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  initialValues, // Prop ini akan berisi data baris yang sedang diedit (termasuk ID)
  formLearnings = [], // Daftar lengkap pilihan untuk dropdown "Bentuk Pembelajaran"
  // Jika Anda ingin mengedit multi-select, tambahkan prop di sini dan di Form.Item bawah:
  // learningMethods = [],
  // assessmentCriterias = [],
  // appraisalForms = []
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      // Transformasi initialValues agar sesuai dengan nama 'name' di Form.Item
      const formValues = {
        ...initialValues,
        // Ekstrak ID dari objek form_learning untuk field 'form_learning_id'
        form_learning_id: initialValues.form_learning?.id,

        // Jika Anda memiliki multi-select dan ingin menampilkannya (aktifkan kembali jika perlu):
        // learning_methods: initialValues.learning_methods?.map(method => method.id) || [],
        // assessment_criterias: initialValues.assessment_criterias?.map(criteria => criteria.id) || [],
        // appraisal_forms: initialValues.appraisal_forms?.map(form => form.id) || [],
      };
      console.log("Setting form values for EditRPSDetailForm:", formValues);
      form.setFieldsValue(formValues);
    } else if (!visible) {
      // Reset form fields saat modal ditutup untuk membersihkan data sebelumnya
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        // 'values' hanya akan berisi data dari field form: week, sub_cp_mk, form_learning_id, weight.
        // ID record yang diedit (initialValues.id) tidak ada di 'values' ini,
        // melainkan akan digabungkan di handleEditSubmit pada komponen induk.
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
      destroyOnClose // Pastikan form direfresh saat ditutup
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false} // Pastikan form tidak mempertahankan nilai saat unmount
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
          label="Pokok Bahasan"
          name="learning_materials"
          rules={[{ required: true, message: "Pokok Bahasan wajib diisi" }]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Bentuk Pembelajaran"
          name="form_learning_id" 
          rules={[{ required: true, message: "Bentuk pembelajaran wajib dipilih" }]}
        >
          <Select placeholder="Pilih Bentuk Pembelajaran">
            {formLearnings.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Jika Anda ingin mengedit multi-select, aktifkan kembali Form.Item ini dan tambahkan props di atas: */}
        {/*
        <Form.Item
          label="Metode Pembelajaran"
          name="learning_methods"
          rules={[{ required: true, message: "Metode pembelajaran wajib dipilih" }]}
        >
          <Select mode="multiple" placeholder="Pilih Metode Pembelajaran">
            {learningMethods.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Kriteria Penilaian"
          name="assessment_criterias"
          rules={[{ required: true, message: "Kriteria penilaian wajib dipilih" }]}
        >
          <Select mode="multiple" placeholder="Pilih Kriteria Penilaian">
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
          <Select mode="multiple" placeholder="Pilih Bentuk Penilaian">
            {appraisalForms.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        */}

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