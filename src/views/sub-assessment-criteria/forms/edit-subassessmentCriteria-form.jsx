/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect , useState} from "react";
import PropTypes from "prop-types";
import { Form, Input, Modal, Select, InputNumber } from "antd";
import { getSubAssessmentCriterias, editSubAssessmentCriteria } from "@/api/subAssessmentCriteria";
import { getAssessmentCriterias } from "@/api/assessmentCriteria";

const { TextArea } = Input;
const { Option } = Select;

const EditSubAssessmentCriteriaForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [list, setList] = useState([]);
  const [form] = Form.useForm();

  const [assessmentCriteriaList, setAssessmentCriteriaList] = useState([]);
  const [loading, setLoading] = useState([]);

  const fetchAssessmentCriteria = async () => {
    try {
      const result = await getAssessmentCriterias();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setAssessmentCriteriaList(content);
      }
    } catch (error) {
      console.error("Error fetching Assessment Kriteria data:", error);
}
};

const fetchSubAssessmentCriteria = async () => {
  try {
    const result = await getSubAssessmentCriterias();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setList(content);
    }
  } catch (error) {
    console.error("Error fetching Sub Kriteria Penilaian data:", error);
  }
};

  useEffect(() => {
    // console.log("currentRowData:", currentRowData);
    fetchSubAssessmentCriteria();
    fetchAssessmentCriteria();
    if (currentRowData) {
      form.setFieldsValue({
        subAssessmentCriteriaId: currentRowData.subAssessmentCriteriaId || "",
        name: currentRowData.name || "",
        description: currentRowData.description || "",
        weight: currentRowData.weight || 0,
        id: currentRowData.assessmentCriteria?.id || null,
    });
    console.log("Form values setelah setFieldsValue:", form.getFieldsValue());
    }
  }, [currentRowData, form]);

  const handleOk = () => {
    try {
      const values = form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };  

  return (
    <Modal
      title="Edit Sub Kriteria Penilaian"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID Sub Kriteria:" name="subAssessmentCriteriaId">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Nama Sub Kriteria:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama sub kriteria" }]}
        >
          <Input placeholder="Nama Sub Kriteria" />
        </Form.Item>

        <Form.Item
          label="Kriteria:"
          name="id"
          rules={[{ required: true, message: "Silahkan pilih Kriteria" }]}
        >
          <Select placeholder="Pilih Kriteria">
                {assessmentCriteriaList.map(({ id, name }) => (
                  <Option key={id} value={id}>
                    {name}
                  </Option>
                ))}
       </Select>
        </Form.Item>

        <Form.Item
          label="Deskripsi:"
          name="description"
          rules={[{ required: true, message: "Silahkan isikan deskripsi sub kriteria" }]}
        >
          <TextArea rows={4} placeholder="Deskripsi Sub Kriteria" />
        </Form.Item>

        <Form.Item
          label="Bobot"
          name="weight"
          rules={[{ required: true, message: "Silahkan isikan bobot sub-kriteria" }]}
        >
          <InputNumber style={{ width: "100%" }} min={1} placeholder="Bobot" />
        </Form.Item>
      </Form>
    </Modal>
  );
};


export default EditSubAssessmentCriteriaForm;
