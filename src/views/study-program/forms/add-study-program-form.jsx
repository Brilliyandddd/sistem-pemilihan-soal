import React, { useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";
import { reqValidatUserID } from "@/api/user";

const { TextArea } = Input;

const AddStudyProgramForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  departments,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible]);

  const validateUserID = async (_, value) => {
    if (!value) {
      return Promise.reject("Silahkan isi ID Pengguna");
    }
    if (!/^[a-zA-Z0-9]{1,6}$/.test(value)) {
      return Promise.reject("ID Pengguna harus berupa 1-6 karakter alfanumerik");
    }
    const res = await reqValidatUserID(value);
    if (res.data.status) {
      return Promise.reject("ID Pengguna sudah ada");
    }
    return Promise.resolve();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validasi gagal:", error);
    }
  };

  return (
    <Modal
      title="Tambah Program Studi"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="department_id"
          label="Jurusan:"
          rules={[{ required: true, message: "Silahkan isi jurusan program studi" }]}
        >
          <Select placeholder="Pilih Jurusan">
            {departments.map((arr) => (
              <Select.Option value={arr.id} key={arr.id}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Nama Prodi:"
          rules={[{ required: true, message: "Silahkan isi nama program studi" }]}
        >
          <Input placeholder="Nama program studi" />
        </Form.Item>

        <Form.Item name="description" label="Deskripsi Prodi:">
          <TextArea rows={4} placeholder="Silahkan isi deskripsi program studi" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudyProgramForm;