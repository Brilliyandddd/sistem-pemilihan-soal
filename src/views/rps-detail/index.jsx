/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Table, message, Divider, Modal, Spin } from "antd"; // Tambahkan Spin
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getRPSDetail,
  deleteRPSDetail,
  editRPSDetail,
  addRPSDetail, // Penting: Ini API untuk menambah RPS Detail
} from "@/api/rpsDetail";
import { getFormLearnings } from "@/api/formLearning";
import { getLearningMethods } from "@/api/learningMethod";
import { getAssessmentCriterias } from "@/api/assessmentCriteria";
import { getAppraisalForms } from "@/api/appraisalForm";
import { getRPSById } from "@/api/rps"; // Untuk mendapatkan detail RPS parent
import TypingCard from "@/components/TypingCard";
import EditRPSDetailForm from "./forms/edit-rpsDetail-form";
import AddRPSDetailForm from "./forms/add-rpsDetail-form";
import { EditOutlined, DiffOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons"; // Tambahkan UploadOutlined, PlusOutlined

const { Column } = Table;
const { confirm } = Modal;

// --- Fungsi parseCSV (di luar komponen, agar dapat diakses) ---
const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length <= 1) return []; // Skip header if only header is present

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`Baris CSV malformed dilewati: "${lines[i]}". Diharapkan ${headers.length} nilai, didapat ${values.length}.`);
            continue; // Skip malformed rows
        }
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return data;
};
// --- Akhir fungsi parseCSV ---

