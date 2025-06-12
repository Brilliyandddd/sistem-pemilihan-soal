/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, InputNumber } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditCausalityForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();
  // Anda mungkin perlu mengambil data subject dan lecture dari API
  // Untuk contoh ini, saya akan menggunakan data dummy
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    if (currentRowData) {
      form.setFieldsValue({
        idCausality: currentRowData.idCausality,
        description: currentRowData.description,
        subject: currentRowData.subject ? currentRowData.subject.id : undefined,
        semester: currentRowData.semester,
        teamTeaching1: currentRowData.teamTeaching1 ? currentRowData.teamTeaching1.id : undefined,
        teamTeaching2: currentRowData.teamTeaching2 ? currentRowData.teamTeaching2.id : undefined,
        teamTeaching3: currentRowData.teamTeaching3 ? currentRowData.teamTeaching3.id : undefined,
      });
    }
    // TODO: Fetch subjects and lectures from your API
    // Example:
    // fetchSubjects().then(data => setSubjects(data));
    // fetchLectures().then(data => setLectures(data));
    setSubjects([
      { id: "sub001", name: "Matematika Diskrit" },
      { id: "sub002", name: "Algoritma dan Struktur Data" },
    ]);
    setLectures([
      { id: "lec001", name: "Dr. Budi Santoso" },
      { id: "lec002", name: "Prof. Ani Suryani" },
      { id: "lec003", name: "Dra. Siti Aminah" },
    ]);
  }, [currentRowData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        subject: subjects.find((s) => s.id === values.subject),
        teamTeaching1: lectures.find((l) => l.id === values.teamTeaching1),
        teamTeaching2: values.teamTeaching2 ? lectures.find((l) => l.id === values.teamTeaching2) : null,
        teamTeaching3: values.teamTeaching3 ? lectures.find((l) => l.id === values.teamTeaching3) : null,
      };
      onOk({ ...formattedValues, idCausality: currentRowData.idCausality });
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Kausalitas"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Kausalitas" name="idCausality">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Deskripsi:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Kausalitas" />
        </Form.Item>
        <Form.Item
          label="Mata Kuliah:"
          name="subject"
          rules={[{ required: true, message: "Silahkan pilih mata kuliah" }]}
        >
          <Select placeholder="Pilih Mata Kuliah">
            {subjects.map((subject) => (
              <Option key={subject.id} value={subject.id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Semester:"
          name="semester"
          rules={[{ required: true, message: "Silahkan isikan semester" }]}
        >
          <InputNumber min={1} max={14} placeholder="Semester" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Dosen Pengajar 1:"
          name="teamTeaching1"
          rules={[{ required: true, message: "Silahkan pilih dosen pengajar 1" }]}
        >
          <Select placeholder="Pilih Dosen Pengajar 1">
            {lectures.map((lecture) => (
              <Option key={lecture.id} value={lecture.id}>
                {lecture.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Dosen Pengajar 2:" name="teamTeaching2">
          <Select allowClear placeholder="Pilih Dosen Pengajar 2 (opsional)">
            {lectures.map((lecture) => (
              <Option key={lecture.id} value={lecture.id}>
                {lecture.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Dosen Pengajar 3:" name="teamTeaching3">
          <Select allowClear placeholder="Pilih Dosen Pengajar 3 (opsional)">
            {lectures.map((lecture) => (
              <Option key={lecture.id} value={lecture.id}>
                {lecture.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCausalityForm;