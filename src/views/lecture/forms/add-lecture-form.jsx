import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Modal, DatePicker, Select } from "antd";

const { TextArea } = Input;

const AddLectureForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  religion,
  user,
  studyProgram,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Mengedit"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item
          label="NIDN:"
          name="nidn"
          rules={[{ required: true, message: "NIDN wajib diisi" }]}
        >
          <Input placeholder="NIDN" />
        </Form.Item>

        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Nama depan wajib diisi" }]}
        >
          <Input placeholder="Nama" />
        </Form.Item>

        <Form.Item
          label="Tempat Lahir:"
          name="place_born"
          rules={[{ required: true, message: "Tempat Lahir wajib diisi" }]}
        >
          <Input placeholder="Tempat Lahir" />
        </Form.Item>

        <Form.Item
          label="Tanggal Lahir:"
          name="date_born"
          rules={[{ required: true, message: "Tanggal Lahir wajib diisi" }]}
        >
          <DatePicker placeholder="Tanggal Lahir" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Gender:"
          name="gender"
          rules={[{ required: true, message: "Gender wajib diisi" }]}
        >
          <Select placeholder="Gender">
            <Select.Option value="L">Laki-laki</Select.Option>
            <Select.Option value="P">Perempuan</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Nomor Telepon:"
          name="phone"
          rules={[{ required: true, message: "Nomor telefon wajib diisi" }]}
        >
          <Input type="number" placeholder="Nomor Telefon (62)" />
        </Form.Item>

        <Form.Item name="status" initialValue="dosen" hidden>
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Alamat:"
          name="address"
          rules={[{ required: true, message: "Alamat wajib diisi" }]}
        >
          <TextArea placeholder="Alamat" />
        </Form.Item>

        <Form.Item
          label="Agama:"
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
          label="Program Study (Prodi):"
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
          label="Akun untuk login:"
          name="user_id"
          rules={[{ required: true, message: "Silahkan pilih akun untuk login" }]}
        >
          <Select placeholder="Pilih akun untuk login">
            {user.map((arr, key) => (
              <Select.Option value={arr.id} key={`user-${key}`}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddLectureForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  religion: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  user: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  studyProgram: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default AddLectureForm;
