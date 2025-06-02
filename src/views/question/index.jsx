import { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Checkbox, Form } from "antd";
import { getQuestion, deleteQuestion, editQuestion, addQuestion, getRpsList, getRpsDetails } from "@/api/question";
import TypingCard from "@/components/TypingCard";
import EditQuestionForm from "./forms/edit-question-form";
import AddQuestionForm from "./forms/add-question-form";
import { useParams, Link } from "react-router-dom";
import { DeleteOutlined, EditOutlined, DiffOutlined } from "@ant-design/icons";

const { Column } = Table;

const Question = () => {
  const { rpsID, rpsDetailID } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rpsList, setRpsList] = useState([]);
  const [rpsDetails, setRpsDetails] = useState([]);
  const [loadingRpsDetails, setLoadingRpsDetails] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editQuestionModalVisible, setEditQuestionModalVisible] = useState(false);
  const [editQuestionModalLoading, setEditQuestionModalLoading] = useState(false);
  const [addQuestionModalVisible, setAddQuestionModalVisible] = useState(false);
  const [addQuestionModalLoading, setAddQuestionModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [selectedExamTypes, setSelectedExamTypes] = useState({
    EXERCISE: false,
    QUIZ: false,
    EXAM: false,
  });

  const [addForm] = Form.useForm();
  const editQuestionFormRef = useRef(null);

  useEffect(() => {
      fetchQuestions();
      fetchRpsList();
  }, []);

  // Helper function untuk generate dummy RPS details
  const generateDummyRpsDetails = (rpsId) => {
    const rpsDetailsMap = {
      1: [
        { id: 1, name: "Pengenalan HTML/CSS", title: "Pengenalan HTML/CSS", description: "Dasar-dasar web development" },
        { id: 2, name: "JavaScript Fundamentals", title: "JavaScript Fundamentals", description: "Pemrograman JavaScript" },
      ],
      2: [
        { id: 3, name: "Database Design", title: "Database Design", description: "Perancangan basis data" },
        { id: 4, name: "SQL Queries", title: "SQL Queries", description: "Query dan manipulasi data" },
      ],
      3: [
        { id: 5, name: "Array dan Linked List", title: "Array dan Linked List", description: "Struktur data dasar" },
        { id: 6, name: "Sorting Algorithms", title: "Sorting Algorithms", description: "Algoritma pengurutan" },
      ],
      4: [
        { id: 7, name: "Network Protocols", title: "Network Protocols", description: "Protokol jaringan" },
        { id: 8, name: "TCP/IP", title: "TCP/IP", description: "Transmission Control Protocol" },
      ],
      5: [
        { id: 9, name: "Process Management", title: "Process Management", description: "Manajemen proses" },
        { id: 10, name: "Memory Management", title: "Memory Management", description: "Manajemen memori" },
      ]
    };
    return rpsDetailsMap[rpsId] || [];
  };

  const fetchRpsList = async () => {
    try {
      const result = await getRpsList();
      console.log("RPS API Response:", result.data);
      
      if (result.data && result.data.statusCode === 200) {
        setRpsList(result.data.content || result.data.data || []);
      } else {
        // Fallback ke data dummy jika API belum ready
        console.warn("API RPS belum tersedia, menggunakan data dummy");
        const dummyRpsList = [
          { idRps: 1, nameRps: "RPS Pemrograman Web" },
          { idRps: 2, nameRps: "RPS Basis Data" },
          { idRps: 3, nameRps: "RPS Algoritma dan Struktur Data" },
          { idRps: 4, nameRps: "RPS Jaringan Komputer" },
          { idRps: 5, nameRps: "RPS Sistem Operasi" }
        ];
        setRpsList(dummyRpsList);
        message.warning("Menggunakan data RPS sementara");
      }
    } catch (error) {
      console.error("Error fetching RPS:", error);
      
      // Fallback ke data dummy
      const dummyRpsList = [
        { idRps: 1, nameRps: "RPS Pemrograman Web" },
        { idRps: 2, nameRps: "RPS Basis Data" },
        { idRps: 3, nameRps: "RPS Algoritma dan Struktur Data" },
        { idRps: 4, nameRps: "RPS Jaringan Komputer" },
        { idRps: 5, nameRps: "RPS Sistem Operasi" }
      ];
      
      setRpsList(dummyRpsList);
      message.warning("Gagal memuat data RPS dari server, menggunakan data sementara");
    }
  };

  const fetchRpsDetails = async (rpsId) => {
    if (!rpsId) {
      setRpsDetails([]);
      return;
    }

    setLoadingRpsDetails(true);
    try {
      const result = await getRpsDetails(rpsId);
      
      if (result.data && result.data.statusCode === 200) {
        const details = result.data.content || result.data.data || [];
        setRpsDetails(details);
      } else {
        throw new Error("Failed to fetch RPS details");
      }
    } catch (error) {
      console.warn("RPS Details API not available, using dummy data for RPS ID:", rpsId);
      
      // Fallback: Data dummy berdasarkan RPS ID
      const dummyRpsDetails = generateDummyRpsDetails(rpsId);
      setRpsDetails(dummyRpsDetails);
      
      message.warning("Menggunakan data RPS Detail sementara");
    } finally {
      setLoadingRpsDetails(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const result = await getQuestion();
      if (result.data && result.data.statusCode === 200) {
        setQuestions(result.data.content || result.data.data || []);
      } else {
        message.error("Gagal memuat pertanyaan");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("Terjadi kesalahan saat memuat data");
      setQuestions([]);
    }
  };

  const handleAddQuestion = () => {
    setAddQuestionModalVisible(true);
  };

  const handleAddQuestionOk = async (formData) => {
    console.log('Adding question with FormData:', formData);
    
    setConfirmLoading(true);
    try {
      // FormData is now passed directly to the API
      const result = await addQuestion(formData);
      
      console.log('Question created successfully:', result);
      message.success('Pertanyaan berhasil ditambahkan!');
      
      setIsModalVisible(false);
      // Refresh your question list here if needed
      await fetchQuestions();
      
    } catch (error) {
      console.error('Error adding question:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Gagal menambahkan pertanyaan';
      
      message.error(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleEditQuestion = (row) => {
    setCurrentRowData({ ...row });
    setEditQuestionModalVisible(true);
  };

  const handleEditQuestionOk = async () => {
    const form = editQuestionFormRef.current?.form;
    if (!form) return;
    
    try {
      const values = await form.validateFields();
      setEditQuestionModalLoading(true);
      await editQuestion({ ...values, idQuestion: currentRowData.idQuestion }, currentRowData.idQuestion);
      form.resetFields();
      setEditQuestionModalVisible(false);
      message.success("Pertanyaan berhasil diedit!");
      fetchQuestions(rpsDetailID);
    } catch (error) {
      console.error("Error editing question:", error);
      message.error("Gagal mengedit pertanyaan");
    } finally {
      setEditQuestionModalLoading(false);
    }
  };

  const handleDeleteQuestion = async (row) => {
    if (row.idQuestion === "admin") {
      message.error("Tidak bisa menghapus oleh Admin！");
      return;
    }
    
    try {
      await deleteQuestion({ idQuestion: row.idQuestion });
      message.success("Pertanyaan berhasil dihapus");
      fetchQuestions(rpsDetailID);
    } catch (error) {
      console.error("Error deleting question:", error);
      message.error("Gagal menghapus pertanyaan");
    }
  };

  const handleCancel = () => {
    setEditQuestionModalVisible(false);
    setAddQuestionModalVisible(false);
  };

  const handleCheckboxChange = (checkedValues) => {
    setSelectedExamTypes({
      EXERCISE: checkedValues.includes("EXERCISE"),
      QUIZ: checkedValues.includes("QUIZ"),
      EXAM: checkedValues.includes("EXAM"),
    });
  };

  const getFilteredData = () => {
    if (!selectedExamTypes.EXERCISE && !selectedExamTypes.QUIZ && !selectedExamTypes.EXAM) {
      return questions;
    }

    return questions.filter((question) => {
      const examType = question.examType || question.questionType;
      return (
        (selectedExamTypes.EXERCISE && examType === "EXERCISE") ||
        (selectedExamTypes.QUIZ && examType === "QUIZ") ||
        (selectedExamTypes.EXAM && examType === "EXAM")
      );
    });
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Pertanyaan"
        source="Di sini, Anda dapat mengelola pertanyaan."
      />

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Filter berdasarkan tipe:</span>
        <Checkbox.Group
          options={["EXERCISE", "QUIZ", "EXAM"]}
          onChange={handleCheckboxChange}
        />
      </div>

      <Card
        title={
          <Button type="primary" onClick={handleAddQuestion}>
            Tambahkan Pertanyaan
          </Button>
        }
      >
        <Table 
          bordered 
          rowKey="idQuestion" 
          dataSource={getFilteredData()} 
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} dari ${total} pertanyaan`,
          }}
        >
          <Column 
            title="No" 
            key="index" 
            align="center" 
            width={60}
            render={(_, __, index) => index + 1} 
          />
          <Column
            title="ID"
            dataIndex="idQuestion"
            align="center"
          />
          <Column 
            title="Pertanyaan" 
            dataIndex="title" 
            key="title" 
            align="left"
            ellipsis={{ showTitle: false }}
            render={(text) => (
              <span title={text}>
                {text || '-'}
              </span>
            )}
          />
          <Column 
            title="Deskripsi" 
            dataIndex="description" 
            key="description" 
            align="left"
            ellipsis={{ showTitle: false }}
            render={(text) => (
              <span title={text}>
                {text || '-'}
              </span>
            )}
          />
          <Column 
            title="Tipe Jawaban" 
            dataIndex="answerType" 
            key="answerType" 
            align="center"
            width={120}
            render={(text) => text || '-'}
          />
          <Column 
            title="Tipe Soal" 
            dataIndex="questionType" 
            key="questionType" 
            align="center"
            width={120}
            render={(text) => text || '-'}
          />
          <Column
            title="Operasi"
            key="action"
            align="center"
            width={150}
            fixed="right"
            render={(text, row) => (
              <span>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditQuestion(row)}
                  size="small"
                  title="Edit"
                />
                <Divider type="vertical" />
<Link to={`/question/${row.idQuestion}`}>
  <Button 
    type="primary" 
    icon={<DiffOutlined />} 
    size="small"
    title="Answer"
  />
</Link>
                <Divider type="vertical" />
                <Button 
                  danger 
                  type="primary" 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteQuestion(row)}
                  size="small"
                  title="Hapus"
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditQuestionForm
        ref={editQuestionFormRef}
        currentRowData={currentRowData}
        visible={editQuestionModalVisible}
        confirmLoading={editQuestionModalLoading}
        onCancel={handleCancel}
        onOk={handleEditQuestionOk}
      />

      <AddQuestionForm
        visible={addQuestionModalVisible}
        confirmLoading={addQuestionModalLoading}
        onCancel={handleCancel}
        onOk={handleAddQuestionOk}
        rps={rpsList} 
      />
    </div>
  );
};

export default Question;