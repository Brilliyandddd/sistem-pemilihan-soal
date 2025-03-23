import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import axios from "axios";
import PropTypes from "prop-types";

const { TextArea } = Input;

const AddSubAssessmentCriteriaForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [assessmentCriteria, setAssessmentCriteria] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCriteria = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/assessment-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", response.data); // Debugging API Response

        if (response.data && Array.isArray(response.data.content)) {
          setAssessmentCriteria(response.data.content);
        } else {
          setAssessmentCriteria([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data kriteria:", error);
        setAssessmentCriteria([]);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchCriteria();
      form.resetFields(); // Reset form ketika modal dibuka
    }
  }, [visible, form]);

  return (
    <Modal
      title="Tambah Sub Kriteria Penilaian"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            console.log("Data yang dikirim:", values);
            onOk(values);
            form.resetFields();
          })
          .catch((info) => {
            console.log("Validasi gagal:", info);
          });
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Sub Kriteria:"
          name="name"
          rules={[{ required: true, message: "Silahkan isikan nama sub kriteria" }]}
        >
          <Input placeholder="Nama Sub Kriteria" />
        </Form.Item>

        <Form.Item
          label="Kriteria:"
          name="assessmentCriteriaId"
          rules={[{ required: true, message: "Silahkan pilih Kriteria" }]}
        >
          <Select
            style={{ width: "100%" }}
            placeholder="Pilih Kriteria"
            loading={loading}
            notFoundContent={loading ? "Memuat..." : "Tidak ada data"}
          >
            {assessmentCriteria.length > 0 ? (
              assessmentCriteria.map((arr) => {
                console.log("Option:", arr.id, arr.name);
                return (
                  <Select.Option key={arr.id} value={arr.id}>
                    {arr.name}
                  </Select.Option>
                );
              })
            ) : (
              <Select.Option disabled value="">
                Tidak ada kriteria tersedia
              </Select.Option>
            )}
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
AddSubAssessmentCriteriaForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool.isRequired,
};

export default AddSubAssessmentCriteriaForm;
