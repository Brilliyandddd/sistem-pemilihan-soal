import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form, Input, Select, Modal, DatePicker } from "antd";

const { TextArea } = Input;

const EditLectureForm = ({
  formRef,
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  religion = [],
  studyProgram = [],
  user = [],
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

useEffect(() => {
  if (currentRowData) {
    form.setFieldsValue({
      id: currentRowData.id,
      nidn: currentRowData.nidn,
      name: currentRowData.name,
      place_born: currentRowData.place_born,
      date_born: currentRowData.date_born
        ? moment(currentRowData.date_born, "YYYY-MM-DD")
        : null,
      gender: currentRowData.gender,
      phone: currentRowData.phone,
      address: currentRowData.address,
      religion_id: currentRowData.religion?.id,
      study_program_id: currentRowData.studyProgram?.id,
      user_id: currentRowData.user?.id,
    });
  }
}, [currentRowData, form]);


  return (
    <Modal
      title="Mengedit Dosen"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Dosen:" name="id">
          <Input disabled />
        </Form.Item>

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
          <Input type="text" />
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
          <Select placeholder="Pilih Akun">
            {user.map((arr, key) => (
              <Select.Option value={arr.id} key={`user-${key}`}>
                {arr.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditLectureForm.propTypes = {
  formRef: PropTypes.shape({ current: PropTypes.any }),
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.string,
    nidn: PropTypes.string,
    name: PropTypes.string,
    place_born: PropTypes.string,
    date_born: PropTypes.string,
    gender: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    religion: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
    studyProgram: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string,
    }),
  }),
  
  religion: PropTypes.array,
  studyProgram: PropTypes.array,
  user: PropTypes.array,
};

export default EditLectureForm;