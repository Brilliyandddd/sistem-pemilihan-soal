/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Modal, DatePicker, Select } from "antd";
import PropTypes from "prop-types";

const { TextArea } = Input;

const AddStudentForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  religion = [],
  user = [],
  studyProgram = [],
  formRef, // Tambahkan formRef agar bisa digunakan dari luar
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef(form); // karena kita kirim function, bukan object
    }
  }, [form, formRef]);
  
  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onOk(values); // Kirim data ke parent
      })
      .catch((err) => {
        console.error("Validasi gagal:", err);
      });
  };

  return (
    <Modal
      title="Tambah Mahasiswa"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="NIM"
          name="nim"
          rules={[{ required: true, message: "NIM wajib diisi" }]}
        >
          <Input placeholder="NIM" />
        </Form.Item>

        <Form.Item
          label="Nama Lengkap"
          name="name"
          rules={[{ required: true, message: "Nama lengkap mahasiswa wajib diisi" }]}
        >
          <Input placeholder="Nama Lengkap Mahasiswa" />
        </Form.Item>

        <Form.Item
          label="Tempat Lahir"
          name="place_born"
          rules={[{ required: true, message: "Tempat Lahir wajib diisi" }]}
        >
          <Input placeholder="Tempat Lahir" />
        </Form.Item>

        <Form.Item
          label="Tanggal Lahir"
          name="birth_date"
          rules={[{ required: true, message: "Tanggal Lahir wajib diisi" }]}
        >
          <DatePicker style={{ width: "100%" }} placeholder="Tanggal Lahir" />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: "Gender wajib diisi" }]}
        >
          <Select placeholder="Gender">
            <Select.Option value="L">Laki-laki</Select.Option>
            <Select.Option value="P">Perempuan</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Nomor Telepon"
          name="phone"
          rules={[{ required: true, message: "Nomor telefon wajib diisi" }]}
        >
          <Input type="number" placeholder="Nomor Telefon (62)" />
        </Form.Item>

        <Form.Item
          label="Alamat"
          name="address"
          rules={[{ required: true, message: "Alamat wajib diisi" }]}
        >
          <TextArea placeholder="Alamat" />
        </Form.Item>

        <Form.Item
          label="Agama"
          name="religion_id"
          rules={[{ required: true, message: "Silahkan pilih agama" }]}
        >
          <Select placeholder="Pilih Agama">
            {religion.map((arr, key) => (
              <Select.Option value={arr.id} key={`religion-${key}`}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Program Study (Prodi)"
          name="study_program_id"
          rules={[{ required: true, message: "Silahkan pilih prodi" }]}
        >
          <Select placeholder="Pilih Prodi">
            {studyProgram.map((arr, key) => (
              <Select.Option value={arr.id} key={`study-program-${key}`}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Akun untuk login"
          name="user_id"
          rules={[{ required: true, message: "Silahkan pilih akun untuk login" }]}
        >
          <Select placeholder="Pilih akun untuk login">
            {user.map((arr, key) => (
              <Select.Option value={arr.id} key={`user-${key}`}>
                {arr.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddStudentForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  religion: PropTypes.array,
  user: PropTypes.array,
  studyProgram: PropTypes.array,
  formRef: PropTypes.shape({ current: PropTypes.any }),
};

AddStudentForm.defaultProps = {
  confirmLoading: false,
  religion: [],
  user: [],
  studyProgram: [],
  formRef: null,
};


export default AddStudentForm;
