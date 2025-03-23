import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Upload } from "antd";
import { EditOutlined, DeleteOutlined, DiffOutlined } from "@ant-design/icons";
import { getRPS, deleteRPS, importRPS } from "@/api/rps";
import { importRPSDetail } from "@/api/rpsDetail";
import { getSubjects } from "@/api/subject";
import { getStudyPrograms } from "@/api/studyProgram";
import { getLectures } from "@/api/lecture";
import { getLearningMediasSoftware, getLearningMediasHardware } from "@/api/learningMedia";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import TypingCard from "@/components/TypingCard";
import EditRPSForm from "./forms/edit-rps-form";
import AddRPSForm from "./forms/add-rps-form";

const { Column } = Table;

const RPS = () => {
  const [rps, setRPS] = useState([]);
  const [learningMediaSoftwares, setLearningMediaSoftwares] = useState([]);
  const [learningMediaHardwares, setLearningMediaHardwares] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [editRPSModalVisible, setEditRPSModalVisible] = useState(false);
  const [editRPSModalLoading, setEditRPSModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addRPSModalVisible, setAddRPSModalVisible] = useState(false);
  const [addRPSModalLoading, setAddRPSModalLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rpsData, subjectsData, learningSoftwares, learningHardwares, studyProgramsData, lecturesData] = await Promise.all([
        getRPS(),
        getSubjects(),
        getLearningMediasSoftware(),
        getLearningMediasHardware(),
        getStudyPrograms(),
        getLectures(),
      ]);

      setRPS(rpsData.data.content);
      setSubjects(subjectsData.data.content);
      setLearningMediaSoftwares(learningSoftwares.data.content);
      setLearningMediaHardwares(learningHardwares.data.content);
      setStudyPrograms(studyProgramsData.data.content);
      setLectures(lecturesData.data.content);
    } catch (error) {
      message.error("Gagal mengambil data. Silakan coba lagi.");
    }
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen RPS" source="Di sini, Anda dapat mengelola RPS." />

      <Card title={<Button type="primary" onClick={() => setAddRPSModalVisible(true)}>Tambahkan RPS</Button>}>
        <Table bordered rowKey="id" dataSource={rps} pagination={{ pageSize: 5 }}>
          <Column title="ID RPS" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="SKS" dataIndex="sks" key="sks" align="center" />
          <Column title="Semester" dataIndex="semester" key="semester" align="center" />
          <Column title="CPL Prodi" dataIndex="cpl_prodi" key="cpl_prodi" align="center" />
          <Column title="CPL Mata Kuliah" dataIndex="cpl_mk" key="cpl_mk" align="center" />
          <Column title="Media Pembelajaran Software" dataIndex="learning_media_softwares" key="learning_media_softwares" align="center" render={(data) => data?.join(", ") || "-"} />
          <Column title="Media Pembelajaran Hardware" dataIndex="learning_media_hardwares" key="learning_media_hardwares" align="center" render={(data) => data?.join(", ") || "-"} />
          <Column title="Mata Kuliah" dataIndex={["subject", "name"]} key="subject.name" align="center" />
          <Column title="Program Studi" dataIndex={["study_program", "name"]} key="study_program.name" align="center" />
          <Column title="Dosen Pengembang" dataIndex="dev_lecturers" key="dev_lecturers" align="center" render={(dev_lecturers) => dev_lecturers?.map((lecturer) => lecturer.name).join(", ") || "-"} />
          <Column title="Dosen Pengajar" dataIndex="teaching_lecturers" key="teaching_lecturers" align="center" render={(teaching_lecturers) => teaching_lecturers?.map((lecturer) => lecturer.name).join(", ") || "-"} />
          <Column title="Koordinator Dosen" dataIndex="coordinator_lecturers" key="coordinator_lecturers" align="center" render={(coordinator_lecturers) => coordinator_lecturers?.map((lecturer) => lecturer.name).join(", ") || "-"} />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => { setCurrentRowData(row); setEditRPSModalVisible(true); }} />
                <Divider type="vertical" />
                <Link to={`/rps/${row.id}`}>
                  <Button type="primary" shape="circle" icon={<DiffOutlined />} />
                </Link>
                <Divider type="vertical" />
                <Button type="danger" shape="circle" icon={<DeleteOutlined />} onClick={() => handleDeleteRPS(row)} />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditRPSForm currentRowData={currentRowData} visible={editRPSModalVisible} confirmLoading={editRPSModalLoading} onCancel={() => setEditRPSModalVisible(false)} />
      <AddRPSForm visible={addRPSModalVisible} confirmLoading={addRPSModalLoading} onCancel={() => setAddRPSModalVisible(false)} />
    </div>
  );
};

export default RPS;