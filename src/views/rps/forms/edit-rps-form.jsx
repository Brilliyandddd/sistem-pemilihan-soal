/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";
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
}) => {
  const [form] = Form.useForm();
  const [learningMedias, setLearningMedias] = useState({ software: [], hardware: [] });
  const [lectures, setLectures] = useState([]);

  const fetchLearningMedias = async () => {
    try {
      const result = await getLearningMedias();
      if (result.data.statusCode === 200) {
        const softwareMedias = result.data.content.filter(media => media.type === 1);
        const hardwareMedias = result.data.content.filter(media => media.type === 2);
        setLearningMedias({ software: softwareMedias, hardware: hardwareMedias });
      } else {
        message.error("Gagal mengambil data learning media");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchLectures = async () => {
    try {
      const result = await getLectures();
      if (result.data.statusCode === 200) {
        setLectures(result.data.content);
      } else {
        message.error("Gagal mengambil data dosen");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchLearningMedias();
      fetchLectures();

    if (currentRowData) {
      // const learningMedia = currentRowData.learningMedia || [];
      const lecturer = currentRowData.lecture || [];
        form.setFieldsValue({
          idRps: currentRowData.idRps || "",
          nameRps: currentRowData.nameRps || "",
          sks: currentRowData.sks || 1,
          semester: currentRowData.semester || 1,
          cplProdi: currentRowData.cplProdi || "",
          cplMk: currentRowData.cplMk || "",
          // idLearningMediaSoftware: currentRowData.learningMedia?.id || "",
          // idLearningMediaHardware: currentRowData.learningMedia?.id || "",
          idLearningMediaSoftware: currentRowData.learningMediaSoftware.id || "",
          idLearningMediaHardware: currentRowData.learningMediaHardware.id || "",
          idProgramStudi: currentRowData.studyProgram?.id || "",
          idSubject: currentRowData.subject?.id || "",
          // developer_lecturer_id: currentRowData.lecture?.developer_lecturer_id || "",
          // instructor_lecturer_id: currentRowData.lecture?.instructor_lecturer_id || "",
          // coordinator_lecturer_id: currentRowData.lecture?.coordinator_lecturer_id || "",
          developer_lecturer_id: lecturer[4] || "",
          instructor_lecturer_id: lecturer[8] || "",
          coordinator_lecturer_id: lecturer[0] || "",
        });
      }
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
        <Form.Item label="ID" name="idRps">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama RPS"
          name="nameRps"
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
          name="cplProdi"
          rules={[{ required: true, message: "CPL Prodi wajib diisi!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="CPL Mata Kuliah"
          name="cplMk"
          rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi!" }]}
        >
          <Input />
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
    <Select.Option value={arr.id} key={`study-program-${arr.id}`}>
      {arr.name}
    </Select.Option>
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

        {/* Dosen Pengampu */}
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

        {/* Dosen Koordinator */}
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

EditRPSForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    idRps: PropTypes.number,
    nameRps: PropTypes.string,
    sks: PropTypes.number,
    semester: PropTypes.number,
    cplProdi: PropTypes.string,
    cplMk: PropTypes.string,
    idLearningMediaSoftware: PropTypes.string,
    idLearningMediaHardware: PropTypes.string,
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
  // studyProgram: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.number,
  //     name: PropTypes.string,
  //   })
  // ).isRequired,
  // subject: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.number,
  //     name: PropTypes.string,
  //   })
  // ).isRequired,
};

export default EditRPSForm;
