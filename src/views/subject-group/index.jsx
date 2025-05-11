import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getSubjectGroups,
  deleteSubjectGroup,
  editSubjectGroup,
  addSubjectGroup,
} from "@/api/subjectGroup";
import TypingCard from "@/components/TypingCard";
import EditSubjectGroupForm from "./forms/edit-subject-group-form";
import AddSubjectGroupForm from "./forms/add-subject-group-form";

const { Column } = Table;

const SubjectGroup = () => {
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  // Fetch data saat komponen pertama kali di-mount
  useEffect(() => {
    fetchSubjectGroups();
  }, []);

  // Fungsi untuk mengambil data subject groups dari API
  const fetchSubjectGroups = useCallback(async () => {
    try {
      const result = await getSubjectGroups();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setSubjectGroups(content);
      }
    } catch (error) {
      message.error("Gagal mengambil data rumpun mata kuliah.");
    }
  }, []);

  // Fungsi untuk menangani edit
  const handleEdit = (row) => {
    setCurrentRowData(row);
    setEditModalVisible(true);
  };

  // Fungsi untuk menangani penghapusan
  const handleDelete = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak bisa dihapus oleh Admin!");
      return;
    }
    try {
      await deleteSubjectGroup({ id });
      message.success("Berhasil dihapus");
      fetchSubjectGroups(); // Refresh data setelah penghapusan
    } catch (error) {
      message.error("Gagal menghapus rumpun mata kuliah.");
    }
  };

  // Menangani penyimpanan data setelah edit
  const handleEditSubjectGroupOk = async (values) => {
    try {
      setEditModalLoading(true);
      const { id, ...updatedValues } = values; // Pisahkan ID dari payload
  
      await editSubjectGroup(updatedValues, id); // Kirim id sebagai parameter kedua (URL param)
      message.success("Berhasil diedit");
      setEditModalVisible(false);
      fetchSubjectGroups();
    } catch (error) {
      message.error("Gagal mengedit kelompok mata kuliah");
    } finally {
      setEditModalLoading(false);
    }
  };
  
  // Menangani pembatalan modal
  const handleCancel = () => {
    setEditModalVisible(false);
    setAddModalVisible(false);
  };

  // Menangani tombol tambah rumpun mata kuliah
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // Menangani penyimpanan data setelah menambah rumpun mata kuliah
  const handleAddOk = async (values) => {
    setAddModalLoading(true);
    try {
      await addSubjectGroup(values);
      message.success("Berhasil menambahkan!");
      setAddModalVisible(false);
      fetchSubjectGroups();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Rumpun Mata Kuliah"
        source="Di sini, Anda dapat mengelola rumpun mata kuliah di sistem."
      />
      <br />
      <Card title={<Button type="primary" onClick={handleAdd}>Tambahkan Rumpun Mata Kuliah</Button>}>
        <Table bordered rowKey="id" dataSource={subjectGroups} pagination={false}>
          <Column title="ID Rumpun Mata Kuliah" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <>
                <Button type="primary" shape="circle" icon={<EditOutlined />} title="Edit" onClick={() => handleEdit(row)} />
                <Divider type="vertical" />
                <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} title="Hapus" onClick={() => handleDelete(row)} />
              </>
            )}
          />
        </Table>
      </Card>

      {/* Modal Edit */}
      {currentRowData && (
        <EditSubjectGroupForm
          currentRowData={currentRowData}
          visible={editModalVisible}
          confirmLoading={editModalLoading}
          onCancel={handleCancel}
          onOk={handleEditSubjectGroupOk}
        />
      )}

      {/* Modal Tambah */}
      <AddSubjectGroupForm
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={handleCancel}
        onOk={handleAddOk}
      />
    </div>
  );
};

export default SubjectGroup;
