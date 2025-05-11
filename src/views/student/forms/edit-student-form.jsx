import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Select, Modal, DatePicker } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;

const EditStudentForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  religion,
  user,
  studyProgram,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && currentRowData) {
      form.setFieldsValue({
        ...currentRowData,
        birth_date: currentRowData.birth_date ? dayjs(currentRowData.birth_date) : null,
        religion_id: currentRowData.religion?.id,
        study_program_id: currentRowData.studyProgram?.id,
        user_id: currentRowData.user?.id,
      });
    }
  }, [visible, currentRowData, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (currentRowData.id) values.id = currentRowData.id;
      onOk(values);
    });
  };

  return (
    <Modal
      title="Edit Mahasiswa"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
      <Form.Item label="ID" name="id">
    <Input disabled />
  </Form.Item>

        <Form.Item label="NIM" name="nim" rules={[{ required: true, message: "NIM wajib diisi" }]}>
          <Input placeholder="NIM" />
        </Form.Item>

        <Form.Item label="Nama Lengkap" name="name" rules={[{ required: true, message: "Nama lengkap mahasiswa wajib diisi" }]}>
          <Input placeholder="Nama Lengkap Mahasiswa" />
        </Form.Item>

        <Form.Item label="Tempat Lahir" name="place_born" rules={[{ required: true, message: "Tempat Lahir wajib diisi" }]}>
          <Input placeholder="Tempat Lahir" />
        </Form.Item>

        <Form.Item label="Tanggal Lahir" name="birth_date" rules={[{ required: true, message: "Tanggal Lahir wajib diisi" }]}>
          <DatePicker style={{ width: "100%" }} placeholder="Tanggal Lahir" />
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
          <Select placeholder="Pilih Agama">
            {religion.map((arr) => (
              <Select.Option value={arr.id} key={`religion-${arr.id}`}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Program Studi" name="study_program_id" rules={[{ required: true, message: "Silahkan pilih prodi" }]}>
          <Select placeholder="Pilih Prodi">
            {studyProgram.map((arr) => (
              <Select.Option value={arr.id} key={`study-program-${arr.id}`}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Akun untuk login" name="user_id" rules={[{ required: true, message: "Silahkan pilih akun untuk login" }]}>
          <Select placeholder="Pilih akun untuk login">
            {user.map((arr) => (
              <Select.Option value={arr.id} key={`user-${arr.id}`}>
                {arr.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditStudentForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.number,
    nim: PropTypes.string,
    name: PropTypes.string,
    place_born: PropTypes.string,
    birth_date: PropTypes.string,
    gender: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    religion: PropTypes.shape({
      id: PropTypes.number,
    }),
    studyProgram: PropTypes.shape({
      id: PropTypes.number,
    }),
    user: PropTypes.shape({
      id: PropTypes.number,
    }),
  }).isRequired,
  religion: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  user: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  studyProgram: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
};

export default EditStudentForm;
