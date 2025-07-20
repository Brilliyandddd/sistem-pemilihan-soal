/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Button, message, Tag, Spin, Tooltip, Alert, Modal, Form, Select } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import TypingCard from '@/components/TypingCard';

// Pastikan jalur impor ini benar di proyek Anda
import { getCausalityByID, submitCausalityRating, getAllCausalityRatingsForTask } from '@/api/causality';
import { reqUserInfo } from '@/api/user';
import { getLinguisticValues } from '@/api/linguisticValue';
import { getQuestionCriterias } from '@/api/questionCriteria';
import { getSubjects } from '@/api/subject';

const { Column } = Table;
const { Option } = Select;

// Helper untuk mencari nama berdasarkan ID (tetap dipertahankan)
const findNameById = (list, id) => {
    const item = list.find((item) => item.id === id);
    return item ? item.name : id || "-";
};

const CausalityRatingPage = () => {
    const { idCausality } = useParams();
    const [causalityTask, setCausalityTask] = useState(null);
    const [allCriteria, setAllCriteria] = useState([]); // Akan diisi dari getQuestionCriterias
    const [linguisticValues, setLinguisticValues] = useState([]); // Akan diisi dari getLinguisticValues
    const [ratingsByPair, setRatingsByPair] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const [matrixRatingModalVisible, setMatrixRatingModalVisible] = useState(false);
    const [currentInfluencingCriteria, setCurrentInfluencingCriteria] = useState(null);
    const [matrixRatingForm] = Form.useForm();

    // --- useEffect untuk memuat data awal (Master Data) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userInfoResponse = await reqUserInfo();
                const currentUserId = userInfoResponse.data?.id;
                if (!currentUserId) {
                    throw new Error("User ID tidak ditemukan. Harap login ulang.");
                }
                setUserInfo(userInfoResponse.data);

                const [subjectResponse, taskResponse, allQCRResponse, linguisticResponse, existingRatingsResponse] = await Promise.all([
                    getSubjects(),
                    getCausalityByID(idCausality),
                    getQuestionCriterias(), // Memuat semua kriteria
                    getLinguisticValues(), // Memuat semua nilai linguistik
                    getAllCausalityRatingsForTask(idCausality)
                ]);

                if (subjectResponse.data && subjectResponse.data.content) {
                    setSubjects(subjectResponse.data.content);
                } else {
                    console.warn("Failed to load subjects data.");
                }

                if (!taskResponse.data || !taskResponse.data.content) {
                    throw new Error("Tugas Kausalitas tidak ditemukan.");
                }
                const task = taskResponse.data.content;
                setCausalityTask(task);

                let processedTaskCriteriaIds = Array.isArray(task.criteriaIds) ? task.criteriaIds : [];
                if (processedTaskCriteriaIds.length === 0 && typeof task.criteriaIds === 'string') {
                    if (task.criteriaIds.includes(';')) {
                        processedTaskCriteriaIds = task.criteriaIds.split(';');
                    } else if (task.criteriaIds.startsWith('[') && task.criteriaIds.endsWith(']')) {
                        try { processedTaskCriteriaIds = JSON.parse(task.criteriaIds); } catch (e) { /* ignore */ }
                    } else if (task.criteriaIds.length > 0) {
                        processedTaskCriteriaIds = [task.criteriaIds];
                    }
                }

                if (!processedTaskCriteriaIds || processedTaskCriteriaIds.length === 0) {
                    throw new Error("Tugas Kausalitas tidak memiliki kriteria yang ditentukan. Pastikan admin telah menetapkan kriteria.");
                }

                let fetchedAllQuestionCriteria = [];
                if (allQCRResponse.data && allQCRResponse.data.content) {
                    fetchedAllQuestionCriteria = allQCRResponse.data.content;
                } else {
                    throw new Error("Gagal memuat daftar semua kriteria pertanyaan (Master Soal).");
                }
                const currentTaskRelevantCriteria = fetchedAllQuestionCriteria.filter(qc => processedTaskCriteriaIds.includes(qc.id));
                currentTaskRelevantCriteria.sort((a, b) => a.id.localeCompare(b.id));

                if (currentTaskRelevantCriteria.length === 0) {
                    throw new Error("Tidak ada kriteria yang relevan ditemukan di Master Soal untuk tugas ini. Pastikan ID kriteria di tugas cocok dengan Master Soal.");
                }
                setAllCriteria(currentTaskRelevantCriteria); // Set state allCriteria

                let fetchedLinguisticValues = [];
                if (linguisticResponse.data && linguisticResponse.data.content) {
                    fetchedLinguisticValues = linguisticResponse.data.content.map(lv => {
                        const val1 = lv.value1 !== undefined && lv.value1 !== null ? lv.value1 : 0;
                        const val2 = lv.value2 !== undefined && lv.value2 !== null ? lv.value2 : 0;
                        const val3 = lv.value3 !== undefined && lv.value3 !== null ? lv.value3 : 0;
                        const val4 = lv.value4 !== undefined && lv.value4 !== null ? lv.value4 : 0;

                        const sum = val1 + val2 + val3 + val4;
                        const average = (sum !== 0 || (val1 === 0 && val2 === 0 && val3 === 0 && val4 === 0)) ? sum / 4.0 : 0;

                        return { ...lv, averageValue: average };
                    });
                    setLinguisticValues(fetchedLinguisticValues); // Set state linguisticValues
                } else {
                    throw new Error("Gagal memuat nilai linguistik.");
                }

                const currentReviewerRatings = existingRatingsResponse.data?.content?.filter(r => r.reviewerId === currentUserId) || [];

                const initialRatingsData = {};
                currentReviewerRatings.forEach(rating => {
                    const pairKey = `${rating.influencingCriteriaId}-${rating.influencedCriteriaId}`;
                    const linguistic = fetchedLinguisticValues.find(lv => lv.id === rating.ratingValue);
                    initialRatingsData[pairKey] = {
                        numericValue: linguistic ? linguistic.averageValue : null,
                        linguisticName: linguistic ? linguistic.name : "N/A",
                        alreadyRated: true,
                        linguisticId: rating.ratingValue,
                    };
                });
                setRatingsByPair(initialRatingsData);

            } catch (err) {
                console.error("Error fetching data for causality rating page:", err);
                setError(err.message || "Gagal memuat data. Mohon coba lagi.");
                message.error(err.message || "Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };

        if (idCausality) {
            fetchData();
        }
    }, [idCausality]); // idCausality sebagai dependency

    // --- Helper untuk parsing CSV (tetap sama) ---
    const parseCSV = (csvString) => {
        const lines = csvString.trim().split('\n');
        if (lines.length <= 1) return []; // Skip header if only header is present

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                console.warn(`Baris CSV malformed dilewati: "${lines[i]}"`);
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

    // --- processCsvDataForSubmission yang diperbaiki ---
    const processCsvDataForSubmission = async (csvDataArray) => {
        setSubmitting(true);
        let overallHasValidationError = false;
        const allPayloadsToSubmit = [];
        const allNewRatingsDataUpdates = {};

        // --- PASTIKAN allCriteria DAN linguisticValues SUDAH ADA DAN TERISI DARI API ---
        if (!allCriteria || allCriteria.length === 0) {
            message.error("Data kriteria (allCriteria) belum dimuat. Tidak dapat memproses CSV. Mohon refresh halaman.");
            setSubmitting(false);
            return;
        }
        if (!linguisticValues || linguisticValues.length === 0) {
            message.error("Data nilai linguistik (linguisticValues) belum dimuat. Tidak dapat memproses CSV. Mohon refresh halaman.");
            setSubmitting(false);
            return;
        }
        // --- AKHIR PASTIKAN DATA MASTER ADA ---

        // Fase 1: Konversi nama dari CSV menjadi ID dan lakukan validasi awal
        const processedCsvRows = [];
        csvDataArray.forEach(row => {
            // Pastikan semua kolom yang diperlukan ada
            if (!row.influencedCriteriaId || !row.influencingCriteriaId || !row.ratingValue || !row.causalityTaskId || !row.reviewerId) {
                console.warn(`Baris CSV dilewati karena data tidak lengkap: ${JSON.stringify(row)}`);
                overallHasValidationError = true;
                return;
            }

            // --- LOOKUP ID untuk influencingCriteriaId (dari NAMA ke ID) ---
            const influencingCrit = allCriteria.find(c => c.name === row.influencingCriteriaId);
            if (!influencingCrit) {
                message.error(`Kriteria penginisiasi dengan nama '${row.influencingCriteriaId}' dari CSV tidak ditemukan di daftar kriteria aplikasi.`);
                overallHasValidationError = true;
                return; // Lewati baris ini jika tidak ditemukan
            }

            // --- LOOKUP ID untuk influencedCriteriaId (dari NAMA ke ID) ---
            const influencedCrit = allCriteria.find(c => c.name === row.influencedCriteriaId);
            if (!influencedCrit) {
                message.error(`Kriteria terpengaruh dengan nama '${row.influencedCriteriaId}' untuk '${row.influencingCriteriaId}' dari CSV tidak ditemukan.`);
                overallHasValidationError = true;
                return; // Lewati baris ini jika tidak ditemukan
            }

            // --- LOOKUP ID untuk ratingValue (dari NAMA ke ID) ---
            const linguisticVal = linguisticValues.find(lv => lv.name === row.ratingValue);
            if (!linguisticVal || linguisticVal.averageValue === undefined || linguisticVal.averageValue === null) {
                message.error(`Nilai linguistik dengan nama '${row.ratingValue}' untuk ${row.influencingCriteriaId} terhadap ${row.influencedCriteriaId} tidak valid.`);
                overallHasValidationError = true;
                return; // Lewati baris ini jika tidak ditemukan atau tidak valid
            }

            // Jika semua lookup berhasil, tambahkan ke array baris yang sudah diproses
            processedCsvRows.push({
                causalityTaskId: row.causalityTaskId,
                reviewerId: row.reviewerId,
                influencingCriteriaId: influencingCrit.id, // Sekarang ini adalah ID
                influencedCriteriaId: influencedCrit.id,   // Sekarang ini adalah ID
                ratingValue: linguisticVal.id,             // Sekarang ini adalah ID
                linguisticAverageValue: linguisticVal.averageValue, // Simpan untuk update state
                linguisticName: linguisticVal.name // Simpan untuk update state
            });
        });

        // Fase 2: Kumpulkan payload dari baris yang sudah diproses (semuanya sudah dalam bentuk ID)
        // Grouping ulang data yang sudah diproses berdasarkan influencingCriteriaId (sekarang ID)
        const groupedByIdInfluencingCriteria = {};
        processedCsvRows.forEach(row => {
            if (!groupedByIdInfluencingCriteria[row.influencingCriteriaId]) {
                groupedByIdInfluencingCriteria[row.influencingCriteriaId] = [];
            }
            groupedByIdInfluencingCriteria[row.influencingCriteriaId].push(row);
        });

        for (const influencingId of Object.keys(groupedByIdInfluencingCriteria)) { // Iterasi berdasarkan ID
            const recordsForThisInfluencing = groupedByIdInfluencingCriteria[influencingId];

            // currentInfluencingCriteria sudah ditemukan di fase 1, tapi kita bisa ambil lagi dari allCriteria
            const currentInfluencingCriteriaObj = allCriteria.find(c => c.id === influencingId);
            // Cek ini seharusnya tidak gagal jika fase 1 berhasil, tapi untuk robustness
            if (!currentInfluencingCriteriaObj) {
                console.error(`Internal Error: Kriteria penginisiasi ID '${influencingId}' tidak ditemukan setelah lookup awal.`);
                overallHasValidationError = true;
                continue;
            }

            recordsForThisInfluencing.forEach(row => {
                const influencedId = row.influencedCriteriaId; // Sudah ID
                const selectedLinguisticValueId = row.ratingValue; // Sudah ID

                const colCriteriaObj = allCriteria.find(c => c.id === influencedId);
                // Cek ini juga seharusnya tidak gagal jika fase 1 berhasil
                if (!colCriteriaObj) {
                    console.error(`Internal Error: Kriteria terpengaruh ID '${influencedId}' untuk '${currentInfluencingCriteriaObj.name}' tidak ditemukan setelah lookup awal.`);
                    overallHasValidationError = true;
                    return;
                }

                const pairKey = `${currentInfluencingCriteriaObj.id}-${colCriteriaObj.id}`;
                const existingRatingInfo = ratingsByPair[pairKey];

                if (selectedLinguisticValueId) {
                    if (existingRatingInfo && existingRatingInfo.alreadyRated && existingRatingInfo.linguisticId === selectedLinguisticValueId) {
                        // console.log(`Skipping unchanged rating for ${pairKey}`);
                        return; // Tidak ada perubahan, lewati
                    }

                    // Ambil linguistic object yang sudah ditemukan di fase 1
                    const selectedLinguistic = linguisticValues.find(lv => lv.id === selectedLinguisticValueId);
                    // Cek ini juga seharusnya tidak gagal jika fase 1 berhasil
                    if (!selectedLinguistic || selectedLinguistic.averageValue === undefined || selectedLinguistic.averageValue === null) {
                        console.error(`Internal Error: Nilai linguistik ID '${selectedLinguisticValueId}' untuk ${currentInfluencingCriteriaObj.name} terhadap ${colCriteriaObj.name} tidak valid setelah lookup awal.`);
                        overallHasValidationError = true;
                        return;
                    }

                    allPayloadsToSubmit.push({
                        causalityTaskId: row.causalityTaskId,
                        reviewerId: row.reviewerId,
                        influencingCriteriaId: currentInfluencingCriteriaObj.id,
                        influencedCriteriaId: colCriteriaObj.id,
                        ratingValue: selectedLinguisticValueId,
                    });
                    allNewRatingsDataUpdates[pairKey] = {
                        numericValue: selectedLinguistic.averageValue !== null ? selectedLinguistic.averageValue.toFixed(2) : 'N/A',
                        linguisticName: selectedLinguistic.name,
                        alreadyRated: true,
                        linguisticId: selectedLinguisticValueId
                    };
                }
            });
        }

        if (overallHasValidationError) {
            message.error("Beberapa baris data CSV mengandung kesalahan validasi (nama kriteria/linguistik tidak ditemukan atau data tidak lengkap). Hanya data valid yang akan diproses.");
        }

        if (allPayloadsToSubmit.length === 0) {
            message.info("Tidak ada rating valid yang ditemukan atau ada perubahan yang akan disimpan dari CSV.");
            setSubmitting(false);
            return;
        }

        console.log("Submitting all collected ratings payloads from CSV:", allPayloadsToSubmit);
        const results = await Promise.allSettled(allPayloadsToSubmit.map(payload => submitCausalityRating(payload)));

        let allSubmissionsSuccessful = true;
        results.forEach((result, index) => {
            if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value && result.value.data && result.value.data.statusCode !== 201)) {
                allSubmissionsSuccessful = false;
                const errorMsg = result.reason?.response?.data?.message || result.value?.data?.message || 'Unknown error';
                const failedPayload = allPayloadsToSubmit[index];
                message.error(`Gagal menyimpan rating untuk ${failedPayload?.influencingCriteriaId || 'N/A'} terhadap ${failedPayload?.influencedCriteriaId || 'N/A'} (Reviewer: ${failedPayload?.reviewerId || 'N/A'}): ${errorMsg}`);
            }
        });

        if (allSubmissionsSuccessful) {
            message.success("Semua rating dari CSV berhasil disimpan!");
            setRatingsByPair(prev => ({ ...prev, ...allNewRatingsDataUpdates }));
        } else {
            message.warning("Beberapa rating dari CSV gagal disimpan. Periksa konsol untuk detail.");
        }

        setSubmitting(false);
    };

    // --- handleFileUpload (tetap sama, hanya memanggil processCsvDataForSubmission) ---
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
                message.error("Hanya file CSV yang diizinkan.");
                return;
            }

            setSubmitting(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csvString = e.target.result;
                try {
                    const parsedData = parseCSV(csvString);
                    if (parsedData.length === 0) {
                        message.info("File CSV kosong atau tidak ada data yang valid.");
                        setSubmitting(false);
                        return;
                    }
                    await processCsvDataForSubmission(parsedData);
                    console.log("CSV data processed and submission attempted.");
                } catch (error) {
                    console.error("Error reading or parsing CSV:", error);
                    message.error("Gagal membaca atau mengurai file CSV: " + error.message);
                } finally {
                    setSubmitting(false);
                }
            };
            reader.readAsText(file);
        } else {
            message.error("Silakan pilih file CSV.");
        }
    };

    // --- isRowFullyRated (tetap sama) ---
    const isRowFullyRated = (influencingCriteriaId) => {
        if (!allCriteria || allCriteria.length === 0) return false;

        const relevantInfluencedCriteria = allCriteria.filter(c => c.id !== influencingCriteriaId);

        return relevantInfluencedCriteria.every(influencedCriteria => {
            const pairKey = `${influencingCriteriaId}-${influencedCriteria.id}`;
            return ratingsByPair[pairKey] && ratingsByPair[pairKey].alreadyRated;
        });
    };

    // --- openMatrixRatingModal (tetap sama) ---
    const openMatrixRatingModal = (influencingCriteria) => {
        setCurrentInfluencingCriteria(influencingCriteria);

        const initialFormValues = {};
        allCriteria.forEach(colCriteria => {
            if (influencingCriteria.id !== colCriteria.id) {
                const pairKey = `${influencingCriteria.id}-${colCriteria.id}`;
                const ratingInfo = ratingsByPair[pairKey];
                if (ratingInfo && ratingInfo.alreadyRated && ratingInfo.linguisticId) {
                    initialFormValues[pairKey] = ratingInfo.linguisticId;
                }
            }
        });
        matrixRatingForm.setFieldsValue(initialFormValues);
        setMatrixRatingModalVisible(true);
    };

    // --- handleMatrixRatingModalSubmit (tetap sama) ---
    const handleMatrixRatingModalSubmit = async () => {
        setSubmitting(true);
        try {
            const values = await matrixRatingForm.validateFields();
            const currentInfluencingId = currentInfluencingCriteria.id;
            const payloads = [];
            const newRatingsDataUpdates = {};
            let hasValidationError = false;

            allCriteria.forEach(colCriteria => {
                if (currentInfluencingId === colCriteria.id) return;

                const pairKey = `${currentInfluencingId}-${colCriteria.id}`;
                const selectedLinguisticValueId = values[pairKey];
                const existingRatingInfo = ratingsByPair[pairKey];

                if (selectedLinguisticValueId) {
                    if (existingRatingInfo && existingRatingInfo.alreadyRated && existingRatingInfo.linguisticId === selectedLinguisticValueId) {
                        return; // No change, skip
                    }

                    const selectedLinguistic = linguisticValues.find(lv => lv.id === selectedLinguisticValueId);
                    if (!selectedLinguistic || selectedLinguistic.averageValue === undefined || selectedLinguistic.averageValue === null) {
                        message.error(`Nilai linguistik untuk ${currentInfluencingCriteria.name} terhadap ${colCriteria.name} tidak valid.`);
                        hasValidationError = true;
                        return;
                    }

                    payloads.push({
                        causalityTaskId: idCausality,
                        reviewerId: userInfo.id,
                        influencingCriteriaId: currentInfluencingId,
                        influencedCriteriaId: colCriteria.id,
                        ratingValue: selectedLinguisticValueId,
                    });
                    newRatingsDataUpdates[pairKey] = {
                        numericValue: selectedLinguistic.averageValue !== null ? selectedLinguistic.averageValue.toFixed(2) : 'N/A',
                        linguisticName: selectedLinguistic.name,
                        alreadyRated: true,
                        linguisticId: selectedLinguisticValueId
                    };
                } else if (!selectedLinguisticValueId && existingRatingInfo && existingRatingInfo.alreadyRated) {
                    // Jika nilai dikosongkan padahal sebelumnya sudah dinilai, kita biarkan nilai lama tetap ada.
                }
            });

            if (hasValidationError) {
                message.error("Terdapat nilai linguistik yang tidak valid. Mohon perbaiki sebelum menyimpan.");
                return;
            }

            if (payloads.length === 0) {
                message.info("Tidak ada perubahan rating yang akan disimpan.");
                setMatrixRatingModalVisible(false);
                matrixRatingForm.resetFields();
                return;
            }

            console.log("Submitting ratings payloads:", payloads);
            const results = await Promise.allSettled(payloads.map(payload => submitCausalityRating(payload)));

            let allSubmissionsSuccessful = true;
            results.forEach(result => {
                if (result.status === 'rejected' || (result.value && result.value.data && result.value.data.statusCode !== 201)) {
                    allSubmissionsSuccessful = false;
                    const errorMsg = result.reason?.response?.data?.message || result.value?.data?.message || 'Unknown error';
                    message.error(`Gagal menyimpan rating untuk ${result.reason?.payload?.influencingCriteriaId || ''} terhadap ${result.reason?.payload?.influencedCriteriaId || ''}: ${errorMsg}`);
                }
            });

            if (allSubmissionsSuccessful) {
                message.success("Rating berhasil disimpan!");
                setRatingsByPair(prev => ({ ...prev, ...newRatingsDataUpdates }));
            } else {
                message.warning("Beberapa rating gagal disimpan. Periksa konsol untuk detail.");
            }

            setMatrixRatingModalVisible(false);
            matrixRatingForm.resetFields();

        } catch (err) {
            console.error("Error submitting ratings:", err);
            message.error(err.message || "Terjadi kesalahan saat menyimpan rating.");
            setMatrixRatingModalVisible(false);
            matrixRatingForm.resetFields();
        } finally {
            setSubmitting(false);
        }
    };

    // --- Rendering UI ---
    if (loading) {
        return (
            <div className="app-container">
                <TypingCard title="Penilaian Kausalitas" source="Memuat data penilaian..." />
                <br />
                <Card>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '16px' }}>Memuat data penilaian...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <TypingCard title="Penilaian Kausalitas" source="Terjadi kesalahan." />
                <br />
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!causalityTask || !allCriteria.length) {
        return (
            <div className="app-container">
                <TypingCard title="Penilaian Kausalitas" source="Tugas tidak ditemukan atau kriteria belum dimuat." />
                <br />
                <Alert message="Informasi" description="Tugas kausalitas tidak ditemukan atau kriteria belum dimuat. Pastikan tugas memiliki kriteria." type="info" showIcon />
            </div>
        );
    }

    const subjectName = findNameById(subjects, causalityTask.subject);

    const mainTableColumns = [
        {
            title: 'Kriteria',
            dataIndex: 'name',
            key: 'criteriaName',
            fixed: 'left',
            width: 200,
        },
        {
            title: 'Status Penilaian',
            dataIndex: 'id',
            key: 'ratingStatus',
            align: 'center',
            width: 150,
            render: (influencingCriteriaId) => {
                const isRated = isRowFullyRated(influencingCriteriaId);
                return isRated ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Sudah Dinilai</Tag>
                ) : (
                    <Tag color="processing">Belum Dinilai</Tag>
                );
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => openMatrixRatingModal(record)}
                    disabled={submitting}
                >
                    Nilai Kriteria
                </Button>
            )
        },
    ];

    return (
        <div className="app-container">
            <TypingCard
                title="Penilaian Kausalitas Kriteria"
                source={`Silahkan berikan penilaian Anda mengenai pengaruh antar kriteria untuk tugas: <strong>${causalityTask.description}</strong> (${subjectName} - Semester ${causalityTask.semester}). Gunakan skala linguistik yang disediakan.`}
            />
            <br />
            <Card title={`Daftar Kriteria untuk Penilaian Tugas: ${subjectName} - ${causalityTask.description}`}>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="csv-upload-input" style={{ marginRight: 8 }}>Import Rating dari CSV:</label>
                    <input
                        id="csv-upload-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={submitting}
                        style={{ display: 'none' }} // Sembunyikan input file asli
                    />
                    <Button
                        type="default"
                        onClick={() => document.getElementById('csv-upload-input').click()}
                        loading={submitting}
                        icon={<PlusOutlined />}
                    >
                        Pilih File CSV
                    </Button>
                    {submitting && <Spin size="small" style={{ marginLeft: 8 }} />}
                </div>
                <Table
                    bordered
                    rowKey="id"
                    dataSource={allCriteria}
                    columns={mainTableColumns}
                    pagination={false}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                />
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                </div>
            </Card>

            <Modal
                title={`Nilai Pengaruh: ${currentInfluencingCriteria?.name} terhadap Kriteria Lain`}
                open={matrixRatingModalVisible}
                onCancel={() => {
                    setMatrixRatingModalVisible(false);
                    matrixRatingForm.resetFields();
                }}
                onOk={handleMatrixRatingModalSubmit}
                confirmLoading={submitting}
                width={700}
            >
                <Form form={matrixRatingForm} layout="vertical">
                    <Table
                        bordered
                        rowKey="id"
                        dataSource={allCriteria.filter(c => c.id !== currentInfluencingCriteria?.id)}
                        pagination={false}
                        showHeader={true}
                        size="small"
                        columns={[
                            {
                                title: 'Kriteria Dipengaruhi',
                                dataIndex: 'name',
                                key: 'influenced_criteria_name',
                                width: 150,
                            },
                            {
                                title: 'Pilih Nilai Pengaruh',
                                key: 'rating_input_column',
                                align: 'center',
                                width: 200,
                                render: (text, influencedCriteria) => {
                                    const influencingId = currentInfluencingCriteria?.id;
                                    const influencedId = influencedCriteria.id;
                                    const pairKey = `${influencingId}-${influencedId}`;
                                    const ratingInfo = ratingsByPair[pairKey];

                                    return (
                                        <Form.Item
                                            name={pairKey}
                                            noStyle
                                            rules={[{ required: true, message: 'Pilih nilai' }]}
                                            initialValue={ratingInfo?.linguisticId}
                                            key={pairKey + (ratingInfo?.linguisticId || 'empty')}
                                        >
                                            <Select
                                                placeholder="Pilih Nilai"
                                                size="small"
                                                style={{ width: '100%' }}
                                                disabled={ratingInfo && ratingInfo.alreadyRated}
                                            >
                                                {linguisticValues.map(lv => (
                                                    <Option key={lv.id} value={lv.id}>
                                                        {lv.name} ({lv.averageValue !== null ? lv.averageValue.toFixed(2) : 'N/A'})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    );
                                }
                            },
                        ]}
                    />
                </Form>
            </Modal>
        </div>
    );
};

export default CausalityRatingPage;