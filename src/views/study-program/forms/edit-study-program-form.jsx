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
        department_id: currentRowData?.department_id, // Perbaikan: akses department_id langsung
        description: currentRowData?.description,
      });
    } else {
      form.resetFields();
    }
  }, [visible, currentRowData, form]);

  return (
    <Modal
      title="Edit Program Studi"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Program Studi:" name="id">
          <Input disabled />
        </Form.Item>

        {/* 🔹 Dropdown Jurusan */}
        <Form.Item
          name="department_id"
          label="Jurusan:"
          rules={[{ required: true, message: "Silahkan pilih jurusan program studi" }]}
        >
          <Select
            placeholder="Pilih Jurusan"
            allowClear
          >
            {/* 🔹 CurrentRowData sebagai nilai default */}
            {currentRowData?.department_id && (
              <Select.Option value={currentRowData.department_id} key="selected">
                {departments.find((dept) => dept.id === currentRowData.department_id)?.name || "Jurusan Tidak Diketahui"}
              </Select.Option>
            )}

            {/* 🔹 Pilihan dari daftar departments */}
            {departments.map((dept) => (
              <Select.Option value={dept.id} key={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
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
