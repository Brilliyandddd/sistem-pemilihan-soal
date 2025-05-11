import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getLearningMedias,
  deleteLearningMedia,
  editLearningMedia,
  addLearningMedia,
} from "@/api/learningMedia";
import TypingCard from "@/components/TypingCard";
import EditLearningMediaForm from "./forms/edit-learningMedia-form";
import AddLearningMediaForm from "./forms/add-learningMedia-form";

const { Column } = Table;

const LearningMedia = () => {
  const [learningMedias, setLearningMedias] = useState([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Fetch data menggunakan useCallback untuk mencegah re-render berlebihan
  const fetchLearningMedias = useCallback(async () => {
    try {
      const result = await getLearningMedias();
      if (result.data.statusCode === 200) {
        setLearningMedias(result.data.content);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  }, []);

  useEffect(() => {
    fetchLearningMedias();
  }, [fetchLearningMedias]);

  const handleAddLearningMedia = () => setAddVisible(true);
  const handleEditLearningMedia = (row) => {
    setCurrentRowData(row);
    setEditVisible(true);
  };

  const handleEditLearningMediaOk = async (values) => {
    try {
      setEditLoading(true);
      console.log("values yang dikirim:", values);
      await editLearningMedia(values.id, {
        name: values.name,
        description: values.description
      });      
      message.success("Berhasil mengedit media pembelajaran!");
      setEditVisible(false);
      fetchLearningMedias();
    } catch (error) {
      console.error("Error saat mengedit:", error);
      message.error("Gagal mengedit, coba lagi!");
    } finally {
      setEditLoading(false);
    }
  };  

  const handleAddLearningMediaOk = async (form) => {
    try {
      const values = await form.validateFields();
      console.log("values", values)
      setAddLoading(true);
      await addLearningMedia(values);
      message.success("Berhasil menambahkan media pembelajaran!");
      setAddVisible(false);
      form.resetFields();
      fetchLearningMedias();
    } catch (error) {
      console.error("Error saat menambahkan:", error);
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteLearningMedia = async (row) => {
    try {
      await deleteLearningMedia(row.id);
      message.success("Berhasil menghapus media pembelajaran!");
      fetchLearningMedias();
    } catch (error) {
      console.error("Error saat menghapus:", error);
      message.error("Gagal menghapus, coba lagi!");
    }
  };

  const handleCancel = () => {
    setEditVisible(false);
    setAddVisible(false);
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Media Pembelajaran" source="Di sini, Anda dapat mengelola media pembelajaran dalam sistem." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddLearningMedia}>Tambahkan Media Pembelajaran</Button>}>
        <Table bordered rowKey="id" dataSource={learningMedias} pagination={false}>
          <Column title="ID" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column title="Type" dataIndex="type" key="type" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(_, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEditLearningMedia(row)} />
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Delete" onClick={() => handleDeleteLearningMedia(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditLearningMediaForm
        currentRowData={currentRowData}
        visible={editVisible}
        confirmLoading={editLoading}
        onCancel={handleCancel}
        onOk={handleEditLearningMediaOk}
      />
      <AddLearningMediaForm
        visible={addVisible}
        confirmLoading={addLoading}
        onCancel={handleCancel}
        onOk={handleAddLearningMediaOk}
      />
    </div>
  );
};

export default LearningMedia;