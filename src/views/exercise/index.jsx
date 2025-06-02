import React, { useState, useEffect, useRef } from "react"; // Hapus setLoading dari sini
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
import { getQuestion } from "@/api/question"; // Ini adalah fungsi yang seharusnya Anda gunakan
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedRpsId, setSelectedRpsId] = useState(null);

  useEffect(() => {
    fetchExercises();
    fetchQuestions(); // Panggil fetchQuestions saat komponen di-mount
    fetchRPS();
  }, []);

  const fetchExercises = async () => {
    try {
      const result = await getExercise();
      if (result.data.statusCode === 200) {
        setExercise(result.data.content);
      } else {
        message.error("Gagal mengambil data latihan: " + result.data.message);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      message.error("Terjadi kesalahan saat mengambil data latihan.");
    }
  };

  const fetchQuestions = async () => {
    try {
      setConfirmLoading(true); // Gunakan state loading yang benar
      const result = await getQuestion(); // Gunakan fungsi getQuestion dari API Anda
      console.log('Questions API result:', result); // Debug log
      if (result.data.statusCode === 200) {
        // Asumsikan data pertanyaan ada di result.data.content atau result.data.data
        const fetchedQuestions = result.data.content || result.data.data;
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
        } else {
          console.error('Questions data format tidak sesuai:', fetchedQuestions);
          setQuestions([]);
        }
      } else {
        message.error("Gagal mengambil data pertanyaan: " + result.data.message);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error("Terjadi kesalahan saat mengambil data pertanyaan.");
      setQuestions([]);
    } finally {
      setConfirmLoading(false);
    }
  };

  const fetchRPS = async () => {
    try {
      const result = await getRPS();
      if (result.data.statusCode === 200) {
        setRps(result.data.content);
      } else {
        message.error("Gagal mengambil data RPS: " + result.data.message);
      }
    } catch (error) {
      console.error("Error fetching RPS:", error);
      message.error("Terjadi kesalahan saat mengambil data RPS.");
    }
  };

  const handleDeleteExercise = async (row) => {
    if (row.idExercise === "admin") {
      message.error("Tidak dapat dihapus oleh Admin!");
      return;
    }
    try {
      await deleteExercise({ idExercise: row.idExercise });
      message.success("Berhasil dihapus");
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      message.error("Gagal menghapus latihan.");
    }
  };

  const handleEditExerciseOk = async (values) => {
    // Fungsi ini dipanggil dari EditExerciseForm setelah form berhasil divalidasi dan disubmit
    try {
      setConfirmLoading(true);
      // Asumsikan `values` sudah mencakup `idExercise` dari latihan yang diedit
      await editExercise(values, values.idExercise);
      message.success("Berhasil diedit!");
      setEditExerciseModalVisible(false); // Tutup modal
      fetchExercises(); // Refresh data latihan
    } catch (error) {
      console.error("Error editing exercise:", error);
      message.error("Gagal mengedit latihan.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAddExerciseOk = async (values) => {
    // Dengan Form.useForm() di AddExerciseForm, onOk akan dipanggil dengan nilai form yang valid.
    try {
      setConfirmLoading(true);
      await addExercise(values);
      message.success("Berhasil ditambahkan!");
      setAddExerciseModalVisible(false);
      fetchExercises();
    } catch (error) {
      console.error("Error adding exercise:", error);
      message.error("Gagal menambahkan latihan.");
    } finally {
      setConfirmLoading(false);
    }
  };

  // --- Implementasi handleRPSChange ---
  const handleRPSChange = (value) => {
    console.log("RPS changed to:", value);
    setSelectedRpsId(value); // Simpan ID RPS yang dipilih
    fetchQuestions(value); // Panggil fetchQuestions dengan ID RPS yang dipilih
  };

  const handleExerciseTypeChange = (value) => {
    console.log("Exercise type changed to:", value);
    // Jika ada logika tambahan yang tergantung pada tipe latihan, bisa ditambahkan di sini
  };

 const cardContent = "Di sini, Anda dapat mengelola Exercise.";
  return (
    <div className="app-container">
      <TypingCard title="Manajemen Latihan" source={cardContent} />
      <br />
      <Card title={<Button type="primary" onClick={() => setAddExerciseModalVisible(true)}>Tambahkan Latihan</Button>}>
        <Table bordered rowKey="idExercise" dataSource={exercise} pagination={false}>
          <Column title="ID Exercise" dataIndex="idExercise" align="center" />
          <Column title="RPS" dataIndex={["rps", "nameRps"]} align="center" /> {/* Sesuaikan dengan properti RPS */}
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
                <Link to={`/setting-exercise/result/${row.idExercise}`}>
                  <Button type="primary" shape="circle" icon="diff" title="Detail Hasil" />
                </Link>
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus Data" onClick={() => handleDeleteExercise(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      {/* EditExerciseForm memerlukan prop 'onOk' untuk menerima nilai form */}
      <EditExerciseForm
        currentRowData={currentRowData}
        visible={editExerciseModalVisible}
        onCancel={() => setEditExerciseModalVisible(false)}
        onOk={handleEditExerciseOk} // onOk akan menerima nilai form dari EditExerciseForm
        questions={questions}
        rpsAll={rps}
        confirmLoading={confirmLoading}
      />
      {/* AddExerciseForm */}
      <AddExerciseForm
        visible={addExerciseModalVisible}
        onCancel={() => setAddExerciseModalVisible(false)}
        onOk={handleAddExerciseOk} // onOk akan menerima nilai form dari AddExerciseForm
        questions={questions}
        rps={rps}
        handleRPSChange={handleRPSChange}
        handleExerciseTypeChange={handleExerciseTypeChange}
        confirmLoading={confirmLoading}
      />
    </div>
  );
};

export default Exercise;
