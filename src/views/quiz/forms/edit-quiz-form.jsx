import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, Select, Modal, InputNumber, DatePicker } from "antd";
import moment from "moment";

const { TextArea } = Input;

const EditQuizForm = ({
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
    if (currentRowData) {
      form.setFieldsValue({
        id: currentRowData.id,
        name: currentRowData.name,
        description: currentRowData.description,
        min_grade: currentRowData.min_grade,
        duration: currentRowData.duration,
        rps_id: currentRowData.rps_id,
        questions: currentRowData.questions,
        date_start: currentRowData.date_start ? moment(currentRowData.date_start) : null,
        date_end: currentRowData.date_end ? moment(currentRowData.date_end) : null,
      });
    }
  }, [currentRowData, form]);

  const handleSubmit = (values) => {
    onOk(values);
  };

  return (
    <Modal
      width={1000}
      title="Edit Quiz"
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
        <Form.Item label="ID Kuis:" name="id">
          <Input disabled />
        </Form.Item>
        
        <Form.Item
          label="Nama Kuis:"
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Masukkan nama kuis" />
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
          label="Durasi Kuis (menit):"
          name="duration"
          rules={[{ required: true, message: "Durasi kuis wajib diisi" }]}
        >
          <InputNumber placeholder="Durasi kuis" min={1} style={{ width: 300 }} />
        </Form.Item>
        
        <Form.Item
          label="RPS:"
          name="rps_id"
          rules={[{ required: true, message: "Silahkan pilih RPS" }]}
        >
          <Select
            style={{ width: 300 }}
            placeholder="Pilih RPS"
            onChange={handleUpdateQuestion}
          >
            {rpsAll.map((arr) => (
              <Select.Option key={arr.id} value={arr.id}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Pertanyaan:"
          name="questions"
          rules={[{ required: true, message: "Silahkan pilih pertanyaan" }]}
        >
          <Select mode="multiple" style={{ width: 300 }} placeholder="Pilih Pertanyaan">
            {questions.map((arr) => (
              <Select.Option key={arr.id} value={arr.id}>
                {arr.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tanggal Mulai:"
          name="date_start"
          rules={[{ required: true, message: "Tanggal Mulai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" />
        </Form.Item>

        <Form.Item
          label="Tanggal Selesai:"
          name="date_end"
          rules={[{ required: true, message: "Tanggal Selesai wajib diisi" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Pilih tanggal" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Validasi Props menggunakan PropTypes
EditQuizForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    min_grade: PropTypes.number,
    duration: PropTypes.number,
    rps_id: PropTypes.number,
    questions: PropTypes.arrayOf(PropTypes.number),
    date_start: PropTypes.string,
    date_end: PropTypes.string,
  }),
  rpsAll: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleUpdateQuestion: PropTypes.func.isRequired,
};

export default EditQuizForm;
