import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, InputNumber, Modal, Select } from "antd";

const { Option } = Select;

const EditRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  studyProgram,
  subject,
  lecture,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && currentRowData) {
      form.setFieldsValue({
        id: currentRowData.id || "",
        name: currentRowData.name || "",
        sks: currentRowData.sks || 1,
        semester: currentRowData.semester || 1,
        cpl_prodi: currentRowData.cpl_prodi || "",
        cpl_mk: currentRowData.cpl_mk || "",
        software_media: currentRowData.software_media || "",
        hardware_media: currentRowData.hardware_media || "",
        study_program_id: currentRowData?.studyProgram?.id || "",
        subject_id: currentRowData?.subject?.id || "",
        mandatory: currentRowData.mandatory ?? true,
        developer_lecturer_id: currentRowData?.developer_lecturer_id || "",
        instructor_lecturer_id: currentRowData?.instructor_lecturer_id || "",
        coordinator_lecturer_id: currentRowData?.coordinator_lecturer_id || "",
      });
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Edit RPS"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama RPS"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Jumlah SKS"
          name="sks"
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Semester"
          name="semester"
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="CPL Prodi"
          name="cpl_prodi"
          rules={[{ required: true, message: "CPL Prodi wajib diisi!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="CPL Mata Kuliah"
          name="cpl_mk"
          rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Software Media Pembelajaran" name="software_media">
          <Input />
        </Form.Item>

        <Form.Item label="Hardware Media Pembelajaran" name="hardware_media">
          <Input />
        </Form.Item>

        <Form.Item
          label="Program Studi"
          name="study_program_id"
          rules={[{ required: true, message: "Program Studi wajib dipilih!" }]}
        >
          <Select placeholder="Pilih Program Studi">
  {Array.isArray(studyProgram) && studyProgram.map((arr) => (
    <Select.Option value={arr.id} key={`study-program-${arr.id}`}>
      {arr.name}
    </Select.Option>
  ))}
</Select>

        </Form.Item>

        <Form.Item
          label="Mata Kuliah"
          name="subject_id"
          rules={[{ required: true, message: "Mata Kuliah wajib dipilih!" }]}
        >
          <Select placeholder="Pilih Mata Kuliah">
    {Array.isArray(subject) && subject.map((subjectItem) => (
      <Option key={subjectItem.id} value={subjectItem.id}>
        {subjectItem.name}
      </Option>
    ))}
  </Select>
        </Form.Item>

        <Form.Item
          label="Mata Kuliah Wajib"
          name="mandatory"
          rules={[{ required: true, message: "Status wajib/tidak wajib harus diisi!" }]}
        >
          <Select placeholder="Pilih status">
            <Option value={true}>Wajib</Option>
            <Option value={false}>Tidak Wajib</Option>
          </Select>
        </Form.Item>

        <Form.Item
  label="Dosen Pengembang"
  name="developer_lecturer_id"
  rules={[{ required: true, message: "Nama Dosen Pengembang wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Pengembang">
    {Array.isArray(lecture) && lecture.map((dosen) => (
      <Option key={dosen.id} value={dosen.id}>
        {dosen.name}
      </Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label="Dosen Pengampu"
  name="instructor_lecturer_id"
  rules={[{ required: true, message: "Nama Dosen Pengampu wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Pengampu">
    {Array.isArray(lecture) && lecture.map((dosen) => (
      <Option key={dosen.id} value={dosen.id}>
        {dosen.name}
      </Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label="Dosen Koordinator"
  name="coordinator_lecturer_id"
  rules={[{ required: true, message: "Nama Dosen Koordinator wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Koordinator">
    {Array.isArray(lecture) && lecture.map((dosen) => (
      <Option key={dosen.id} value={dosen.id}>
        {dosen.name}
      </Option>
    ))}
  </Select>
</Form.Item>

      </Form>
    </Modal>
  );
};

EditRPSForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    sks: PropTypes.number,
    semester: PropTypes.number,
    cpl_prodi: PropTypes.string,
    cpl_mk: PropTypes.string,
    software_media: PropTypes.string,
    hardware_media: PropTypes.string,
    studyProgram: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    subject: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    mandatory: PropTypes.bool,
    developer_lecturer_id: PropTypes.number,
    instructor_lecturer_id: PropTypes.number,
    coordinator_lecturer_id: PropTypes.number,
  }).isRequired,
  studyProgram: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  subject: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  lecture: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
};

export default EditRPSForm;
