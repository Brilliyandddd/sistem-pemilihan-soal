import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Upload, Checkbox, message } from "antd";
import PropTypes from "prop-types";
import { getRpsDetails } from "@/api/question";

const { TextArea } = Input;
const { Option } = Select;

const AddQuestionForm = ({ visible, onCancel, onOk, confirmLoading, rps }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [rpsDetails, setRpsDetails] = useState([]);
  const [selectedRpsId, setSelectedRpsId] = useState(null);
  const [loadingRpsDetails, setLoadingRpsDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
      setRpsDetails([]);
      setSelectedRpsId(null);
    }
  }, [visible, form]);

  const fetchRpsDetails = async (rpsId) => {
    if (!rpsId) {
      setRpsDetails([]);
      return;
    }

    setLoadingRpsDetails(true);
    try {
      const response = await getRpsDetails(rpsId);
      
      console.log('Processed Response:', response);

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to load RPS details');
      }

      const details = response.data.content.map(item => ({
        id: item.id,
        name: `Minggu ${item.week}`,
        description: item.sub_cp_mk || 'Tanpa deskripsi',
        week: item.week,
        rpsId: item.rps?.idRps || item.rpsId
      }));

      console.log('Formatted Details:', details);
      setRpsDetails(details);
    } catch (error) {
      console.error("Error fetching RPS details:", error);
      message.error(error.message || "Gagal memuat detail RPS");
      setRpsDetails([]);
    } finally {
      setLoadingRpsDetails(false);
    }
  };

  const handleRpsChange = async (rpsId) => {
    console.log('RPS changed to:', rpsId);
    setSelectedRpsId(rpsId);
    form.setFieldsValue({ rps_detail_id: undefined });
    await fetchRpsDetails(rpsId);
  };

  const handleBeforeUpload = (file) => {
    setFileList([file]);
    return false;
  };

  const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    
    // 1. Prepare exam types
    const examData = {
      examType: values.examType?.includes('EXERCISE') ? 'EXERCISE' : null,
      examType2: values.examType2?.includes('QUIZ') ? 'QUIZ' : null,
      examType3: values.examType3?.includes('EXAM') ? 'EXAM' : null
    };

    // 2. Validate at least one exam type selected
    if (!Object.values(examData).some(Boolean)) {
      message.error("Pilih minimal 1 tipe ujian!");
      return;
    }

    // 3. Prepare FormData
    const formData = new FormData();
    
    // Required fields
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('explanation', values.explanation);
    formData.append('question_type', values.question_type);
    formData.append('answer_type', values.answer_type);
    formData.append('idRps', selectedRpsId);
    formData.append('rps_detail_id', values.rps_detail_id);

    // Conditional fields
    if (examData.examType) formData.append('examType', examData.examType);
    if (examData.examType2) formData.append('examType2', examData.examType2); 
    if (examData.examType3) formData.append('examType3', examData.examType3);
    if (fileList[0]) formData.append('file', fileList[0]);

    // 4. Debug output
    console.log('=== FormData Contents ===');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value instanceof File ? `File: ${value.name}` : value);
    }
    console.log("id Question ", + formData);

    // 5. Submit
    await onOk(formData);
    
  } catch (error) {
    console.error('Submission error:', {
      error: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      message.error('Sesi telah habis, silakan login kembali');
      // Optional: redirect to login
    } else {
      message.error(error.response?.data?.message || 'Gagal menyimpan pertanyaan');
    }
  }
};

  return (
    <Modal
      title="Tambah Pertanyaan"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      width={600}
      afterClose={() => {
        form.resetFields();
        setFileList([]);
        setRpsDetails([]);
        setSelectedRpsId(null);
      }}
    >
      <Form 
        layout="vertical"
        form={form}
        initialValues={{
          question_type: 'NORMAL',
          answer_type: 'MULTIPLE_CHOICE',
          rps_detail_id: undefined
        }}
      >
        <Form.Item
          label="RPS"
          name="idRps"
          rules={[{ required: true, message: "Silahkan pilih RPS" }]}
        >
          <Select 
            placeholder="Pilih RPS"
            onChange={handleRpsChange}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {rps.map((item) => (
              <Option key={item.idRps} value={item.idRps}>
                {item.idRps} - {item.nameRps || item.namaRps || 'Tanpa Nama'}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="RPS Detail"
          name="rps_detail_id"
          rules={[{ required: true, message: "Silahkan pilih RPS Detail" }]}
        >
          <Select 
            placeholder={
              loadingRpsDetails 
                ? "Memuat detail RPS..." 
                : !selectedRpsId 
                ? "Pilih RPS terlebih dahulu" 
                : rpsDetails.length === 0
                ? "Tidak ada detail RPS tersedia"
                : "Pilih RPS Detail"
            }
            disabled={!selectedRpsId || loadingRpsDetails}
            loading={loadingRpsDetails}
            notFoundContent={
              loadingRpsDetails 
                ? "Memuat..." 
                : !selectedRpsId 
                ? "Pilih RPS terlebih dahulu"
                : "Tidak ada data"
            }
          >
            {rpsDetails.map((detail) => (
              <Option key={detail.id} value={String(detail.id)}>
                {detail.name} - {detail.description.substring(0, 50)}...
              </Option>
            ))}
          </Select>
        </Form.Item>

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
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
          >
            <p className="ant-upload-drag-icon">📂</p>
            <p className="ant-upload-text">Klik atau tarik file ke area ini</p>
            <p className="ant-upload-hint">Mendukung gambar, audio, video, PDF, dan dokumen Word</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item label="Tipe Ujian">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Form.Item name="examType" noStyle initialValue={[]}>
              <Checkbox.Group>
                <Checkbox value="EXERCISE">Exercise (Latihan Soal)</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="examType2" noStyle initialValue={[]}>
              <Checkbox.Group>
                <Checkbox value="QUIZ">Quiz</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="examType3" noStyle initialValue={[]}>
              <Checkbox.Group>
                <Checkbox value="EXAM">Exam (UTS/UAS)</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddQuestionForm.defaultProps = {
  rps: [],
};

AddQuestionForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  rps: PropTypes.array.isRequired,
};

export default AddQuestionForm;