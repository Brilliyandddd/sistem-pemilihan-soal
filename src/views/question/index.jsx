import { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Checkbox } from "antd";
import { getQuestions, deleteQuestion, editQuestion, addQuestion } from "@/api/question";
import TypingCard from "@/components/TypingCard";
import EditQuestionForm from "./forms/edit-question-form";
import AddQuestionForm from "./forms/add-question-form";
import { useParams, Link } from "react-router-dom";

const { Column } = Table;

const Question = () => {
  const { rpsID, rpsDetailID } = useParams();
  const [questions, setQuestions] = useState([]);
  const [editQuestionModalVisible, setEditQuestionModalVisible] = useState(false);
  const [editQuestionModalLoading, setEditQuestionModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addQuestionModalVisible, setAddQuestionModalVisible] = useState(false);
  const [addQuestionModalLoading, setAddQuestionModalLoading] = useState(false);
  const [selectedExamTypes, setSelectedExamTypes] = useState({
    EXERCISE: false,
    QUIZ: false,
    EXAM: false,
  });

  const editQuestionFormRef = useRef(null);
  const addQuestionFormRef = useRef(null);

  useEffect(() => {
    fetchQuestions(rpsDetailID);
  }, [rpsDetailID]);

  const fetchQuestions = async (id) => {
    const result = await getQuestions(id);
    if (result.data.statusCode === 200) {
      setQuestions(result.data.content);
    }
  };

  const handleEditQuestion = (row) => {
    setCurrentRowData({ ...row });
    setEditQuestionModalVisible(true);
  };

  const handleDeleteQuestion = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak bisa menghapus oleh Admin！");
      return;
    }
    await deleteQuestion({ id: row.id });
    message.success("Berhasil dihapus");
    fetchQuestions(rpsDetailID);
  };

  const handleEditQuestionOk = async () => {
    const form = editQuestionFormRef.current?.form;
    if (!form) return;
    try {
      const values = await form.validateFields();
      setEditQuestionModalLoading(true);
      await editQuestion(values);
      form.resetFields();
      setEditQuestionModalVisible(false);
      message.success("Berhasil!");
      fetchQuestions(rpsDetailID);
    } catch (error) {
      message.error("Gagal");
    } finally {
      setEditQuestionModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditQuestionModalVisible(false);
    setAddQuestionModalVisible(false);
  };

  const handleAddQuestion = () => {
    setAddQuestionModalVisible(true);
  };

  const handleAddQuestionOk = async () => {
    const form = addQuestionFormRef.current?.form;
    if (!form) return;
    try {
      const values = await form.validateFields();
      setAddQuestionModalLoading(true);
      await addQuestion({ ...values, rps_detail_id: rpsDetailID });
      form.resetFields();
      setAddQuestionModalVisible(false);
      message.success("Berhasil!");
      fetchQuestions(rpsDetailID);
    } catch (error) {
      message.error("Gagal menambahkan");
    } finally {
      setAddQuestionModalLoading(false);
    }
  };

  const handleCheckboxChange = (checkedValues) => {
    setSelectedExamTypes({
      EXERCISE: checkedValues.includes('EXERCISE'),
      QUIZ: checkedValues.includes('QUIZ'),
      EXAM: checkedValues.includes('EXAM'),
    });
  };

  const getFilteredData = () => {
    if (!selectedExamTypes.EXERCISE && !selectedExamTypes.QUIZ && !selectedExamTypes.EXAM) {
      return questions;
    }
    return questions.filter(question =>
      (selectedExamTypes.EXERCISE && question.examType === 'EXERCISE') ||
      (selectedExamTypes.QUIZ && question.examType2 === 'QUIZ') ||
      (selectedExamTypes.EXAM && question.examType3 === 'EXAM')
    );
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Pertanyaan" source="Di sini, Anda dapat mengelola pertanyaan." />
      <Checkbox.Group options={["EXERCISE", "QUIZ", "EXAM"]} onChange={handleCheckboxChange} />
      <br />
      <Card title={<Button type="primary" onClick={handleAddQuestion}>Tambahkan Pertanyaan</Button>}>
        <Table bordered rowKey="id" dataSource={getFilteredData()} pagination={false}>
          <Column title="ID" key="id" align="center" render={(_, __, index) => index + 1} />
          <Column title="Pertanyaan" dataIndex="title" key="title" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column title="Tipe Jawaban" dataIndex="answerType" key="answerType" align="center" />
          <Column title="Tipe Soal" dataIndex="questionType" key="questionType" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" icon="edit" onClick={() => handleEditQuestion(row)} />
                <Divider type="vertical" />
                <Link to={`/rps/${rpsID}/${rpsDetailID}/${row.id}`}>
                  <Button type="primary" icon="diff" />
                </Link>
                <Divider type="vertical" />
                <Button type="primary" icon="delete" onClick={() => handleDeleteQuestion(row)} />
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
        ref={addQuestionFormRef}
        visible={addQuestionModalVisible}
        confirmLoading={addQuestionModalLoading}
        onCancel={handleCancel}
        onOk={handleAddQuestionOk}
      />
    </div>
  );
};

export default Question;