/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;

const EditStudyProgramForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  departments = [],
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        id: currentRowData?.id,
        name: currentRowData?.name,
        department_id: currentRowData?.department_id || undefined, // Pastikan department_id sesuai
        description: currentRowData?.description,
      });
    } else {
      form.resetFields();
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Tambah Program Studi"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        
        {/* 🔹 Dropdown Jurusan */}
        <Form.Item
          name="department_id"
          label="Jurusan:"
          rules={[{ required: true, message: "Silahkan pilih jurusan program studi" }]}
        >
          <Select placeholder="Pilih Jurusan" allowClear>
            {/* 🔹 Pilihan dari daftar departments */}
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Select.Option value={dept.id} key={dept.id}>
                  {dept.name}
                </Select.Option>
              ))
            ) : (
              <Select.Option value="" disabled>
                Tidak ada jurusan tersedia
              </Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="Nama Prodi:"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama program studi" }]}
        >
          <Input placeholder="Nama program studi" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Prodi:"
          name="description"
          rules={[{ required: true, message: "Silahkan isi deskripsi program studi" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi program studi" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStudyProgramForm;
