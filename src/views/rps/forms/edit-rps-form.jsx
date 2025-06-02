/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import PropTypes from "prop-types";
import { getLearningMedias } from "@/api/learningMedia";
import { getLectures } from "@/api/lecture";


const { Option } = Select;

const EditRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  studyProgram,
  subject,
  // lecture prop is passed, but it's better to fetch it directly in the component if it's dynamic
}) => {
  const [form] = Form.useForm();
  const [learningMedias, setLearningMedias] = useState({ software: [], hardware: [] });
  const [lectures, setLectures] = useState([]); // State to hold lectures fetched inside this component

  // Fetch Learning Medias
  const fetchLearningMedias = async () => {
    try {
      const result = await getLearningMedias();
      if (result.data.statusCode === 200) {
        const softwareMedias = result.data.content.filter(media => media.type === 1);
        const hardwareMedias = result.data.content.filter(media => media.type === 2);
        setLearningMedias({ software: softwareMedias, hardware: hardwareMedias });
      } else {
        message.error("Gagal mengambil data media pembelajaran");
      }
    } catch (error) {
      console.error("Error fetching learning medias:", error);
      message.error("Terjadi kesalahan saat mengambil media pembelajaran: " + error.message);
    }
  };

  // Fetch Lectures
  const fetchLectures = async () => {
    try {
      const result = await getLectures();
      if (result.data.statusCode === 200) {
        setLectures(result.data.content);
      } else {
        message.error("Gagal mengambil data dosen");
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      message.error("Terjadi kesalahan saat mengambil data dosen: " + error.message);
    }
  };

  // Effect to load data when modal becomes visible or currentRowData changes
  useEffect(() => {
    if (visible) {
      form.resetFields(); // Reset fields when modal opens
      fetchLearningMedias();
      fetchLectures();

      if (currentRowData) {
        // Set form fields with currentRowData
        form.setFieldsValue({
          idRps: currentRowData.idRps || "",
          nameRps: currentRowData.nameRps || "",
          sks: currentRowData.sks || 1,
          semester: currentRowData.semester || 1,
          cplProdi: currentRowData.cplProdi || "",
          cplMk: currentRowData.cplMk || "",
          // Ensure these paths match your API response structure for nested objects
          idLearningMediaSoftware: currentRowData.learningMediaSoftware?.id || "",
          idLearningMediaHardware: currentRowData.learningMediaHardware?.id || "",
          idProgramStudi: currentRowData.studyProgram?.id || "",
          idSubject: currentRowData.subject?.id || "",
          // For lecturers, assume the backend sends specific IDs directly
          // If lecture is an array of objects, access 'id' property
          developer_lecturer_id: currentRowData.developerLecturer?.id || "",
          instructor_lecturer_id: currentRowData.instructorLecturer?.id || "",
          coordinator_lecturer_id: currentRowData.coordinatorLecturer?.id || "",
        });
      }
    }
  }, [visible, currentRowData, form]); // Added `form` to dependency array

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Data yang dikirim dari EditRPSForm:", values);
      await onOk(values); // Pass the validated values to the onOk prop
      form.resetFields(); // Reset fields after successful submission
    } catch (error) {
      console.error("Validasi Gagal di EditRPSForm:", error);
      // Ant Design form validation errors are usually caught by validateFields()
      // If other errors occur, message them
      if (error.errorFields) {
        message.error("Harap lengkapi semua bidang yang diperlukan.");
      } else {
        message.error("Gagal mengedit RPS: " + error.message);
      }
    }
  };

  return (
    <Modal
      width={800} // Set width for better layout
      title="Edit RPS"
      open={visible}
      onCancel={() => {
        form.resetFields(); // Reset fields on cancel
        onCancel();
      }}
      onOk={handleOk} // Call handleOk for validation and submission
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID" name="idRps">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama RPS"
          name="nameRps"
          rules={[{ required: true, message: "Nama RPS wajib diisi!" }]}
        >
          <Input placeholder="Masukkan Nama RPS" />
        </Form.Item>

        <Form.Item
          label="Jumlah SKS"
          name="sks"
          rules={[
            { required: true, message: "Jumlah SKS wajib diisi!" },
            { type: "number", min: 1, message: "SKS harus lebih dari 0!" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Masukkan jumlah SKS" />
        </Form.Item>

        <Form.Item
          label="Semester"
          name="semester"
          rules={[
            { required: true, message: "Semester wajib diisi!" },
            { type: "number", min: 1, message: "Semester harus lebih dari 0!" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Masukkan semester" />
        </Form.Item>

        <Form.Item
          label="CPL Prodi"
          name="cplProdi"
          rules={[{ required: true, message: "CPL Prodi wajib diisi!" }]}
        >
          <Input placeholder="Masukkan CPL Prodi" />
        </Form.Item>

        <Form.Item
          label="CPL Mata Kuliah"
          name="cplMk"
          rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi!" }]}
        >
          <Input placeholder="Masukkan CPL Mata Kuliah" />
        </Form.Item>

        <Form.Item
          name="idLearningMediaSoftware"
          label="Software Media Pembelajaran"
          rules={[{ required: true, message: "Software wajib diisi!" }]}
        >
          <Select placeholder="Pilih Software Media Pembelajaran">
            {learningMedias.software.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="idLearningMediaHardware"
          label="Hardware Media Pembelajaran"
          rules={[{ required: true, message: "Hardware wajib diisi!" }]}
        >
          <Select placeholder="Pilih Hardware Media Pembelajaran">
            {learningMedias.hardware.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Program Studi"
          name="idProgramStudi"
          rules={[{ required: true, message: "Program Studi wajib dipilih!" }]}
        >
          <Select placeholder="Pilih Program Studi">
            {Array.isArray(studyProgram) && studyProgram.map((arr) => (
              <Option value={arr.id} key={`study-program-${arr.id}`}>
                {arr.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Mata Kuliah"
          name="idSubject"
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
          name="developer_lecturer_id"
          label="Dosen Pengembang"
          rules={[{ required: true, message: "Dosen Pengembang wajib dipilih!" }]}
        >
          <Select
            placeholder="Pilih Dosen Pengembang"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {lectures.map(lecturer => (
              <Option key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="instructor_lecturer_id"
          label="Dosen Pengampu"
          rules={[{ required: true, message: "Dosen Pengampu wajib dipilih!" }]}
        >
          <Select
            placeholder="Pilih Dosen Pengampu"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {lectures.map(lecturer => (
              <Option key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="coordinator_lecturer_id"
          label="Dosen Koordinator"
          rules={[{ required: true, message: "Dosen Koordinator wajib dipilih!" }]}
        >
          <Select
            placeholder="Pilih Dosen Koordinator"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {lectures.map(lecturer => (
              <Option key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// PropTypes for validation
EditRPSForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    idRps: PropTypes.string, // Assuming ID is string from backend
    nameRps: PropTypes.string,
    sks: PropTypes.number,
    semester: PropTypes.number,
    cplProdi: PropTypes.string,
    cplMk: PropTypes.string,
    learningMediaSoftware: PropTypes.shape({ id: PropTypes.string }), // Check nested ID
    learningMediaHardware: PropTypes.shape({ id: PropTypes.string }), // Check nested ID
    studyProgram: PropTypes.shape({
      id: PropTypes.string, // Assuming ID is string from backend
      name: PropTypes.string,
    }),
    subject: PropTypes.shape({
      id: PropTypes.string, // Assuming ID is string from backend
      name: PropTypes.string,
    }),
    developerLecturer: PropTypes.shape({ id: PropTypes.string }), // Check nested ID
    instructorLecturer: PropTypes.shape({ id: PropTypes.string }), // Check nested ID
    coordinatorLecturer: PropTypes.shape({ id: PropTypes.string }), // Check nested ID
  }).isRequired,
  studyProgram: PropTypes.array,
  subject: PropTypes.array,
};

EditRPSForm.defaultProps = {
  confirmLoading: false,
  studyProgram: [],
  subject: [],
};

export default EditRPSForm;