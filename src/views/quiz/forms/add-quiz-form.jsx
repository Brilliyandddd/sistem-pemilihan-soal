import React, { useEffect, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Input, InputNumber, Modal, Select, DatePicker, message } from "antd";

const { TextArea } = Input;

const AddQuizForm = forwardRef(({
  visible = false,
  onCancel,
  onOk,
  confirmLoading = false,
  questions = [],
  rps = [],
  handleUpdateQuestion,
}, ref) => {
  const [form] = Form.useForm();
  const [selectedRps, setSelectedRps] = useState(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);

  // Generate random questions based on selected count
  const generateRandomQuestions = useCallback(() => {
    if (!selectedQuestionCount || availableQuestions.length === 0) {
      setGeneratedQuestions([]);
      form.setFieldsValue({ questions: [] });
      return;
    }

    // Check if we have enough questions
    if (availableQuestions.length < selectedQuestionCount) {
      message.warning(`Hanya tersedia ${availableQuestions.length} soal untuk RPS ini`);
      return;
    }

    // Shuffle and select questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, selectedQuestionCount);

    setGeneratedQuestions(selected);

    // Auto-select generated questions in the form
    form.setFieldsValue({
      questions: selected.map(q => q.idQuestion)
    });

    message.success(`Berhasil generate ${selected.length} soal secara acak!`);
  }, [selectedQuestionCount, availableQuestions, form]);

  // Update available questions when questions prop changes
  useEffect(() => {
    setAvailableQuestions(questions);
  }, [questions]);

  // Generate questions when both RPS and question count are selected
  useEffect(() => {
    if (selectedRps && selectedQuestionCount && availableQuestions.length > 0) {
      console.log("Generating questions:", { selectedRps, selectedQuestionCount, availableQuestionsCount: availableQuestions.length });
      generateRandomQuestions();
    } else {
      console.log("Not generating questions:", { selectedRps, selectedQuestionCount, availableQuestionsCount: availableQuestions.length });
    }
  }, [selectedRps, selectedQuestionCount, availableQuestions, generateRandomQuestions]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getForm: () => form,
    resetForm: () => {
      form.resetFields();
      setSelectedRps(null);
      setSelectedQuestionCount(null);
      setGeneratedQuestions([]);
      setAvailableQuestions([]);
    }
  }));

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedRps(null);
      setSelectedQuestionCount(null);
      setGeneratedQuestions([]);
      setAvailableQuestions([]);
      console.log("Current RPS data:", rps);
    }
  }, [visible, form , rps]);

  const handleSubmit = (values) => {
    onOk(values);
  };

  const handleRpsChange = (value) => {
  console.log("RPS changed to:", value);
  
  // Accept string values directly
  setSelectedRps(value);
  setSelectedQuestionCount(null);
  setGeneratedQuestions([]);

  form.setFieldsValue({
    questions: [],
    numberOfQuestions: undefined
  });

  if (handleUpdateQuestion && value) {
    handleUpdateQuestion(value);
  }
};

  const handleQuestionCountChange = (value) => {
    setSelectedQuestionCount(value);
    // Clear previously generated questions when count changes
    setGeneratedQuestions([]);
    form.setFieldsValue({ questions: [] });
  };

  const getQuestionCountOptions = () => {
  const maxQuestions = availableQuestions.length;
  const standardOptions = [10, 20, 30, 40, 50];
  
  // Only show options that are <= available questions
  const filteredOptions = standardOptions.filter(count => count <= maxQuestions);
  
  // If we have questions but less than 10, show the actual count
  if (maxQuestions > 0 && maxQuestions < 10) {
    return [maxQuestions];
  }
  
  return filteredOptions.length > 0 ? filteredOptions : [];
};

  return (
    <Modal
      width={800}
      title="Tambah Quiz"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Nama Kuis:"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Nama" />
        </Form.Item>

        <Form.Item
          label="Deskripsi Kuis:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi kuis" }]}
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
          label="Durasi Kuis:"
          name="duration"
          rules={[{ required: true, message: "Durasi kuis wajib diisi" }]}
        >
          <InputNumber placeholder="Durasi kuis (menit)" min={1} style={{ width: 300 }} />
        </Form.Item>

        <Form.Item
  label="RPS:"
  name="rps_id"
  rules={[{ required: true, message: "Silahkan pilih RPS" }]}
