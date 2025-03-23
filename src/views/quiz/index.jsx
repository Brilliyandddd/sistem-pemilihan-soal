import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { getQuiz, deleteQuiz, editQuiz, addQuiz } from "@/api/quiz";
import { getQuestionsByRPS, getQuestions } from "@/api/question";
import { getRPS } from "@/api/rps";
import { Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";
import EditQuizForm from "./forms/edit-quiz-form";
import AddQuizForm from "./forms/add-quiz-form";
import moment from "moment";

const { Column } = Table;

const Quiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [rps, setRps] = useState([]);
  const [currentRowData, setCurrentRowData] = useState({});
  const [editQuizModalVisible, setEditQuizModalVisible] = useState(false);
  const [editQuizModalLoading, setEditQuizModalLoading] = useState(false);
  const [addQuizModalVisible, setAddQuizModalVisible] = useState(false);
  const [addQuizModalLoading, setAddQuizModalLoading] = useState(false);

  const editQuizFormRef = useRef(null);
  const addQuizFormRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
    fetchRPS();
  }, []);

  const fetchQuiz = async () => {
    const result = await getQuiz();
    if (result.data.statusCode === 200) {
      setQuiz(result.data.content);
    }
  };

  const fetchQuestions = async () => {
    const result = await getQuestions();
    if (result.data.statusCode === 200) {
      setQuestions(result.data.content);
    }
  };

  const updateQuestion = async (id) => {
    const result = await getQuestionsByRPS(id);
    if (result.data.statusCode === 200) {
      setQuestions(result.data.content.filter(q => q.examType2 === 'QUIZ'));
    }
  };

  const fetchRPS = async () => {
    const result = await getRPS();
    if (result.data.statusCode === 200) {
      setRps(result.data.content);
    }
  };

  const handleEditQuiz = (row) => {
    setCurrentRowData({ ...row });
    setEditQuizModalVisible(true);
  };

  const handleDeleteQuiz = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak bisa dihapus oleh Admin!");
      return;
    }
    await deleteQuiz({ id: row.id });
    message.success("Berhasil dihapus");
    fetchQuiz();
  };

  const handleEditQuizOk = () => {
    const { form } = editQuizFormRef.current.props;
    form.validateFields(async (err, values) => {
      if (err) return;
      setEditQuizModalLoading(true);
      try {
        await editQuiz(values, values.id);
        form.resetFields();
        setEditQuizModalVisible(false);
        setEditQuizModalLoading(false);
        message.success("Berhasil!");
        fetchQuiz();
      } catch {
        message.error("Gagal");
      }
    });
  };

  const handleCancel = () => {
    setEditQuizModalVisible(false);
    setAddQuizModalVisible(false);
  };

  const handleAddQuiz = () => {
    setAddQuizModalVisible(true);
  };

  const handleAddQuizOk = () => {
    const { form } = addQuizFormRef.current.props;
    form.validateFields(async (err, values) => {
      if (err) return;
      setAddQuizModalLoading(true);
      try {
        await addQuiz(values);
        form.resetFields();
        setAddQuizModalVisible(false);
        setAddQuizModalLoading(false);
        message.success("Berhasil!");
        fetchQuiz();
      } catch {
        message.error("Gagal menambahkan, coba lagi!");
      }
    });
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Kuis" source="Di sini, Anda dapat mengelola Quiz sesuai dengan mata kuliah yang diampu." />
      <br />
      <Card title={<Button type="primary" onClick={handleAddQuiz}>Tambahkan Kuis</Button>}>
        <Table bordered rowKey="id" dataSource={quiz} pagination={false}>
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="RPS" dataIndex="rps.name" key="rps.name" align="center" />
          <Column title="Nilai Minimal" dataIndex="min_grade" key="min_grade" align="center" />
          <Column title="Tipe Kuis" dataIndex="type_quiz" key="type_quiz" align="center" />
          <Column title="Tanggal Mulai" dataIndex="date_start" key="date_start" align="center" render={(text) => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Tanggal Selesai" dataIndex="date_end" key="date_end" align="center" render={(text) => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Durasi" dataIndex="duration" key="duration" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit Kuis" onClick={() => handleEditQuiz(row)} />
                <Divider type="vertical" />
                <Link to={`/setting-quiz/result/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Detail Hasil" />
                </Link>
                <Divider type="vertical" />
                <Link to={`/setting-quiz/generate-quiz/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Detail Generate Quiz" />
                </Link>
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus Data" onClick={() => handleDeleteQuiz(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditQuizForm ref={editQuizFormRef} visible={editQuizModalVisible} confirmLoading={editQuizModalLoading} onCancel={handleCancel} onOk={handleEditQuizOk} questions={questions} rpsAll={rps} />
      <AddQuizForm ref={addQuizFormRef} visible={addQuizModalVisible} confirmLoading={addQuizModalLoading} onCancel={handleCancel} onOk={handleAddQuizOk} questions={questions} rps={rps} />
    </div>
  );
};

export default Quiz;