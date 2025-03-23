import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getStudyPrograms,
  deleteStudyProgram,
  editStudyProgram,
  addStudyProgram,
} from "@/api/studyProgram";
import { getDepartments } from "@/api/department";
import TypingCard from "@/components/TypingCard";
import EditStudyProgramForm from "./forms/edit-study-program-form";
import AddStudyProgramForm from "./forms/add-study-program-form";

const { Column } = Table;

const StudyProgram = () => {
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  useEffect(() => {
    fetchStudyPrograms();
    fetchDepartments();
  }, []);

  const fetchStudyPrograms = async () => {
    try {
      const result = await getStudyPrograms();
      if (result.data.statusCode === 200) {
        setStudyPrograms(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data program studi");
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await getDepartments();
      if (result.data.statusCode === 200) {
        setDepartments(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data jurusan");
    }
  };

  const handleEditStudyProgram = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleDeleteStudyProgram = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak bisa menghapus admin");
      return;
    }
    try {
      await deleteStudyProgram({ id: row.id });
      message.success("Berhasil dihapus");
      fetchStudyPrograms();
    } catch (error) {
      message.error("Gagal menghapus program studi");
    }
  };

  const handleEditStudyProgramOk = async () => {
    try {
      const values = await editFormRef.current.validateFields();
      setEditModalLoading(true);
      await editStudyProgram(values);
      message.success("Berhasil diedit");
      setEditModalVisible(false);
      fetchStudyPrograms();
    } catch (error) {
      message.error("Gagal mengedit");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleAddStudyProgram = () => {
    setAddModalVisible(true);
  };

  const handleAddStudyProgramOk = async (values) => {
    try {
      setAddModalLoading(true);
      await addStudyProgram(values);
      message.success("Berhasil ditambahkan");
      setAddModalVisible(false);
      fetchStudyPrograms();
    } catch (error) {
      message.error("Gagal menambahkan program studi");
    } finally {
      setAddModalLoading(false);
    }
  };

  const renderColumns = () => [
    {
      title: "ID Program Studi",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Jurusan",
      dataIndex: ["department", "name"],
      key: "name",
      align: "center",
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Deskripsi Program Studi",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (text, row) => (
        <span>
          <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEditStudyProgram(row)} />
          <Divider type="vertical" />
          <Button type="danger" shape="circle" icon="delete" title="Hapus" onClick={() => handleDeleteStudyProgram(row)} />
        </span>
      ),
    },
  ];
  
  const renderTable = () => (
    <Table bordered rowKey="id" dataSource={studyPrograms} pagination={false} columns={renderColumns()} />
  );

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Program Studi" source="Di sini, Anda dapat mengelola program studi di sistem." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddStudyProgram}>Tambahkan program studi</Button>}>
        {renderTable()}
      </Card>
      <EditStudyProgramForm
        ref={editFormRef}
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditStudyProgramOk}
      />
      <AddStudyProgramForm
        ref={addFormRef}
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddStudyProgramOk}
        departments={departments}
      />
    </div>
  );
};

export default StudyProgram;