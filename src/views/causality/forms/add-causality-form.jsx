/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, InputNumber, message } from "antd";
// moment tidak lagi diperlukan di sini karena dateCreated tidak dikirim dari frontend

// Pastikan jalur import ini sudah benar di proyek Anda
import { getSubjects } from "@/api/subject";
import { getLectures } from "@/api/lecture";

const { TextArea } = Input;
const { Option } = Select;

const AddCausalityForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    if (!visible) {
      form.resetFields(); // Reset form saat modal ditutup
    }

    const fetchDropdownData = async () => {
      try {
        // Mengambil data subjects dari API
        const subjectResponse = await getSubjects();
        if (subjectResponse.data && subjectResponse.data.content) {
          setSubjects(subjectResponse.data.content);
        } else {
          message.error("Gagal memuat data mata kuliah: Struktur data tidak sesuai.");
        }

        // Mengambil data lectures dari API
        const lectureResponse = await getLectures();
        if (lectureResponse.data && lectureResponse.data.content) {
          setLectures(lectureResponse.data.content);
        } else {
          message.error("Gagal memuat data dosen: Struktur data tidak sesuai.");
        }
      } catch (error) {
        console.error("Gagal mengambil data dropdown:", error);
        message.error("Gagal memuat data mata kuliah atau dosen dari server.");
      }
    };

    if (visible) {
      // Ambil data hanya saat modal terlihat
      fetchDropdownData();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // dateCreated tidak lagi dikirim dari frontend, backend yang akan mengaturnya.
      // teamTeaching2 dan teamTeaching3 tidak lagi wajib.
      const formattedValues = {
        description: values.description,
        subject: values.subject, // Pastikan `values.subject` adalah ID mata kuliah (String)
        semester: values.semester,
        teamTeaching1: values.teamTeaching1, // <-- CUKUP KIRIM ID SEBAGAI STRING
        teamTeaching2: values.teamTeaching2 || null, // <-- SET KE NULL JIKA TIDAK DIISI
        teamTeaching3: values.teamTeaching3 || null, // <-- SET KE NULL JIKA TIDAK DIISI
      };

      onOk(formattedValues);
      // form.resetFields(); // Reset dilakukan setelah onOk berhasil di parent component
    } catch (error) {
      console.log("Validasi Gagal:", error);
      // Pesan error dari antd form validation sudah cukup muncul di UI
      // message.error("Harap lengkapi semua bidang yang wajib diisi.");
    }
  };

  return (
    <Modal
      title="Tambah Kausalitas"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()} // Reset form saat modal ditutup setelah animasi
    >
      <Form form={form} layout="vertical">
        {/* dateCreated dihapus dari form */}
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
          <Select placeholder="Pilih Mata Kuliah" showSearch optionFilterProp="children">
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
          <Select placeholder="Pilih Dosen Pengajar 1" showSearch optionFilterProp="children">
            {lectures.map((lecture) => (
              <Option key={lecture.id} value={lecture.id}>
                {lecture.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Dosen Pengajar 2 (Opsional):"
          name="teamTeaching2"
          // Rules diubah agar tidak required
        >
          <Select placeholder="Pilih Dosen Pengajar 2" showSearch optionFilterProp="children" allowClear>
            {lectures.map((lecture) => (
              <Option key={lecture.id} value={lecture.id}>
                {lecture.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Dosen Pengajar 3 (Opsional):"
          name="teamTeaching3"
          // Rules diubah agar tidak required
        >
          <Select placeholder="Pilih Dosen Pengajar 3" showSearch optionFilterProp="children" allowClear>
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

export default AddCausalityForm;