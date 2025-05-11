import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider, Form } from "antd";
import {
  getLearningMethods,
  deleteLearningMethod,
  editLearningMethod,
  addLearningMethod,
} from "@/api/learningMethod";
import TypingCard from "@/components/TypingCard";
import EditLearningMethodForm from "./forms/edit-learningMethod-form";
import AddLearningMethodForm from "./forms/add-learningMethod-form";

const { Column } = Table;

const LearningMethod = () => {
  const [learningMethods, setLearningMethods] = useState([]);
  const [editLearningMethodModalVisible, setEditLearningMethodModalVisible] = useState(false);
  const [editLearningMethodModalLoading, setEditLearningMethodModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addLearningMethodModalVisible, setAddLearningMethodModalVisible] = useState(false);
  const [addLearningMethodModalLoading, setAddLearningMethodModalLoading] = useState(false);

  // Inisialisasi form menggunakan Form.useForm dari Ant Design
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    fetchLearningMethods();
  }, []);

  const fetchLearningMethods = async () => {
    try {
      const result = await getLearningMethods();
      if (result.data.statusCode === 200) {
        setLearningMethods(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data");
    }
  };

  const handleEditLearningMethod = (row) => {
    setCurrentRowData(row);
    setEditLearningMethodModalVisible(true);
    editForm.setFieldsValue(row); // Isi form dengan data yang dipilih
  };

  const handleDeleteLearningMethod = async (row) => {
    try {
      await deleteLearningMethod({ id: row.id });
      message.success("Berhasil dihapus");
      fetchLearningMethods();
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  const handleEditLearningMethodOk = async () => {
    try {
      const values = await editForm.validateFields();
      const { id, ...payload } = values; // Pisahkan id dari payload
      setEditLearningMethodModalLoading(true);
      await editLearningMethod(payload, id); // Kirim payload tanpa id
      message.success("Berhasil diperbarui!");
      setEditLearningMethodModalVisible(false);
      fetchLearningMethods();
    } catch (error) {
      message.error("Gagal memperbarui");
    } finally {
      setEditLearningMethodModalLoading(false);
    }
  };
  

  const handleAddLearningMethod = () => {
    setAddLearningMethodModalVisible(true);
    addForm.resetFields(); // Reset form saat modal dibuka
  };

  const handleAddLearningMethodOk = async () => {
    try {
      const values = await addForm.validateFields();
      setAddLearningMethodModalLoading(true);
      await addLearningMethod(values);
      message.success("Berhasil ditambahkan!");
      setAddLearningMethodModalVisible(false);
      fetchLearningMethods();
    } catch (error) {
      message.error("Gagal menambahkan");
    } finally {
      setAddLearningMethodModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Metode Pembelajaran" source="Di sini, Anda dapat mengelola metode pembelajaran." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddLearningMethod}>Tambahkan metode pembelajaran</Button>}>
        <Table bordered rowKey="id" dataSource={learningMethods} pagination={false}>
          <Column title="ID Metode Pembelajaran" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEditLearningMethod(row)} />
                <Divider type="vertical" />
                <Button type="danger" shape="circle" icon="delete" title="Hapus" onClick={() => handleDeleteLearningMethod(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditLearningMethodForm
        form={editForm}
        visible={editLearningMethodModalVisible}
        confirmLoading={editLearningMethodModalLoading}
        onCancel={() => setEditLearningMethodModalVisible(false)}
        onOk={handleEditLearningMethodOk}
      />
      <AddLearningMethodForm
        form={addForm}
        visible={addLearningMethodModalVisible}
        confirmLoading={addLearningMethodModalLoading}
        onCancel={() => setAddLearningMethodModalVisible(false)}
        onOk={handleAddLearningMethodOk}
      />
    </div>
  );
};

export default LearningMethod;
