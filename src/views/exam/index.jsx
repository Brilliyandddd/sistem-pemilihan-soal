import React, { useState, useEffect, useRef } from "react";
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
  const [currentRowData, setCurrentRowData] = useState({});
  const [addExamModalVisible, setAddExamModalVisible] = useState(false);
  const [addExamModalLoading, setAddExamModalLoading] = useState(false);
  
  const editExamFormRef = useRef(null);
  const addExamFormRef = useRef(null);

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

  const handleEditExam = (row) => {
    setCurrentRowData(row);
    setEditExamModalVisible(true);
  };

  const handleDeleteExam = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }
    await deleteExam({ id: row.id });
    message.success("Berhasil dihapus");
    fetchExam();
  };

  const handleEditExamOk = () => {
    const { form } = editExamFormRef.current.props;
    form.validateFields(async (err, values) => {
      if (err) return;
      setEditExamModalLoading(true);
      try {
        await editExam(values, values.id);
        form.resetFields();
        setEditExamModalVisible(false);
        message.success("Berhasil!");
        fetchExam();
      } catch {
        message.error("Gagal mengedit");
      } finally {
        setEditExamModalLoading(false);
      }
    });
  };

  const handleCancel = () => {
    setEditExamModalVisible(false);
    setAddExamModalVisible(false);
  };

  const handleAddExam = () => {
    setAddExamModalVisible(true);
  };

  const handleAddExamOk = () => {
    const { form } = addExamFormRef.current.props;
    form.validateFields(async (err, values) => {
      if (err) return;
      setAddExamModalLoading(true);
      try {
        await addExam(values);
        form.resetFields();
        setAddExamModalVisible(false);
        message.success("Berhasil!");
        fetchExam();
      } catch {
        message.error("Gagal menambahkan");
      } finally {
        setAddExamModalLoading(false);
      }
    });
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Ujian" source="Di sini, Anda dapat mengelola ujian." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddExam}>Tambahkan Ujian</Button>}>
        <Table bordered rowKey="id" dataSource={exam} pagination={false}>
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="RPS" dataIndex="rps.name" key="rps.name" align="center" />
          <Column title="Nilai Minimal" dataIndex="min_grade" key="min_grade" align="center" />
          <Column
            title="Pilihan Ujian"
            dataIndex="type_exercise"
            key="type_exercise"
            align="center"
            render={text => text === "1-8" ? "UTS" : text === "1-18" ? "UAS" : text}
          />
          <Column title="Tanggal Mulai" dataIndex="date_start" key="date_start" align="center" render={text => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Tanggal Selesai" dataIndex="date_end" key="date_end" align="center" render={text => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Durasi" dataIndex="duration" key="duration" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit Ujian" onClick={() => handleEditExam(row)} />
                <Divider type="vertical" />
                <Link to={`/setting-exam/result/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Detail Hasil" />
                </Link>
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus Data" onClick={() => handleDeleteExam(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditExamForm ref={editExamFormRef} visible={editExamModalVisible} confirmLoading={editExamModalLoading} onCancel={handleCancel} onOk={handleEditExamOk} questions={questions} rpsAll={rps} />
      <AddExamForm ref={addExamFormRef} visible={addExamModalVisible} confirmLoading={addExamModalLoading} onCancel={handleCancel} onOk={handleAddExamOk} rpsDetail={rpsDetail} questions={questions} rps={rps} />
    </div>
  );
};

export default Exam;