// src/pages/Question/forms/edit-question-form.jsx

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import PropTypes from "prop-types";
import { Form, Input, Modal, Select, Checkbox } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditQuestionForm = forwardRef(({ visible, onCancel, onOk, confirmLoading, currentRowData, rpsDetailsOptions }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    form,
  }));

  useEffect(() => {
    // Debugging: Lihat data yang diterima oleh form
    console.log("EditQuestionForm - currentRowData:", currentRowData);
    console.log("EditQuestionForm - rpsDetailsOptions:", rpsDetailsOptions);

    if (currentRowData && currentRowData.idQuestion) {
      // Pastikan rps_detail dari currentRowData (yang sudah string ID) disetel ke form
      form.setFieldsValue({
        idQuestion: currentRowData.idQuestion,
        title: currentRowData.title,
        description: currentRowData.description,
        question_type: currentRowData.question_type,
        answer_type: currentRowData.answer_type,
        // --- PERBAIKAN: Set properti 'rps_detail' di form dengan string ID dari currentRowData ---
        // Jika currentRowData.rps_detail adalah string ID, langsung gunakan itu.
        // Jika mungkin objek { id: '...', ... } di sini, ekstrak .id
        rps_detail: (typeof currentRowData.rps_detail === 'object' && currentRowData.rps_detail != null && currentRowData.rps_detail.id)
            ? currentRowData.rps_detail.id
            : currentRowData.rps_detail, // Asumsi ini adalah string ID
        // --- Akhir PERBAIKAN ---
        examType: currentRowData.examType === "EXERCISE" ? ["EXERCISE"] : [],
        examType2: currentRowData.examType2 === "QUIZ" ? ["QUIZ"] : [],
        examType3: currentRowData.examType3 === "EXAM" ? ["EXAM"] : [],
      });
    } else {
      form.resetFields();
    }
  }, [currentRowData, form]); // Tambahkan form ke dependency array

  return (
    <Modal
      title="Edit Pertanyaan"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onOk}
        key={currentRowData?.idQuestion || 'new-question-form'}
      >
        <Form.Item label="ID Pertanyaan" name="idQuestion">
          <Input readOnly />
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
          name="question_type"
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
          name="answer_type"
          rules={[{ required: true, message: "Silakan pilih tipe jawaban" }]}
        >
          <Select placeholder="Pilih tipe jawaban">
            <Option value="MULTIPLE_CHOICE">Pilihan Ganda</Option>
            <Option value="BOOLEAN">Benar / Salah</Option>
            <Option value="COMPLETION">Mengisi Kalimat</Option>
          </Select>
        </Form.Item>

        {/* --- PERBAIKAN: Tambahkan Form.Item untuk RPS Detail --- */}
        <Form.Item
          label="Detail RPS"
          name="rps_detail" // Nama field ini harus konsisten dengan yang akan diambil oleh valuesFromForm
          rules={[{ required: true, message: "Silakan pilih Detail RPS" }]}
        >
          <Select placeholder="Pilih Detail RPS terkait">
            {rpsDetailsOptions.map((detail) => (
              <Option key={detail.id} value={detail.id}>
                {`Minggu ${detail.week}: ${detail.sub_cp_mk}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* --- Akhir PERBAIKAN --- */}


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
});

EditQuestionForm.displayName = 'EditQuestionForm';

EditQuestionForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  rpsDetailsOptions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    title: PropTypes.string,
    week: PropTypes.number,
  })).isRequired, // RPS Details Options sekarang wajib
  currentRowData: PropTypes.shape({
    idQuestion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    question_type: PropTypes.string,
    answer_type: PropTypes.string,
    rps_detail: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({id: PropTypes.string})]), // Bisa string ID atau objek (saat pertama load)
    examType: PropTypes.string,
    examType2: PropTypes.string,
    examType3: PropTypes.string,
    file_path: PropTypes.string,
    rps: PropTypes.object,
    explanation: PropTypes.string,
    is_rated: PropTypes.bool,
    valid: PropTypes.bool,
    criteriaValues: PropTypes.array,
    criteriaValuesJson: PropTypes.string,
    questionRating: PropTypes.object,
    questionRatingJson: PropTypes.string,
  }),
};

export default EditQuestionForm;
