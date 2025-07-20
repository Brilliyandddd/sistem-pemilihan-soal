/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Button, Table, message, Divider, Image, Tag, Modal, Form, InputNumber, Select, Spin, Alert } from "antd";
import { getQuestionsByRPSQuiz1, getQuizByID } from "@/api/quiz";
import { getLectures } from "@/api/lecture";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { reqUserInfo } from '@/api/user';
import { useParams, Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";
import PropTypes from "prop-types";

import { submitQuestionCriteriaRating, editQuestion } from "@/api/question";
import { getAnswers } from "@/api/answer";
import { getLinguisticValues } from "@/api/linguisticValue";

import {
    DiffOutlined,
    EditOutlined,
    DownOutlined,
    UpOutlined
} from "@ant-design/icons";

const { Column } = Table;
const { Option } = Select;

const getImageUrl = (filePath) => {
    if (!filePath) return null;
    return `http://localhost:8081${filePath}`;
};

// --- Perbaikan: Pindahkan parseCSV ke luar komponen atau buat sebagai helper global ---
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
// --- Akhir perbaikan parseCSV ---

const RateQuestionModal = ({ visible, onCancel, handleRatingSubmit, confirmLoading, question, criteria, linguisticValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && question) {
            const initialValues = {};

            criteria.forEach((crit, index) => {
                const avgValueKey = `averageValue${index + 1}`;
                const currentNumericValue = question[avgValueKey];

                const foundLinguisticValue = linguisticValues.find(lv =>
                    lv.averageValue !== undefined && Math.abs(lv.averageValue - parseFloat(currentNumericValue)) < 0.0001
                );
                initialValues[crit.name] = foundLinguisticValue ? foundLinguisticValue.id : undefined;
            });
            form.setFieldsValue(initialValues);

        } else if (!visible) {
            form.resetFields();
        }
    }, [visible, question, criteria, form, linguisticValues]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            handleRatingSubmit(question.idQuestion, values);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    return (
        <Modal
            title={`Pertanyaan: ${question?.title || ''}`}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={confirmLoading}
            width={600}
        >
            <Form form={form} layout="vertical">

                {question?.file_path && (
                    <div style={{ marginBottom: '16px' }}>
                        <strong>Gambar Pertanyaan:</strong><br/>
                        <Image
                            src={getImageUrl(question.file_path)}
                            alt="Question Image"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '8px' }}
                            fallback="https://via.placeholder.com/200?text=Gambar+Tidak+Ada"
                        />
                    </div>
                )}
                <p><strong>Pilihan Jawaban:</strong></p>
                {question?.formattedAnswers && question.formattedAnswers.length > 0 ? (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {question.formattedAnswers.map((ans, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>
                                {ans.is_right ? (
                                    <Tag color="green" style={{ fontSize: '0.9em' }}>
                                        ✔ {ans.title} (Jawaban Benar)
                                    </Tag>
                                ) : (
                                    <Tag color="default" style={{ fontSize: '0.9em' }}>
                                        {ans.title}
                                    </Tag>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontStyle: 'italic' }}>Tidak ada pilihan jawaban ditemukan.</p>
                )}

                <Divider />
                <h4>Nilai Kriteria:</h4>
                {criteria.map((crit, index) => (
                    <Form.Item
                        key={crit.id}
                        label={crit.name}
                        name={crit.name} // Form field name is criterion name
                        rules={[{ required: true, message: `Harap pilih nilai untuk ${crit.name}` }]}
                    >
                        <Select
                            placeholder={`Pilih nilai untuk ${crit.name}`}
                            style={{ width: '100%' }}
                        >
                            {linguisticValues.map(lv => (
                                <Option key={lv.id} value={lv.id}>
                                    {lv.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                ))}
            </Form>
        </Modal>
    );
};

RateQuestionModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    handleRatingSubmit: PropTypes.func.isRequired,
    confirmLoading: PropTypes.bool,
    question: PropTypes.object,
    criteria: PropTypes.array.isRequired,
    linguisticValues: PropTypes.array.isRequired,
    lecturers: PropTypes.array,
};
RateQuestionModal.defaultProps = {
    confirmLoading: false,
    question: null,
    lecturers: [],
};


const QuestionIndexQuiz1 = () => {
    const { quizID } = useParams();
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionID, setSelectedQuestionID] = useState(null);
    const [quizDetails, setQuizDetails] = useState(null);
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [currentQuestionForRating, setCurrentQuestionForRating] = useState(null);
    const [ratingModalLoading, setRatingModalLoading] = useState(false);
    const [criteria, setCriteria] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [linguisticValues, setLinguisticValues] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    const [expandedQuestionId, setExpandedQuestionId] = useState(null);
    const [fileUploadLoading, setFileUploadLoading] = useState(false); // State untuk loading impor CSV

    const fetchUserInfo = async () => {
        try {
            const response = await reqUserInfo();
            if (response.status === 200) {
                setUserInfo(response.data.id.toLowerCase());
            } else {
                console.error("Failed to fetch user info:", response.data.message);
                message.error("Gagal memuat informasi pengguna.");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            message.error("Terjadi kesalahan saat memuat informasi pengguna.");
        }
    };

    const findNameById = (list, id, idKey = "id", nameKey = "name") => {
        const item = list.find((item) => String(item[idKey]) === String(id));
        return item ? item[nameKey] : null;
    };
    const getCriterionName = (criterionId, criteriaList) => {
        return findNameById(criteriaList, criterionId, "id", "name");
    };

    const fetchInitialData = async (quizId) => {
        console.log("Frontend: Memuat detail kuis untuk quizId:", quizId);
        try {
            const quizResult = await getQuizByID(quizId);
            const criteriaResult = await getQuestionCriterias();
            const lecturersResult = await getLectures();
            const linguisticValuesResult = await getLinguisticValues();

            let currentUserInfoId = null;
            try {
                const userInfoResponse = await reqUserInfo();
                if (userInfoResponse.status === 200) {
                    currentUserInfoId = userInfoResponse.data.id.toLowerCase();
                    setUserInfo(currentUserInfoId);
                } else {
                    console.error("Failed to fetch user info:", userInfoResponse.data.message);
                    message.error("Gagal memuat informasi pengguna.");
                }
            } catch (error) {
                console.error("Error fetching user info in fetchInitialData:", error);
                message.error("Terjadi kesalahan saat memuat informasi pengguna.");
            }

            let fetchedCriteria = [];
            if (criteriaResult.status === 200 && criteriaResult.data && criteriaResult.data.content) {
                fetchedCriteria = criteriaResult.data.content;
                setCriteria(fetchedCriteria);
            } else {
                console.warn("Failed to load criteria for modal/columns.");
                setCriteria([]);
            }
            if (lecturersResult.status === 200 && lecturersResult.data && lecturersResult.data.content) {
                setLecturers(lecturersResult.data.content);
            } else {
                console.warn("Failed to load lecturers for modal.");
                setLecturers([]);
            }
            let fetchedLinguisticValues = [];
            if (linguisticValuesResult.status === 200 && linguisticValuesResult.data && linguisticValuesResult.data.content) {
                fetchedLinguisticValues = linguisticValuesResult.data.content;
                setLinguisticValues(fetchedLinguisticValues);
                console.log("Fetched Linguistic Values (with averageValue):", fetchedLinguisticValues);
            } else {
                console.warn("Failed to load linguistic values.");
                setLinguisticValues([]);
            }

            if (quizResult.status === 200 && quizResult.data) {
                setQuizDetails(quizResult.data);
                const quizQuestions = quizResult.data.questions || [];

                if (quizQuestions.length === 0) {
                    message.warn("Kuis ini tidak memiliki pertanyaan yang terdaftar.");
                }

                console.log("Frontend: Data pertanyaan KUIS yang DITERIMA DARI BACKEND sebelum pengurutan:", quizQuestions);

                const sortedQuizQuestions = [...quizQuestions].sort((a, b) => {
                    if (a.idQuestion && b.idQuestion) {
                        return a.idQuestion.localeCompare(b.idQuestion);
                    }
                    return 0;
                });
                console.log("Frontend: Data pertanyaan KUIS yang DITERIMA DARI BACKEND SETELAH pengurutan:", sortedQuizQuestions);


                const questionsWithRatingsForTable = sortedQuizQuestions
                    .filter(q => q.examType2 === "QUIZ")
                    .map(q => {
                        const questionCopy = { ...q };

                        console.log(`DEBUG fetchInitialData: Raw question for table processing (ID: ${q.idQuestion}):`, q);

                        if (questionCopy.questionRating && questionCopy.questionRating.reviewerRatings && currentUserInfoId) {
                            const reviewerKey = Object.keys(questionCopy.questionRating.reviewerRatings).find(
                                key => key.toLowerCase() === currentUserInfoId.toLowerCase()
                            );

                            if (reviewerKey) {
                                const userRating = questionCopy.questionRating.reviewerRatings[reviewerKey];
                                for (let i = 1; i <= fetchedCriteria.length; i++) {
                                    const avgValueKey = `averageValue${i}`;
                                    questionCopy[avgValueKey] = userRating[avgValueKey];
                                    console.log(`DEBUG fetchInitialData: Flattened ${avgValueKey} for ${questionCopy.idQuestion} to:`, questionCopy[avgValueKey]);
                                }
                            } else {
                                console.log(`DEBUG fetchInitialData: No rating found for user (${currentUserInfoId}) for question ${questionCopy.idQuestion}. Setting averageValues to null.`);
                                for (let i = 1; i <= fetchedCriteria.length; i++) {
                                    const avgValueKey = `averageValue${i}`;
                                    questionCopy[avgValueKey] = null;
                                }
                            }
                        } else {
                            console.log(`DEBUG fetchInitialData: questionRating or reviewerRatings missing for question ${questionCopy.idQuestion} OR userInfo missing. Setting averageValues to null.`);
                            for (let i = 1; i <= fetchedCriteria.length; i++) {
                                const avgValueKey = `averageValue${i}`;
                                questionCopy[avgValueKey] = null;
                            }
                        }
                        console.log(`     Question ${questionCopy.idQuestion} (Processed for Table):`, questionCopy);
                        return questionCopy;
                    });

                return questionsWithRatingsForTable;
            } else {
                message.error(quizResult.data?.message || "Gagal memuat detail kuis atau konten kosong.");
            }
        } catch (error) {
            console.error("Frontend: Error saat memuat pertanyaan kuis:", error);
            message.error("Frontend: Terjadi kesalahan saat memuat data pertanyaan kuis.");
        }
        return [];
    };

    useEffect(() => {
        if (quizID) {
            fetchInitialData(quizID).then((data) => {
                setQuestions(data);
            });
        }
    }, [quizID]);

    const handleLinkClick = (idQuestion) => {
        setSelectedQuestionID(idQuestion);
    };

    const handleOpenRatingModal = async (question) => {
        setRatingModalLoading(true);
        try {
            const answerResult = await getAnswers(question.idQuestion);

            let formattedAnswers = [];
            if (answerResult.status === 200 && answerResult.data?.content?.length > 0) {
                formattedAnswers = answerResult.data.content.map(ans => ({
                    title: ans.title,
                    is_right: ans.is_right
                }));
            }

            const currentReviewerId = userInfo;
            let reviewerRatings = {};

            if (question.questionRating?.reviewerRatings) {
                reviewerRatings = question.questionRating.reviewerRatings;

                const reviewerKey = Object.keys(reviewerRatings).find(
                    key => key.toLowerCase() === currentReviewerId.toLowerCase()
                );

                if (reviewerKey) {
                    reviewerRatings[currentReviewerId] = reviewerRatings[reviewerKey];
                } else {
                    reviewerRatings[currentReviewerId] = {};
                }
            } else {
                reviewerRatings[currentReviewerId] = {};
            }

            const questionWithAnswersAndRatings = {
                ...question,
                formattedAnswers,
                questionRating: {
                    ...question.questionRating,
                    reviewerRatings
                }
            };

            for (let i = 1; i <= criteria.length; i++) {
                const avgValueKey = `averageValue${i}`;
                questionWithAnswersAndRatings[avgValueKey] =
                    reviewerRatings[currentReviewerId]?.[avgValueKey] || null;
            }

            setCurrentQuestionForRating(questionWithAnswersAndRatings);
            setIsRatingModalVisible(true);
        } catch (error) {
            console.error("Error in handleOpenRatingModal:", error);
            message.error("Gagal memuat data pertanyaan");
        } finally {
            setRatingModalLoading(false);
        }
    };

    // --- handleRatingSubmit yang dimodifikasi untuk menerima payload lengkap atau ratingValues ---
    const handleRatingSubmit = async (questionId, ratingValuesOrFullPayload) => {
        setRatingModalLoading(true);
        try {
            let finalQuestionRequestPayload;

            // Perbaikan: gunakan Object.prototype.hasOwnProperty.call
            if (Object.prototype.hasOwnProperty.call(ratingValuesOrFullPayload, 'linguisticValue1Id')) {
                // Ini berarti argumen kedua adalah payload lengkap dari CSV
                finalQuestionRequestPayload = ratingValuesOrFullPayload;
            } else {
                // Ini berarti argumen kedua adalah ratingValues dari modal (nama kriteria -> ID linguistik)
                const ratingValuesFromModal = ratingValuesOrFullPayload;

                const targetQuestion = questions.find(q => q.idQuestion === questionId);
                if (!targetQuestion) {
                    message.error(`Pertanyaan dengan ID ${questionId} tidak ditemukan.`);
                    setRatingModalLoading(false); // Pastikan loading direset
                    return;
                }

                finalQuestionRequestPayload = {
                    idQuestion: questionId,
                    reviewer: userInfo, // Gunakan userInfo dari state
                };

                // Inisialisasi semua linguisticValueXId dan averageValueX dengan null
                for (let i = 1; i <= criteria.length; i++) {
                    const avgKey = `averageValue${i}`;
                    const lingIdKey = `linguisticValue${i}Id`;
                    finalQuestionRequestPayload[avgKey] = null;
                    finalQuestionRequestPayload[lingIdKey] = null;
                }

                Object.keys(ratingValuesFromModal).forEach(criterionName => {
                    const selectedLinguisticValueId = ratingValuesFromModal[criterionName]; // Ini sudah ID linguistik
                    const linguisticObject = linguisticValues.find(lv => lv.id === selectedLinguisticValueId);
                    const criterionIndex = criteria.findIndex(c => c.name === criterionName) + 1;

                    if (linguisticObject && criterionIndex >= 1 && criterionIndex <= criteria.length) {
                        finalQuestionRequestPayload[`averageValue${criterionIndex}`] = linguisticObject.averageValue;
                        finalQuestionRequestPayload[`linguisticValue${criterionIndex}Id`] = linguisticObject.id;
                    } else {
                        console.warn(`Could not find linguistic value (ID: ${selectedLinguisticValueId}) or criterion (Name: ${criterionName}). Skipping.`);
                    }
                });
            }

            console.log("Final QuestionRequest Payload being sent:", finalQuestionRequestPayload);

            const response = await submitQuestionCriteriaRating(finalQuestionRequestPayload, questionId);

            if (response.status === 200) {
                message.success(`Penilaian untuk ${questionId} berhasil disimpan!`);
                if (isRatingModalVisible) {
                    setIsRatingModalVisible(false);
                }

                await fetchInitialData(quizID).then(data => {
                    setQuestions(data);
                    console.log("Frontend: Table data updated with new questions state.");
                });

            } else {
                message.error(response.data?.message || `Gagal menyimpan penilaian untuk ${questionId}. Silakan coba lagi.`);
            }

        } catch (error) {
            console.error("Error submitting rating:", error);
            message.error(`Terjadi kesalahan saat menyimpan penilaian untuk ${questionId}. Silakan coba lagi.`);
        } finally {
            setRatingModalLoading(false);
        }
    };

    const getLinguisticTermForTable = (numericValue) => {
        const valueAsNumber = parseFloat(numericValue);

        if (numericValue === null || numericValue === undefined || isNaN(valueAsNumber) || valueAsNumber === 0) {
            return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.8em' }}>Belum dinilai</Tag>;
        }

        const tolerance = 0.0001;

        const found = linguisticValues.find(lv =>
            lv.averageValue !== undefined && Math.abs(lv.averageValue - valueAsNumber) < tolerance
        );

        if (found) {
            return <Tag color="blue" style={{ fontWeight: 'bold' }}>{found.name}</Tag>;
        }

        return <Tag color="green" style={{ fontWeight: 'bold' }}>{valueAsNumber.toFixed(4)}</Tag>;
    };


    const getCriteriaValueColumns = () => {
        if (criteria.length === 0) return [];
        return criteria.map((crit, index) => ({
            title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{crit.name}</span>,
            key: `avg_val_${crit.id}`,
            align: 'center',
            width: 100,
            render: (_, row) => {
                const avgValueKey = `averageValue${index + 1}`;
                const valueToDisplay = row[avgValueKey];
                console.log(`DEBUG getCriteriaValueColumns: Rendering ${row.idQuestion} - ${crit.name}. Value:`, valueToDisplay);
                return getLinguisticTermForTable(valueToDisplay);
            },
        }));
    };

    // --- FUNGSI handleImportCsv yang diperbarui ---
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

        setFileUploadLoading(true);
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

                if (criteria.length === 0 || linguisticValues.length === 0) {
                    message.error("Data kriteria atau nilai linguistik belum dimuat. Mohon refresh halaman dan coba lagi.");
                    return;
                }
                
                // Urutkan kriteria berdasarkan ID (tetap penting untuk pemetaan yang konsisten)
                const sortedCriteria = [...criteria].sort((a, b) => a.id.localeCompare(b.id));

                const submissionPromises = [];

                for (const row of parsedData) {
                    const questionIdFromCsv = row.idQuestion;
                    // Verifikasi idQuestion ada di daftar pertanyaan kuis yang sudah dimuat
                    const existingQuestion = questions.find(q => q.idQuestion === questionIdFromCsv);
                    if (!existingQuestion) {
                        message.warn(`Pertanyaan dengan ID '${questionIdFromCsv}' dari CSV tidak ditemukan di kuis ini. Dilewati.`);
                        failureCount++;
                        continue;
                    }

                    // --- Bangun payload lengkap sesuai format yang Anda inginkan ---
                    const fullPayloadFromCsv = {
                        idQuestion: questionIdFromCsv,
                        reviewer: row.reviewer || userInfo, // Ambil reviewer dari CSV, fallback ke userInfo
                    };

                    let rowHasError = false;

                    for (let i = 1; i <= criteria.length; i++) { // Iterasi hingga 10 kriteria
                        const linguisticValueNameKey = `linguisticValue${i}Id`; // Nama kolom di CSV untuk NAMA linguistik
                        const averageValueKey = `averageValue${i}`; // Nama kolom di CSV untuk averageValue

                        const linguisticValueNameFromCsv = row[linguisticValueNameKey];
                        const averageValueFromCsv = row[averageValueKey]; // Ini string dari CSV, perlu parse float

                        // Inisialisasi dengan null
                        fullPayloadFromCsv[linguisticValueNameKey] = null;
                        fullPayloadFromCsv[averageValueKey] = null;

                        // Lookup dan set linguisticValueXId (NAMA ke ID)
                        if (linguisticValueNameFromCsv) {
                            const foundLinguisticValue = linguisticValues.find(lv => lv.name === linguisticValueNameFromCsv);
                            if (foundLinguisticValue) {
                                fullPayloadFromCsv[linguisticValueNameKey] = foundLinguisticValue.id; // Ini yang berubah: simpan ID linguistik
                                
                                // Jika averageValue tidak ada di CSV, ambil dari objek linguistik
                                if (averageValueFromCsv === undefined || averageValueFromCsv === null || averageValueFromCsv.trim() === '') {
                                    fullPayloadFromCsv[averageValueKey] = foundLinguisticValue.averageValue;
                                }
                            } else {
                                message.warn(`Nilai linguistik dengan nama '${linguisticValueNameFromCsv}' untuk kriteria ke-${i} di pertanyaan '${questionIdFromCsv}' tidak valid. Dilewati.`);
                                rowHasError = true;
                            }
                        }

                        // Set averageValueX (dari CSV jika ada, atau dari linguisticValue jika ditemukan, atau null)
                        if (averageValueFromCsv !== undefined && averageValueFromCsv !== null && averageValueFromCsv.trim() !== '') {
                            const parsedAvgValue = parseFloat(averageValueFromCsv);
                            if (!isNaN(parsedAvgValue)) {
                                fullPayloadFromCsv[averageValueKey] = parsedAvgValue;
                            } else {
                                message.warn(`Nilai rata-rata '${averageValueFromCsv}' untuk kriteria ke-${i} di pertanyaan '${questionIdFromCsv}' tidak valid. Dilewati.`);
                                rowHasError = true;
                            }
                        }
                    } // End of criteria loop

                    if (rowHasError) {
                        failureCount++;
                        continue; // Lewati baris ini jika ada error di dalamnya
                    }

                    // Tambahkan Promise untuk submit payload ini
                    // handleRatingSubmit sekarang menerima payload yang sudah lengkap
                    submissionPromises.push(
                        (async () => {
                            try {
                                await handleRatingSubmit(questionIdFromCsv, fullPayloadFromCsv);
                                successCount++;
                                return { status: 'fulfilled', id: questionIdFromCsv };
                            } catch (submitError) {
                                console.error(`Error during submit for question ${questionIdFromCsv}:`, submitError);
                                failureCount++;
                                return { status: 'rejected', id: questionIdFromCsv, error: submitError };
                            }
                        })()
                    );
                } // End of parsedData loop

                await Promise.allSettled(submissionPromises); // Tunggu semua submit selesai

                if (successCount > 0 && failureCount === 0) {
                    message.success(`Berhasil mengimpor dan menyimpan ${successCount} rating dari CSV!`);
                } else if (successCount > 0 && failureCount > 0) {
                    message.warning(`Impor CSV selesai dengan ${successCount} berhasil dan ${failureCount} gagal. Periksa konsol untuk detail.`);
                } else if (failureCount > 0) {
                    message.error(`Gagal mengimpor semua rating dari CSV. Total ${failureCount} kegagalan. Periksa konsol untuk detail.`);
                } else {
                    message.info("Tidak ada rating yang diproses dari file CSV.");
                }

            } catch (error) {
                console.error("Error reading or parsing CSV:", error);
                message.error("Gagal membaca atau mengurai file CSV: " + error.message);
            } finally {
                setFileUploadLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div>
            <TypingCard source={`Daftar Pertanyaan Kuis: ${quizDetails?.name || 'Memuat...'}`} />
            <Card title={`Daftar Pertanyaan Kuis: ${quizDetails?.name || 'Memuat...'}`}>
                {/* Input untuk mengimpor CSV */}
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="csv-import-input" style={{ marginRight: 8 }}>Import Rating CSV:</label>
                    <input
                        id="csv-import-input"
                        type="file"
                        accept=".csv"
                        onChange={handleImportCsv}
                        disabled={fileUploadLoading || ratingModalLoading}
                        style={{ display: 'none' }}
                    />
                    <Button
                        type="default"
                        onClick={() => document.getElementById('csv-import-input').click()}
                        loading={fileUploadLoading || ratingModalLoading}
                        icon={<DiffOutlined />}
                    >
                        Impor CSV Rating
                    </Button>
                </div>

                <Table
                    dataSource={questions}
                    pagination={false}
                    rowKey="idQuestion"
                    scroll={{ x: 'max-content' }}
                >
                    <Column
                        title="ID Pertanyaan"
                        dataIndex="idQuestion"
                        key="idQuestion"
                        align="center"
                        width={120}
                    />
                    <Column
                        title="Pertanyaan"
                        dataIndex="title"
                        key="title"
                        align="left"
                        width={250}
                        render={(text, row) => {
                            const isExpanded = row.idQuestion === expandedQuestionId;
                            const displayTitle = text || '';
                            const truncatedText = displayTitle.length > 100 ? `${displayTitle.substring(0, 97)}...` : displayTitle;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <p style={{ margin: 0, fontWeight: 'normal',
                                            maxHeight: isExpanded ? 'none' : '40px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: isExpanded ? 'normal' : 'nowrap',
                                            width: '100%'
                                            }}>
                                        {isExpanded ? displayTitle : truncatedText}
                                    </p>
                                    {displayTitle.length > 100 && (
                                        <Button
                                            type="link"
                                            onClick={() => setExpandedQuestionId(isExpanded ? null : row.idQuestion)}
                                            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                                            size="small"
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            {isExpanded ? 'Sembunyikan' : 'Lihat lebih banyak'}
                                        </Button>
                                    )}

                                    {row.file_path && (
                                        <Image
                                            src={getImageUrl(row.file_path)}
                                            alt="Question Image"
                                            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain', marginTop: '8px' }}
                                            fallback="https://via.placeholder.com/150?text=Gambar+Tidak+Ada"
                                        />
                                    )}
                                </div>
                            );
                        }}
                    />

                    {getCriteriaValueColumns().map((col, index) => <Column {...col} key={index} />)}

                    <Column
                        title="Operasi"
                        key="action"
                        align="center"
                        width={120}
                        fixed="right"
                        render={(_, row) => (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<EditOutlined />}
                                title="Nilai Pertanyaan"
                                onClick={() => handleOpenRatingModal(row)}
                                disabled={fileUploadLoading || ratingModalLoading}
                            />
                        )}
                    />
                </Table>
            </Card>

            <RateQuestionModal
                visible={isRatingModalVisible}
                onCancel={() => setIsRatingModalVisible(false)}
                handleRatingSubmit={handleRatingSubmit}
                confirmLoading={ratingModalLoading}
                question={currentQuestionForRating}
                criteria={criteria}
                lecturers={lecturers}
                linguisticValues={linguisticValues}
            />
        </div>
    );
};

export default QuestionIndexQuiz1;