const RPSDetailDetail = () => {
  const { rpsID } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    rpsDetail: [],
    formLearnings: [],
    learningMethods: [],
    dev_lecturers: [], // Ini mungkin tidak relevan di RPSDetail, hanya di RPS parent
    assessmentCriterias: [],
    rps: null, // Detail RPS parent (dari getRPSById)
    appraisalForms: [],
    currentRowData: {},
    loading: false, // Loading untuk fetch data tabel
  });

  const [modal, setModal] = useState({
    editVisible: false,
    editLoading: false,
    addVisible: false,
    addLoading: false,
  });

  const [importCsvLoading, setImportCsvLoading] = useState(false); // State baru untuk loading impor CSV

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const [
        detailRes,
        rpsRes, // Mengambil detail RPS parent
        formLearningsRes,
        learningMethodsRes,
        assessmentRes,
        appraisalRes,
      ] = await Promise.all([
        getRPSDetail(rpsID), // Mengambil detail RPS yang disaring berdasarkan rpsID
        getRPSById(rpsID), // Mengambil detail RPS parent
        getFormLearnings(),
        getLearningMethods(),
        getAssessmentCriterias(),
        getAppraisalForms(),
      ]);

      let rpsData = rpsRes.data?.content;
      // Normalisasi rpsData jika API getRPSById mengembalikan array tunggal
      if (Array.isArray(rpsData) && rpsData.length > 0) {
        rpsData = rpsData[0];
      }

      setState(prev => ({
        ...prev,
        rpsDetail: detailRes.data?.content || [], // Ini adalah daftar RPS Details
        rps: rpsData, // Ini adalah objek RPS parent
        formLearnings: formLearningsRes.data?.content || [],
        learningMethods: learningMethodsRes.data?.content || [],
        assessmentCriterias: assessmentRes.data?.content || [],
        appraisalForms: appraisalRes.data?.content || [],
        loading: false,
      }));

    } catch (error) {
      message.error(`Failed to fetch data: ${error.message}`);
      console.error("Error in fetchData:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (rpsID) { // Pastikan rpsID ada sebelum fetch
      fetchData();
    } else {
      message.error("ID RPS tidak ditemukan di URL.");
      navigate('/rps'); // Redirect jika ID tidak ada
    }
  }, [rpsID]);

  const handleEdit = (row) => {
    setState(prev => ({ ...prev, currentRowData: row }));
    setModal(prev => ({ ...prev, editVisible: true }));
  };

  const handleDelete = async (row) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      icon: <DeleteOutlined />,
      content: `Anda yakin ingin menghapus detail RPS Minggu ke-${row.week} ini?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await deleteRPSDetail(row.id);
          message.success("Berhasil dihapus!");
          fetchData(); // Muat ulang data setelah berhasil hapus
        } catch (error) {
          message.error("Gagal menghapus.");
          console.error("Error deleting RPS Detail:", error);
        }
      },
    });
  };

  const handleEditSubmit = async (values) => {
    setModal(prev => ({ ...prev, editLoading: true }));

    try {
      const idToEdit = state.currentRowData.id;

      if (!idToEdit) {
        message.error("Error: ID item yang akan diedit tidak ditemukan.");
        setModal(prev => ({ ...prev, editLoading: false }));
        return;
      }

      const payloadForBackendBody = {
          week: values.week,
          sub_cp_mk: values.sub_cp_mk,
          weight: values.weight,
          learning_materials: values.learning_materials || null, // Pastikan ada di form dan ditambahkan
          form_learning_id: values.form_learning_id, // Mengirim ID flat
          rps_id: rpsID // Mengirim ID RPS (dari useParams) secara flat
      };

      await editRPSDetail(idToEdit, payloadForBackendBody);

      message.success("Update berhasil!");
      setModal(prev => ({ ...prev, editVisible: false, editLoading: false }));
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Update gagal";
      message.error(errorMessage);
      console.error("Error saat mengedit RPS Detail:", error.response?.data || error);
      setModal(prev => ({ ...prev, editLoading: false }));
    }
  };

  const handleAddSubmit = async (values) => {
    setModal(prev => ({ ...prev, addLoading: true }));

    try {
      const payload = {
          week: values.week,
          sub_cp_mk: values.sub_cp_mk,
          learning_materials: values.learning_materials || null, // Pastikan ini ada di formValues dan payload
          weight: values.weight,
          form_learning_id: values.form_learning_id, // Mengirim ID flat
          rps_id: rpsID // Mengirim ID RPS (dari useParams) secara flat
      };

      await addRPSDetail(payload);
      message.success("Berhasil ditambahkan!");
      setModal(prev => ({ ...prev, addVisible: false, addLoading: false }));
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Gagal menambah";
      message.error(errorMessage);
      console.error("Error adding RPS Detail (handleAddSubmit):", error.response?.data || error);
      setModal(prev => ({ ...prev, addLoading: false }));
    }
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

        if (state.formLearnings.length === 0) {
            message.error("Data 'Bentuk Pembelajaran' belum dimuat. Mohon refresh halaman dan coba lagi.");
            return;
        }

        const submissionPromises = [];

        for (const row of parsedData) {
          let rowHasError = false;
          const payload = {
            rps_id: rpsID, // Diambil dari useParams
            week: parseInt(row.week, 10), // Pastikan ini angka
            sub_cp_mk: row.sub_cp_mk,
            learning_materials: row.learning_materials || null,
            weight: parseFloat(row.weight), // Pastikan ini angka float
          };

          // Lookup dan assign ID untuk form_learning_id
          const formLearningIdentifier = row.form_learning_id; // Ini bisa ID atau nama dari CSV
          if (formLearningIdentifier) {
              const foundFormLearning = state.formLearnings.find(fl => 
                  fl.id === formLearningIdentifier || fl.name === formLearningIdentifier
              );
              if (foundFormLearning) {
                  payload.form_learning_id = foundFormLearning.id;
              } else {
                  message.warn(`'Bentuk Pembelajaran' '${formLearningIdentifier}' tidak ditemukan. Baris dilewati.`);
                  rowHasError = true;
              }
          } else {
              payload.form_learning_id = null; // Set null jika kosong di CSV
          }
          
          // Periksa apakah semua kolom penting terisi dari CSV
          if (!payload.week || !payload.sub_cp_mk || isNaN(payload.weight) || !payload.form_learning_id) {
            message.warn(`Baris dilewati karena data inti RPS Detail tidak lengkap atau tidak valid: ${JSON.stringify(row)}`);
            rowHasError = true;
          }

          if (rowHasError) {
            failureCount++;
            continue; // Lanjut ke baris berikutnya jika ada error di baris ini
          }
            // Tambahkan promise untuk addRPSDetail
          submissionPromises.push(
            (async () => {
              try {
                await addRPSDetail(payload);
                successCount++;
                return { status: 'fulfilled', data: payload };
              } catch (addError) {
                console.error("Error adding RPS Detail from CSV row:", payload, addError);
                return { status: 'rejected', error: addError.message || "Unknown error", data: payload };
              }
            })()
          );
        }

        // Tunggu semua promise selesai
        const results = await Promise.allSettled(submissionPromises);

        results.forEach(result => {
            if (result.status === 'rejected') {
                message.error(`Gagal menambah detail RPS (Minggu ke-${result.reason.data?.week}): ${result.reason.error}`);
            }
        });

        if (successCount > 0 && failureCount === 0) {
            message.success(`Berhasil mengimpor ${successCount} detail RPS baru!`);
        } else if (successCount > 0 && failureCount > 0) {
            message.warning(`Impor detail RPS selesai dengan ${successCount} berhasil dan ${failureCount} gagal. Periksa konsol untuk detail.`);
        } else if (failureCount > 0) {
            message.error(`Gagal mengimpor detail RPS. Total ${failureCount} kegagalan. Periksa konsol untuk detail.`);
        } else {
            message.info("Tidak ada detail RPS yang valid untuk diimpor dari file CSV.");
        }

        fetchData(); // Muat ulang data setelah semua operasi impor selesai

      } catch (error) {
        console.error("Error processing CSV:", error);
        message.error(`Gagal memproses file CSV: ${error.message}`);
      } finally {
        setImportCsvLoading(false); // Pastikan loading dinonaktifkan
        // Penting: Reset input file agar event change tetap terpicu jika file yang sama diunggah lagi
        event.target.value = null; // Ini penting untuk mengizinkan unggahan file yang sama berkali-kali
      }
    };

    reader.readAsText(file); // Baca file sebagai teks
  };
  // --- Akhir Fungsi Baru: handleImportCsv ---

  const cardContent = `Di sini Anda dapat mengelola Detail RPS untuk RPS dengan ID: ${rpsID} - ${state.rps?.nameRps || 'Memuat...'} Semester ${state.rps?.semester || 'Memuat...'}.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Detail RPS" source={cardContent} />
      <br />

      <Card
        title={
          <>
            <Button
              type="primary"
              onClick={() => setModal(prev => ({ ...prev, addVisible: true }))}
              icon={<PlusOutlined />}
            >
              Tambah Detail RPS
            </Button>
            <Divider type="vertical" />
            <input
              type="file"
              id="csvFileInputRPSDetail" // ID unik untuk input file ini
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportCsv}
            />
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('csvFileInputRPSDetail').click()}
              loading={importCsvLoading}
              disabled={state.loading} // Disable jika data tabel masih loading
            >
              Impor Detail RPS (CSV)
            </Button>
          </>
        }
      >
        <Table
          bordered
          rowKey="id"
          dataSource={state.rpsDetail}
          loading={state.loading || importCsvLoading} // Gabungkan loading state
          pagination={{ pageSize: 10 }} // Ganti ke pagination biasa atau sesuaikan
        >
          <Column title="ID Detail RPS" dataIndex="id" align="center" />
          <Column
            title="Minggu ke-"
            dataIndex="week"
            align="center"
            sorter={(a, b) => a.week - b.week}
          />
          <Column
            title="Bentuk Pembelajaran"
            dataIndex={["form_learning", "name"]}
            align="center"
          />
          <Column
            title="Materi Pembelajaran"
            dataIndex="learning_materials" // Data ini sudah String dari model
            align="center"
            render={(text) => (text && text.length > 50 ? `${text.substring(0, 50)}...` : text || '-')}
          />
          <Column
            title="Sub CP MK"
            dataIndex="sub_cp_mk"
            align="center"
            sorter={(a, b) => a.sub_cp_mk.localeCompare(b.sub_cp_mk)}
          />
          <Column
            title="Bobot"
            dataIndex="weight"
            align="center"
          />
          {/* Tambahkan kolom-kolom lain sesuai kebutuhan */}
          <Column
            title="Actions"
            align="center"
            render={(_, record) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  disabled={state.loading || importCsvLoading}
                />
                <Divider type="vertical" />
                <Link to={`/rps/${rpsID}/${record.id}`}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DiffOutlined />}
                  />
                </Link>
                <Divider type="vertical" />
                <Button
                  type="danger"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                  disabled={state.loading || importCsvLoading}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditRPSDetailForm
        visible={modal.editVisible}
        confirmLoading={modal.editLoading}
        onCancel={() => setModal(prev => ({ ...prev, editVisible: false }))}
        onOk={handleEditSubmit}
        initialValues={state.currentRowData}
        formLearnings={state.formLearnings}
        learningMethods={state.learningMethods}
        assessmentCriterias={state.assessmentCriterias}
        appraisalForms={state.appraisalForms}
        devLecturers={state.dev_lecturers} // Pass dev_lecturers jika dibutuhkan di form
      />

      <AddRPSDetailForm
        visible={modal.addVisible}
        confirmLoading={modal.addLoading}
        onCancel={() => setModal(prev => ({ ...prev, addVisible: false }))}
        onOk={handleAddSubmit}
        formLearnings={state.formLearnings}
        learningMethods={state.learningMethods}
        assessmentCriterias={state.assessmentCriterias}
        appraisalForms={state.appraisalForms}
        devLecturers={state.dev_lecturers} // Pass dev_lecturers jika dibutuhkan di form
      />
    </div>
  );
};

export default RPSDetailDetail;