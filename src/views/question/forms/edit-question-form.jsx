import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select, Checkbox } from "antd";

const { TextArea } = Input;

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
      title="Edit Jurusan"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Pertanyaan:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item 
          label="Pertanyaan:" 
          name="title" 
          rules={[{ required: true, message: "Silahkan isikan nama jurusan" }]}
        >
          <Input placeholder="Pertanyaan" />
        </Form.Item>
        <Form.Item 
          label="Deskripsi Jurusan:" 
          name="description" 
          rules={[{ required: true, message: "Silahkan isikan deskripsi jurusan" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Pertanyaan" />
        </Form.Item>
        <Form.Item 
          label="Tipe Pertanyaan:" 
          name="questionType" 
          rules={[{ required: true, message: "Silahkan pilih tipe pertanyaan" }]}
        >
          <Select placeholder="Pilih tipe pertanyaan">
            <Select.Option value="IMAGE">Gambar</Select.Option>
            <Select.Option value="AUDIO">Musik / Audio</Select.Option>
            <Select.Option value="VIDEO">Video</Select.Option>
            <Select.Option value="NORMAL">Normal</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          label="Tipe Jawaban:" 
          name="answerType" 
          rules={[{ required: true, message: "Silahkan pilih tipe jawaban" }]}
        >
          <Select placeholder="Pilih tipe jawaban">
            <Select.Option value="MULTIPLE_CHOICE">Pilihan Ganda</Select.Option>
            <Select.Option value="BOOLEAN">Benar / Salah</Select.Option>
            <Select.Option value="COMPLETION">Menyelesaikan kalimat rumpang</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Pilih jenis soal:" name="examType" valuePropName="checked">
          <Checkbox.Group>
            <Checkbox value="EXERCISE">Exercise</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="Pilih jenis soal:" name="examType2" valuePropName="checked">
          <Checkbox.Group>
            <Checkbox value="QUIZ">Quiz</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="Pilih jenis soal:" name="examType3" valuePropName="checked">
          <Checkbox.Group>
            <Checkbox value="EXAM">Exam</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQuestionForm;