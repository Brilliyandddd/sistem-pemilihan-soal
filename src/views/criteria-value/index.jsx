import React, { useEffect, useState } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { Link } from "react-router-dom";
import { getRPS } from "@/api/rps";
import { getSubjects } from "@/api/subject";
import { getStudyPrograms } from "@/api/studyProgram";
import { getLectures } from "@/api/lecture";
import { getLearningMediasSoftware, getLearningMediasHardware } from "@/api/learningMedia";
import TypingCard from "@/components/TypingCard";

const { Column } = Table;

const CriteriaValue = () => {
  const [rps, setRps] = useState([]);
  const [learningMediaSoftwares, setLearningMediaSoftwares] = useState([]);
  const [learningMediaHardwares, setLearningMediaHardwares] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [lectures, setLectures] = useState([]);

  const fetchRPS = async () => {
    try {
      const result = await getRPS();
      const { content, statusCode } = result.data;
      if (statusCode === 200) setRps(content);
    } catch (err) {
      message.error("Gagal memuat data RPS");
    }
  };

  const fetchLearningMedias = async () => {
    try {
      const resSoftware = await getLearningMediasSoftware();
      if (resSoftware.data.statusCode === 200) {
        setLearningMediaSoftwares(resSoftware.data.content);
      }

      const resHardware = await getLearningMediasHardware();
      if (resHardware.data.statusCode === 200) {
        setLearningMediaHardwares(resHardware.data.content);
      }
    } catch (err) {
      message.error("Gagal memuat media pembelajaran");
    }
  };

  const fetchSubjects = async () => {
    try {
      const result = await getSubjects();
      if (result.data.statusCode === 200) {
        setSubjects(result.data.content);
      }
    } catch (err) {
      message.error("Gagal memuat mata kuliah");
    }
  };

  const fetchStudyPrograms = async () => {
    try {
      const result = await getStudyPrograms();
      if (result.data.statusCode === 200) {
        setStudyPrograms(result.data.content);
      }
    } catch (err) {
      message.error("Gagal memuat program studi");
    }
  };

  const fetchLectures = async () => {
    try {
      const result = await getLectures();
      if (result.data.statusCode === 200) {
        setLectures(result.data.content);
      }
    } catch (err) {
      message.error("Gagal memuat dosen");
    }
  };

  useEffect(() => {
    fetchRPS();
    fetchSubjects();
    fetchLearningMedias();
    fetchStudyPrograms();
    fetchLectures();
  }, []);

  const title = (
    <span>
      <div>Pilih RPS yang akan dinilai soal soalnya</div>
    </span>
  );

  const cardContent = `Di sini, Anda dapat mengelola RPS sesuai dengan mata kuliah yang diampu. Di bawah ini dapat menampilkan list RPS yang ada.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen RPS" source={cardContent} />
      <br />
      <Card title={title}>
        <Table bordered rowKey="id" dataSource={rps} pagination={false}>
          <Column title="ID RPS" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Semester" dataIndex="semester" key="semester" align="center" />
          <Column title="SKS" dataIndex="sks" key="sks" align="center" />
          <Column title="Mata Kuliah" dataIndex={["subject", "name"]} key="subject.name" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(_, row) => (
              <span>
                <Divider type="vertical" />
                <Link to={`/index/question/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Pilih RPS" />
                </Link>
                <Divider type="vertical" />
              </span>
            )}
          />
        </Table>
      </Card>
    </div>
  );
};

export default CriteriaValue;
