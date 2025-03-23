import React, { useState } from "react";
import { Form, Input, Modal, Select, Upload, Checkbox } from "antd";
const { TextArea } = Input;

const AddQuestionForm = ({ visible, onCancel, onOk, confirmLoading, form }) => {
  const [fileList, setFileList] = useState([]);

  const handleBeforeUpload = (file) => {
    setFileList([...fileList, file]);
    return false;
  };

  return (
    <Modal
      title="Tambah Pertanyaan"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form layout="vertical" encType="multipart/form-data">
        <Form.Item label="Pertanyaan :" name="title" rules={[{ required: true, message: "Silahkan isikan pertanyaan" }]}>
          <Input placeholder="Pertanyaan" />
        </Form.Item>
        <Form.Item label="Deskripsi Pertanyaan:" name="description" initialValue="Default value in this form" rules={[{ required: true, message: "Silahkan isikan deskripsi pertanyaan" }]}>
          <TextArea rows={4} placeholder="Deskripsi pertanyaan" />
        </Form.Item>
        <Form.Item label="Penjelasan:" name="explanation" initialValue="Default value in this form" rules={[{ required: true, message: "Silahkan isikan deskripsi penjelasan" }]}>
          <TextArea rows={4} placeholder="Deskripsi penjelasan" />
        </Form.Item>
        <Form.Item label="Tipe Pertanyaan:" name="question_type" initialValue="NORMAL" rules={[{ required: true, message: "Silahkan pilih tipe pertanyaan" }]}>
          <Select placeholder="Pilih tipe pertanyaan">
            <Select.Option value="IMAGE">Gambar</Select.Option>
            <Select.Option value="AUDIO">Musik / Audio</Select.Option>
            <Select.Option value="VIDEO">Video</Select.Option>
            <Select.Option value="NORMAL">Normal</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Tipe Jawaban:" name="answer_type" initialValue="MULTIPLE_CHOICE" rules={[{ required: true, message: "Silahkan pilih tipe jawaban" }]}>
          <Select placeholder="Pilih tipe jawaban">
            <Select.Option value="MULTIPLE_CHOICE">Pilihan Ganda</Select.Option>
            <Select.Option value="BOOLEAN">Benar / Salah</Select.Option>
            <Select.Option value="COMPLETION">Menyelesaikan kalimat rumpang</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="File">
          <Upload.Dragger name="file" beforeUpload={handleBeforeUpload} maxCount={1}>
            <p className="ant-upload-drag-icon">📂</p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item label="untuk latihan soal:" name="examType" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXERCISE">Exercise</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="untuk quiz 1 atau quiz 2:" name="examType2" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="QUIZ">Quiz</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="untuk UTS atau UAS:" name="examType3" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXAM">Exam</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddQuestionForm;