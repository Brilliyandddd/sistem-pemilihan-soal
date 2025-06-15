/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Button, Table, message, Divider, Image, Tag, Modal, Form, InputNumber, Select, Spin, Alert } from "antd"; // Tambahkan Spin, Alert
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

const RateQuestionModal = ({ visible, onCancel, handleRatingSubmit, confirmLoading, question, criteria, linguisticValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && question) {
            const initialValues = {};
            
            criteria.forEach((crit, index) => {
                const avgValueKey = `averageValue${index + 1}`;
                // Get the current numeric value for this criterion from the question object.
                // Assuming 'question' object has direct properties like averageValue1, averageValue2, etc.
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
                        name={crit.name}
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

    const fetchUserInfo = async () => {
        try {
            const response = await reqUserInfo();
            if (response.status === 200) {
                setUserInfo(response.data.id.toLowerCase()); // Ensure userInfo is lowercase
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

            if (criteriaResult.status === 200 && criteriaResult.data && criteriaResult.data.content) {
                setCriteria(criteriaResult.data.content);
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
            if (linguisticValuesResult.status === 200 && linguisticValuesResult.data && linguisticValuesResult.data.content) {
                setLinguisticValues(linguisticValuesResult.data.content);
                console.log("Fetched Linguistic Values (with averageValue):", linguisticValuesResult.data.content);
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

                // --- BARU: Urutkan pertanyaan berdasarkan idQuestion ---
                const sortedQuizQuestions = [...quizQuestions].sort((a, b) => {
                    if (a.idQuestion && b.idQuestion) {
                        return a.idQuestion.localeCompare(b.idQuestion);
                    }
                    return 0; // Jangan ubah urutan jika ID tidak ada
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
                                for (let i = 1; i <= 10; i++) {
                                    const avgValueKey = `averageValue${i}`;
                                    questionCopy[avgValueKey] = userRating[avgValueKey];
                                    console.log(`DEBUG fetchInitialData: Flattened ${avgValueKey} for ${questionCopy.idQuestion} to:`, questionCopy[avgValueKey]);
                                }
                            } else {
                                console.log(`DEBUG fetchInitialData: No rating found for user (${currentUserInfoId}) for question ${questionCopy.idQuestion}. Setting averageValues to null.`);
                                for (let i = 1; i <= 10; i++) {
                                    const avgValueKey = `averageValue${i}`;
                                    questionCopy[avgValueKey] = null;
                                }
                            }
                        } else {
                            console.log(`DEBUG fetchInitialData: questionRating or reviewerRatings missing for question ${questionCopy.idQuestion} OR userInfo missing. Setting averageValues to null.`);
                            for (let i = 1; i <= 10; i++) {
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
                    // Update the local reviewerRatings with the correctly cased key
                    reviewerRatings[currentReviewerId] = reviewerRatings[reviewerKey];
                } else {
                    // If no rating for the current user, ensure it's an empty object, not undefined
                    reviewerRatings[currentReviewerId] = {}; 
                }
            } else {
                reviewerRatings[currentReviewerId] = {}; // Initialize if questionRating or reviewerRatings is missing
            }

            const questionWithAnswersAndRatings = {
                ...question,
                formattedAnswers,
                questionRating: {
                    ...question.questionRating, // Ensure existing questionRating properties are copied
                    reviewerRatings // Assign the (possibly modified) reviewerRatings map
                }
            };

            for (let i = 1; i <= 10; i++) {
                const avgValueKey = `averageValue${i}`;
                // Populate with existing rating or null if not present
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

    const handleRatingSubmit = async (questionId, ratingValues) => {
        setRatingModalLoading(true);
        try {
            const updatedQuestionPayload = { ...currentQuestionForRating };

            for (let i = 1; i <= 10; i++) {
                updatedQuestionPayload[`averageValue${i}`] = updatedQuestionPayload[`averageValue${i}`] || null;
            }

            Object.keys(ratingValues).forEach(criterionName => {
                const selectedLinguisticValueId = ratingValues[criterionName];
                const linguisticObject = linguisticValues.find(lv => lv.id === selectedLinguisticValueId);
                const criterionIndex = criteria.findIndex(c => c.name === criterionName) + 1; 

                if (linguisticObject && criterionIndex >= 1 && criterionIndex <= 10) {
                    updatedQuestionPayload[`averageValue${criterionIndex}`] = linguisticObject.averageValue;
                } else {
                    console.warn(`Could not find linguistic value or criterion for ${criterionName}.`);
                }
            });

            const isFullyRated = criteria.every((crit, index) => {
                const avgValueKey = `averageValue${index + 1}`;
                return updatedQuestionPayload[avgValueKey] !== null && updatedQuestionPayload[avgValueKey] !== undefined && updatedQuestionPayload[avgValueKey] !== 0;
            });
            updatedQuestionPayload.is_rated = isFullyRated;

            const finalQuestionRequestPayload = {
                idQuestion: updatedQuestionPayload.idQuestion,
                reviewer: userInfo, 
                averageValue1: updatedQuestionPayload.averageValue1,
                averageValue2: updatedQuestionPayload.averageValue2,
                averageValue3: updatedQuestionPayload.averageValue3,
                averageValue4: updatedQuestionPayload.averageValue4,
                averageValue5: updatedQuestionPayload.averageValue5,
                averageValue6: updatedQuestionPayload.averageValue6,
                averageValue7: updatedQuestionPayload.averageValue7,
                averageValue8: updatedQuestionPayload.averageValue8,
                averageValue9: updatedQuestionPayload.averageValue9,
                averageValue10: updatedQuestionPayload.averageValue10,
            };

            console.log("Final QuestionRequest Payload being sent:", finalQuestionRequestPayload);

            const response = await submitQuestionCriteriaRating(finalQuestionRequestPayload, questionId);

            if (response.status === 200) {
                message.success("Penilaian berhasil disimpan!");
                setIsRatingModalVisible(false);

                // Re-fetch data to update the table
                await fetchInitialData(quizID).then(data => {
                    setQuestions(data);
                    console.log("Frontend: Table data updated with new questions state.");
                });

            } else {
                message.error(response.data?.message || "Gagal menyimpan penilaian. Silakan coba lagi.");
            }

        } catch (error) {
            console.error("Error submitting rating:", error);
            message.error("Terjadi kesalahan saat menyimpan penilaian. Silakan coba lagi.");
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

      return (
          <div>
               <TypingCard source={`Daftar Pertanyaan Kuis: ${quizDetails?.name || 'Memuat...'}`} />
               <Card title={`Daftar Pertanyaan Kuis: ${quizDetails?.name || 'Memuat...'}`}>
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