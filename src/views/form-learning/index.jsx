import React, { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getFormLearnings,
  deleteFormLearning,
  editFormLearning,
  addFormLearning,
} from "@/api/formLearning";
import TypingCard from "@/components/TypingCard";
import EditFormLearningForm from "./forms/edit-formLearning-form";
import AddFormLearningForm from "./forms/add-formLearning-form";

const { Column } = Table;

const FormLearning = () => {
  const [formLearnings, setFormLearnings] = useState([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const fetchFormLearnings = async () => {
    try {
      const result = await getFormLearnings();
      if (result.data.statusCode === 200) {
        setFormLearnings(result.data.content);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchFormLearnings();
  }, []);

  const handleEditFormLearning = (row) => {
    setCurrentRowData({ ...row });
    setEditVisible(true);
  };

  const handleDeleteFormLearning = async (row) => {
    try {
      await deleteFormLearning({ id: row.id });
      message.success("Berhasil dihapus");
      fetchFormLearnings();
    } catch (error) {
      message.error("Gagal menghapus, coba lagi!");
    }
  };

  const handleEditFormLearningOk = async (values) => {
    setEditLoading(true);
    const { id, ...payload } = values; // pisahkan id dari payload
    console.log("Payload dikirim (tanpa id):", payload);
    try {
      await editFormLearning(payload, id); // id hanya di URL
      message.success("Berhasil mengedit!");
      setEditVisible(false);
      fetchFormLearnings();
    } catch (error) {
      message.error("Gagal mengedit, coba lagi!");
    } finally {
      setEditLoading(false);
    }
  };
  

  const handleAddFormLearning = () => {
    setAddVisible(true);
  };

  const handleAddFormLearningOk = async (values) => {
    setAddLoading(true);
    try {
      await addFormLearning(values);
      message.success("Berhasil menambahkan!");
      setAddVisible(false);
      fetchFormLearnings();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Bentuk Pembelajaran"
        source="Di sini, Anda dapat mengelola bentuk pembelajaran dalam sistem."
      />
      <br />
      <Card title={<Button type="primary" onClick={handleAddFormLearning}>Tambahkan Bentuk Pembelajaran</Button>}>
        <Table bordered rowKey="id" dataSource={formLearnings} pagination={false}>
          <Column title="ID Bentuk Pembelajaran" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
  title="Operasi"
  key="action"
  width={195}
  align="center"
  render={(text, row) => (
    <>
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={() => handleEditFormLearning(row)} // ✅ gunakan nama fungsi yang benar
      />
      <Divider type="vertical" />
      <Button
        type="danger"
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteFormLearning(row)} // ✅ gunakan nama fungsi yang benar
      />
    </>
  )}
/>

        </Table>
      </Card>
      <EditFormLearningForm visible={editVisible} confirmLoading={editLoading} onCancel={() => setEditVisible(false)} onOk={handleEditFormLearningOk} currentRowData={currentRowData} />
      <AddFormLearningForm visible={addVisible} confirmLoading={addLoading} onCancel={() => setAddVisible(false)} onOk={handleAddFormLearningOk} />
    </div>
  );
};

export default FormLearning;
