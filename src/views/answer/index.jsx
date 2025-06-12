/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider, Typography, Image } from "antd"; // Import Image
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAnswers, deleteAnswer, editAnswer, addAnswer } from "@/api/answer";
import { getQuestionByIdPaged } from "@/api/question";
import TypingCard from "@/components/TypingCard";
import EditAnswerForm from "./forms/edit-answer-form";
import AddAnswerForm from "./forms/add-answer-form";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Column } = Table;
const { Title } = Typography;

const Answer = () => {
  const { questionID } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    answers: [],
    question: {},
    currentRowData: {},
    loading: false,
  });

  const [modal, setModal] = useState({
    editVisible: false,
    editLoading: false,
    addVisible: false,
    addLoading: false,
  });

  const fetchData = async () => {
    if (!questionID) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const [answersRes, questionRes] = await Promise.all([
        getAnswers(questionID),
        getQuestionByIdPaged(questionID),
      ]);

      console.log("Answers Response:", answersRes);
      console.log("Question Response:", questionRes);

      // Pastikan content atau data ada sebelum mengaksesnya
      const fetchedAnswers = answersRes?.data?.content || answersRes?.data?.data || [];
      const fetchedQuestion = questionRes?.data?.content || questionRes?.data?.data || {};

      // Jika getQuestionByIdPaged mengembalikan array, ambil elemen pertama
      const questionData = Array.isArray(fetchedQuestion) ? fetchedQuestion[0] : fetchedQuestion;


      setState({
        answers: fetchedAnswers,
        question: questionData, // Pastikan ini adalah objek tunggal
        currentRowData: {},
        loading: false,
      });
    } catch (error) {
      message.error("Failed to fetch data");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [questionID]);

  const handleEdit = (row) => {
    setState(prev => ({ ...prev, currentRowData: row }));
    setModal(prev => ({ ...prev, editVisible: true }));
  };

  const handleDelete = async (row) => {
    try {
      await deleteAnswer({ idAnswer: row.idAnswer });
      message.success("Deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  const handleEditSubmit = async (values) => {
    setModal(prev => ({ ...prev, editLoading: true }));

    try {
      await editAnswer(values, state.currentRowData.idAnswer);
      message.success("Updated successfully");
      setModal(prev => ({ ...prev, editVisible: false, editLoading: false }));
      fetchData();
    } catch (error) {
      message.error("Update failed");
      setModal(prev => ({ ...prev, editLoading: false }));
    }
  };

  const handleAddSubmit = async (values) => {
    setModal(prev => ({ ...prev, addLoading: true }));

    try {
      const { file, ...otherValues } = values;
      const formData = new FormData();

      // Add all form values to FormData
      Object.entries(otherValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add file if exists
      if (file && file.length > 0) {
        formData.append("file", file[0].originFileObj);
      }

      // Add question ID
      formData.append("idQuestion", questionID);
      console.log("Current questionID:", questionID);

      await addAnswer(formData);
      message.success("Added successfully");
      setModal(prev => ({ ...prev, addVisible: false, addLoading: false }));
      fetchData();
    } catch (error) {
      message.error("Failed to add");
      setModal(prev => ({ ...prev, addLoading: false }));
    }
  };

  // Render answer type with better formatting
  const renderAnswerType = (type) => {
    const typeMap = {
      'IMAGE': 'Gambar',
      'AUDIO': 'Audio',
      'VIDEO': 'Video',
      'NORMAL': 'Normal'
    };
    return typeMap[type] || type;
  };

  // Render correct/incorrect answer status
  const renderCorrectStatus = (isRight) => {
    return isRight ? (
      <span style={{ color: '#52c41a' }}>✓ Benar</span>
    ) : (
      <span style={{ color: '#ff4d4f' }}>✗ Salah</span>
    );
  };

  // --- START: Tambahan untuk Gambar Pertanyaan ---
  // Fungsi untuk mendapatkan URL gambar dari path pertanyaan
  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    // Asumsi filePath adalah format "/images/questions/nama_gambar.png"
    // Pastikan http://localhost:8081 sesuai dengan alamat backend Anda
    return `http://localhost:8081${filePath}`;
  };
  // --- END: Tambahan untuk Gambar Pertanyaan ---

  const cardContent = "Di sini, Anda dapat mengelola jawaban di sistem, seperti menambahkan jawaban baru, atau mengubah jawaban yang sudah ada di sistem.";

  return (
    <div className="app-container">
      <TypingCard title="Answer Management" source={cardContent} />
      <br />

      {/* Card untuk menampilkan informasi pertanyaan */}
      {state.question.title && (
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            Pertanyaan: {state.question.title}
          </Title>
          {/* Tampilkan gambar pertanyaan jika ada */}
          {state.question.file_path && (
            <div style={{ marginBottom: 16, textAlign: 'left' }}> {/* Center the image */}
              <Image
                src={getImageUrl(state.question.file_path)}
                alt="Question Image"
                style={{ maxWidth: '250px', maxHeight: '250px', objectFit: 'contain' }} // Sesuaikan ukuran gambar
                fallback="https://via.placeholder.com/250?text=Question+Image" // Gambar fallback jika gagal dimuat
              />
            </div>
          )}
        </Card>
      )}
      <br />

      <Card
        title={
          <Button
            type="primary"
            onClick={() => setModal(prev => ({ ...prev, addVisible: true }))}
          >
            Add Answer
          </Button>
        }
      >
        <Table
          bordered
          rowKey="idAnswer"
          dataSource={state.answers}
          loading={state.loading}
          pagination={false}
        >
          <Column
            title="ID Jawaban"
            dataIndex="idAnswer"
            align="center"
            width={120}
          />
          <Column
            title="Jawaban"
            dataIndex="title"
            align="left"
          />
          <Column
            title="Deskripsi Jawaban"
            dataIndex="description"
            align="left"
            ellipsis={true}
          />
          <Column
            title="Status"
            dataIndex="is_right"
            align="center"
            width={100}
            render={renderCorrectStatus}
          />
          <Column
            title="Tipe Soal"
            dataIndex="type"
            align="center"
            width={120}
            render={renderAnswerType}
          />
          <Column
            title="Actions"
            align="center"
            width={120}
            render={(_, record) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Divider type="vertical" />
                <Button
                  type="danger"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditAnswerForm
        visible={modal.editVisible}
        loading={modal.editLoading}
        onCancel={() => setModal(prev => ({ ...prev, editVisible: false }))}
        onOk={handleEditSubmit}
        initialValues={state.currentRowData}
      />

      <AddAnswerForm
        visible={modal.addVisible}
        loading={modal.addLoading}
        onCancel={() => setModal(prev => ({ ...prev, addVisible: false }))}
        onOk={handleAddSubmit}
      />
    </div>
  );
};

export default Answer;