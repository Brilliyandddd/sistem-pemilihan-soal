/* eslint-disable react/prop-types */
import React from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";

const { Option } = Select;

const AddCriteriaValue = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  studyPrograms,
  learningMediaSoftwares,
  learningMediaHardwares,
  subjects,
  lectures,
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
        layout="horizontal"
      >
        <Form.Item
          name="name"
          label="Nama:"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Nama" />
        </Form.Item>

        <Form.Item
          name="sks"
          label="SKS:"
          rules={[{ required: true, message: "SKS wajib diisi" }]}
        >
          <InputNumber placeholder="SKS RPS" min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          name="semester"
          label="Semester:"
          rules={[{ required: true, message: "Semester wajib diisi" }]}
        >
          <InputNumber placeholder="Semester" min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          name="cpl_prodi"
          label="CPL Prodi:"
          rules={[{ required: true, message: "CPL Prodi wajib diisi" }]}
        >
          <Input placeholder="CPL Prodi" />
        </Form.Item>

        <Form.Item
          name="cpl_mk"
          label="CPL Mata Kuliah:"
          rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi" }]}
        >
          <Input placeholder="CPL Mata Kuliah" />
        </Form.Item>

        <Form.Item
          name="learning_media_softwares"
          label="Software Media Pembelajaran:"
          rules={[{ required: true, message: "Pilih software media" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Software Media">
            {learningMediaSoftwares.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="learning_media_hardwares"
          label="Hardware Media Pembelajaran:"
          rules={[{ required: true, message: "Pilih hardware media" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Hardware Media">
            {learningMediaHardwares.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="study_program_id"
          label="Program Study (Prodi):"
          rules={[{ required: true, message: "Pilih prodi" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih Prodi">
            {studyPrograms.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="subject_id"
          label="Untuk Mata Kuliah:"
          rules={[{ required: true, message: "Pilih matkul" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih Matkul">
            {subjects.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="requirement_subjects"
          label="Mata Kuliah Wajib:"
          rules={[{ required: true, message: "Pilih matkul wajib" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Matkul Wajib">
            {subjects.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dev_lecturers"
          label="Dosen Pengembang:"
          rules={[{ required: true, message: "Pilih dosen pengembang" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Dosen Pengembang">
            {lectures.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teaching_lecturers"
          label="Dosen Pengampu:"
          rules={[{ required: true, message: "Pilih dosen pengampu" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Dosen Pengampu">
            {lectures.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="coordinator_lecturers"
          label="Dosen Koordinator:"
          rules={[{ required: true, message: "Pilih dosen koordinator" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Dosen Koordinator">
            {lectures.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="ka_study_program"
          label="Ka Prodi:"
          rules={[{ required: true, message: "Pilih Ka Prodi" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih Ka Prodi">
            {lectures.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCriteriaValue;
