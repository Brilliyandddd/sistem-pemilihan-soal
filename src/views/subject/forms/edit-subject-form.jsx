import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Modal, Select, InputNumber } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditSubjectForm = ({ 
  visible, 
  onCancel, 
  onOk, 
  confirmLoading, 
  currentRowData, 
  subjectGroups, 
  studyPrograms 
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && currentRowData) {
      form.setFieldsValue({
        name: currentRowData.name || "",
        description: currentRowData.description || "",
        credit_point: currentRowData.credit_point || 1,
        year_commenced: currentRowData.year_commenced ? String(currentRowData.year_commenced) : "2024",
        study_program_id: currentRowData.study_program_id || undefined,
        subject_group_id: currentRowData.subject_group_id || undefined,
      });
    }
  }, [visible, currentRowData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values sebelum dikirim:", values);
      onOk({
        ...values,
        study_program_id: values.study_program_id || null, 
        subject_group_id: values.subject_group_id || null,
      });
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()} // Reset setelah modal tertutup
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="Nama:" 
          name="name" 
          rules={[{ required: true, message: "Masukkan nama mata kuliah" }]}
        >
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>

        <Form.Item 
          label="Deskripsi:" 
          name="description" 
          rules={[{ required: true, message: "Masukkan deskripsi mata kuliah" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Mata Kuliah" />
        </Form.Item>

        <Form.Item 
          label="Point Kredit:" 
          name="credit_point" 
          rules={[{ required: true, message: "Masukkan point kredit" }]}
        >
          <InputNumber style={{ width: "100%" }} min={1} placeholder="Point Kredit" />
        </Form.Item>

        <Form.Item 
          label="Tahun Mata Kuliah:" 
          name="year_commenced" 
          rules={[{ required: true, message: "Pilih tahun mata kuliah" }]}
        >
          <Select showSearch placeholder="Pilih Tahun">
            {["2022", "2023", "2024", "2025"].map((year) => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label="Program Studi:" 
          name="study_program_id" 
          rules={[{ required: true, message: "Pilih program studi" }]}
        >
          <Select placeholder="Pilih Program Studi">
            {studyPrograms.map((sp) => (
              <Option key={sp.id} value={sp.id}>{sp.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label="Rumpun Mata Kuliah:" 
          name="subject_group_id" 
          rules={[{ required: true, message: "Pilih rumpun mata kuliah" }]}
        >
          <Select placeholder="Pilih Rumpun">
            {subjectGroups.map((sg) => (
              <Option key={sg.id} value={sg.id}>{sg.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditSubjectForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.object,
  subjectGroups: PropTypes.array,
  studyPrograms: PropTypes.array,
};

export default EditSubjectForm;
