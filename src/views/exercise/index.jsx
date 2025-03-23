import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import TypingCard from "@/components/TypingCard";
import EditExerciseForm from "./forms/edit-exercise-form";
import AddExerciseForm from "./forms/add-exercise-form";
import {
  getExercise,
  deleteExercise,
  editExercise,
  addExercise,
  getQuestionsByRPS,
} from "@/api/exercise";
import { getQuestions } from "@/api/question";
import { getRPS } from "@/api/rps";
import { getRPSDetail } from "@/api/rpsDetail";

const { Column } = Table;

const Exercise = () => {
  const [exercise, setExercise] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [rps, setRps] = useState([]);
  const [editExerciseModalVisible, setEditExerciseModalVisible] = useState(false);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  
  const editExerciseFormRef = useRef(null);
  const addExerciseFormRef = useRef(null);

  useEffect(() => {
    fetchExercises();
    fetchQuestions();
    fetchRPS();
  }, []);

  const fetchExercises = async () => {
    const result = await getExercise();
    if (result.data.statusCode === 200) {
      setExercise(result.data.content);
    }
  };

  const fetchQuestions = async () => {
    const result = await getQuestions();
    if (result.data.statusCode === 200) {
      setQuestions(result.data.content);
    }
  };

  const fetchRPS = async () => {
    const result = await getRPS();
    if (result.data.statusCode === 200) {
      setRps(result.data.content);
    }
  };

  const handleDeleteExercise = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat dihapus oleh Admin!");
      return;
    }
    await deleteExercise({ id: row.id });
    message.success("Berhasil dihapus");
    fetchExercises();
  };

  const handleEditExerciseOk = async () => {
    const form = editExerciseFormRef.current.props.form;
    form.validateFields(async (err, values) => {
      if (!err) {
        await editExercise(values, values.id);
        message.success("Berhasil diedit!");
        setEditExerciseModalVisible(false);
        fetchExercises();
      }
    });
  };

  const handleAddExerciseOk = async () => {
    const form = addExerciseFormRef.current.props.form;
    form.validateFields(async (err, values) => {
      if (!err) {
        await addExercise(values);
        message.success("Berhasil ditambahkan!");
        setAddExerciseModalVisible(false);
        fetchExercises();
      }
    });
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Latihan" source="Di sini, Anda dapat mengelola Exercise." />
      <br />
      <Card title={<Button type="primary" onClick={() => setAddExerciseModalVisible(true)}>Tambahkan Latihan</Button>}>
        <Table bordered rowKey="id" dataSource={exercise} pagination={false}>
          <Column title="ID Exercise" dataIndex="id" align="center" />
          <Column title="RPS" dataIndex="rps.name" align="center" />
          <Column title="Nilai Minimal" dataIndex="min_grade" align="center" />
          <Column title="Pilihan Ujian" dataIndex="type_exercise" align="center" />
          <Column title="Tanggal Mulai" dataIndex="date_start" align="center" render={(text) => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Tanggal Selesai" dataIndex="date_end" align="center" render={(text) => moment(text).format("DD MMMM YYYY, HH:mm:ss")} />
          <Column title="Durasi" dataIndex="duration" align="center" />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit Latihan" onClick={() => { setCurrentRowData(row); setEditExerciseModalVisible(true); }} />
                <Divider type="vertical" />
                <Link to={`/setting-exercise/result/${row.id}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Detail Hasil" />
                </Link>
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus Data" onClick={() => handleDeleteExercise(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditExerciseForm
        currentRowData={currentRowData}
        wrappedComponentRef={editExerciseFormRef}
        visible={editExerciseModalVisible}
        onCancel={() => setEditExerciseModalVisible(false)}
        onOk={handleEditExerciseOk}
        questions={questions}
        rpsAll={rps}
      />
      <AddExerciseForm
        wrappedComponentRef={addExerciseFormRef}
        visible={addExerciseModalVisible}
        onCancel={() => setAddExerciseModalVisible(false)}
        onOk={handleAddExerciseOk}
        questions={questions}
        rps={rps}
      />
    </div>
  );
};

export default Exercise;
