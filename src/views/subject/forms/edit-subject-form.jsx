import React, { useEffect } from "react";
import PropTypes from "prop-types"; // Tambahkan PropTypes
import { Form, Input, Modal, Select, InputNumber } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const EditSubjectForm = ({ visible, onCancel, onOk, confirmLoading, currentRowData, subjectGroups, studyPrograms }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: currentRowData?.name || "",
        description: currentRowData?.description || "",
        credit_point: currentRowData?.credit_point || 1,
        year_commenced: currentRowData?.year_commenced || "2024",
        study_program_id: currentRowData?.study_program_id || undefined,
        subject_group_id: currentRowData?.subject_group_id || undefined,
      });
    }
  }, [currentRowData, visible, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  return (
    <Modal
      title="Edit Mata Kuliah"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama:" name="name" rules={[{ required: true, message: "Silahkan isikan nama mata kuliah" }]}>
          <Input placeholder="Nama Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Deskripsi:" name="description" rules={[{ required: true, message: "Silahkan isikan deskripsi mata kuliah" }]}>
          <TextArea rows={4} placeholder="Deskripsi Mata Kuliah" />
        </Form.Item>
        <Form.Item label="Point Kredit:" name="credit_point" rules={[{ required: true, message: "Silahkan isikan point kredit mata kuliah" }]}>
          <InputNumber style={{ width: "100%" }} min={1} placeholder="Point Kredit" />
        </Form.Item>
        <Form.Item label="Tahun Mata Kuliah:" name="year_commenced" rules={[{ required: true, message: "Silahkan isikan tahun mata kuliah" }]}>
          <Select showSearch placeholder="Pilih Tahun Ajaran">
            <Option value="2022">2022</Option>
            <Option value="2023">2023</Option>
            <Option value="2024">2024</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Program Studi:" name="study_program_id" rules={[{ required: true, message: "Silahkan pilih program studi" }]}>
          <Select placeholder="Pilih Program Studi">
            {studyPrograms?.map((arr) => (
              <Option value={arr.id} key={arr.id}>
                {arr.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Rumpun Mata Kuliah:" name="subject_group_id" rules={[{ required: true, message: "Silahkan pilih rumpun mata kuliah" }]}>
          <Select placeholder="Pilih Rumpun Mata Kuliah">
            {subjectGroups?.map((arr) => (
              <Option value={arr.id} key={arr.id}>
                {arr.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// **Tambahkan propTypes untuk validasi props**
EditSubjectForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  currentRowData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    credit_point: PropTypes.number,
    year_commenced: PropTypes.string,
    study_program_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subject_group_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  subjectGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  studyPrograms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

// **Tambahkan defaultProps untuk menghindari undefined errors**
EditSubjectForm.defaultProps = {
  confirmLoading: false,
  currentRowData: {},
  subjectGroups: [],
  studyPrograms: [],
};

export default EditSubjectForm;
