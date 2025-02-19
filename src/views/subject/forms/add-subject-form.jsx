import React from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const AddSubjectForm = ({ visible, onCancel, onOk, confirmLoading, subjectGroups, studyPrograms }) => {
  const [form] = Form.useForm(); // Use the useForm hook to get the form instance

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values); // Pass the form values to the parent component
    });
  };

  return (
    <Modal
      title="Tambah Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama:" name="name" rules={[{ required: true, message: "Silahkan isikan nama mata kuliah" }]}>
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Deskripsi:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi mata kuliah" }]}>
          <TextArea rows={4} placeholder="Deskripsi Pengguna" />
        </Form.Item>
        <Form.Item label="Point Kredit:" name="credit_point" rules={[{ required: true, message: "Silahkan isikan point kredit mata kuliah" }]}>
          <InputNumber style={{ width: 300 }} min={1} placeholder="Point Kredit" />
        </Form.Item>
        <Form.Item label="Tahun Mata Kuliah:" name="year_commenced" rules={[{ required: true, message: "Silahkan isikan tahun mata kuliah" }]}>
          <Select showSearch style={{ width: 300 }} placeholder="Pilih Tahun Ajaran" optionFilterProp="children" filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }>
            <Option value="2022">2022</Option>
            <Option value="2023">2023</Option>
            <Option value="2024">2024</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Program Study:" name="study_program_id" rules={[{ required: true, message: "Silahkan pilih program studi" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Program Study">
            {studyPrograms.map((arr, key) => (
              <Select.Option value={arr.id} key={key}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Rumpun Mata Kuliah:" name="subject_group_id" rules={[{ required: true, message: "Silahkan pilih rumpun mata kuliah" }]}>
          <Select style={{ width: 300 }} placeholder="Pilih Rumpun Matakuliah">
            {subjectGroups.map((arr, key) => (
              <Select.Option value={arr.id} key={key}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectForm;
