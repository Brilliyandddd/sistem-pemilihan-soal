/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Button, Table, message, Divider, Image, Tag, Modal, Form, InputNumber, Select } from "antd";
import { getQuestionsByRPSQuiz1, getQuizByID } from "@/api/quiz"; // getQuizByID is the one returning the Quiz object with nested Questions
import { getLectures } from "@/api/lecture";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { useParams, Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";
import PropTypes from "prop-types";

import { submitQuestionCriteriaRating } from "@/api/question";
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

const RateQuestionModal = ({ visible, onCancel, onOk, confirmLoading, question, criteria, linguisticValues }) => {
  const [form] = Form.useForm();

  // Helper to find linguistic term from a numeric value for display purposes
  // This is used for setting initial values based on existing averageValueX from backend
  const getLinguisticTerm = (numericValue) => {
    // Using a tolerance for finding the linguistic term from numeric value
    const tolerance = 0.0001; // Adjust as needed
    const found = linguisticValues.find(lv => Math.abs(lv.averageValue - numericValue) < tolerance);
    return found ? found.name : undefined; 
  };

  useEffect(() => {
    if (visible && question) {
      const initialValues = {};
      criteria.forEach((crit, index) => {
        const avgValueKey = `averageValue${index + 1}`;
        // currentNumericValue could be undefined if not yet rated
        const currentNumericValue = question[avgValueKey]; 
        
        // Find the corresponding linguistic value ID for initial selection
        // We find the linguistic value that matches the numeric averageValue from the question
        // then set the form field to its unique 'id' (e.g., "LV001")
        // Apply parseFloat and tolerance here as well to accurately match existing values
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
      onOk(question.idQuestion, values);
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
                // Use lv.id as value for unique identification in the form
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
  onOk: PropTypes.func.isRequired,
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

  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

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
      const quizResult = await getQuizByID(quizId); // This call should return updated Question data
      const criteriaResult = await getQuestionCriterias();
      const lecturersResult = await getLectures();
      const linguisticValuesResult = await getLinguisticValues();

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
        const quizQuestions = quizResult.data.questions || []; // Array of Question objects

        if (quizQuestions.length === 0) {
          message.warn("Kuis ini tidak memiliki pertanyaan yang terdaftar.");
        }

        const filteredQuestions = quizQuestions.filter(q => q.examType2 === "QUIZ");
        
        // --- LOG DATA YANG DITERIMA DARI BACKEND UNTUK VERIFIKASI ---
        console.log("Frontend: Data pertanyaan KUIS yang DITERIMA DARI BACKEND setelah re-fetch:");
        filteredQuestions.forEach((q, index) => {
          console.log(`  Question ${index + 1} (ID: ${q.idQuestion}):`, {
            is_rated: q.is_rated,
            avg1: q.averageValue1,
            avg2: q.averageValue2,
            avg3: q.averageValue3,
            avg4: q.averageValue4,
            avg5: q.averageValue5,
            avg6: q.averageValue6,
            avg7: q.averageValue7,
            avg8: q.averageValue8,
            avg9: q.averageValue9,
            avg10: q.averageValue10
          });
        });
        // --- AKHIR LOG ---

        return filteredQuestions;
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

      if (answerResult.status === 200 && answerResult.data && answerResult.data.content && answerResult.data.content.length > 0) {
        formattedAnswers = answerResult.data.content.map(ans => ({
          title: ans.title,
          is_right: ans.is_right
        }));
      } else {
        message.warn("Pilihan jawaban untuk pertanyaan ini tidak ditemukan.");
      }

      const questionWithAnswers = {
        ...question,
        formattedAnswers: formattedAnswers,
      };

      setCurrentQuestionForRating(questionWithAnswers);
      setIsRatingModalVisible(true);
    } catch (error) {
      console.error("Error fetching answer options:", error);
      message.error("Gagal memuat pilihan jawaban. Silakan coba lagi.");
    } finally {
      setRatingModalLoading(false);
    }
  };

  const handleRatingSubmit = async (questionId, ratingValues) => {
    setRatingModalLoading(true);
    try {
      const payload = Object.keys(ratingValues).map(criterionName => {
        // selectedLinguisticValueId is the unique 'id' (e.g., "LV001")
        const selectedLinguisticValueId = ratingValues[criterionName]; 
        
        // Find the full linguistic object using its unique 'id'
        const linguisticObject = linguisticValues.find(lv => lv.id === selectedLinguisticValueId);
        
        if (!linguisticObject) {
            console.warn(`Linguistic value with ID ${selectedLinguisticValueId} not found.`);
            return null;
        }
        
        const criterion = criteria.find(c => c.name === criterionName);
        if (!criterion) {
            console.warn(`Criterion with name ${criterionName} not found.`);
            return null;
        }

        return {
          questionId: questionId,
          criterionId: criterion.id,
          // Use the actual averageValue from the found linguisticObject
          ratingValue: linguisticObject.averageValue, 
        };
      }).filter(item => item !== null); // Filter out any nulls if lookups failed

      console.log("Payload being sent (final check):", payload);

      const response = await submitQuestionCriteriaRating(payload);

      if (response.status === 200) {
        message.success("Penilaian berhasil disimpan!");
        setIsRatingModalVisible(false); // Close modal on success

        // Re-fetch all data to update the table with the new ratings
        // This is the correct way to get the latest state from the backend
        fetchInitialData(quizID).then(data => {
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

  // Helper to get linguistic term from numeric value for table display
  const getLinguisticTermForTable = (numericValue) => {
    const valueAsNumber = parseFloat(numericValue);

    // Check if it's not a valid number or 0 (for "Belum dinilai")
    if (numericValue === null || numericValue === undefined || isNaN(valueAsNumber) || valueAsNumber === 0) {
      return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.8em' }}>Belum dinilai</Tag>;
    }

    // Define a small tolerance for floating-point comparison
    const tolerance = 0.0001; // Adjust this value if needed (e.g., 0.00001 for higher precision)

    // Find the linguistic value that matches the numeric averageValue within the tolerance
    const found = linguisticValues.find(lv => 
      lv.averageValue !== undefined && Math.abs(lv.averageValue - valueAsNumber) < tolerance
    );

    if (found) {
      return <Tag color="blue" style={{ fontWeight: 'bold' }}>{found.name}</Tag>; // Display the name as a blue tag
    }
    
    // Fallback: If no linguistic term matches closely, display the number itself (rounded)
    // Use green tag for numeric values that don't map to a specific linguistic term
    return <Tag color="green" style={{ fontWeight: 'bold' }}>{valueAsNumber.toFixed(4)}</Tag>; // Display with 4 decimal places for precision
  };


  const getCriteriaValueColumns = () => {
    if (criteria.length === 0) return [];
    return criteria.map((crit, index) => ({
      title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{crit.name}</span>,
      dataIndex: `averageValue${index + 1}`,
      key: `avg_val_${crit.id}`,
      align: 'center',
      width: 100,
      // Render function directly uses getLinguisticTermForTable which returns a Tag
      render: (value) => getLinguisticTermForTable(value), 
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
            title="Status Penilaian"
            dataIndex="is_rated"
            key="status_penilaian"
            align="center"
            width={150}
            render={(isRated) => {
              const statusText = isRated ? 'Sudah Dinilai' : 'Belum Dinilai';
              const statusColor = isRated ? 'green' : 'red';
              return <Tag color={statusColor}>{statusText}</Tag>;
            }}
          />

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
        onOk={handleRatingSubmit}
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