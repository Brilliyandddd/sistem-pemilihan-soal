import React, { useState } from "react";
import { Form, Input, Modal, Select, Upload, Checkbox, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const AddQuestionForm = ({ visible, onCancel, onSubmit, confirmLoading, form }) => {
  const [fileList, setFileList] = useState([]);

  const handleBeforeUpload = (file) => {
    setFileList([file]);
    return false; // Mencegah upload otomatis
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (fileList.length > 0) {
        values.file = fileList[0];
      }

      onSubmit(values);
    } catch (errorInfo) {
      message.error("Form tidak valid!");
    }
  };

  return (
    <Modal
      title="Tambah Pertanyaan"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Pertanyaan"
          name="title"
          rules={[{ required: true, message: "Silahkan isikan pertanyaan" }]}
        >
          <Input placeholder="Contoh: Apa itu React?" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Pertanyaan"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi pertanyaan" }]}
        >
          <TextArea rows={4} placeholder="Penjelasan tambahan tentang pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Penjelasan"
          name="explanation"
          rules={[{ required: true, message: "Silahkan isikan deskripsi penjelasan" }]}
        >
          <TextArea rows={4} placeholder="Jawaban atau petunjuk jika ada" />
        </Form.Item>

        <Form.Item
          label="Tipe Pertanyaan"
          name="question_type"
          rules={[{ required: true, message: "Silahkan pilih tipe pertanyaan" }]}
        >
          <Select placeholder="Pilih tipe pertanyaan">
            <Option value="IMAGE">Gambar</Option>
            <Option value="AUDIO">Audio</Option>
            <Option value="VIDEO">Video</Option>
            <Option value="NORMAL">Normal</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Tipe Jawaban"
          name="answer_type"
          rules={[{ required: true, message: "Silahkan pilih tipe jawaban" }]}
        >
          <Select placeholder="Pilih tipe jawaban">
            <Option value="MULTIPLE_CHOICE">Pilihan Ganda</Option>
            <Option value="BOOLEAN">Benar / Salah</Option>
            <Option value="COMPLETION">Mengisi Kalimat</Option>
          </Select>
        </Form.Item>

        <Form.Item label="File (opsional)">
          <Upload.Dragger
            name="file"
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onRemove={() => setFileList([])}
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">📂</p>
            <p className="ant-upload-text">Klik atau tarik file ke area ini</p>
            <p className="ant-upload-hint">Mendukung satu file saja.</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item label="Tipe Ujian - Latihan Soal" name="examType" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXERCISE">Exercise</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Tipe Ujian - Quiz" name="examType2" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="QUIZ">Quiz</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Tipe Ujian - UTS/UAS" name="examType3" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXAM">Exam</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddQuestionForm;
