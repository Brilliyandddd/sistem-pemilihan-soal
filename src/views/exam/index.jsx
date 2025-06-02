import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { Link } from "react-router-dom";
import moment from "moment"; // Pastikan moment diimpor
import TypingCard from "@/components/TypingCard";
import EditExamForm from "./forms/edit-exam-form";
import AddExamForm from "./forms/add-exam-form";

// Impor fungsi API
import { getExam, deleteExam, editExam, addExam } from "@/api/exam";
import { getRpsList, getQuestion, getQuestionsByRPS } from "@/api/question"; // Menggunakan getRpsList dan getQuestion dari api/question
import { getRPSDetail } from "@/api/rpsDetail"; // Menggunakan getRPSDetail dari api/rpsDetail

import { EditOutlined, DeleteOutlined, DiffOutlined } from "@ant-design/icons";

const { Column } = Table;

const Exam = () => {
  const [exam, setExam] = useState([]);
  const [questions, setQuestions] = useState([]); // Pertanyaan yang tersedia
  const [rps, setRps] = useState([]); // Daftar RPS
  const [rpsDetail, setRpsDetail] = useState([]); // Detail RPS berdasarkan RPS yang dipilih
  const [editExamModalVisible, setEditExamModalVisible] = useState(false);
  const [editExamModalLoading, setEditExamModalLoading] = useState(false);
  const [addExamModalVisible, setAddExamModalVisible] = useState(false);
  const [addExamModalLoading, setAddExamModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [selectedRpsId, setSelectedRpsId] = useState(null); // State untuk RPS ID yang sedang dipilih

  useEffect(() => {
    fetchExam();
    fetchRpsData(); // Memanggil fungsi untuk mengambil daftar RPS
    // Saat komponen dimuat, kita tidak langsung mengambil pertanyaan atau detail RPS
    // karena itu tergantung pada pilihan user di form.
  }, []);

  const fetchExam = async () => {
    try {
      const result = await getExam();
      if (result.data.statusCode === 200) {
        setExam(result.data.content);
      } else {
        message.error("Gagal mengambil data ujian: " + result.data.message);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      message.error("Terjadi kesalahan saat mengambil data ujian.");
    }
  };

  const fetchRpsData = async () => { // Mengubah nama fungsi untuk kejelasan
    try {
      const result = await getRpsList(); // Menggunakan getRpsList dari api/question
      if (result.data.statusCode === 200) {
        setRps(result.data.content);
      } else {
        message.error("Gagal mengambil data RPS: " + result.data.message);
      }
    } catch (error) {
      console.error("Error fetching RPS data:", error);
      message.error("Terjadi kesalahan saat mengambil data RPS.");
    }
  };

  // Handler untuk saat RPS dipilih di form Add/Edit Exam
  const handleRPSSelectChange = async (rpsId) => {
  setSelectedRpsId(rpsId);
  await fetchRPSDetail(rpsId);
  await fetchQuestionsForExam(rpsId);
};

  // Handler untuk saat RPS Detail (UTS/UAS) dipilih di form Add/Edit Exam
  const handleRPSDetailSelectChange = (value) => {
    console.log("RPS Detail/Exam Type selected:", value);
    // Logika untuk memfilter pertanyaan berdasarkan tipe ujian (UTS/UAS)
    // Jika ada logika tambahan di sini, bisa ditambahkan
  };

  // Fungsi untuk mengambil detail RPS berdasarkan RPS ID
  const fetchRPSDetail = async (rpsId) => {
    if (!rpsId) {
      setRpsDetail([]);
      return;
    }
    try {
      const result = await getRPSDetail(rpsId); // Menggunakan getRPSDetail dari api/rpsDetail
      if (result.data.statusCode === 200 && Array.isArray(result.data.content)) {
        setRpsDetail(result.data.content);
      } else {
        console.warn("RPS Detail data format tidak sesuai atau kosong:", result.data);
        setRpsDetail([]);
      }
    } catch (error) {
      console.error("Error fetching RPS Detail:", error);
      message.error("Gagal mengambil detail RPS.");
      setRpsDetail([]);
    }
  };

  // Fungsi untuk mengambil pertanyaan berdasarkan RPS ID dan memfilter untuk tipe EXAM
  const fetchQuestionsForExam = async (rpsId) => {
    if (!rpsId) {
      setQuestions([]);
      return;
    }
    try {
      const result = await getQuestionsByRPS(rpsId); // Menggunakan getQuestionsByRPS dari api/question
      if (result.data.statusCode === 200 && Array.isArray(result.data.content)) {
        // Filter pertanyaan yang memiliki examType3 sebagai 'EXAM'
        const filteredQuestions = result.data.content.filter(q => q.examType3 === 'EXAM');
        setQuestions(filteredQuestions);
        console.log("Filtered Questions for Exam:", filteredQuestions);
      } else {
        console.warn("Questions data format tidak sesuai atau kosong:", result.data);
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions by RPS:", error);
      message.error("Gagal mengambil pertanyaan berdasarkan RPS.");
      setQuestions([]);
    }
  };

  const handleEditExam = async (row) => {
    setCurrentRowData(row);
    // Saat membuka modal edit, kita perlu memuat RPS Detail dan pertanyaan berdasarkan RPS dari data yang akan diedit
    setSelectedRpsId(row.idRps); // Set RPS ID dari data yang sedang diedit
    await fetchRPSDetail(row.idRps);
    await fetchQuestionsForExam(row.idRps);
    setEditExamModalVisible(true);
  };

  const handleDeleteExam = async (row) => {
    try {
      await deleteExam({ id: row.id });
      message.success("Berhasil dihapus");
      fetchExam();
    } catch (error) {
      console.error("Error deleting exam:", error);
      message.error("Gagal menghapus ujian.");
    }
  };

  const handleCancel = () => {
    setEditExamModalVisible(false);
    setAddExamModalVisible(false);
    // Reset states terkait RPS dan Questions saat modal ditutup
    setSelectedRpsId(null);
    setRpsDetail([]);
    setQuestions([]);
  };

  const handleAddExam = () => {
    setAddExamModalVisible(true);
    // Reset states saat membuka modal Add
    setSelectedRpsId(null);
    setRpsDetail([]);
    setQuestions([]);
  };

  const handleAddExamOk = async (values) => {
    // Pastikan `values.date_start` dan `values.date_end` adalah objek moment yang valid
    // Ant Design DatePicker mengembalikan objek moment, jadi .toISOString() sudah benar
    const submitValues = {
      ...values,
      date_start: values.date_start ? values.date_start.toISOString() : null,
      date_end: values.date_end ? values.date_end.toISOString() : null,
      // Pastikan rps_id dan questions ada dan sesuai format backend
    };
    setAddExamModalLoading(true);
    try {
      console.log("Submitting Add Exam values:", submitValues);
      await addExam(submitValues);
      message.success("Berhasil menambahkan");
      fetchExam();
      setAddExamModalVisible(false);
    } catch (error) {
      console.error("Error adding exam:", error);
      message.error("Gagal menambahkan");
    } finally {
      setAddExamModalLoading(false);
    }
  };

  const handleEditExamOk = async (values) => {
    const submitValues = {
      ...values,
      date_start: values.date_start ? moment(values.date_start).toISOString() : null,
      date_end: values.date_end ? moment(values.date_end).toISOString() : null,
    };
    setEditExamModalLoading(true);
    try {
      console.log("Submitting Edit Exam values:", submitValues);
      await editExam(submitValues, submitValues.id); // Pastikan `values.id` ada
      message.success("Berhasil mengedit");
      fetchExam();
      setEditExamModalVisible(false);
    } catch (error) {
      console.error("Error editing exam:", error);
      message.error("Gagal mengedit");
    } finally {
      setEditExamModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Ujian" source="Di sini, Anda dapat mengelola ujian." />
      ---
      <Card title={<Button type="primary" onClick={handleAddExam}>Tambahkan Ujian</Button>}>
        <Table bordered rowKey="id" dataSource={exam} pagination={false}>
          <Column title="Nama" dataIndex="name" align="center" />
          <Column
  title="RPS"
  align="center"
  render={(_, row) => {
    // Temporary fallback - use first RPS if none specified
    const rpsId = row.idRps || rps[0]?.idRps;
    const rpsItem = rps.find(r => r.idRps === rpsId);
    return rpsItem?.nameRps || "-";
  }}
/>
          <Column
            title="Pilihan Ujian"
            dataIndex="type_exercise"
            align="center"
            render={text => {
              if (text === "1-8") return "UTS";
              if (text === "1-18") return "UAS";
              return text; // Untuk nilai lain, tampilkan apa adanya
            }}
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
                <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEditExam(row)} />
                <Divider type="vertical" />
                <Link to={`/setting-exam/result/${row.id}`}>
                  <Button type="primary" shape="circle" icon={<DiffOutlined />} />
                </Link>
                <Divider type="vertical" />
                <Button type="danger" shape="circle" icon={<DeleteOutlined />} onClick={() => handleDeleteExam(row)} />
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
        rps={rps} // Daftar semua RPS
        rpsDetail={rpsDetail} // Detail RPS yang saat ini dipilih
        questions={questions} // Pertanyaan yang saat ini tersedia
        handleRPSChange={handleRPSSelectChange} // Handler untuk perubahan RPS
        handleRPSDetailChange={handleRPSDetailSelectChange} // Handler untuk perubahan RPS Detail (UTS/UAS)
        selectedRpsId={selectedRpsId} // Teruskan RPS ID yang dipilih
      />

      <EditExamForm
        visible={editExamModalVisible}
        confirmLoading={editExamModalLoading}
        onCancel={handleCancel}
        onOk={handleEditExamOk}
        rpsAll={rps} // Daftar semua RPS (mengikuti nama prop di EditExamForm)
        rpsDetail={rpsDetail} // Detail RPS yang saat ini dipilih
        questions={questions} // Pertanyaan yang saat ini tersedia
        data={currentRowData}
        handleRPSChange={handleRPSSelectChange} // Teruskan handler RPS
        handleRPSDetailChange={handleRPSDetailSelectChange} // Teruskan handler RPS Detail
        selectedRpsId={selectedRpsId} // Teruskan RPS ID yang dipilih
      />
    </div>
  );
};

export default Exam;