import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";

const { TextArea } = Input;

const AddExerciseForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading, // Pastikan prop ini diterima
  questions,
  rps,
  handleRPSChange,
  handleExerciseTypeChange,
}) => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState(null);
  const [randomQuestions, setRandomQuestions] = useState([]);

  // Debug: Log untuk melihat data questions
  useEffect(() => {
    console.log("Questions data received by AddExerciseForm:", questions);
    console.log("Questions length in AddExerciseForm:", questions?.length || 0);
  }, [questions]);

  // Fungsi untuk mengacak pertanyaan
  const generateRandomQuestions = useCallback(() => {
    if (!selectedOption || !questions || questions.length === 0) {
      setRandomQuestions([]);
      // Reset selected questions in form if no questions or option selected
      form.setFieldsValue({ questions: [] });
      return;
    }

    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, selectedOption);
    setRandomQuestions(selectedQuestions);

    // Set nilai default untuk pertanyaan di form
    form.setFieldsValue({
      questions: selectedQuestions.map((q) => q.idQuestion),
    });
  }, [selectedOption, questions, form]);

  // Gunakan useEffect untuk memanggil generateRandomQuestions saat selectedOption atau questions berubah
  // Jangan hanya bergantung pada generateRandomQuestions, karena questions juga bisa berubah
  useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions, questions]); // Tambahkan questions sebagai dependency

  // Reset form ketika modal ditutup
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedOption(null);
      setRandomQuestions([]);
    }
  }, [visible, form]);

  return (
    <Modal
      width={1000}
      title="Tambah Exercise"
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()} // Panggil form.submit() langsung
      confirmLoading={confirmLoading}
      destroyOnClose={true} // Penting untuk mereset form saat modal ditutup
    >
      <Form form={form} layout="vertical" onFinish={onOk}> {/* onFinish akan memanggil onOk dengan nilai form */}
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
              <Select.Option key={item.idRps} value={item.idRps}>
                {item.nameRps || item.namaRps || "Tanpa Nama"}
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
          label="Pilih jumlah soal"
          rules={[{ required: true, message: "Jumlah soal wajib dipilih" }]}
        >
          <Select
            style={{ width: 300 }}
            placeholder="Pilih jumlah soal yang akan diuji"
            onChange={setSelectedOption}
            value={selectedOption}
          >
            {[10, 20, 30, 40, 50].map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Pilih Pertanyaan"
          name="questions"
          rules={[{ required: true, message: "Silahkan pilih pertanyaan" }]}
        >
          <Select
            mode="multiple"
            style={{ width: 300 }}
            placeholder={
              !selectedOption
                ? "Pilih jumlah soal terlebih dahulu"
                : randomQuestions.length === 0
                  ? "Tidak ada pertanyaan tersedia"
                  : "Pilih Pertanyaan"
            }
            disabled={!selectedOption || randomQuestions.length === 0}
          >
            {randomQuestions.map((item) => (
              <Select.Option key={item.idQuestion} value={item.idQuestion}>
                {item.title || item.question || `Pertanyaan ID: ${item.idQuestion}`}
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

// ✅ Update PropTypes untuk validasi props - menerima string dan number
AddExerciseForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool.isRequired,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      idQuestion: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string,
      question: PropTypes.string,
    })
  ).isRequired,
  rps: PropTypes.arrayOf(
    PropTypes.shape({
      idRps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      nameRps: PropTypes.string,
      namaRps: PropTypes.string,
    })
  ).isRequired,
  handleRPSChange: PropTypes.func.isRequired,
  handleExerciseTypeChange: PropTypes.func.isRequired,
};

export default AddExerciseForm;