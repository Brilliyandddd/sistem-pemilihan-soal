import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { getQuiz, deleteQuiz, editQuiz, addQuiz } from "@/api/quiz";
import { getQuestionsByRPS, getQuestion } from "@/api/question"; // Ganti getQuestions dengan getQuestion
import { getRPS } from "@/api/rps";
import { Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";
import EditQuizForm from "./forms/edit-quiz-form";
import AddQuizForm from "./forms/add-quiz-form";
import moment from "moment";
import { EditOutlined, BarChartOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";

const { Column } = Table;

const Quiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [rps, setRps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [editQuizModalVisible, setEditQuizModalVisible] = useState(false);
  const [editQuizModalLoading, setEditQuizModalLoading] = useState(false);
  const [addQuizModalVisible, setAddQuizModalVisible] = useState(false);
  const [addQuizModalLoading, setAddQuizModalLoading] = useState(false);

  const editQuizFormRef = useRef(null);
  const addQuizFormRef = useRef(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getQuiz();
      if (result.data.statusCode === 200) {
        setQuiz(result.data.content || []);
      } else {
        message.error("Gagal memuat data kuis");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      message.error("Gagal memuat data kuis");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllQuestions = useCallback(async () => {
    try {
      const result = await getQuestion(); // Ganti getQuestions dengan getQuestion
      if (result.data.statusCode === 200) {
        setAllQuestions(result.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching all questions:", error);
      message.error("Gagal memuat semua data pertanyaan");
    }
  }, []);

  const updateQuestion = useCallback(async (rpsId) => {
    if (rpsId) {
      try {
        const result = await getQuestionsByRPS(rpsId);  // Pastikan ini mengirim rpsId dengan benar
        if (result.data.statusCode === 200) {
          const questionsForRps = result.data.content?.filter(q => q.examType2 === 'QUIZ') || [];
          setFilteredQuestions(questionsForRps);
        } else {
          setFilteredQuestions([]);
        }
      } catch (error) {
        console.error("Error updating questions by RPS:", error);
        message.error("Gagal memperbarui data pertanyaan berdasarkan RPS");
        setFilteredQuestions([]);
      }
    } else {
      setFilteredQuestions([]);
    }
  }, []);

  const fetchRPS = useCallback(async () => {
  try {
    const result = await getRPS();
    if (result.data.statusCode === 200) {
      // Keep the original ID as value but display the formatted name
      const formattedRps = result.data.content.map(rpsItem => ({
        ...rpsItem,
        // Keep original string ID as value
        idRps: rpsItem.idRps, 
        // Standardize the display name
        displayName: rpsItem.nameRps || `RPS ${rpsItem.idRps}`
      }));
      setRps(formattedRps || []);
    }
  } catch (error) {
    console.error("Error fetching RPS:", error);
    message.error("Gagal memuat data RPS");
  }
}, []);

  useEffect(() => {
    fetchQuiz();
    fetchAllQuestions();
    fetchRPS();
  }, [fetchQuiz, fetchAllQuestions, fetchRPS]);

  const handleEditQuiz = (row) => {
    setCurrentRowData({ ...row });
    setEditQuizModalVisible(true);
  };

  const handleDeleteQuiz = async (row) => {
    if (row.idQuiz === "admin") {
      message.error("Tidak bisa dihapus oleh Admin!");
      return;
    }

    try {
      await deleteQuiz({ idQuiz: row.idQuiz });
      message.success("Berhasil dihapus");
      fetchQuiz();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      message.error("Gagal menghapus kuis");
    }
  };

  const handleEditQuizOk = () => {
    const form = editQuizFormRef.current?.getForm();
    if (!form) {
      message.error("Form tidak ditemukan");
      return;
    }

    form.validateFields()
      .then(async (values) => {
        setEditQuizModalLoading(true);
        try {
          await editQuiz(values, values.idQuiz);
          form.resetFields();
          setEditQuizModalVisible(false);
          setEditQuizModalLoading(false);
          message.success("Berhasil diperbarui!");
          fetchQuiz();
        } catch (error) {
          console.error("Error editing quiz:", error);
          setEditQuizModalLoading(false);
          message.error("Gagal memperbarui kuis");
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleCancel = () => {
    setEditQuizModalVisible(false);
    setAddQuizModalVisible(false);
    setFilteredQuestions([]);
    addQuizFormRef.current?.resetForm();
  };

  const handleAddQuiz = () => {
    setAddQuizModalVisible(true);
    setFilteredQuestions([]);
    addQuizFormRef.current?.resetForm();
  };

  const handleAddQuizOk = () => {
    const form = addQuizFormRef.current?.getForm();
    if (!form) {
      message.error("Form tidak ditemukan");
      return;
    }

    form.validateFields()
      .then(async (values) => {
        setAddQuizModalLoading(true);
        try {
          await addQuiz(values);
          form.resetFields();
          setAddQuizModalVisible(false);
          setAddQuizModalLoading(false);
          message.success("Berhasil menambahkan kuis!");
          fetchQuiz();
          setFilteredQuestions([]);
          addQuizFormRef.current?.resetForm();
        } catch (error) {
          console.error("Error adding quiz:", error);
          setAddQuizModalLoading(false);
          message.error("Gagal menambahkan kuis, coba lagi!");
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const renderQuizType = (type) => {
    const typeMap = {
      'PRACTICE': 'Latihan',
      'EXAM': 'Ujian',
      'QUIZ': 'Kuis'
    };
    return typeMap[type] || type;
  };

  const renderDuration = (duration) => {
    if (!duration) return '-';
    return `${duration} menit`;
  };

  const title = (
    <Button type="primary" onClick={handleAddQuiz}>
      Tambahkan Kuis
    </Button>
  );

  const cardContent = "Di sini, Anda dapat mengelola Quiz sesuai dengan mata kuliah yang diampu. Anda dapat menambahkan kuis baru, mengedit kuis yang sudah ada, melihat hasil kuis, dan mengelola generate quiz.";

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Kuis" source={cardContent} />
      <br />
      <Card title={title}>
        <Table
          bordered
          rowKey="idQuiz"
          dataSource={quiz}
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 1200 }}
        >
          <Column
            title="Nama Kuis"
            dataIndex="name"
            key="name"
            align="center"
            ellipsis={true}
            width={150}
          />
          <Column
            title="RPS"
            dataIndex={["rps", "nameRps"]}
            key="rps.name"
            align="center"
            ellipsis={true}
            width={120}
          />
          <Column
            title="Nilai Minimal"
            dataIndex="min_grade"
            key="min_grade"
            align="center"
            width={120}
            render={(grade) => grade ? `${grade}%` : '-'}
          />
          <Column
            title="Tipe Kuis"
            dataIndex="type_quiz"
            key="type_quiz"
            align="center"
            width={100}
            render={renderQuizType}
          />
          <Column
            title="Tanggal Mulai"
            dataIndex="date_start"
            key="date_start"
            align="center"
            width={180}
            render={(text) => text ? moment(text).format("DD MMM YYYY, HH:mm") : '-'}
          />
          <Column
            title="Tanggal Selesai"
            dataIndex="date_end"
            key="date_end"
            align="center"
            width={180}
            render={(text) => text ? moment(text).format("DD MMM YYYY, HH:mm") : '-'}
          />
          <Column
            title="Durasi"
            dataIndex="duration"
            key="duration"
            align="center"
            width={100}
            render={renderDuration}
          />
          <Column
            title="Operasi"
            key="action"
            align="center"
            width={220}
            fixed="right"
            render={(_, row) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  title="Edit Kuis"
                  onClick={() => handleEditQuiz(row)}
                  size="small"
                />
                <Divider type="vertical" />
                <Link to={`/setting-quiz/result/${row.idQuiz}`}>
                  <Button
                    type="default"
                    shape="circle"
                    icon={<BarChartOutlined />}
                    title="Detail Hasil"
                    size="small"
                  />
                </Link>
                <Divider type="vertical" />
                <Link to={`/setting-quiz/generate-quiz/${row.idQuiz}`}>
                  <Button
                    type="default"
                    shape="circle"
                    icon={<SettingOutlined />}
                    title="Generate Quiz"
                    size="small"
                  />
                </Link>
                <Divider type="vertical" />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  title="Hapus Data"
                  onClick={() => handleDeleteQuiz(row)}
                  size="small"
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditQuizForm
        ref={editQuizFormRef}
        visible={editQuizModalVisible}
        confirmLoading={editQuizModalLoading}
        onCancel={handleCancel}
        onOk={handleEditQuizOk}
        questions={allQuestions}
        rpsAll={rps}
        currentRowData={currentRowData}
        updateQuestion={updateQuestion}
      />

      <AddQuizForm
        ref={addQuizFormRef}
        visible={addQuizModalVisible}
        confirmLoading={addQuizModalLoading}
        onCancel={handleCancel}
        onOk={handleAddQuizOk}
        questions={filteredQuestions}
        rps={rps}
        handleUpdateQuestion={updateQuestion}
      />
    </div>
  );
};

export default Quiz;