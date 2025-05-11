/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Table, message, Modal } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
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
      const [rpsRes, prodiRes, subjectRes, lectureRes] = await Promise.all([  // Ubah dari courseRes menjadi subjectRes
        getRPS(),
        getStudyProgram(),
        getSubject(),  // Ubah dari getCourses menjadi getSubjects
        getLecture(),
      ]);

      console.log("lectureRes.data:", lectureRes.data);

      setRPS(rpsRes.data.content);
      setStudyProgram(prodiRes.data);
      setSubject(subjectRes.data);  // Ubah dari courses menjadi subjects
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
      content: `ID: ${row.id} - Nama: ${row.name}`,
      okText: "Ya",
      okType: "danger",
      cancelText: "Batal",
      async onOk() {
        try {
          await deleteRPS(row.id);
          message.success("RPS berhasil dihapus!");
          fetchAllData();
        } catch (error) {
          message.error("Gagal menghapus RPS. Silakan coba lagi.");
        }
      },
    });
  }, []);

  const handleEditRPS = (row) => {
    setCurrentRowData(row);
    setEditRPSModalVisible(true);
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
          <Column title="ID RPS" dataIndex="id" align="center" />
          <Column title="Nama" dataIndex="name" align="center" />
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
            dataIndex="developer_lecturer"
            align="center"
            render={(lecture) => lecture?.name || "-"}
          />
          <Column
            title="Dosen Pengampu"
            dataIndex="developer_lecturer"
            align="center"
            render={(lecture) => lecture?.name || "-"}
          />
          <Column
            title="Dosen Koordinator"
            dataIndex="developer_lecturer"
            align="center"
            render={(lecture) => lecture?.name || "-"}
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
        lecture={lecture.content}
        onCancel={() => setEditRPSModalVisible(false)}
        onOk={async (values) => {
          setEditRPSModalLoading(true);
          try {
            values.mandatory = values.mandatory.trim().toLowerCase(); // Normalize the field
            await editRPS(values);
            message.success("RPS berhasil diperbarui!");
            setEditRPSModalVisible(false);
            fetchAllData();
          } catch (error) {
            message.error("Gagal memperbarui RPS. Silakan coba lagi.");
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
          setEditRPSModalLoading(true);
          try {
            // values.mandatory = values.mandatory.trim().toLowerCase(); // Normalize the field
            const updatedValues = {

              cplMk: values.cplMk,
              cplProdi: values.cplProdi,
              idProgramStudi: values.idProgramStudi,
              idSubject: values.idSubject,  // Ubah dari course_id menjadi subject_id
              sks: values.sks,
              semester: values.semester,
              name: values.name,
              idLearningMediaSoftware: values.software,
              idLearningMediaHardware: values.hardware,
              developer_lecturer_id: values.developer_lecturer_id,
              coordinator_lecturer_id: values.coordinator_lecturer_id,
              instructor_lecturer_id: values.instructor_lecturer_id,
              // idLecturer: [values.developer_lecturer_id, values.coordinator_lecturer_id, values.instructor_lecturer_id],
            };
            console.log("Learning media software", values.software);
            console.log("Learning media hardware", values.hardware);
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
