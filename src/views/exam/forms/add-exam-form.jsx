import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import moment from "moment"; // Import moment untuk penggunaan di DatePicker

const { TextArea } = Input;

const AddExamForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  questions, // Pertanyaan yang sudah difilter dari index.jsx
  rps, // Semua RPS
  rpsDetail, // RPS Detail yang sudah difilter dari index.jsx
  handleRPSChange, // Mengambil RPS Detail dan pertanyaan saat RPS dipilih
  handleRPSDetailChange, // Mengambil pertanyaan sesuai tipe ujian (UTS/UAS)
  selectedRpsId, // RPS ID yang sedang aktif dari parent
}) => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState(null); // Jumlah soal yang dipilih
  const [randomQuestions, setRandomQuestions] = useState([]); // Pertanyaan acak yang ditampilkan di Select

  // Fungsi untuk mengacak pertanyaan
  const generateRandomQuestions = useCallback(() => {
    // Pastikan questions tidak kosong dan selectedOption sudah dipilih
    if (!selectedOption || !questions || questions.length === 0) {
      setRandomQuestions([]);
      form.setFieldsValue({ questions: [] }); // Reset field questions
      return;
    }

    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, selectedOption);
    setRandomQuestions(selectedQuestions);

    // Set nilai default untuk pertanyaan di form
    form.setFieldsValue({
      questions: selectedQuestions.map((q) => q.idQuestion || q.id), // Gunakan idQuestion atau id
    });
  }, [selectedOption, questions, form]);

  // Efek untuk memanggil generateRandomQuestions saat questions atau selectedOption berubah
  useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions, questions, selectedOption]); // Tambahkan selectedOption sebagai dependency

  // Efek untuk mereset form saat modal ditutup
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedOption(null);
      setRandomQuestions([]);
    }
  }, [visible, form]);

  // Efek untuk mengisi form saat data berubah (untuk Edit, tapi di Add form ini mungkin tidak langsung terpakai kecuali ada initialValues)
  // Untuk AddForm, ini tidak akan mengisi data awal kecuali ada `initialValues` dari `onOk` atau `onCancel`
  useEffect(() => {
    // Set initial values for DatePicker if provided (for editing, not typically for add)
    // if (data.date_start) {
    //   form.setFieldsValue({
    //     date_start: moment(data.date_start),
    //     date_end: moment(data.date_end),
    //   });
    // }
  }, [form]); // Tidak ada `data` di sini, jadi ini tidak relevan untuk AddExamForm.

  return (
    <Modal
      width={1000}
      title="Tambah Ujian"
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      destroyOnClose={true} // Pastikan form di-reset saat ditutup
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item
          label="Nama Ujian:"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Nama" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Ujian:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi ujian" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi pertanyaan" />
        </Form.Item>

        <Form.Item
          label="Nilai Minimum:"
          name="min_grade"
          rules={[{ required: true, message: "Nilai minimum wajib diisi" }]}
        >
          <InputNumber placeholder="Nilai minimum" min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          label="Durasi Ujian:"
          name="duration"
          rules={[{ required: true, message: "Durasi ujian (menit) wajib diisi" }]}
        >
          <InputNumber placeholder="Durasi ujian (menit)" min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
          label="RPS:"
          name="rps_id"
          rules={[{ required: true, message: "Silahkan pilih RPS" }]}
        >
<Select
  style={{ width: 300 }}
  placeholder="Pilih RPS"
  onChange={(value) => {
    if (handleRPSChange) { // Add safety check
      handleRPSChange(value);
    }
    form.setFieldsValue({ type_exercise: undefined, questions: [] });
    setSelectedOption(null);
  }}
>
  {rps.map((arr) => (
    <Select.Option value={arr.idRps} key={arr.idRps}>
      {arr.idRps} - {arr.nameRps || arr.namaRps || "Tanpa Nama"}
    </Select.Option>
  ))}
</Select>
        </Form.Item>

        <Form.Item
          label="Pilih ujian:"
          name="type_exercise"
          rules={[{ required: true, message: "Silahkan pilih tipe ujian" }]}
        >
          <Select
            style={{ width: 300 }}
            placeholder="Pilih tipe ujian"
            onChange={(value) => {
              handleRPSDetailChange(value); // Panggil handler dari parent
              // Pertanyaan akan di-update otomatis karena `questions` prop berubah
            }}
            disabled={!selectedRpsId} // Nonaktifkan jika RPS belum dipilih
          >
            <Select.Option value="1-8">
              UTS (Weeks 1-8): {rpsDetail.filter((arr) => arr.week >= 1 && arr.week <= 8).map((arr) => arr.week).join(", ")}
            </Select.Option>
            <Select.Option value="1-16">
              UAS (Weeks 1-16): {rpsDetail.filter((arr) => arr.week >= 1 && arr.week <= 16).map((arr) => arr.week).join(", ")}
            </Select.Option>
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
            disabled={!questions || questions.length === 0} // Nonaktifkan jika belum ada pertanyaan
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
              <Select.Option key={item.idQuestion || item.id} value={item.idQuestion || item.id}>
                {item.title || item.question || `Pertanyaan ID: ${item.idQuestion || item.id}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tanggal Mulai:"
          name="date_start"
          rules={[{ required: true, message: "Tanggal Mulai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Tanggal Selesai:"
          name="date_end"
          rules={[{ required: true, message: "Tanggal Selesai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddExamForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      idQuestion: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired, // Sesuaikan dengan id atau idQuestion
      title: PropTypes.string,
      question: PropTypes.string,
      examType3: PropTypes.string, // Tambahkan ini jika ada
    })
  ),
  rps: PropTypes.arrayOf(
    PropTypes.shape({
      idRps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      nameRps: PropTypes.string,
      namaRps: PropTypes.string,
    })
  ),
  rpsDetail: PropTypes.arrayOf(
    PropTypes.shape({
      idRpsDetail: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Tambahkan ini
      week: PropTypes.number.isRequired,
    })
  ),
  handleRPSChange: PropTypes.func.isRequired,
  handleRPSDetailChange: PropTypes.func.isRequired,
  selectedRpsId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default AddExamForm;