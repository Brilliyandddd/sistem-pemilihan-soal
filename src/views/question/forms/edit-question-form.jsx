import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select, Checkbox } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditQuestionForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      id: currentRowData?.id,
      title: currentRowData?.title,
      description: currentRowData?.description,
      questionType: currentRowData?.questionType,
      answerType: currentRowData?.answerType,
      examType: currentRowData?.examType === "EXERCISE" ? ["EXERCISE"] : [],
      examType2: currentRowData?.examType2 === "QUIZ" ? ["QUIZ"] : [],
      examType3: currentRowData?.examType3 === "EXAM" ? ["EXAM"] : [],
    });
  }, [currentRowData, form]);

  return (
    <Modal
      title="Edit Pertanyaan"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Pertanyaan" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Pertanyaan"
          name="title"
          rules={[{ required: true, message: "Silakan isikan pertanyaan" }]}
        >
          <Input placeholder="Contoh: Apa itu React?" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Pertanyaan"
          name="description"
          rules={[{ required: true, message: "Silakan isikan deskripsi" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi tambahan tentang pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Tipe Pertanyaan"
          name="questionType"
          rules={[{ required: true, message: "Silakan pilih tipe pertanyaan" }]}
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
          name="answerType"
          rules={[{ required: true, message: "Silakan pilih tipe jawaban" }]}
        >
          <Select placeholder="Pilih tipe jawaban">
            <Option value="MULTIPLE_CHOICE">Pilihan Ganda</Option>
            <Option value="BOOLEAN">Benar / Salah</Option>
            <Option value="COMPLETION">Mengisi Kalimat</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Untuk Latihan Soal" name="examType" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXERCISE">Exercise</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Untuk Quiz 1 / Quiz 2" name="examType2" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="QUIZ">Quiz</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="Untuk UTS / UAS" name="examType3" initialValue={[]}>
          <Checkbox.Group>
            <Checkbox value="EXAM">Exam</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQuestionForm;
