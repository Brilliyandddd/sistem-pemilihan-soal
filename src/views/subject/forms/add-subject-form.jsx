import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import PropTypes from "prop-types";

const { TextArea } = Input;
const { Option } = Select;

const AddSubjectForm = ({ visible, onCancel, onOk, confirmLoading, subjectGroups, studyPrograms }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields(); // Reset form ketika modal dibuka
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validasi gagal:", error);
    }
  };

  return (
    <Modal
      title="Tambah Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()} // Reset form setelah modal ditutup
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama:" name="name" rules={[{ required: true, message: "Silahkan isikan nama mata kuliah" }]}>
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Deskripsi:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi mata kuliah" }]}>
          <TextArea rows={4} placeholder="Deskripsi Pengguna" />
        </Form.Item>
        <Form.Item label="Point Kredit:" name="credit_point" rules={[{ required: true, message: "Silahkan isikan point kredit mata kuliah" }]}>
          <InputNumber style={{ width: 300 }} min={1} placeholder="Point Kredit" />
        </Form.Item>
        <Form.Item label="Tahun Mata Kuliah:" name="year_commenced" rules={[{ required: true, message: "Silahkan isikan tahun mata kuliah" }]}>
          <Select showSearch style={{ width: 300 }} placeholder="Pilih Tahun Ajaran">
            <Option value="2022">2022</Option>
            <Option value="2023">2023</Option>
            <Option value="2024">2024</Option>
            <Option value="2025">2025</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Program Study:" name="study_program_id" rules={[{ required: true, message: "Silahkan pilih program studi" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Program Study">
            {studyPrograms.map((arr) => (
              <Select.Option value={arr.id} key={arr.id}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Rumpun Mata Kuliah:" name="subject_group_id" rules={[{ required: true, message: "Silahkan pilih rumpun mata kuliah" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Rumpun Matakuliah">
            {subjectGroups.map((arr) => (
              <Select.Option value={arr.id} key={arr.id}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddSubjectForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  subjectGroups: PropTypes.array,
  studyPrograms: PropTypes.array,
};

export default AddSubjectForm;