>
  <Select
    style={{ width: 300 }}
    placeholder={rps.length === 0 ? "Memuat RPS..." : "Pilih RPS"}
    onChange={handleRpsChange}
    allowClear
    loading={rps.length === 0}
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
  >
    {rps.map((item) => (
      <Select.Option key={item.idRps} value={item.idRps}>
        {item.nameRps || item.idRps}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

        <Form.Item
          label="Tipe Kuis:"
          name="type_quiz"
          rules={[{ required: true, message: "Tipe Kuis Wajib diisi" }]}
        >
          <Select style={{ width: 120 }} placeholder="Tipe Kuis" allowClear>
            <Select.Option value="quiz1">Kuis 1</Select.Option>
            <Select.Option value="quiz2">Kuis 2</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
  label={`Pilih jumlah soal${availableQuestions.length > 0 ? ` (Tersedia: ${availableQuestions.length} soal)` : ''}`}
>
  <Select
    style={{ width: 300 }}
    placeholder={
      availableQuestions.length === 0 
        ? "Tidak ada soal tersedia" 
        : "Pilih jumlah soal yang akan diuji"
    }
    onChange={handleQuestionCountChange}
    disabled={!selectedRps || availableQuestions.length === 0}
    value={selectedQuestionCount}
    allowClear
  >
    {getQuestionCountOptions().length > 0 ? (
      getQuestionCountOptions().map((value) => (
        <Select.Option key={value} value={value}>
          {value} soal
        </Select.Option>
      ))
    ) : (
      <Select.Option disabled value="no-data">
        Tidak ada data
      </Select.Option>
    )}
  </Select>
</Form.Item>

{availableQuestions.length > 0 && availableQuestions.length < 10 && (
  <div style={{ color: '#faad14', marginTop: -16, marginBottom: 16, fontSize: 12 }}>
    Hanya tersedia {availableQuestions.length} soal untuk RPS ini
  </div>
)}

        {/* Field pertanyaan selalu tampil, tapi disable berdasarkan kondisi */}
        <Form.Item
          label={`Pilih Pertanyaan${generatedQuestions.length > 0 ? ` (${generatedQuestions.length} soal ter-generate)` : ''}`}
          name="questions"
          rules={[{ required: true, message: "Silahkan pilih pertanyaan" }]}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={
              !selectedRps
                ? "Pilih RPS terlebih dahulu"
                : !selectedQuestionCount
                  ? "Pilih jumlah soal terlebih dahulu"
                  : "Pertanyaan akan ter-generate otomatis atau pilih manual"
            }
            disabled={!selectedRps || !selectedQuestionCount}
          >
            {availableQuestions.map((item) => (
              <Select.Option key={item.idQuestion} value={item.idQuestion}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Show info about generated questions
        {generatedQuestions.length > 0 && (
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 4,
            padding: 12,
            marginBottom: 16
          }}>
            <p style={{ margin: 0, color: '#52c41a', fontWeight: 500 }}>
              ✅ {generatedQuestions.length} soal telah di-generate secara otomatis!
              <br />
              <small style={{ color: '#666' }}>
                Anda dapat mengubah pilihan soal secara manual jika diperlukan.
              </small>
            </p>
          </div>
        )} */}

        <Form.Item
          label="Tanggal Mulai:"
          name="date_start"
          rules={[{ required: true, message: "Tanggal Mulai wajib diisi" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Pilih tanggal"
            style={{ width: 300 }}
          />
        </Form.Item>

        <Form.Item
          label="Tanggal Selesai:"
          name="date_end"
          rules={[{ required: true, message: "Tanggal Selesai wajib diisi" }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Pilih tanggal"
            style={{ width: 300 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

AddQuizForm.displayName = 'AddQuizForm';

AddQuizForm.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  questions: PropTypes.array,
  rps: PropTypes.array,
  handleUpdateQuestion: PropTypes.func,
};

AddQuizForm.defaultProps = {
  visible: false,
  confirmLoading: false,
  questions: [],
  rps: [],
  handleUpdateQuestion: () => {},
};

export default AddQuizForm;