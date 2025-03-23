import React, { useEffect } from "react";
import PropTypes from "prop-types"; // Import prop-types untuk validasi props
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

const EditAssessmentCriteriaForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData && Object.keys(currentRowData).length > 0) {
      form.setFieldsValue(currentRowData);
    } else {
      form.resetFields();
    }
  }, [currentRowData, form]);

  return (
    <Modal
      title="Edit Penilaian"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item label="ID Penilaian:" name="id">
          <Input disabled />
        </Form.Item>
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
EditAssessmentCriteriaForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

// Default Props
EditAssessmentCriteriaForm.defaultProps = {
  confirmLoading: false,
  currentRowData: {},
};

export default EditAssessmentCriteriaForm;
