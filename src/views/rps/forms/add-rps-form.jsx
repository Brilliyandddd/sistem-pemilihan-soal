import React from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";

const AddRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  studyPrograms = [],
  learningMediaSoftwares = [],
  learningMediaHardwares = [],
  subjects = [],
  lecturers = [],
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.error("Validasi Gagal:", error);
    }
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
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nama" rules={[{ required: true, message: "Nama wajib diisi" }]}>
          <Input placeholder="Nama RPS" />
        </Form.Item>

        <Form.Item name="sks" label="SKS" rules={[{ required: true, message: "SKS wajib diisi" }]}>
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Jumlah SKS" />
        </Form.Item>

        <Form.Item name="semester" label="Semester" rules={[{ required: true, message: "Semester wajib diisi" }]}>
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Semester" />
        </Form.Item>

        <Form.Item name="cpl_prodi" label="CPL Prodi" rules={[{ required: true, message: "CPL Prodi wajib diisi" }]}>
          <Input placeholder="CPL Prodi" />
        </Form.Item>

        <Form.Item name="cpl_mk" label="CPL Mata Kuliah" rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi" }]}>
          <Input placeholder="CPL Mata Kuliah" />
        </Form.Item>

        <Form.Item name="learning_media_softwares" label="Software Media Pembelajaran" rules={[{ required: true, message: "Silahkan pilih Software Media Pembelajaran" }]}>
          <Select mode="multiple" placeholder="Pilih Software">
            {learningMediaSoftwares.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="learning_media_hardwares" label="Hardware Media Pembelajaran" rules={[{ required: true, message: "Silahkan pilih Hardware Media Pembelajaran" }]}>
          <Select mode="multiple" placeholder="Pilih Hardware">
            {learningMediaHardwares.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="study_program_id" label="Program Studi (Prodi)" rules={[{ required: true, message: "Silahkan pilih prodi" }]}>
          <Select placeholder="Pilih Prodi">
            {studyPrograms.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="subject_id" label="Mata Kuliah" rules={[{ required: true, message: "Silahkan pilih matkul" }]}>
          <Select placeholder="Pilih Mata Kuliah">
            {subjects.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="dev_lecturers" label="Dosen Pengembang" rules={[{ required: true, message: "Silahkan pilih Dosen Pengembang" }]}>
          <Select mode="multiple" placeholder="Pilih Dosen">
            {lecturers.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="teaching_lecturers" label="Dosen Pengajar" rules={[{ required: true, message: "Silahkan pilih Dosen Pengajar" }]}>
          <Select mode="multiple" placeholder="Pilih Dosen">
            {lecturers.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="coordinator_lecturers" label="Dosen Koordinator" rules={[{ required: true, message: "Silahkan pilih Dosen Koordinator" }]}>
          <Select mode="multiple" placeholder="Pilih Dosen">
            {lecturers.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="ka_study_program" label="Ketua Program Studi" rules={[{ required: true, message: "Silahkan pilih Ketua Program Studi" }]}>
          <Select placeholder="Pilih Ketua Program Studi">
            {lecturers.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRPSForm;