import React from "react";
import { Form, Input, Modal, Select} from "antd";

const { TextArea } = Input;
const { Option } = Select;

// eslint-disable-next-line react/prop-types
const AddLearningMediaForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm(); // Menggunakan useForm

  return (
    <Modal
      title="Tambah Media Pembelajaran"
      open={visible}
      onCancel={onCancel}
      onOk={() => onOk(form)} // Kirim form sebagai parameter
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Media Pembelajaran"
          name="name"
          rules={[
            { required: true, message: "Silahkan isikan nama media pembelajaran" },
          ]}
        >
          <Input placeholder="Nama Media Pembelajaran" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Media Pembelajaran"
          name="description"
          rules={[
            { required: true, message: "Silahkan isikan deskripsi media pembelajaran" },
          ]}
        >
          <TextArea rows={4} placeholder="Deskripsi Pengguna" />
        </Form.Item>
        <Form.Item
          label="Pilih tipenya"
          name="type"
          rules={[
            { required: true, message: "Silahkan isikan deskripsi media pembelajaran" },
          ]}
        >
          <Select showSearch style={{ width: 300 }} placeholder="Pilih Tahun Ajaran">
                      <Option value="1">Software</Option>
                      <Option value="2">Hardware</Option>
                    </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLearningMediaForm;
