/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Modal, Spin } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { getSubAssessmentCriterias, deleteSubAssessmentCriteria, editSubAssessmentCriteria, addSubAssessmentCriteria } from "@/api/subAssessmentCriteria";
import { getAssessmentCriterias } from "@/api/assessmentCriteria";
import TypingCard from "@/components/TypingCard";
import EditSubAssessmentCriteriaForm from "./forms/edit-subassessmentCriteria-form";
import AddSubAssessmentCriteriaForm from "./forms/add-subassessmentCriteria-form";


const SubAssessmentCriteria = () => {
  const [subAssessmentCriterias, setSubAssessmentCriterias] = useState([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  useEffect(() => {
    fetchSubAssessmentCriteria();
    fetchAssessmentCriterias();
  }, []);

  const fetchSubAssessmentCriteria = async () => {
    try {
      const result = await getSubAssessmentCriterias();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setSubAssessmentCriterias(content);
        setLoading(false);
      }
    } catch (error) {
      message.error("Gagal memuat data: " + error.message);
    }
  };

  const fetchAssessmentCriterias = async () => {
      try {
        const result = await getAssessmentCriterias();
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          setAssessmentCriteria(content);
        }
      } catch (error) {
        message.error("Gagal mengambil data penilaian");
      }
    };
  
  const handleEdit = (row) => {
    setCurrentRowData({...row});
    setEditModalVisible(true);
  };

  const handleDelete = (row) => {
    Modal.confirm({
      title: "Apakah Anda yakin ingin menghapus sub kriteria ini?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        // Tidak pakai async/await langsung di sini, karena akan throw error
        return deleteSubAssessmentCriteria({ id: row.subAssessmentCriteriaId })
          .then(() => {
            message.success("Berhasil dihapus");
            fetchSubAssessmentCriteria();
          })
          .catch((error) => {
            console.error("Error saat menghapus:", error);
            message.error("Gagal menghapus sub kriteria");
            // Tidak lempar error agar Modal tidak munculkan [object Object]
          });
      },
    });
  };
  
  const handleEditOk = async (values) => {
    setEditModalLoading(true);
    try {
      const resolvedValues = values instanceof Promise ? await values : values;

      const updatedValues = {
        subAssessmentCriteriaId: resolvedValues.subAssessmentCriteriaId,
        name: resolvedValues.name,
        description: resolvedValues.description,
        weight: resolvedValues.weight,
        assessmentCriteriaId: resolvedValues.id,
      };
      console.log("Data yang dikirim untuk di edit new:", updatedValues);
      console.log("Data lama :", values);
      console.log("ID Sub Assessment:", updatedValues.subAssessmentCriteriaId);
      
      await editSubAssessmentCriteria(updatedValues, currentRowData.subAssessmentCriteriaId); 
      setEditModalLoading(false);
      setEditModalVisible(false);
      message.success("Berhasil mengubah!");
    } catch (error) {
      setEditModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
  };
  
  const handleAddOk = async (values) => {
    try {
      setAddModalLoading(true);
      await addSubAssessmentCriteria(values);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchSubAssessmentCriteria();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddModalLoading(false);
    }
  };

  const columns = [
    { title: "ID Sub Kriteria", dataIndex: "subAssessmentCriteriaId", key: "subAssessmentCriteriaId", align: "center" },
    { title: "Nama", dataIndex: "name", key: "name", align: "center" },
    { 
      title: "Kriteria", 
      dataIndex: ["assessmentCriteria", "name"], 
      key: "name", 
      align: "center" 
    },
    { title: "Deskripsi", dataIndex: "description", key: "description", align: "center" },
    { title: "Bobot", dataIndex: "weight", key: "weight", align: "center" },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (_, row) => (
        <span>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
          <Divider type="vertical" />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
        </span>
      ),
    },
  ];
  
  return (
    <div className="app-container">
      <TypingCard title="Manajemen Sub Kriteria Penilaian" source="Di sini, Anda dapat mengelola sub kriteria penilaian." />
      <br />
      <Card title={<Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>Tambahkan Sub Kriteria</Button>}>
        {loading ? <Spin tip="Memuat data..." /> : <Table bordered rowKey="idSubAssessment" dataSource={subAssessmentCriterias} pagination={{ pageSize: 10 }} columns={columns} />}
      </Card>
<EditSubAssessmentCriteriaForm
  wrappedComponentRef={editFormRef}
  currentRowData={currentRowData}
  visible={editModalVisible}
  confirmLoading={editModalLoading}
  onCancel={() => setEditModalVisible(false)}
  onOk={handleEditOk}
/>
<AddSubAssessmentCriteriaForm
wrappedComponentRef={addFormRef}
  visible={addModalVisible}
  confirmLoading={addModalLoading}
  onCancel={() => setAddModalVisible(false)}
  onOk={handleAddOk}
  assessmentCriteria={assessmentCriteria}
/>

    </div>
  );
};

export default SubAssessmentCriteria;
