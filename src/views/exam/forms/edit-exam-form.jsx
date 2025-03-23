import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Select, Modal, InputNumber, DatePicker } from "antd";
import moment from "moment";

const { TextArea } = Input;

const EditExamForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
  rpsAll,
  questions,
  handleUpdateQuestion,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData && Object.keys(currentRowData).length > 0) {
      form.setFieldsValue({
        id: currentRowData.id || "",
        name: currentRowData.name || "",
        description: currentRowData.description || "",
        min_grade: currentRowData.min_grade || "",
        duration: currentRowData.duration || "",
        rps_id: currentRowData.rps_id || "",
        questions: currentRowData.questions || [],
        date_start: currentRowData.date_start ? moment(currentRowData.date_start) : null,
        date_end: currentRowData.date_end ? moment(currentRowData.date_end) : null,
      });
    }
  }, [currentRowData, form]);
  
  return (
    <Modal
      width={1000}
      title="Edit Exam"
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Ujian:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Ujian:" name="name" rules={[{ required: true, message: "Nama wajib diisi" }]}> 
          <Input placeholder="Masukkan Nama" />
        </Form.Item>
        <Form.Item label="Deskripsi Ujian:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi ujian" }]}> 
          <TextArea rows={4} placeholder="Deskripsi ujian" />
        </Form.Item>
        <Form.Item label="Nilai Minimum:" name="min_grade" rules={[{ required: true, message: "Nilai minimum wajib diisi" }]}> 
          <InputNumber placeholder="Nilai minimum" min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Durasi Ujian:" name="duration" rules={[{ required: true, message: "Durasi ujian wajib diisi" }]}> 
          <InputNumber placeholder="Durasi ujian (menit)" min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="RPS:" name="rps_id" rules={[{ required: true, message: "Silahkan pilih RPS" }]}> 
          <Select placeholder="Pilih RPS" onChange={handleUpdateQuestion}>
            {rpsAll.map((rps) => (
              <Select.Option key={rps.id} value={rps.id}>
                {rps.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Pertanyaan:" name="questions" rules={[{ required: true, message: "Silahkan pilih pertanyaan" }]}> 
          <Select mode="multiple" placeholder="Pilih Pertanyaan">
            {questions.map((q) => (
              <Select.Option key={q.id} value={q.id}>
                {q.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Tanggal Mulai:" name="date_start" rules={[{ required: true, message: "Tanggal Mulai wajib diisi" }]}> 
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Tanggal Selesai:" name="date_end" rules={[{ required: true, message: "Tanggal Selesai wajib diisi" }]}> 
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditExamForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.object.isRequired,
  rpsAll: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  handleUpdateQuestion: PropTypes.func.isRequired,
};

export default EditExamForm;
