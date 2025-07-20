// src/pages/Question/index.jsx

/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Checkbox, Form, Image, Spin, Modal } from "antd"; // Tambahkan Spin, Modal
import { getQuestions, deleteQuestion, editQuestion, addQuestion, getRpsList, getRpsDetails, getQuestion, getQuestionsByRpsDetailId } from "@/api/question";
import TypingCard from "@/components/TypingCard";
import EditQuestionForm from "./forms/edit-question-form";
import AddQuestionForm from "./forms/add-question-form";
import { useParams, Link } from "react-router-dom";
import { DeleteOutlined, EditOutlined, DiffOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons"; // Tambahkan UploadOutlined, PlusOutlined

const { Column } = Table;
const { confirm } = Modal;

const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length <= 1) {
        console.warn("parseCSV: Kurang dari 2 baris ditemukan (hanya header atau kosong).");
        return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`parseCSV: Baris CSV malformed dilewati: "${lines[i]}". Diharapkan ${headers.length} nilai, didapat ${values.length}.`);
            continue;
        }
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return data;
};

const Question = () => {
  const { rpsID, rpsDetailID } = useParams();

  const [rpsList, setRpsList] = useState([]);
  const [rpsDetails, setRpsDetails] = useState([]);
  const [loadingRpsDetails, setLoadingRpsDetails] = useState(false);
  const [questions, setQuestions] = useState([]);

  const [editQuestionModalVisible, setEditQuestionModalVisible] = useState(false);
  const [editQuestionModalLoading, setLoadingEditModal] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  const [addQuestionModalVisible, setAddQuestionModalVisible] = useState(false);
  const [addQuestionModalLoading, setLoadingAddModal] = useState(false);

  const [importCsvLoading, setImportCsvLoading] = useState(false);

  const [selectedExamTypes, setSelectedExamTypes] = useState({
    EXERCISE: false,
    QUIZ: false,
    EXAM: false,
  });

  const editQuestionFormRef = useRef(null);

  useEffect(() => {
    fetchRpsList();
  }, []);

  useEffect(() => {
    if (rpsDetailID) {
      console.log(`URL has rpsDetailID: ${rpsDetailID}. Fetching questions for this detail.`);
      fetchQuestions(rpsDetailID);

      if (rpsID) {
        fetchRpsDetails(rpsID);
      } else if (currentRowData?.rps?.idRps) {
        fetchRpsDetails(currentRowData.rps.idRps);
      }
    } else {
      console.log("No specific rpsDetailID in URL. Fetching all questions or showing empty.");
      fetchQuestions();
      setRpsDetails([]);
    }
  }, [rpsID, rpsDetailID, currentRowData?.rps?.idRps]);

  const generateDummyRpsDetails = (rpsId) => {
    const rpsDetailsMap = {
      "RPS001": [
        { id: "RPS001-D001", week: 1, weekLabel: "Minggu 1", name: "Intro Web Dev", title: "Intro Web Dev", rps: { idRps: "RPS001" } },
        { id: "RPS001-D002", week: 2, weekLabel: "Minggu 2", name: "JS Basics", title: "JS Basics", rps: { idRps: "RPS001" } },
      ],
      "RPS002": [
        { id: "RPS002-D001", week: 1, weekLabel: "Minggu 1", name: "Advanced React", title: "Advanced React", rps: { idRps: "RPS002" } },
        { id: "RPS002-D002", week: 2, weekLabel: "Minggu 2", name: "State Management", title: "State Management", rps: { idRps: "RPS002" } },
      ],
    };
    return rpsDetailsMap[String(rpsId)] || [];
  };

  const fetchRpsList = async () => {
    try {
      const result = await getRpsList();
      if (result.data && result.data.statusCode === 200) {
        setRpsList(result.data.content || result.data.data || []);
      } else {
        console.warn("API RPS belum tersedia, menggunakan data dummy");
        const dummyRpsList = [
          { idRps: "RPS001", nameRps: "RPS Pemrograman Web" },
          { idRps: "RPS002", nameRps: "RPS Basis Data" },
        ];
        setRpsList(dummyRpsList);
        message.warning("Menggunakan data RPS sementara");
      }
    } catch (error) {
      console.error("Error fetching RPS:", error);
      const dummyRpsList = [ /* ... dummy data ... */ ];
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
        // --- Perbaikan: Pastikan ID RPS Detail diubah menjadi string murni ---
        const sanitizedDetails = details.map(d => ({
            ...d,
            id: String(d.id), // Pastikan ID adalah string
            week: d.week, // Biarkan week apa adanya
            weekLabel: d.weekLabel ? String(d.weekLabel) : null // Pastikan weekLabel juga string
        }));
        setRpsDetails(sanitizedDetails);
        console.log("Fetched RPS Details (sanitized):", sanitizedDetails);
      } else {
        throw new Error("Failed to fetch RPS details");
      }
    } catch (error) {
      console.warn("RPS Details API not available, using dummy data for RPS ID:", rpsId);
      const dummyRpsDetails = generateDummyRpsDetails(rpsId);
      const sanitizedDummyDetails = dummyRpsDetails.map(d => ({
        ...d,
        id: String(d.id),
        week: d.week,
        weekLabel: d.weekLabel ? String(d.weekLabel) : null
      }));
      setRpsDetails(sanitizedDummyDetails);
      message.warning("Menggunakan data RPS Detail sementara");
    } finally {
      setLoadingRpsDetails(false);
    }
  };


  const fetchQuestions = async (filterRpsDetailId = null) => {
    try {
      let result;
      if (filterRpsDetailId) {
        console.log('Memanggil getQuestionsByRpsDetailId dengan:', filterRpsDetailId);
        result = await getQuestionsByRpsDetailId(filterRpsDetailId);
      } else {
        console.log('Memanggil getQuestion untuk mengambil semua pertanyaan');
        result = await getQuestion();
      }

      if (result.data && result.data.statusCode === 200) {
        const rawQuestions = result.data.content || result.data.data || [];
        console.log("Raw questions from API (after backend filter, if any):", rawQuestions);

        const processedQuestions = rawQuestions.map(q => {
          console.log(`Question ID: ${q.idQuestion || q.id}, Answer Type: ${q.answer_type}, Question Type: ${q.question_type}`);
          let questionRpsDetailId = null;
          if (q.rps_detail) {
            if (typeof q.rps_detail === 'string') {
              questionRpsDetailId = q.rps_detail;
            } else if (typeof q.rps_detail === 'object' && q.rps_detail.id) {
              questionRpsDetailId = q.rps_detail.id;
            }
          }
          console.log(`Processing question ${q.idQuestion || q.id}: Original rps_detail=${JSON.stringify(q.rps_detail)}, Extracted rps_detail=${questionRpsDetailId}`);

          return {
            ...q,
            idQuestion: q.idQuestion || q.id,
            rps_detail: q.rps_detail,
          };
        });

        setQuestions(processedQuestions);
        console.log("Final questions set after processing (assuming backend filtered):", processedQuestions);

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
    if (!rpsID) {
      message.error("Anda harus memilih RPS terlebih dahulu untuk menambahkan pertanyaan.");
      return;
    }
    if (loadingRpsDetails) {
        message.info("Memuat detail RPS, harap tunggu...");
        return;
    }
    if (rpsDetails.length === 0) {
        message.warning("Tidak ada detail RPS yang tersedia untuk RPS ini. Harap tambahkan detail RPS terlebih dahulu.");
        return;
    }

    setAddQuestionModalVisible(true);
  };

  const handleAddQuestionOk = async (formData) => {
    console.log('Adding question with FormData:', formData);
    setLoadingAddModal(true);
    try {
      const result = await addQuestion(formData);
      console.log('Question created successfully:', result);
      message.success('Pertanyaan berhasil ditambahkan!');
      setAddQuestionModalVisible(false);
      fetchQuestions(rpsDetailID);
    } catch (error) {
      console.error('Error adding question:', error);
      const errorMessage = error.response?.data?.message ||
                                   error.message ||
                                   'Gagal menambahkan pertanyaan';
      message.error(errorMessage);
    } finally {
      setLoadingAddModal(false);
    }
  };

  const handleEditQuestion = (row) => {
    console.log("handleEditQuestion called with row:", row);
    setCurrentRowData({ ...row });
    console.log("currentRowData after setting:", { ...row });
    setEditQuestionModalVisible(true);
  };

  const handleEditQuestionOk = async () => {
    const formInstance = editQuestionFormRef.current?.form;
    if (!formInstance) {
      console.error("Edit form instance is null. Is EditQuestionForm wrapped with forwardRef and ref prop passed correctly?");
      message.error("Terjadi masalah dengan form edit. Harap hubungi administrator.");
      return;
    }

    try {
      const valuesFromForm = await formInstance.validateFields();
      setLoadingEditModal(true);

      let examTypeToSet = null;
      let examType2ToSet = null;
      let examType3ToSet = null;

      if (valuesFromForm.examType && valuesFromForm.examType.includes("EXERCISE")) {
          examTypeToSet = "EXERCISE";
      }
      if (valuesFromForm.examType2 && valuesFromForm.examType2.includes("QUIZ")) {
          examType2ToSet = "QUIZ";
      }
      if (valuesFromForm.examType3 && valuesFromForm.examType3.includes("EXAM")) {
          examType3ToSet = "EXAM";
      }

      let finalRpsDetailIdString = null;
      if (typeof valuesFromForm.rps_detail === 'string' && valuesFromForm.rps_detail) {
        finalRpsDetailIdString = valuesFromForm.rps_detail;
      } else if (currentRowData.rps_detail) {
        if (typeof currentRowData.rps_detail === 'object' && currentRowData.rps_detail.id) {
          finalRpsDetailIdString = currentRowData.rps_detail.id;
        } else if (typeof currentRowData.rps_detail === 'string') {
          finalRpsDetailIdString = currentRowData.rps_detail;
        }
      }
      console.log("Extracted finalRpsDetailIdString (to be used in payload):", finalRpsDetailIdString);

      const payload = {
        idQuestion: currentRowData.idQuestion,
        title: valuesFromForm.title,
        description: valuesFromForm.description,
        question_type: valuesFromForm.question_type,
        answer_type: valuesFromForm.answer_type,
        explanation: valuesFromForm.explanation,
        is_rated: currentRowData.is_rated,

        rps: currentRowData.rps,

        rps_detail: finalRpsDetailIdString,

        examType: examTypeToSet,
        examType2: examType2ToSet,
        examType3: examType3ToSet,

        file_path: currentRowData.file_path,
      };

      if (payload.rps && typeof payload.rps === 'object' && payload.rps.idRps) {
        payload.rps = payload.rps.idRps;
      }

      delete payload.criteriaValuesJson;
      delete payload.questionRating;
      delete payload.questionRatingJson;
      delete payload.valid;
      delete payload.createdBy;


      console.log("Final payload to send to editQuestion API (AFTER CLEANUP):", payload);

      await editQuestion(payload, currentRowData.idQuestion);

      formInstance.resetFields();
      setEditQuestionModalVisible(false);
      message.success("Pertanyaan berhasil diedit!");
      fetchQuestions(rpsDetailID);
    } catch (error) {
      console.error("Error editing question:", error.response?.data || error.message || error);
      message.error("Gagal mengedit pertanyaan: " + (error.response?.data?.message || error.message || 'Error tidak diketahui'));
    } finally {
      setLoadingEditModal(false);
    }
  };

  const handleDeleteQuestion = async (row) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      icon: <DeleteOutlined />,
      content: `Anda yakin ingin menghapus pertanyaan ini (ID: ${row.idQuestion})?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await deleteQuestion({ idQuestion: row.idQuestion });
          message.success("Pertanyaan berhasil dihapus");
          fetchQuestions(rpsDetailID);
        } catch (error) {
          console.error("Error deleting question:", error);
          message.error("Gagal menghapus pertanyaan: " + (error.response?.data?.message || error.message || 'Error tidak diketahui'));
        }
      },
    });
  };

  const handleCancel = () => {
    setEditQuestionModalVisible(false);
    setAddQuestionModalVisible(false);
    setCurrentRowData({});
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
      return (
        (selectedExamTypes.EXERCISE && question.examType === "EXERCISE") ||
        (selectedExamTypes.QUIZ && question.examType2 === "QUIZ") ||
        (selectedExamTypes.EXAM && question.examType3 === "EXAM")
      );
    });
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    const baseUrl = "http://localhost:8081";
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  // --- Fungsi Baru: handleImportCsv ---
  const handleImportCsv = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error("Silakan pilih file CSV.");
      return;
    }
    if (file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      message.error("Hanya file CSV yang diizinkan.");
      return;
    }

    setImportCsvLoading(true); // Mulai loading impor
    const reader = new FileReader();

    reader.onload = async (e) => {
      const csvString = e.target.result;
      let successCount = 0;
      let failureCount = 0;

      try {
        const parsedData = parseCSV(csvString);
        if (parsedData.length === 0) {
          message.info("File CSV kosong atau tidak ada data yang valid.");
          return;
        }

        // --- Debugging Tambahan untuk Verifikasi Data Master ---
        console.log("DEBUG_IMPORT: rpsList (from state):", rpsList);
        console.log("DEBUG_IMPORT: rpsDetails (from state):", rpsDetails);
        // --- Akhir Debugging Tambahan ---

        if (rpsList.length === 0 || rpsDetails.length === 0) {
            message.error("Data RPS atau Detail RPS belum dimuat. Mohon refresh halaman dan coba lagi.");
            return;
        }

        const submissionPromises = [];

        for (const row of parsedData) {
          let rowHasError = false;

          if (!rpsID || !rpsDetailID) {
              message.error("ID RPS atau ID Detail RPS tidak ditemukan di URL. Tidak dapat mengimpor.");
              failureCount++;
              continue;
          }

          let finalRpsId = rpsID;
          const rpsFromCsv = row.rps_id;

          if (rpsFromCsv) {
              const foundRps = rpsList.find(r => r.idRps === rpsFromCsv || r.nameRps === rpsFromCsv);
              if (foundRps) {
                  finalRpsId = foundRps.idRps;
              } else {
                  message.warning(`RPS dengan ID/nama '${rpsFromCsv}' dari CSV tidak ditemukan. Baris dilewati.`);
                  rowHasError = true;
              }
          }
          if (finalRpsId !== rpsID) {
              message.warning(`RPS ID dari CSV ('${finalRpsId}') berbeda dengan ID dari URL ('${rpsID}'). Menggunakan ID dari URL.`);
          }

          let finalRpsDetailId = rpsDetailID;
          const rpsDetailFromCsv = row.rps_detail; // Ini adalah string '4edf2f17-9-6' dari CSV Anda

          if (rpsDetailFromCsv) {
              // --- DEBUGGING KRITIS DI SINI ---
              console.log(`DEBUG_IMPORT_LOOKUP: rpsDetailFromCsv (from CSV): '${rpsDetailFromCsv}' (Type: ${typeof rpsDetailFromCsv}, Length: ${rpsDetailFromCsv.length})`);
              
              const foundRpsDetail = rpsDetails.find(rd => {
                  const rdId = String(rd.id); // Pastikan ini string
                  const rdWeekLabel = rd.weekLabel ? String(rd.weekLabel) : null; // Pastikan ini string
                  const rdWeek = rd.week ? parseInt(rd.week, 10) : null; // Pastikan ini int

                  console.log(`  Comparing with RPS Detail from State: ID: '${rdId}' (Type: ${typeof rdId}, Length: ${rdId.length}), WeekLabel: '${rdWeekLabel}', Week: ${rdWeek}`);
                  
                  // Perbaikan utama di sini untuk memastikan perbandingan yang tepat
                  return rdId === rpsDetailFromCsv || 
                         (rdWeekLabel && rdWeekLabel === rpsDetailFromCsv) || 
                         (rdWeek && parseInt(rpsDetailFromCsv, 10) === rdWeek);
              });

              if (foundRpsDetail) {
                  finalRpsDetailId = foundRpsDetail.id;
                  console.log(`DEBUG_IMPORT_LOOKUP: FOUND RPS Detail in state: '${finalRpsDetailId}'`);
              } else {
                  message.warning(`RPS Detail dengan ID/label minggu '${rpsDetailFromCsv}' dari CSV tidak ditemukan. Baris dilewati.`);
                  rowHasError = true;
                  console.log(`DEBUG_IMPORT_LOOKUP: RPS Detail NOT FOUND for '${rpsDetailFromCsv}'.`);
              }
          }
          if (finalRpsDetailId !== rpsDetailID) {
              message.warning(`RPS Detail ID dari CSV ('${finalRpsDetailId}') berbeda dengan ID dari URL ('${rpsDetailID}'). Menggunakan ID dari URL.`);
          }

          if (rowHasError) {
              failureCount++;
              continue;
          }

          const payload = {
              idQuestion: null,
              title: row.title,
              description: row.description || null,
              question_type: row.question_type,
              answer_type: row.answer_type,
              explanation: row.explanation || null,
              rps: finalRpsId,
              rps_detail: finalRpsDetailId,
              
              examType: row.examType || null,
              examType2: row.examType2 || null,
              examType3: row.examType3 || null,
          };

          if (!payload.title || !payload.question_type || !payload.answer_type || !payload.rps || !payload.rps_detail) {
              message.warning(`Baris dilewati karena data inti pertanyaan tidak lengkap: ${JSON.stringify(row)}`);
              failureCount++;
              continue;
          }
          
          submissionPromises.push(
            (async () => {
              try {
                await addQuestion(payload);
                successCount++;
                return { status: 'fulfilled', data: payload };
              } catch (addError) {
                console.error("Error adding question from CSV row:", payload, addError);
                return { status: 'rejected', error: addError.response?.data?.message || addError.message || "Unknown error", data: payload };
              }
            })()
          );
        }

        const results = await Promise.allSettled(submissionPromises);

        results.forEach(result => {
            if (result.status === 'rejected') {
                message.error(`Gagal menambah pertanyaan (ID: ${result.reason.data?.idQuestion || result.reason.data?.title || 'N/A'}): ${result.reason.error}`);
            }
        });

        if (successCount > 0 && failureCount === 0) {
            message.success(`Berhasil mengimpor ${successCount} pertanyaan baru!`);
        } else if (successCount > 0 && failureCount > 0) {
            message.warning(`Impor pertanyaan selesai dengan ${successCount} berhasil dan ${failureCount} gagal. Periksa konsol untuk detail.`);
        } else if (failureCount > 0) {
            message.error(`Gagal mengimpor pertanyaan. Total ${failureCount} kegagalan. Periksa konsol untuk detail.`);
        } else {
            message.info("Tidak ada pertanyaan yang valid untuk diimpor dari file CSV.");
        }

        fetchQuestions(rpsDetailID);

      } catch (error) {
        console.error("Error processing CSV:", error);
        message.error(`Gagal memproses file CSV: ${error.message}`);
      } finally {
        setImportCsvLoading(false);
        event.target.value = null;
      }
    };

    reader.readAsText(file);
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
          <>
            <Button type="primary" onClick={handleAddQuestion} icon={<PlusOutlined/>}>
              Tambahkan Pertanyaan
            </Button>
            <Divider type="vertical" />
            <input
                type="file"
                id="csvFileInputQuestion" // ID unik untuk input file ini
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImportCsv}
            />
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('csvFileInputQuestion').click()}
              loading={importCsvLoading}
              disabled={loadingRpsDetails}
            >
              Impor Pertanyaan (CSV)
            </Button>
          </>
        }
      >
        <Table
          bordered
          rowKey="idQuestion"
          dataSource={getFilteredData()}
          loading={loadingRpsDetails || importCsvLoading}
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
            title="Gambar"
            key="image"
            align="center"
            width={120}
            render={(_, row) => {
              if (row.file_path) {
                const imageUrl = getImageUrl(row.file_path);
                return (
                  <Image
                    src={imageUrl}
                    alt="Question Image"
                    style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }}
                    fallback="https://via.placeholder.com/80?text=No+Image"
                  />
                );
              } else {
                return <span>Tidak ada gambar</span>;
              }
            }}
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
            dataIndex="answer_type"
            key="answer_type"
            align="center"
            width={120}
            render={(text) => text || '-'}
          />
          <Column
            title="Tipe Soal"
            dataIndex="question_type"
            key="question_type"
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
                  disabled={loadingRpsDetails || importCsvLoading}
                />
                <Divider type="vertical" />
                <Link to={`/question/${row.idQuestion}`}>
                  <Button
                    type="primary"
                    icon={<DiffOutlined />}
                    size="small"
                    title="Answer"
                    disabled={loadingRpsDetails || importCsvLoading}
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
                  disabled={loadingRpsDetails || importCsvLoading}
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
        rpsDetailsOptions={rpsDetails}
      />

      <AddQuestionForm
        visible={addQuestionModalVisible}
        confirmLoading={addQuestionModalLoading}
        onCancel={handleCancel}
        onOk={handleAddQuestionOk}
        rps={rpsList}
        rpsDetails={rpsDetails}
      />
    </div>
  );
};

Question.displayName = 'QuestionPage';

export default Question;