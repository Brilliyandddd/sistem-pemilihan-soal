import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Input, InputNumber, Modal, Select, DatePicker } from "antd";

const { TextArea } = Input;

const AddQuizForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  questions,
  rps,
  handleUpdateQuestion,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onOk(values);
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      width={1000}
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
            placeholder="Pilih RPS"
            onChange={handleUpdateQuestion}
          >
            {rps.map((arr) => (
              <Select.Option key={arr.id} value={arr.id}>
                {arr.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tipe Kuis:"
          name="type_quiz"
          rules={[{ required: true, message: "Tipe Kuis Wajib diisi" }]}
        >
          <Select style={{ width: 120 }} placeholder="Tipe Kuis">
            <Select.Option value="quiz1">Kuis 1</Select.Option>
            <Select.Option value="quiz2">Kuis 2</Select.Option>
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

// Validasi Props dengan PropTypes
AddQuizForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
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
  handleUpdateQuestion: PropTypes.func.isRequired,
};

export default AddQuizForm;
