/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Button, message, Tag, Spin, Tooltip, Alert, Modal, Form, Select } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import TypingCard from '@/components/TypingCard';

import { getCausalityByID, submitCausalityRating, getAllCausalityRatingsForTask } from '@/api/causality';
import { reqUserInfo } from '@/api/user';
import { getLinguisticValues } from '@/api/linguisticValue';
import { getQuestionCriterias } from '@/api/questionCriteria';
import { getSubjects } from '@/api/subject';

const { Column } = Table;
const { Option } = Select;

const findNameById = (list, id) => {
    const item = list.find((item) => item.id === id);
    return item ? item.name : id || "-";
};

const CausalityRatingPage = () => {
    const { idCausality } = useParams();
    const [causalityTask, setCausalityTask] = useState(null);
    const [allCriteria, setAllCriteria] = useState([]);
    const [linguisticValues, setLinguisticValues] = useState([]);
    const [ratingsByPair, setRatingsByPair] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const [matrixRatingModalVisible, setMatrixRatingModalVisible] = useState(false);
    const [currentInfluencingCriteria, setCurrentInfluencingCriteria] = useState(null);
    const [matrixRatingForm] = Form.useForm();

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
                    getQuestionCriterias(),
                    getLinguisticValues(),
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
                setAllCriteria(currentTaskRelevantCriteria);

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
                    setLinguisticValues(fetchedLinguisticValues);
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
    }, [idCausality]);

    const isRowFullyRated = (influencingCriteriaId) => {
        if (!allCriteria || allCriteria.length === 0) return false;
        
        const relevantInfluencedCriteria = allCriteria.filter(c => c.id !== influencingCriteriaId);
        
        return relevantInfluencedCriteria.every(influencedCriteria => {
            const pairKey = `${influencingCriteriaId}-${influencedCriteria.id}`;
            return ratingsByPair[pairKey] && ratingsByPair[pairKey].alreadyRated;
        });
    };

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
                // Jangan tutup modal atau reset form di sini. Biarkan user perbaiki.
                message.error("Terdapat nilai linguistik yang tidak valid. Mohon perbaiki sebelum menyimpan.");
                return; // Berhenti jika ada error validasi di loop
            }

            if (payloads.length === 0) {
                message.info("Tidak ada perubahan rating yang akan disimpan.");
                // Tetap tutup modal dan reset form karena tidak ada yang perlu disimpan
                setMatrixRatingModalVisible(false);
                matrixRatingForm.resetFields();
                return;
            }

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
                // Ini akan memicu render ulang komponen utama dengan data yang diperbarui
            } else {
                message.warning("Beberapa rating gagal disimpan. Periksa konsol untuk detail."); // Menggunakan message.warning
            }
            
            // --- PERBAIKAN: Tutup modal dan reset form DI SINI (terlepas dari sukses/gagal submit API) ---
            setMatrixRatingModalVisible(false);
            matrixRatingForm.resetFields();
            // --- AKHIR PERBAIKAN ---

        } catch (err) {
            console.error("Error submitting ratings:", err);
            // Ini akan menangkap error dari matrixRatingForm.validateFields() atau error non-API lainnya
            message.error(err.message || "Terjadi kesalahan saat menyimpan rating.");
            // --- PERBAIKAN: Tutup modal dan reset form jika ada error validasi atau error lain di sini ---
            setMatrixRatingModalVisible(false);
            matrixRatingForm.resetFields();
            // --- AKHIR PERBAIKAN ---
        } finally {
            setSubmitting(false);
        }
    };

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