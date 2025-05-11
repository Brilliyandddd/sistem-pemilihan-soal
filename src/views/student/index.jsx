import React, { useEffect, useState } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getStudents,
  deleteStudent,
  editStudent,
  addStudent,
} from "@/api/student";
import { getReligions } from "@/api/religion";
import { getUsersNotUsedInLectures } from "@/api/user";
import { getStudyPrograms } from "@/api/studyProgram";
import TypingCard from "@/components/TypingCard";
import EditStudentForm from "./forms/edit-student-form";
import AddStudentForm from "./forms/add-student-form";

const Student = () => {
  const [students, setStudents] = useState([]);
  const [religions, setReligions] = useState([]);
  const [users, setUsers] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studentsRes, religionsRes, usersRes, studyProgramsRes] = await Promise.all([
          getStudents(),
          getReligions(),
          getUsersNotUsedInLectures(),
          getStudyPrograms(),
        ]);
  
        if (studentsRes.data.statusCode === 200) setStudents(studentsRes.data.content);
        if (religionsRes.data.statusCode === 200) setReligions(religionsRes.data.content);
        if (usersRes.data.statusCode === 200) setUsers(usersRes.data.content);
        if (studyProgramsRes.data.statusCode === 200) setStudyPrograms(studyProgramsRes.data.content);
      } catch (error) {
        message.error("Gagal memuat data awal");
      }
    };
  
    fetchInitialData();
  }, []);  

  const fetchStudents = async () => {
    try {
      const result = await getStudents();
      if (result.data.statusCode === 200) {
        setStudents(result.data.content);
      }
    } catch {
      message.error("Gagal mengambil data mahasiswa");
    }
  };

  const fetchReligions = async () => {
    try {
      const result = await getReligions();
      if (result.data.statusCode === 200) {
        setReligions(result.data.content);
      }
    } catch {
      message.error("Gagal mengambil data agama");
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await getUsersNotUsedInLectures();
      if (result.data.statusCode === 200) {
        setUsers(result.data.content);
      }
    } catch {
      message.error("Gagal mengambil data pengguna");
    }
  };

  const fetchStudyPrograms = async () => {
    try {
      const result = await getStudyPrograms();
      if (result.data.statusCode === 200) {
        setStudyPrograms(result.data.content);
      }
    } catch {
      message.error("Gagal mengambil data program studi");
    }
  };

  const handleEditStudent = (row) => {
    setCurrentRowData(row);
    setEditModalVisible(true);
  };

  const handleDeleteStudent = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus Admin");
      return;
    }
    try {
      await deleteStudent({ id: row.id });
      message.success("Berhasil dihapus");
      fetchStudents();
      fetchUsers();
    } catch {
      message.error("Gagal menghapus mahasiswa");
    }
  };

  const handleEditStudentOk = async (values) => {
    try {
      setEditModalLoading(true);
      console.log("Edit Values:", values);
      console.log("Students:", students);

  
      const { id, ...payload } = values; // pisahkan id dari data lain
      await editStudent(payload, id); // kirim data dan id dengan benar
  
      message.success("Berhasil diedit");
      setEditModalVisible(false);
      fetchStudents();
      fetchUsers();
    } catch {
      message.error("Gagal mengedit mahasiswa");
    } finally {
      setEditModalLoading(false);
    }
  };
  
  const handleAddStudentOk = async (values) => {
    try {
      setAddModalLoading(true);
      await addStudent(values);
      message.success("Berhasil menambahkan mahasiswa");
      setAddModalVisible(false);
      fetchStudents();
      fetchUsers();
    } catch {
      message.error("Gagal menambahkan mahasiswa");
    } finally {
      setAddModalLoading(false);
    }
  };

  const renderColumns = () => [
    {
      title: "NIM",
      dataIndex: "nim",
      key: "nim",
      align: "center",
    },
    {
      title: "Nama Lengkap",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Tempat Lahir",
      dataIndex: "place_born",
      key: "place_born",
      align: "center",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "birth_date",
      key: "birth_date",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("id-ID"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => (gender === "L" ? "Laki-laki" : "Perempuan"),
    },
    {
      title: "Nomor Telepon",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
      align: "center",
    },
    {
      title: "Agama",
      dataIndex: ["religion", "name"],
      key: "religion",
      align: "center",
    },
    {
      title: "Program Studi",
      dataIndex: ["studyProgram", "name"],
      key: "studyProgram",
      align: "center",
    },
    {
      title: "Akun Login",
      dataIndex: ["user", "username"],
      key: "user",
      align: "center",
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (_, row) => (
        <>
          <Button type="primary" onClick={() => handleEditStudent(row)}>
            Edit
          </Button>
          <Divider type="vertical" />
          <Button type="danger" onClick={() => handleDeleteStudent(row)}>
            Hapus
          </Button>
        </>
      ),
    },
  ];
  
  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Mahasiswa"
        source="Di sini, Anda dapat mengelola mahasiswa di sistem, seperti menambahkan mahasiswa baru, atau mengubah mahasiswa yang sudah ada di sistem."
      />
      <br />
      <Card title={<Button type="primary" onClick={() => setAddModalVisible(true)}>Tambahkan Mahasiswa</Button>}>
        <Table
          bordered
          rowKey="id"
          dataSource={students}
          pagination={false}
          columns={renderColumns()}
        />
      </Card>

      <EditStudentForm
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditStudentOk}
        religion={religions}
        user={users}
        studyProgram={studyPrograms}
      />

      <AddStudentForm
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddStudentOk}
        religion={religions}
        user={users}
        studyProgram={studyPrograms}
      />
    </div>
  );
};

export default Student;
