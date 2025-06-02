/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Table, message, Modal, Divider } from "antd";
import { Link } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DiffOutlined,
} from "@ant-design/icons";
import {
  getRPS,
  deleteRPS,
  editRPS,
  addRPS,
  getStudyProgram,
  getSubject,  // Ubah dari getCourses menjadi getSubjects
  getLecture,
} from "@/api/rps"; // Pastikan semua API ini tersedia
import TypingCard from "@/components/TypingCard";
import EditRPSForm from "./forms/edit-rps-form";
import AddRPSForm from "./forms/add-rps-form";

const { Column } = Table;
const { confirm } = Modal;

const RPS = () => {
  const [rps, setRPS] = useState([]);
  const [studyProgram, setStudyProgram] = useState([]);
  const [subject, setSubject] = useState([]);  // Ubah dari courses menjadi subjects
  const [lecture, setLecture] = useState([]);

  const [editRPSModalVisible, setEditRPSModalVisible] = useState(false);
  const [editRPSModalLoading, setEditRPSModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const [addRPSModalVisible, setAddRPSModalVisible] = useState(false);
  const [addRPSModalLoading, setAddRPSModalLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [rpsRes, prodiRes, subjectRes, lectureRes] = await Promise.all([  
        getRPS(),
        getStudyProgram(),
        getSubject(),  
        getLecture(),
      ]);

      console.log("lectureRes.data:", lectureRes.data);

      setRPS(rpsRes.data.content);
      setStudyProgram(prodiRes.data);
      setSubject(subjectRes.data);  
      setLecture(lectureRes.data.content);
    } catch (error) {
      message.error("Gagal mengambil data. Silakan coba lagi.");
    }
  };

  const fetchStudyProgram = async () => {
      try {
        const result = await getStudyProgram();
        if (result.data.statusCode === 200) {
          setStudyProgram(result.data.content);
        }
      } catch {
        message.error("Gagal mengambil data program studi");
      }
    };

  const fetchSubject = async () => {
    try {
      const result = await getSubject(); // pastikan ini adalah API service kamu
      if (result.data.statusCode === 200) {
        setSubject(result.data.content);
      }
    } catch {
      message.error("Gagal mengambil data mata kuliah");
    }
  };
  
const handleDeleteRPS = useCallback((row) => {
  confirm({
    title: "Apakah Anda yakin ingin menghapus RPS ini?",
    icon: <ExclamationCircleOutlined />,
    content: `ID: ${row.idRps} - Nama: ${row.nameRps}`,
    okText: "Ya",
    okType: "danger",
    cancelText: "Batal",
    async onOk() {
      try {
        await deleteRPS(row.idRps); // Ubah dari row.id menjadi row.idRps
        message.success("RPS berhasil dihapus!");
        fetchAllData();
      } catch (error) {
        message.error("Gagal menghapus RPS. Silakan coba lagi.");
      }
    },
  });
}, []);

  const handleEditRPS = (row) => {
  if (!row?.idRps) {
    message.error("Data RPS tidak memiliki ID!");
    return;
  }
  setCurrentRowData(row);
  setEditRPSModalVisible(true);
};


  const getLecturerByIndex = (lectureArray, index) => {
  if (!lectureArray || !Array.isArray(lectureArray)) return "-";
  if (index >= lectureArray.length) return "-";
  return lectureArray[index] || "-";
};

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen RPS"
        source="Di sini, Anda dapat mengelola RPS."
      />
      <Card
        title={
          <Button type="primary" onClick={() => setAddRPSModalVisible(true)}>
            Tambahkan RPS
          </Button>
        }
      >
        <Table
          bordered
          rowKey="id"
          dataSource={rps}
          pagination={{ pageSize: 5 }}
        >
          <Column title="ID RPS" dataIndex="idRps" align="center" />
          <Column title="Nama" dataIndex="nameRps" align="center" />
          <Column title="SKS" dataIndex="sks" align="center" />
          <Column title="Semester" dataIndex="semester" align="center" />
          <Column
            title="Mata Kuliah"  
            dataIndex="subject" 
            align="center"
            render={(subject) => subject?.name || "-"} 
          />
          <Column
  title="Dosen Pengembang"
  dataIndex={["developerLecturer", "name"]}
  align="center"
  render={(name, record) => (
    name || 
    record?.developer_lecturer_id || 
    "-"
  )}
/>
<Column
  title="Dosen Koordinator"
  dataIndex={["coordinatorLecturer", "name"]}
  align="center"
  render={(name, record) => (
    name || 
    record?.coordinator_lecturer_id || 
    "-"
  )}
/>
<Column
  title="Dosen Pengampu"
  dataIndex={["instructorLecturer", "name"]}
  align="center"
  render={(name, record) => (
    name || 
    record?.instructor_lecturer_id || 
    "-"
  )}
/>
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEditRPS(row)}
                />
                <Divider type="vertical" />
                  <Link to={`/rps/${row.idRps}`}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<DiffOutlined />}
                      title="Detail RPS"
                    />
                  </Link>
                  <Divider type="vertical" />
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteRPS(row)}
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          />
        </Table>
      </Card>

      <EditRPSForm
        currentRowData={currentRowData}
        visible={editRPSModalVisible}
        confirmLoading={editRPSModalLoading}
        studyProgram={studyProgram.content}
        subject={subject.content}  
        lecture={lecture}
        onCancel={() => setEditRPSModalVisible(false)}
        onOk={async (values) => {
  setEditRPSModalLoading(true);
  try {
    if (!values.idRps) {
      throw new Error("ID RPS tidak valid");
    }
    const editedValues = {
      idRps: values.idRps,
      cplMk: values.cplMk,
      cplProdi: values.cplProdi,
      idProgramStudi: values.idProgramStudi,
      idSubject: values.idSubject,
      sks: values.sks,
      semester: values.semester,
      nameRps: values.nameRps,
      idLearningMediaSoftware: values.idLearningMediaSoftware,
      idLearningMediaHardware: values.idLearningMediaHardware,
      developer_lecturer_id: values.developer_lecturer_id,
      coordinator_lecturer_id: values.coordinator_lecturer_id,
      instructor_lecturer_id: values.instructor_lecturer_id,
    };
    console.log("values update", editedValues);
    // Panggil API dengan memisahkan ID dan data
    await editRPS(editedValues.idRps, editedValues); // Kirim semua values
    
    message.success("RPS berhasil diubah!");
    setEditRPSModalVisible(false);
    fetchAllData();
  } catch (error) {
    console.error("Error saat mengedit RPS:", error);
    message.error(`Gagal mengubah RPS: ${error.message}`);
  } finally {
    setEditRPSModalLoading(false);
  }
}}
        
      />

      <AddRPSForm
        visible={addRPSModalVisible}
        confirmLoading={addRPSModalLoading}
        studyProgram={studyProgram.content}
        subject={subject.content}  
        lecture={lecture}
        onCancel={() => setAddRPSModalVisible(false)}
        onOk={async (values) => {
          setAddRPSModalLoading(false);
          try {
            // values.mandatory = values.mandatory.trim().toLowerCase(); // Normalize the field
            const updatedValues = {
              idRps: null,
              cplMk: values.cplMk,
              cplProdi: values.cplProdi,
              idProgramStudi: values.idProgramStudi,
              idSubject: values.idSubject, 
              sks: values.sks,
              semester: values.semester,
              nameRps: values.nameRps,
              idLearningMediaSoftware: values.idLearningMediaSoftware,
              idLearningMediaHardware: values.idLearningMediaHardware,
              developer_lecturer_id: values.developer_lecturer_id,
              coordinator_lecturer_id: values.coordinator_lecturer_id,
              instructor_lecturer_id: values.instructor_lecturer_id,
              // idLecturer: [values.developer_lecturer_id, values.coordinator_lecturer_id, values.instructor_lecturer_id],
            };
            console.log("Learning media software", values.idLearningMediaSoftware);
            console.log("Learning media hardware", values.idLearningMediaHardware);
            console.log ("values", updatedValues);
            await addRPS(updatedValues);
            
            message.success("RPS berhasil ditambah!");
            setAddRPSModalVisible(false);
            fetchAllData();
          } catch (error) {
            message.error("Gagal manambah RPS. Silakan coba lagi.");
          } finally {
            setAddRPSModalLoading(false);
          }
        }}
        
      />
    </div>
  );
};

export default RPS;
