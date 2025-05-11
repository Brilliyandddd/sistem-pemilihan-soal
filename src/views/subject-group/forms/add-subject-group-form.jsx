import { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import PropTypes from "prop-types";

const { TextArea } = Input;

const AddSubjectGroupForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields(); // Reset form saat modal ditutup
    }
  }, [visible , form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validasi gagal:", error);
    }
  };

  return (
    <Modal
      title="Tambah Rumpun Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama" name="name" rules={[{ required: true, message: "Silahkan isikan nama rumpun mata kuliah" }]}> 
          <Input placeholder="Nama Rumpun Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Deskripsi" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi rumpun mata kuliah" }]}> 
          <TextArea rows={4} placeholder="Deskripsi Rumpun Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddSubjectGroupForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  subjectGroups: PropTypes.array,
  studyPrograms: PropTypes.array,
};

export default AddSubjectGroupForm;
