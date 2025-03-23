import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";

const { TextArea } = Input;

const AddExerciseForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  questions,
  rps,
  handleRPSChange,
  handleExerciseTypeChange,
}) => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState(null);
  const [randomQuestions, setRandomQuestions] = useState([]);

  // Fungsi untuk mengacak pertanyaan
  const generateRandomQuestions = useCallback(() => {
    if (!selectedOption) return;

    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffledQuestions.slice(0, selectedOption));

    // Set nilai default untuk pertanyaan di form
    form.setFieldsValue({
      questions: shuffledQuestions.slice(0, selectedOption).map((q) => q.id),
    });
  }, [selectedOption, questions, form]);

  // Gunakan useEffect untuk memanggil generateRandomQuestions saat selectedOption berubah
  useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions]);

  return (
    <Modal
      width={1000}
      title="Tambah Exercise"
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item
          label="Nama Latihan"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Nama" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Latihan"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi latihan" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Nilai Minimum"
          name="min_grade"
          rules={[{ required: true, message: "Nilai minimum wajib diisi" }]}
        >
          <InputNumber min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          label="Durasi Latihan"
          name="duration"
          rules={[{ required: true, message: "Durasi latihan wajib diisi" }]}
        >
          <InputNumber min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          label="RPS"
          name="rps_id"
          rules={[{ required: true, message: "Silahkan pilih RPS" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih RPS" onChange={handleRPSChange}>
            {rps.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Pilih ujian"
          name="type_exercise"
          rules={[{ required: true, message: "Silahkan pilih tipe latihan ujian" }]}
        >
          <Select style={{ width: 300 }} placeholder="Pilih tipe latihan ujian" onChange={handleExerciseTypeChange}>
            <Select.Option value="Latihan quiz 1">Latihan quiz 1 (Weeks 1-4)</Select.Option>
            <Select.Option value="Latihan quiz 2">Latihan quiz 2 (Weeks 9-13)</Select.Option>
            <Select.Option value="Latihan UTS">Latihan UTS (Weeks 1-8)</Select.Option>
            <Select.Option value="Latihan UAS">Latihan UAS (Weeks 1-18)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Pilih Pertanyaan"
          name="questions"
          rules={[{ required: true, message: "Silahkan pilih pertanyaan" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Pertanyaan">
            {randomQuestions.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Pilih jumlah soal">
          <Select style={{ width: 300 }} placeholder="Pilih jumlah soal yang akan diuji" onChange={setSelectedOption}>
            {[10, 20, 30, 40, 50].map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tanggal Mulai"
          name="date_start"
          rules={[{ required: true, message: "Tanggal Mulai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item
          label="Tanggal Selesai"
          name="date_end"
          rules={[{ required: true, message: "Tanggal Selesai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ✅ Tambahkan PropTypes untuk validasi props
AddExerciseForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool.isRequired,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  rps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleRPSChange: PropTypes.func.isRequired,
  handleExerciseTypeChange: PropTypes.func.isRequired,
};

export default AddExerciseForm;
