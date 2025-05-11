/* eslint-disable no-unused-vars */
import React, { useEffect , useState} from "react";
import PropTypes from "prop-types";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import { getLearningMedias} from "@/api/learningMedia";
import {getLectures} from "@/api/lecture";

const { Option } = Select;

const AddRPSForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  studyProgram = [],
  subject = [],
  lecture = [],
}) => {
  const [form] = Form.useForm();
  const [learningMedias, setLearningMedias] = useState({ software: [], hardware: [] });
  const [lectures, setLectures] = useState({developer_lecturer_id:[], coordinator_lecturer_id:[], instructor_lecturer_id:[]});
  console.log("Data Program Studi:", studyProgram);
  console.log("Data Mata Kuliah:", subject);
  console.log("Data Dosen:", lecture);

  const fetchLearningMedias = async () => {
    try {
      const result = await getLearningMedias();
      if (result.data.statusCode === 200) {
        const softwareMedias = result.data.content.filter(learning_media => learning_media.type === 1);
      const hardwareMedias = result.data.content.filter(learning_media => learning_media.type === 2);
      
      setLearningMedias({ software: softwareMedias, hardware: hardwareMedias });
      } else {
        message.error("Gagal mengambil data");
      }

    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
};

const fetchLecture = async () => {
  try {
    const result = await getLectures();
    if (result.data.statusCode === 200) {
      setLectures(result.data.content);
    } else {
      message.error("Gagal mengambil data");
    }
  } catch (error) {
    message.error("Terjadi kesalahan: " + error.message);
  }
};
  useEffect(() => {
    if (visible) {
      form.resetFields();
      fetchLearningMedias();
      fetchLecture();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Data yang dikirim:", values); // Tambahkan log untuk data
      await onOk(values);  // Pastikan onOk menangani data ini dengan benar
      form.resetFields();
    } catch (error) {
      console.error("Validasi Gagal:", error);
    }
  };
  
  return (
    <Modal
      width={800}
      title="Tambah RPS"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nama RPS"
          rules={[{ required: true, message: "Nama RPS wajib diisi!" }]}
        >
          <Input placeholder="Masukkan Nama RPS" />
        </Form.Item>

        <Form.Item
          name="sks"
          label="Jumlah SKS"
          rules={[
            { required: true, message: "Jumlah SKS wajib diisi!" },
            { type: "number", min: 1, message: "SKS harus lebih dari 0!" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Masukkan jumlah SKS" />
        </Form.Item>

        <Form.Item
          name="semester"
          label="Semester"
          rules={[
            { required: true, message: "Semester wajib diisi!" },
            { type: "number", min: 1, message: "Semester harus lebih dari 0!" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="Masukkan semester" />
        </Form.Item>

        <Form.Item
          name="cplProdi"
          label="CPL Program Studi"
          rules={[{ required: true, message: "CPL Prodi wajib diisi!" }]}
        >
          <Input placeholder="Masukkan CPL Prodi" />
        </Form.Item>

        <Form.Item
          name="cplMk"
          label="CPL Mata Kuliah"
          rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi!" }]}
        >
          <Input placeholder="Masukkan CPL Mata Kuliah" />
        </Form.Item>

        <Form.Item
          name="software"
          label="Software Media Pembelajaran"
          rules={[{ required: true, message: "Software wajib diisi!" }]}
        >
          <Select placeholder="Pilih Kelas">
                {learningMedias.software.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
              </Select>

        </Form.Item>

        <Form.Item
          name="hardware"
          label="Hardware Media Pembelajaran"
          rules={[{ required: true, message: "Hardware wajib diisi!" }]}
        >
          <Select placeholder="Pilih Kelas">
                {learningMedias.hardware.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
              </Select>
        </Form.Item>

        <Form.Item
          name="idProgramStudi"
          label="Program Studi"
          rules={[{ required: true, message: "Program Studi wajib dipilih!" }]}
        >
          <Select placeholder="Pilih Prodi">
            {Array.isArray(studyProgram) && studyProgram.map((arr) => (
              <Option value={arr.id} key={arr.id}>
                {arr.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="idSubject"
          label="Mata Kuliah"
          rules={[{ required: true, message: "Mata Kuliah wajib dipilih!" }]}
        >
          <Select placeholder="Pilih Mata Kuliah">
            {Array.isArray(subject) && subject.map((mk) => (
              <Option key={mk.id} value={mk.id}>
                {mk.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {/* <Form.Item
          name="mandatory"
          label="Mata Kuliah Wajib?"
          rules={[{ required: true, message: "Silakan pilih status wajib." }]}
        >
          <Select placeholder="Pilih status">
            <Option value={true}>Wajib</Option>
            <Option value={false}>Tidak Wajib</Option>
          </Select>
        </Form.Item> */}

        <Form.Item
  name="developer_lecturer_id"
  label="Dosen Pengembang"
  rules={[{ required: true, message: "Nama Dosen Pengembang wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Pengembang">
  {lecture.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
  </Select>
</Form.Item>

<Form.Item
  name="instructor_lecturer_id"
  label="Dosen Pengampu"
  rules={[{ required: true, message: "Nama Dosen Pengampu wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Pengampu">
  {lecture.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
  </Select>
</Form.Item>

<Form.Item
  name="coordinator_lecturer_id"
  label="Dosen Koordinator"
  rules={[{ required: true, message: "Nama Dosen Koordinator wajib dipilih!" }]}
>
  <Select placeholder="Pilih Dosen Koordinator">
  {lecture.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
  </Select>
</Form.Item>

      </Form>
    </Modal>
  );
};

AddRPSForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  studyProgram: PropTypes.array,  // Ensure it's an array
  subject: PropTypes.array,      // Ensure it's an array
  lecture: PropTypes.array,
};

AddRPSForm.defaultProps = {
  confirmLoading: false,
  subject: [],
  lecture: [],
  studyProgram: [],
  formRef: null,
};

export default AddRPSForm;
