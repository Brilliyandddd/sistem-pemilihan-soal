/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Table, message, Modal, Divider, Spin } from "antd"; // Tambahkan Spin
import { Link } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DiffOutlined, // Untuk ikon impor
  UploadOutlined, // Opsi ikon lain untuk upload
  PlusOutlined // Untuk tombol tambah RPS
} from "@ant-design/icons";
import {
  getRPS,
  deleteRPS,
  editRPS,
  addRPS,
  getStudyProgram,
  getSubject,
  getLecture,
} from "@/api/rps";
import TypingCard from "@/components/TypingCard";
import EditRPSForm from "./forms/edit-rps-form";
import AddRPSForm from "./forms/add-rps-form";

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

const RPS = () => {
  const [rps, setRPS] = useState([]);
  const [studyProgram, setStudyProgram] = useState([]);
  const [subject, setSubject] = useState([]);
  const [lecture, setLecture] = useState([]);

  const [editRPSModalVisible, setEditRPSModalVisible] = useState(false);
  const [editRPSModalLoading, setEditRPSModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const [addRPSModalVisible, setAddRPSModalVisible] = useState(false);
  const [addRPSModalLoading, setAddRPSModalLoading] = useState(false);

  const [importCsvLoading, setImportCsvLoading] = useState(false); // State baru untuk loading impor CSV

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [rpsRes, prodiRes, subjectRes, lectureRes] = await Promise.all([
        getRPS(),
        getStudyProgram(),
        getSubject(),
        getLecture(),
      ]);

      setRPS(rpsRes.data.content);
      // Pastikan data master punya format yang konsisten, biasanya { content: [...] } atau langsung array
      setStudyProgram(prodiRes.data.content || prodiRes.data); // Sesuaikan jika API langsung mengembalikan array
      setSubject(subjectRes.data.content || subjectRes.data); // Sesuaikan
      setLecture(lectureRes.data.content || lectureRes.data); // Sesuaikan
    } catch (error) {
      console.error("Error fetching all data:", error);
      message.error("Gagal mengambil data utama. Silakan coba lagi.");
    }
  };

  // Fungsi fetchStudyProgram, fetchSubject sudah dipanggil di fetchAllData,
  // jadi tidak perlu dipanggil secara terpisah kecuali ada kebutuhan spesifik.

  const handleDeleteRPS = useCallback((row) => {
    confirm({
      title: "Apakah Anda yakin ingin menghapus RPS ini?",
      icon: <ExclamationCircleOutlined />,
      content: `ID: ${row.idRps} - Nama: ${row.nameRps}`,
      okText: "Ya",
      okType: "danger",
      cancelText: "Batal",
      async onOk() {
        try {
          await deleteRPS(row.idRps);
          message.success("RPS berhasil dihapus!");
          fetchAllData();
        } catch (error) {
          message.error("Gagal menghapus RPS. Silakan coba lagi.");
        }
      },
    });
  }, []);

  const handleEditRPS = (row) => {
    if (!row?.idRps) {
      message.error("Data RPS tidak memiliki ID!");
      return;
    }
    setCurrentRowData(row);
    setEditRPSModalVisible(true);
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
          return; // Berhenti jika tidak ada data
        }

        // --- Verifikasi data master sudah dimuat ---
        if (studyProgram.length === 0 || subject.length === 0 || lecture.length === 0) {
            message.error("Data master (Program Studi, Mata Kuliah, Dosen) belum dimuat. Mohon refresh halaman dan coba lagi.");
            return; // Berhenti jika data master belum siap
        }

        const submissionPromises = [];

        for (const row of parsedData) {
          // --- Bangun payload dari baris CSV dan lakukan lookup ID ---
          let rowHasError = false;
          const payload = {
            idRps: null, // ID akan digenerate oleh backend
            cplMk: row.cplMk,
            cplProdi: row.cplProdi,
            sks: parseInt(row.sks, 10), // Pastikan ini angka
            semester: parseInt(row.semester, 10), // Pastikan ini angka
            nameRps: row.nameRps,
          };

          // Lookup dan assign ID untuk Program Studi
          const foundStudyProgram = studyProgram.find(sp => sp.name === row.idProgramStudi || sp.id === row.idProgramStudi);
          if (foundStudyProgram) {
            payload.idProgramStudi = foundStudyProgram.id;
          } else {
            message.warn(`Program Studi '${row.idProgramStudi}' tidak ditemukan. Baris dilewati.`);
            rowHasError = true;
          }

          // Lookup dan assign ID untuk Mata Kuliah
          const foundSubject = subject.find(sub => sub.name === row.idSubject || sub.id === row.idSubject);
          if (foundSubject) {
            payload.idSubject = foundSubject.id;
          } else {
            message.warn(`Mata Kuliah '${row.idSubject}' tidak ditemukan. Baris dilewati.`);
            rowHasError = true;
          }

          // Lookup dan assign ID untuk Dosen (developer, coordinator, instructor)
          const lecturerFields = ['developer_lecturer_id', 'coordinator_lecturer_id', 'instructor_lecturer_id'];
          lecturerFields.forEach(field => {
            const lecturerIdentifier = row[field]; // Ini bisa berupa ID atau nama dosen dari CSV
            if (lecturerIdentifier) {
                // Mencari berdasarkan ID atau Nama
                const foundLecturer = lecture.find(lect => lect.id === lecturerIdentifier || lect.name === lecturerIdentifier);
                if (foundLecturer) {
                    payload[field] = foundLecturer.id;
                } else {
                    message.warn(`Dosen '${lecturerIdentifier}' untuk '${field}' tidak ditemukan. Dosen tidak akan terisi untuk baris ini.`);
                    // Tidak set rowHasError = true, karena dosen bisa opsional atau diisi manual nanti
                }
            } else {
                payload[field] = null; // Set null jika kosong di CSV
            }
          });
          
          // Learning Media (Diasumsikan sudah ID di CSV, jika tidak perlu lookup serupa)
          payload.idLearningMediaSoftware = row.idLearningMediaSoftware || null;
          payload.idLearningMediaHardware = row.idLearningMediaHardware || null;

          // Periksa apakah semua kolom penting terisi dari CSV
          if (!payload.cplMk || !payload.cplProdi || !payload.nameRps || isNaN(payload.sks) || isNaN(payload.semester)) {
            message.warn(`Baris dilewati karena data inti RPS tidak lengkap: ${JSON.stringify(row)}`);
            rowHasError = true;
          }

          if (rowHasError) {
            failureCount++;
            continue; // Lanjut ke baris berikutnya jika ada error di baris ini
          }

          // Tambahkan promise untuk addRPS
          submissionPromises.push(
            (async () => {
              try {
                await addRPS(payload);
                successCount++;
                return { status: 'fulfilled', id: payload.idRps || row.nameRps };
              } catch (addError) {
                console.error("Error adding RPS from CSV row:", payload, addError);
                return { status: 'rejected', id: payload.idRps || row.nameRps, error: addError.message || "Unknown error" };
              }
            })()
          );
        }

        // Tunggu semua promise selesai
        const results = await Promise.allSettled(submissionPromises);

        results.forEach(result => {
            if (result.status === 'rejected') {
                message.error(`Gagal menambah RPS (${result.reason.id}): ${result.reason.error}`);
            }
        });

        if (successCount > 0 && failureCount === 0) {
            message.success(`Berhasil mengimpor ${successCount} RPS baru!`);
        } else if (successCount > 0 && failureCount > 0) {
            message.warning(`Impor RPS selesai dengan ${successCount} berhasil dan ${failureCount} gagal. Periksa konsol untuk detail.`);
        } else if (failureCount > 0) {
            message.error(`Gagal mengimpor RPS. Total ${failureCount} kegagalan. Periksa konsol untuk detail.`);
        } else {
            message.info("Tidak ada RPS yang valid untuk diimpor dari file CSV.");
        }

        fetchAllData(); // Muat ulang data setelah semua operasi impor selesai

      } catch (error) {
        console.error("Error processing CSV:", error);
        message.error(`Gagal memproses file CSV: ${error.message}`);
      } finally {
        setImportCsvLoading(false); // Pastikan loading dinonaktifkan
        // Penting: Reset input file agar event change tetap terpicu jika file yang sama diunggah lagi
        event.target.value = null;
      }
    };

    reader.readAsText(file); // Baca file sebagai teks
  };
  // --- Akhir Fungsi Baru: handleImportCsv ---

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen RPS"
        source="Di sini, Anda dapat mengelola RPS."
      />
      <Card
        title={
          <>
            <Button type="primary" onClick={() => setAddRPSModalVisible(true)} icon={<PlusOutlined/>}>
              Tambahkan RPS
            </Button>
            <Divider type="vertical" />
            <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImportCsv}
            />
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('csvFileInput').click()}
              loading={importCsvLoading}
            >
              Impor RPS (CSV)
            </Button>
          </>
        }
      >
        <Table
          bordered
          rowKey="idRps" // Pastikan rowKey ini sesuai dengan ID unik di data RPS
          dataSource={rps}
          pagination={{ pageSize: 5 }}
          loading={importCsvLoading} // Tampilkan loading pada tabel saat impor berlangsung
        >
          <Column title="ID RPS" dataIndex="idRps" align="center" />
          <Column title="Nama" dataIndex="nameRps" align="center" />
          <Column title="SKS" dataIndex="sks" align="center" />
          <Column title="Semester" dataIndex="semester" align="center" />
          <Column
            title="Mata Kuliah"
            dataIndex="subject"
            align="center"
            render={(subject) => subject?.name || "-"}
          />
          <Column
            title="Dosen Pengembang"
            dataIndex={["developerLecturer", "name"]}
            align="center"
            render={(name, record) => (
              name ||
              record?.developer_lecturer_id ||
              "-"
            )}
          />
          <Column
            title="Dosen Koordinator"
            dataIndex={["coordinatorLecturer", "name"]}
            align="center"
            render={(name, record) => (
              name ||
              record?.coordinator_lecturer_id ||
              "-"
            )}
          />
          <Column
            title="Dosen Pengampu"
            dataIndex={["instructorLecturer", "name"]}
            align="center"
            render={(name, record) => (
              name ||
              record?.instructor_lecturer_id ||
              "-"
            )}
          />
          <Column
            title="Operasi"
            key="action"
            align="center"
            render={(text, row) => (
              <>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEditRPS(row)}
                  disabled={importCsvLoading} // Disable saat impor berlangsung
                />
                <Divider type="vertical" />
                <Link to={`/rps/${row.idRps}`}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DiffOutlined />}
                    title="Detail RPS"
                    disabled={importCsvLoading} // Disable saat impor berlangsung
                  />
                </Link>
                <Divider type="vertical" />
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteRPS(row)}
                  style={{ marginLeft: 8 }}
                  disabled={importCsvLoading} // Disable saat impor berlangsung
                />
              </>
            )}
          />
        </Table>
      </Card>

      <EditRPSForm
        currentRowData={currentRowData}
        visible={editRPSModalVisible}
        confirmLoading={editRPSModalLoading}
        studyProgram={studyProgram.content || studyProgram} // Sesuaikan prop jika studyProgram tidak selalu punya .content
        subject={subject.content || subject} // Sesuaikan prop
        lecture={lecture}
        onCancel={() => setEditRPSModalVisible(false)}
        onOk={async (values) => {
            setEditRPSModalLoading(true);
            try {
                if (!values.idRps) {
                    throw new Error("ID RPS tidak valid");
                }
                const editedValues = {
                    idRps: values.idRps,
                    cplMk: values.cplMk,
                    cplProdi: values.cplProdi,
                    idProgramStudi: values.idProgramStudi,
                    idSubject: values.idSubject,
                    sks: values.sks,
                    semester: values.semester,
                    nameRps: values.nameRps,
                    idLearningMediaSoftware: values.idLearningMediaSoftware,
                    idLearningMediaHardware: values.idLearningMediaHardware,
                    developer_lecturer_id: values.developer_lecturer_id,
                    coordinator_lecturer_id: values.coordinator_lecturer_id,
                    instructor_lecturer_id: values.instructor_lecturer_id,
                };
                console.log("values update", editedValues);
                await editRPS(editedValues.idRps, editedValues);

                message.success("RPS berhasil diubah!");
                setEditRPSModalVisible(false);
                fetchAllData();
            } catch (error) {
                console.error("Error saat mengedit RPS:", error);
                message.error(`Gagal mengubah RPS: ${error.message}`);
            } finally {
                setEditRPSModalLoading(false);
            }
        }}
      />

      <AddRPSForm
        visible={addRPSModalVisible}
        confirmLoading={addRPSModalLoading}
        studyProgram={studyProgram.content || studyProgram} // Sesuaikan prop
        subject={subject.content || subject} // Sesuaikan prop
        lecture={lecture}
        onCancel={() => setAddRPSModalVisible(false)}
        onOk={async (values) => {
          setAddRPSModalLoading(false); // Ini harusnya true saat mulai submit
          try {
            setAddRPSModalLoading(true); // Pindahkan ke sini
            const updatedValues = {
              idRps: null,
              cplMk: values.cplMk,
              cplProdi: values.cplProdi,
              idProgramStudi: values.idProgramStudi,
              idSubject: values.idSubject,
              sks: values.sks,
              semester: values.semester,
              nameRps: values.nameRps,
              idLearningMediaSoftware: values.idLearningMediaSoftware,
              idLearningMediaHardware: values.idLearningMediaHardware,
              developer_lecturer_id: values.developer_lecturer_id,
              coordinator_lecturer_id: values.coordinator_lecturer_id,
              instructor_lecturer_id: values.instructor_lecturer_id,
            };
            console.log("values", updatedValues);
            await addRPS(updatedValues);

            message.success("RPS berhasil ditambah!");
            setAddRPSModalVisible(false);
            fetchAllData();
          } catch (error) {
            message.error("Gagal manambah RPS. Silakan coba lagi.");
          } finally {
            setAddRPSModalLoading(false);
          }
        }}
      />
    </div>
  );
};

export default RPS;