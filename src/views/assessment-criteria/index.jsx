import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Modal, Form, Input } from "antd";
import { DeleteOutlined , EditOutlined } from '@ant-design/icons';
import axios from 'axios';

import {
  getAssessmentCriterias,
  deleteAssessmentCriteria,
  editAssessmentCriteria,
  addAssessmentCriteria,
} from "@/api/assessmentCriteria";
import TypingCard from "@/components/TypingCard";

const { Column } = Table;
const { TextArea } = Input;

const AssessmentCriteria = () => {
  const [assessmentCriterias, setAssessmentCriterias] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    fetchAssessmentCriterias();
  }, []);

  const fetchAssessmentCriterias = async () => {
    try {
      const result = await getAssessmentCriterias();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setAssessmentCriterias(content);
      }
    } catch (error) {
      message.error("Gagal mengambil data penilaian");
    }
  };

  const handleEdit = (row) => {
    setCurrentRowData(row);
    editForm.setFieldsValue(row);
    setEditModalVisible(true);
  };

  const handleDelete = async (row) => {
    try {
      await deleteAssessmentCriteria({ id: row.id });
      message.success("Berhasil dihapus");
      fetchAssessmentCriterias();
    } catch (error) {
      message.error("Gagal menghapus data");
    }
  };
  

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      console.log("Payload yang dikirim:", values);
      setLoading(true);
      await editAssessmentCriteria(values, currentRowData.id); // Gunakan currentRowData.id
      message.success("Berhasil diperbarui!");
      setEditModalVisible(false);
      fetchAssessmentCriterias();
    } catch (error) {
      message.error("Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleAdd = () => {
    addForm.resetFields();
    setAddModalVisible(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);
      await addAssessmentCriteria(values);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchAssessmentCriterias();
    } catch (error) {
      message.error("Gagal menambahkan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Penilaian" source="Di sini, Anda dapat mengelola penilaian." />
      <br />
      <Card title={<Button type="primary" onClick={handleAdd}>Tambahkan Penilaian</Button>}>
        <Table bordered rowKey="id" dataSource={assessmentCriterias} pagination={false}>
          <Column title="ID Penilaian" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi Penilaian" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
                <Divider type="vertical" />
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      
      {/* Modal Edit */}
      <Modal title="Edit Penilaian" visible={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={handleEditOk} confirmLoading={loading}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="id" label="ID Penilaian">
            <Input disabled />
          </Form.Item>
          <Form.Item name="name" label="Nama Penilaian" rules={[{ required: true, message: "Silahkan isikan nama penilaian" }]}> 
            <Input placeholder="Nama Penilaian" />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi Penilaian" rules={[{ required: true, message: "Silahkan isikan deskripsi" }]}> 
            <TextArea rows={4} placeholder="Deskripsi Penilaian" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tambah */}
      <Modal title="Tambah Penilaian" visible={addModalVisible} onCancel={() => setAddModalVisible(false)} onOk={handleAddOk} confirmLoading={loading}>
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Nama Penilaian" rules={[{ required: true, message: "Silahkan isikan nama penilaian" }]}> 
            <Input placeholder="Nama Penilaian" />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi Penilaian" rules={[{ required: true, message: "Silahkan isikan deskripsi" }]}> 
            <TextArea rows={4} placeholder="Deskripsi Penilaian" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssessmentCriteria;
