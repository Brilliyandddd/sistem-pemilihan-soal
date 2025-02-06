import React from "react";
import { Form, Input, Modal, DatePicker, Select } from "antd";

const { TextArea } = Input;

const AddStudentForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  religion,
  user,
  studyProgram,
}) => {
  const [form] = Form.useForm(); // Gunakan useForm untuk mendapatkan instance form

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Kirim nilai form saat Ok diklik
    });
  };

  return (
    <Modal
      title="Tambah Mahasiswa"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="NIM" name="nim" rules={[{ required: true, message: "NIM wajib diisi" }]}>
          <Input placeholder="NIM" />
        </Form.Item>
        <Form.Item
          label="Nama Lengkap"
          name="name"
          rules={[{ required: true, message: "Nama lengkap mahasiswa wajib diisi" }]}
        >
          <Input placeholder="Nama Lengkap Mahasiswa" />
        </Form.Item>
        <Form.Item label="Tempat Lahir" name="place_born" rules={[{ required: true, message: "Tempat Lahir wajib diisi" }]}>
          <Input placeholder="Tempat Lahir" />
        </Form.Item>
        <Form.Item
          label="Tanggal Lahir"
          name="birth_date"
          rules={[{ required: true, message: "Tanggal Lahir wajib diisi" }]}
        >
          <DatePicker placeholder="Tanggal Lahir" />
        </Form.Item>
        <Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Gender wajib diisi" }]}>
          <Select placeholder="Gender">
            <Select.Option value="L">Laki-laki</Select.Option>
            <Select.Option value="P">Perempuan</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Nomor Telepon" name="phone" rules={[{ required: true, message: "Nomor telefon wajib diisi" }]}>
          <Input type="number" placeholder="Nomor Telefon (62)" />
        </Form.Item>
        <Form.Item label="Alamat" name="address" rules={[{ required: true, message: "Alamat wajib diisi" }]}>
          <TextArea placeholder="Alamat" />
        </Form.Item>
        <Form.Item label="Agama" name="religion_id" rules={[{ required: true, message: "Silahkan pilih agama" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Agama">
            {religion.map((arr, key) => (
              <Select.Option value={arr.id} key={"religion-" + key}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Program Study (Prodi)" name="study_program_id" rules={[{ required: true, message: "Silahkan pilih prodi" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Prodi">
            {studyProgram.map((arr, key) => (
              <Select.Option value={arr.id} key={"study-program-" + key}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Akun untuk login" name="user_id" rules={[{ required: true, message: "Silahkan pilih akun untuk login" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih akun untuk login">
            {user.map((arr, key) => (
              <Select.Option value={arr.id} key={"user-" + key}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentForm;
