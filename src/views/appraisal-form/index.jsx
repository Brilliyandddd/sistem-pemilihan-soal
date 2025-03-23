import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getAppraisalForms,
  deleteAppraisalForm,
  editAppraisalForm,
  addAppraisalForm,
} from "@/api/appraisalForm";
import TypingCard from "@/components/TypingCard";
import EditAppraisalForm from "./forms/edit-appraisal-form";
import AddAppraisalForm from "./forms/add-appraisal-form";

const { Column } = Table;

const AppraisalForm = () => {
  const [appraisalForms, setAppraisalForms] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  useEffect(() => {
    fetchAppraisalForms();
  }, []);

  const fetchAppraisalForms = async () => {
    try {
      const result = await getAppraisalForms();
      if (result.data.statusCode === 200) {
        setAppraisalForms(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data formulir penilaian");
    }
  };

  const handleEditAppraisalForm = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleDeleteAppraisalForm = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }
    try {
      await deleteAppraisalForm({ id: row.id });
      message.success("Berhasil dihapus");
      fetchAppraisalForms();
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  const handleEditAppraisalFormOk = async (values) => {
    try {
      setEditModalLoading(true);
      await editAppraisalForm(values, values.id);
      message.success("Berhasil disimpan!");
      setEditModalVisible(false);
      fetchAppraisalForms();
    } catch (error) {
      message.error("Gagal menyimpan perubahan");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleAddAppraisalForm = () => {
    setAddModalVisible(true);
  };

  const handleAddAppraisalFormOk = async (values) => {
    try {
      setAddModalLoading(true);
      await addAppraisalForm(values);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchAppraisalForms();
    } catch (error) {
      message.error("Gagal menambahkan");
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setAddModalVisible(false);
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Formulir Penilaian"
        source="Di sini, Anda dapat mengelola formulir penilaian dalam sistem."
      />
      <br />
      <Card title={<Button type="primary" onClick={handleAddAppraisalForm}>Tambahkan formulir penilaian</Button>}>
        <Table bordered rowKey="id" dataSource={appraisalForms} pagination={false}>
          <Column title="ID" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <>
                <Button type="primary" shape="circle" icon="edit" onClick={() => handleEditAppraisalForm(row)} />
                <Divider type="vertical" />
                <Button type="danger" shape="circle" icon="delete" onClick={() => handleDeleteAppraisalForm(row)} />
              </>
            )}
          />
        </Table>
      </Card>
      <EditAppraisalForm
        ref={editFormRef}
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={handleCancel}
        onOk={handleEditAppraisalFormOk}
      />
      <AddAppraisalForm
        ref={addFormRef}
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={handleCancel}
        onOk={handleAddAppraisalFormOk}
      />
    </div>
  );
};

export default AppraisalForm;
