import React from "react";
import PropTypes from "prop-types"; // Import prop-types untuk validasi props
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const AddAssessmentCriteriaForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validasi gagal:", info);
      });
  };

  return (
    <Modal
      title="Tambah Penilaian"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item
          label="Nama Penilaian:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama penilaian" }]}
        >
          <Input placeholder="Nama Penilaian" />
        </Form.Item>
        <Form.Item
          label="Deskripsi Penilaian:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi penilaian" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Penilaian" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Validasi PropTypes
AddAssessmentCriteriaForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
};

// Default Props
AddAssessmentCriteriaForm.defaultProps = {
  confirmLoading: false,
};

export default AddAssessmentCriteriaForm;
