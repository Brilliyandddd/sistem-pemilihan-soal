import React, { useState, useEffect } from "react";
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

const StudyProgram = () => {
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

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
    setCurrentRowData(row);
    setEditModalVisible(true);
  };

  const handleDeleteStudyProgram = async (row) => {
    try {
      await deleteStudyProgram({ id: row.id });
      message.success("Berhasil dihapus");
      fetchStudyPrograms();
    } catch (error) {
      message.error("Gagal menghapus program studi");
    }
  };

  const handleEditStudyProgramOk = async (values) => {
    try {
      setEditModalLoading(true);
      const { id, ...updatedValues } = values;
  
      await editStudyProgram(updatedValues, id); // Kirim ID sebagai argumen kedua
      message.success("Berhasil diedit");
      setEditModalVisible(false);
      fetchStudyPrograms();
    } catch (error) {
      message.error("Gagal mengedit program studi");
    } finally {
      setEditModalLoading(false);
    }
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
      dataIndex: ["department", "name"], // 🛠 FIX: Ambil dari department_id, bukan department.name
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
      render: (_, row) => (
        <>
          <Button type="primary" title="Edit" onClick={() => handleEditStudyProgram(row)}>
            Edit
          </Button>
          <Divider type="vertical" />
          <Button type="danger" title="Hapus" onClick={() => handleDeleteStudyProgram(row)}>
            Hapus
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Program Studi" source="Di sini, Anda dapat mengelola program studi di sistem." />
      <br />
      <Card title={<Button type="primary" onClick={() => setAddModalVisible(true)}>Tambahkan program studi</Button>}>
        <Table bordered rowKey="id" dataSource={studyPrograms} pagination={false} columns={renderColumns()} />
      </Card>

      {/* 🛠 Edit Study Program Form - Pastikan departments dikirim */}
      <EditStudyProgramForm
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditStudyProgramOk}
        departments={departments} // 🛠 FIX: Kirim departments ke form edit
      />

      {/* 🛠 Add Study Program Form */}
      <AddStudyProgramForm
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
