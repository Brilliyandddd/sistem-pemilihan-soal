// src/pages/Quiz/QuizGenerateLinguisticStep.jsx

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Table, message, Spin, Alert, Tag, Select, Button, Image } from "antd";
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionsByRPSQuiz1 } from "@/api/quiz";
import { getQuiz } from "@/api/quiz";
import { getRPS } from "@/api/rps";
import { getUsers } from "@/api/user";
import { getLinguisticValues } from "@/api/linguisticValue";
import TypingCard from "@/components/TypingCard";

const { Option } = Select;

const CRITERIA_IDS_ORDER = [
  "QC001", "QC002", "QC003", "QC004", "QC005",
  "QC006", "QC007", "QC008", "QC009", "QC010"
];
const CRITERIA_NAMES_MAP = {
  "QC001": "Knowledge", "QC002": "Comprehension", "QC003": "Application",
  "QC004": "Analysis", "QC005": "Evaluation", "QC006": "Difficulty",
  "QC007": "Discrimination", "QC008": "Reliability", "QC009": "Problem Solving",
  "QC010": "Creativity"
};

const QuizGenerateLinguisticStep = () => {
  const { quizID } = useParams();
  const navigate = useNavigate();

  // --- Raw Data States ---
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRPS, setAllRPS] = useState([]);
  const [rawLinguisticDefs, setRawLinguisticDefs] = useState([]);

  // --- Processed/Derived Data States ---
  const [processedQuestionsData, setProcessedQuestionsData] = useState([]);
  const [devLecturers, setDevLecturers] = useState([]); // Unique lecturers for tabs
  const [quizDetails, setQuizDetails] = useState(null);
  const [matchingRPS, setMatchingRPS] = useState(null);
  const [linguisticDefinitionsMap, setLinguisticDefinitionsMap] = useState({}); // LV_ID -> LV_Name map

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Inisialisasi selectedLecturerTab menjadi undefined atau null
  // agar dropdown tidak menampilkan 'no-lecturers' secara default.
  const [selectedLecturerTab, setSelectedLecturerTab] = useState(undefined); 

  // Utility functions
  const findNameById = useCallback((list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]).trim().toLowerCase() === String(id).trim().toLowerCase());
    return item ? item[nameKey] : null;
  }, []);

  const getLinguisticValueName = useCallback((valueId) => {
    return linguisticDefinitionsMap[valueId] || valueId; 
  }, [linguisticDefinitionsMap]);

  const getImageUrl = useCallback((filePath) => {
    if (!filePath) return "https://via.placeholder.com/200?text=No+Image+Path";
    return `http://localhost:8081${filePath}`;
  }, []);

  const getColorForRole = useCallback((role) => {
    switch ((role || '').toLowerCase()) {
      case 'developer': return 'blue';
      case 'coordinator': return 'green';
      case 'instructor': return 'orange';
      default: return 'default';
    }
  }, []);

  // --- EFFECT 1: Fetch ALL Master Data (runs ONLY ONCE on mount) ---
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [quizRes, usersRes, rpsRes, linguisticRes] = await Promise.all([
          getQuiz(),
          getUsers(),
          getRPS(),
          getLinguisticValues(), // Fetch linguistic definitions early
        ]);

        setAllQuizzes(quizRes.data?.content || []);
        setAllUsers(usersRes.data?.content || []);
        setAllRPS(rpsRes.data?.content || []);
        setRawLinguisticDefs(linguisticRes.data?.content || []);

        const definitionsMap = {};
        (linguisticRes.data?.content || []).forEach(def => {
          definitionsMap[def.id] = def.name; // Map LV ID to its name
        });
        setLinguisticDefinitionsMap(definitionsMap);

      } catch (err) {
        console.error('Error fetching initial master data:', err);
        message.error('Gagal memuat data dasar (kuis, pengguna, RPS, linguistik).');
        setError('Gagal memuat data dasar.');
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  // --- processAndFetchQuizData as a useCallback hook ---
  const processAndFetchQuizData = useCallback(async () => {
    // Kriteria untuk melanjutkan: quizID ada, dan semua data master sudah dimuat
    if (!quizID || allQuizzes.length === 0 || allUsers.length === 0 || allRPS.length === 0 || rawLinguisticDefs.length === 0) {
      if (!error) setLoading(true); 
      return;
    }

    setLoading(true);
    setError(null); 
    try {
      const targetQuiz = allQuizzes.find(q => q.idQuiz === quizID);
      if (!targetQuiz) {
        throw new Error("Kuis tidak ditemukan.");
      }
      setQuizDetails(targetQuiz);

      const foundRPS = allRPS.find(rps => rps.idRps === targetQuiz.rps.idRps);
      if (!foundRPS) {
        throw new Error("RPS terkait kuis tidak ditemukan.");
      }
      setMatchingRPS(foundRPS);

      const lecturerIdsWithRoles = [];
      if (targetQuiz.developerId) lecturerIdsWithRoles.push({ id: targetQuiz.developerId.trim().toLowerCase(), role: 'developer' });
      if (targetQuiz.coordinatorId) lecturerIdsWithRoles.push({ id: targetQuiz.coordinatorId.trim().toLowerCase(), role: 'coordinator' });
      if (targetQuiz.instructorId) lecturerIdsWithRoles.push({ id: targetQuiz.instructorId.trim().toLowerCase(), role: 'instructor' });

      const addRPSLecturers = (lecturersArray, role) => {
        if (Array.isArray(lecturersArray)) {
          lecturersArray.forEach(l => {
            if (l && l.id) {
              const normalizedId = l.id.trim().toLowerCase();
              if (!lecturerIdsWithRoles.some(item => item.id === normalizedId)) {
                lecturerIdsWithRoles.push({ id: normalizedId, role: role });
              }
            }
          });
        }
      };

      addRPSLecturers(foundRPS.developerLecturer, 'developer');
      addRPSLecturers(foundRPS.coordinatorLecturer, 'coordinator');
      addRPSLecturers(foundRPS.instructorLecturer, 'instructor');

      const resolvedDevLecturers = lecturerIdsWithRoles.map(({ id, role }) => {
        const user = allUsers.find(u => (u.id || '').trim().toLowerCase() === id);
        return user ? { id: user.id, name: user.name, role: role } : null;
      }).filter(Boolean);
      setDevLecturers(resolvedDevLecturers);
      
      const questionsFromBackendData = await getQuestionsByRPSQuiz1(foundRPS.idRps);
      const allRPSQuestions = questionsFromBackendData.data?.content || [];

      const quizQuestionIds = targetQuiz.questions.map(q => q.idQuestion);
      const filteredQuizQuestions = allRPSQuestions.filter(q =>
        quizQuestionIds.includes(q.idQuestion)
      );

      // --- Process Questions Data for Linguistic Display ---
      const processedQuestions = filteredQuizQuestions.map(q => {
        const transformedQuestion = { ...q };
        const questionRatingObjectRaw = q.questionRatingJson;
        let reviewerRatings = {};

        if (questionRatingObjectRaw) {
          try {
            const parsedRating = JSON.parse(questionRatingObjectRaw);
            reviewerRatings = parsedRating.reviewerRatings || {};
          } catch (e) {
            console.error("Error parsing questionRatingJson for question:", q.idQuestion, e);
          }
        }

        resolvedDevLecturers.forEach(lecturer => {
          const lecturerIdKey = lecturer.id.trim().toLowerCase();
          const currentLecturerRating = reviewerRatings[lecturerIdKey];

          CRITERIA_IDS_ORDER.forEach(criteriaId => {
            const criteriaValueKey = `criteriaValue_${criteriaId}_${lecturer.id}`;
            
            let linguisticRatingId = null;
            let numericValueFromAverage = null;

            if (currentLecturerRating) {
              const criteriaIndex = CRITERIA_IDS_ORDER.indexOf(criteriaId) + 1;
              linguisticRatingId = currentLecturerRating?.[`linguisticValue${criteriaIndex}Id`];
              numericValueFromAverage = currentLecturerRating?.[`averageValue${criteriaIndex}`];
            }

            if (linguisticRatingId) {
              transformedQuestion[criteriaValueKey] = {
                valueId: linguisticRatingId,
                name: getLinguisticValueName(linguisticRatingId),
                role: lecturer.role
              };
            } else if (numericValueFromAverage !== undefined && numericValueFromAverage !== null && !isNaN(numericValueFromAverage)) {
              console.warn(`No linguistic ID found for ${q.idQuestion} - ${criteriaId} by ${lecturer.id}. Displaying numeric average as fallback. Value: ${numericValueFromAverage}`);
              transformedQuestion[criteriaValueKey] = {
                valueId: null, 
                name: Number(numericValueFromAverage).toFixed(2),
                role: lecturer.role,
                isNumericFallback: true
              };
            } else {
              transformedQuestion[criteriaValueKey] = {
                valueId: null,
                name: 'Belum Dinilai',
                role: lecturer.role
              };
            }
          });
        });
        return transformedQuestion;
      });

      setProcessedQuestionsData(processedQuestions);

    } catch (err) {
      console.error('Error processing quiz data:', err);
      message.error(err.message || 'Gagal memproses data kuis.');
      setError(err.message || 'Gagal memproses data kuis.');
      setProcessedQuestionsData([]);
      setDevLecturers([]);
    } finally {
      setLoading(false);
    }
  }, [quizID, allQuizzes, allUsers, allRPS, rawLinguisticDefs, getLinguisticValueName, findNameById, getColorForRole, error]);

  // --- EFFECT 2: Trigger processAndFetchQuizData when relevant dependencies change ---
  useEffect(() => {
    processAndFetchQuizData(); 
  }, [processAndFetchQuizData]); 

  // --- EFFECT 3: Set initial selectedLecturerTab (runs AFTER devLecturers are available) ---
  useEffect(() => {
    // Hanya atur selectedLecturerTab jika ada dosen dan belum ada yang terpilih
    if (devLecturers.length > 0 && selectedLecturerTab === undefined) {
      setSelectedLecturerTab(devLecturers[0].id); // Pilih dosen pertama
    }
    // Hapus else if untuk 'no-lecturers' agar tidak pernah menjadi nilai default di dropdown
  }, [devLecturers, selectedLecturerTab]);


  // --- UI Handlers ---
  const handleChangeLecturer = useCallback((value) => {
    setSelectedLecturerTab(value);
  }, []);

  const renderCriteriaValue = useCallback((record, criteriaId) => {
    // Pastikan selectedLecturerTab memiliki nilai yang valid sebelum mengakses
    if (!selectedLecturerTab) return <Tag color="volcano">N/A</Tag>;

    const ratingEntry = record[`criteriaValue_${criteriaId}_${selectedLecturerTab}`];
    const displayValue = ratingEntry?.name || 'N/A';
    const role = ratingEntry?.role;
    const isNumericFallback = ratingEntry?.isNumericFallback;

    let tagColor;
    if (displayValue === 'Belum Dinilai' || displayValue === 'N/A') {
      tagColor = 'volcano';
    } else {
      tagColor = isNumericFallback ? 'blue' : getColorForRole(role); 
    }

    return (
      <Tag color={tagColor} style={{ fontWeight: 'bold', fontSize: '0.8em', textAlign: 'center' }}>
        {displayValue}
      </Tag>
    );
  }, [selectedLecturerTab, getColorForRole]);

  const columns = useMemo(() => {
    // Kolom hanya akan dirender jika ada dosen yang terpilih
    if (!selectedLecturerTab || devLecturers.length === 0) { // Tambahkan cek devLecturers.length
      return [];
    }
    return [
      {
        title: "ID Pertanyaan",
        dataIndex: "idQuestion",
        key: "idQuestion",
        align: "center",
        width: 120,
      },
      {
        title: "Pertanyaan",
        key: "questionContent",
        width: 250,
        render: (text, record) => (
          <div style={{ textAlign: 'left' }}>
            {record.title || 'No Title Found'}
            {record.questionType === 'IMAGE' && record.file_path && (
              <div style={{ marginTop: 8 }}>
                <Image
                  src={getImageUrl(record.file_path)}
                  alt="Question Image"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  fallback="https://via.placeholder.com/200?text=Gambar+Tidak+Dimuat"
                />
              </div>
            )}
            {record.description && record.questionType !== 'IMAGE' && (
              <p>{record.description}</p>
            )}
            {record.questionType && record.questionType !== 'IMAGE' && record.questionType !== 'NORMAL' && (
              <p>Tipe: {record.questionType}</p>
            )}
          </div>
        )
      },
      ...CRITERIA_IDS_ORDER.map((criteriaId) => ({
        title: CRITERIA_NAMES_MAP[criteriaId],
        key: `criterion_value_${criteriaId}`,
        width: 150,
        align: "center",
        render: (text, record) => renderCriteriaValue(record, criteriaId)
      }))
    ];
  }, [renderCriteriaValue, getImageUrl, selectedLecturerTab, devLecturers]); // Tambahkan devLecturers ke deps

  const handleNextStep = useCallback(() => {
    // Lanjutkan hanya jika ada dosen yang dipilih
    if (selectedLecturerTab) { 
        navigate(`/setting-quiz/generate-quiz-step-numeric/${quizID}`);
    } else {
        message.warn("Mohon pilih dosen terlebih dahulu.");
    }
  }, [navigate, quizID, selectedLecturerTab]);

  const handlePreviousPage = useCallback(() => {
    navigate(`/setting-quiz`);
  }, [navigate]);

  const cardContent = `Di sini, Anda dapat melihat nilai penilaian linguistik untuk setiap pertanyaan kuis berdasarkan kriteria. Pilih dosen dari daftar di bawah untuk melihat penilaian spesifik mereka.`;

  // Render logic based on loading and error states
  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Memuat data kuis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <TypingCard title="Daftar Nilai Quiz Berdasarkan Dosen Yang Menilai" />
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <TypingCard title="Matriks Penilaian Pertanyaan Quiz (Linguistik)" source={cardContent} />

      <Card style={{ marginBottom: 20 }}>
        {devLecturers.length > 0 ? (
          <div>
            <p>Pilih Dosen:</p>
            <Select
              value={selectedLecturerTab} // Menggunakan selectedLecturerTab yang sekarang bisa undefined
              style={{ width: 300, marginBottom: 20 }}
              onChange={handleChangeLecturer}
              placeholder="Pilih Dosen Penilai"
            >
              {devLecturers.map((lecturer) => (
                <Option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name} ({lecturer.role})
                </Option>
              ))}
            </Select>

            {/* Tampilkan tabel hanya jika ada dosen yang dipilih DAN data pertanyaan tersedia */}
            {selectedLecturerTab && processedQuestionsData.length > 0 ? (
              <Table
                dataSource={processedQuestionsData}
                pagination={false}
                rowKey={record => record.idQuestion || Math.random()}
                columns={columns}
                scroll={{ x: 'max-content' }}
                bordered
              />
            ) : (
              // Menampilkan pesan jika tidak ada pertanyaan untuk dosen yang dipilih
              <Alert 
                message="Informasi" 
                description="Tidak ada data penilaian atau pertanyaan yang ditemukan untuk dosen yang dipilih." 
                type="info" 
                showIcon 
              />
            )}
          </div>
        ) : (
          // Jika devLecturers.length === 0, tampilkan pesan bahwa tidak ada dosen
          <Alert
            message="Informasi"
            description="Tidak ada dosen yang terlibat dalam kuis ini, atau data dosen tidak dapat dimuat."
            type="info"
            showIcon
          />
        )}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button type="primary" onClick={handlePreviousPage}>
          Halaman Sebelumnya
        </Button>
        <Button type="primary" onClick={handleNextStep}>
          Lanjutkan ke Step Numerik
        </Button>
      </div>
    </div>
  );
};

export default QuizGenerateLinguisticStep;