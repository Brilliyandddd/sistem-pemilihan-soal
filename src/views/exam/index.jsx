import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { getExam, deleteExam, editExam, addExam } from "@/api/exam";
import { getQuestionsByRPS } from "@/api/question";
import { getRPS } from "@/api/rps";
import { getRPSDetail } from "@/api/rpsDetail";
import { Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";
import EditExamForm from "./forms/edit-exam-form";
import AddExamForm from "./forms/add-exam-form";
import moment from "moment";

const { Column } = Table;

const Exam = () => {
  const [exam, setExam] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [rps, setRps] = useState([]);
  const [rpsDetail, setRpsDetail] = useState([]);
  const [editExamModalVisible, setEditExamModalVisible] = useState(false);
  const [editExamModalLoading, setEditExamModalLoading] = useState(false);
  const [addExamModalVisible, setAddExamModalVisible] = useState(false);
  const [addExamModalLoading, setAddExamModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  useEffect(() => {
    fetchExam();
    fetchRps();
  }, []);

  const fetchExam = async () => {
    const result = await getExam();
    if (result.data.statusCode === 200) {
      setExam(result.data.content);
    }
  };

  const fetchRps = async () => {
    const result = await getRPS();
    if (result.data.statusCode === 200) {
      setRps(result.data.content);
    }
  };

  const fetchQuestionsByRPS = async (id) => {
    const result = await getQuestionsByRPS(id);
    if (result.data.statusCode === 200) {
      setQuestions(result.data.content.filter(q => q.examType3 === 'EXAM'));
    }
  };

  const fetchRPSDetail = async (id) => {
    const result = await getRPSDetail(id);
    if (result.data.statusCode === 200) {
      setRpsDetail(result.data.content);
    }
  };

  const handleEditExam = (row) => {
    setCurrentRowData(row);
    setEditExamModalVisible(true);
  };

  const handleDeleteExam = async (row) => {
    await deleteExam({ id: row.id });
    message.success("Berhasil dihapus");
    fetchExam();
  };

  const handleCancel = () => {
    setEditExamModalVisible(false);
    setAddExamModalVisible(false);
  };

  const handleAddExam = () => {
    setAddExamModalVisible(true);
  };

  const handleAddExamOk = async (values) => {
    values.date_start = values.date_start.toISOString();
    values.date_end = values.date_end.toISOString();
    setAddExamModalLoading(true);
    try {
      console.log(values);
      await addExam(values);
      message.success("Berhasil menambahkan");
      fetchExam();
      setAddExamModalVisible(false);
    } catch {
      message.error("Gagal menambahkan");
    } finally {
      setAddExamModalLoading(false);
    }
  };

  const handleEditExamOk = async (values) => {
    setEditExamModalLoading(true);
    try {
      await editExam(values, values.id);
      message.success("Berhasil mengedit");
      fetchExam();
      setEditExamModalVisible(false);
    } catch {
      message.error("Gagal mengedit");
    } finally {
      setEditExamModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Ujian" source="Di sini, Anda dapat mengelola ujian." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddExam}>Tambahkan Ujian</Button>}>
        <Table bordered rowKey="id" dataSource={exam} pagination={false}>
          <Column title="Nama" dataIndex="name" align="center" />
          <Column title="RPS" dataIndex={["rps", "name"]} align="center" />
          <Column title="Nilai Minimal" dataIndex="min_grade" align="center" />
          <Column
            title="Pilihan Ujian"
            dataIndex="type_exercise"
            align="center"
            render={text => text === "1-8" ? "UTS" : text === "1-18" ? "UAS" : text}
          />
          <Column title="Tanggal Mulai" dataIndex="date_start" align="center" render={text => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Tanggal Selesai" dataIndex="date_end" align="center" render={text => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Durasi" dataIndex="duration" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" onClick={() => handleEditExam(row)} />
                <Divider type="vertical" />
                <Link to={`/setting-exam/result/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" />
                </Link>
                <Divider type="vertical" />
                <Button type="danger" shape="circle" icon="delete" onClick={() => handleDeleteExam(row)} />
              </span>
            )}
          />
        </Table>
      </Card>

      <AddExamForm
        visible={addExamModalVisible}
        confirmLoading={addExamModalLoading}
        onCancel={handleCancel}
        onOk={handleAddExamOk}
        rps={rps}
        rpsDetail={rpsDetail}
        questions={questions}
        handleGetRPSDetail={fetchRPSDetail}
        handleUpdateQuestion={fetchQuestionsByRPS}
      />

      <EditExamForm
        visible={editExamModalVisible}
        confirmLoading={editExamModalLoading}
        onCancel={handleCancel}
        onOk={handleEditExamOk}
        rpsAll={rps}
        questions={questions}
        data={currentRowData}
      />
    </div>
  );
};

export default Exam;
