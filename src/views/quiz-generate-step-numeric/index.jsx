// src/pages/Quiz/QuizGenerateNumericStep.jsx

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Table, message, Spin, Alert, Select, Button, Tag } from "antd";
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

// NEW: Define distinct colors for each criterion.
// Ant Design Tag's 'color' prop automatically generates light backgrounds
// and appropriate text colors for these named colors.
const CRITERIA_COLORS_MAP = {
  "QC001": "blue",        // Knowledge (e.g., default blue tag background)
  "QC002": "green",       // Comprehension (e.g., default green tag background)
  "QC003": "orange",      // Application (e.g., default orange tag background)
  "QC004": "purple",      // Analysis (e.g., default purple tag background)
  "QC005": "red",         // Evaluation (e.g., default red tag background)
  "QC006": "cyan",        // Difficulty
  "QC007": "magenta",     // Discrimination
  "QC008": "geekblue",    // Reliability
  "QC009": "lime",        // Problem Solving
  "QC010": "gold"         // Creativity
};

const QuizGenerateNumericStep = () => {
  const { quizID } = useParams();
  const navigate = useNavigate();

  // --- Raw Data States ---
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRPS, setAllRPS] = useState([]);
  const [rawLinguisticDefs, setRawLinguisticDefs] = useState([]);

  // --- Processed/Derived Data States ---
  const [processedQuestionsData, setProcessedQuestionsData] = useState([]);
  const [devLecturers, setDevLecturers] = useState([]);
  const [linguisticDefinitionsMap, setLinguisticDefinitionsMap] = useState({});
  const [linguisticValuesDetailMap, setLinguisticValuesDetailMap] = useState({});
  
  // --- Table Data for Numeric View ---
  const [numericTableData, setNumericTableData] = useState([]); 

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState(undefined);

  // Utility functions
  const findNameById = useCallback((list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]).trim().toLowerCase() === String(id).trim().toLowerCase());
    return item ? item[nameKey] : null;
  }, []);

  const getLinguisticValueName = useCallback((valueId) => {
    return linguisticDefinitionsMap[valueId] || valueId; 
  }, [linguisticDefinitionsMap]);

  const getLinguisticValueDetails = useCallback((valueId) => {
    return linguisticValuesDetailMap[valueId];
  }, [linguisticValuesDetailMap]);

  // --- EFFECT 1: Fetch ALL Master Data (runs ONLY ONCE on mount) ---
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [quizRes, usersRes, rpsRes, linguisticRes] = await Promise.all([
          getQuiz(),
          getUsers(),
          getRPS(),
          getLinguisticValues(),
        ]);

        setAllQuizzes(quizRes.data?.content || []);
        setAllUsers(usersRes.data?.content || []);
        setAllRPS(rpsRes.data?.content || []);
        setRawLinguisticDefs(linguisticRes.data?.content || []);

        const definitionsMap = {};
        const detailsMap = {};
        (linguisticRes.data?.content || []).forEach(def => {
          definitionsMap[def.id] = def.name;
          detailsMap[def.id] = def;
        });
        setLinguisticDefinitionsMap(definitionsMap);
        setLinguisticValuesDetailMap(detailsMap);

      } catch (err) {
        console.error('Error fetching initial master data:', err);
        message.error('Gagal memuat data dasar (kuis, pengguna, RPS, linguistik).');
        setError('Gagal memuat data dasar.');
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  // --- EFFECT 2: Process Quiz Questions and Extract All Lecturer Ratings ---
  const processAllQuizQuestions = useCallback(async () => {
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

      const foundRPS = allRPS.find(rps => rps.idRps === targetQuiz.rps.idRps);
      if (!foundRPS) {
        throw new Error("RPS terkait kuis tidak ditemukan.");
      }

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

      // Process questions to store linguistic IDs for each criteria by each lecturer
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
            const keyForLinguisticData = `numericData_${criteriaId}_${lecturer.id}`; 
            
            let linguisticRatingId = null;
            let numericValues = { value1: null, value2: null, value3: null, value4: null };

            if (currentLecturerRating) {
              const criteriaIndex = CRITERIA_IDS_ORDER.indexOf(criteriaId) + 1;
              linguisticRatingId = currentLecturerRating?.[`linguisticValue${criteriaIndex}Id`];
              
              if (linguisticRatingId) {
                const lvDetails = getLinguisticValueDetails(linguisticRatingId);
                if (lvDetails) {
                  numericValues = {
                    value1: lvDetails.value1,
                    value2: lvDetails.value2,
                    value3: lvDetails.value3,
                    value4: lvDetails.value4,
                  };
                }
              }
            }
            transformedQuestion[keyForLinguisticData] = {
              linguisticId: linguisticRatingId,
              values: numericValues,
              isRated: !!linguisticRatingId
            };
          });
        });
        return transformedQuestion;
      });

      setProcessedQuestionsData(processedQuestions);

    } catch (err) {
      console.error('Error processing quiz data:', err);
      message.error('Gagal memproses data kuis.');
      setError('Gagal memproses data kuis.');
      setProcessedQuestionsData([]);
      setDevLecturers([]);
    } finally {
      setLoading(false);
    }
  }, [quizID, allQuizzes, allUsers, allRPS, rawLinguisticDefs, error, getLinguisticValueDetails]);

  // --- EFFECT 2 Trigger (from above function) ---
  useEffect(() => {
    processAllQuizQuestions(); 
  }, [processAllQuizQuestions]); 

  // --- EFFECT 3: Set initial selectedLecturerId (runs AFTER devLecturers are available) ---
  useEffect(() => {
    if (devLecturers.length > 0 && selectedLecturerId === undefined) {
      setSelectedLecturerId(devLecturers[0].id);
    }
  }, [devLecturers, selectedLecturerId]);

  // --- EFFECT 4: Prepare numeric table data for the selected lecturer ---
  useEffect(() => {
    if (selectedLecturerId && processedQuestionsData.length > 0 && Object.keys(linguisticValuesDetailMap).length > 0) {
      const dataForTable = processedQuestionsData.map(q => {
        const rowData = {
          key: q.idQuestion,
          idQuestion: q.idQuestion,
          questionTitle: q.title || q.description || `Question ${q.idQuestion}`
        };

        CRITERIA_IDS_ORDER.forEach(criteriaId => {
          const numericData = q[`numericData_${criteriaId}_${selectedLecturerId}`];
          if (numericData && numericData.isRated) {
            rowData[`${criteriaId}_A`] = numericData.values.value1;
            rowData[`${criteriaId}_B`] = numericData.values.value2;
            rowData[`${criteriaId}_C`] = numericData.values.value3;
            rowData[`${criteriaId}_D`] = numericData.values.value4;
          } else {
            rowData[`${criteriaId}_A`] = null;
            rowData[`${criteriaId}_B`] = null;
            rowData[`${criteriaId}_C`] = null;
            rowData[`${criteriaId}_D`] = null;
          }
        });
        return rowData;
      });
      setNumericTableData(dataForTable);
    } else {
      setNumericTableData([]);
    }
  }, [selectedLecturerId, processedQuestionsData, linguisticValuesDetailMap]);

  // --- UI Handlers ---
  const handleChangeLecturer = useCallback((value) => {
    setSelectedLecturerId(value);
  }, []);

  // Render function for single numeric values (A, B, C, D) using Tag
  const renderSingleNumericValue = useCallback((value, criteriaId) => { // Now accepts criteriaId
    const formatValue = (val) => val !== null ? val.toFixed(4) : '-';
    const valueStr = formatValue(value);

    // Get color based on the criterion ID from the new map
    const tagColor = CRITERIA_COLORS_MAP[criteriaId] || 'default'; // Fallback to 'default' if color not found

    return (
        <Tag 
          color={value !== null ? tagColor : 'default'} // Use 'default' color for N/A values
          style={{ 
            borderRadius: '4px', // Increased border-radius for more rounded corners
            padding: '1px 6px', // Reduced vertical padding, slightly increased horizontal for compactness
            fontSize: '0.7em', // Keep font size relatively small
            fontWeight: 'bold',
            textAlign: 'center',
            // width: '100%', // Make Tag fill its container
            // height: '100%', // Make Tag fill its container
            display: 'inline-flex', // Use flex to center content vertically and horizontally
            alignItems: 'center',
            justifyContent: 'center',
            margin: '2px', // Slight margin around each tag for visual separation
            lineHeight: 'normal', // Reset line height
            height: 'auto', // Let height adjust to content and padding
            whiteSpace: 'nowrap', // Prevent text wrapping
          }}
        >
            {valueStr}
        </Tag>
    );
  }, []); // Dependensi kosong karena menggunakan argumen langsung dan konstanta


  const columns = useMemo(() => {
    if (!selectedLecturerId || devLecturers.length === 0) {
      return [];
    }

    const baseColumns = [
      {
        title: "ID Pertanyaan",
        dataIndex: "idQuestion",
        key: "idQuestion",
        width: 150,
        fixed: 'left',
        align: 'center',
      },
    ];

    const groupedCriteriaColumns = CRITERIA_IDS_ORDER.map(criteriaId => ({
      title: CRITERIA_NAMES_MAP[criteriaId],
      key: criteriaId,
      align: "center",
      children: [
        {
          title: "A",
          dataIndex: `${criteriaId}_A`, // e.g., "QC001_A"
          key: `${criteriaId}_A`, // Key harus unik
          width: 60, // Lebar masing-masing sub-kolom
          align: "center",
          // Pass the parent criteriaId to the render function
          render: (text) => renderSingleNumericValue(text, criteriaId), 
        },
        {
          title: "B",
          dataIndex: `${criteriaId}_B`,
          key: `${criteriaId}_B`,
          width: 60,
          align: "center",
          render: (text) => renderSingleNumericValue(text, criteriaId),
        },
        {
          title: "C",
          dataIndex: `${criteriaId}_C`,
          key: `${criteriaId}_C`,
          width: 60,
          align: "center",
          render: (text) => renderSingleNumericValue(text, criteriaId),
        },
        {
          title: "D",
          dataIndex: `${criteriaId}_D`,
          key: `${criteriaId}_D`,
          width: 60,
          align: "center",
          render: (text) => renderSingleNumericValue(text, criteriaId),
        },
      ],
    }));

    return baseColumns.concat(groupedCriteriaColumns);
  }, [selectedLecturerId, devLecturers, renderSingleNumericValue]);

  const handlePreviousPage = useCallback(() => {
    navigate(`/setting-quiz/generate-quiz-linguistic-step/${quizID}`); 
  }, [navigate, quizID]);

  const handleNextStep = useCallback(() => {
    navigate(`/setting-quiz/generate-quiz/${quizID}`); 
  }, [navigate, quizID]);

  const cardContent = `Tabel ini menampilkan nilai numerik (A, B, C, D) yang dikonversi dari penilaian linguistik untuk setiap pertanyaan kuis, berdasarkan kriteria penilaian dan dosen yang dipilih.`;

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Memuat data kuis dan linguistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <TypingCard title="Matriks Penilaian Pertanyaan (Numerik)" />
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
      <TypingCard title="Matriks Penilaian Pertanyaan (Numerik)" source={cardContent} />

      <Card style={{ marginBottom: 20 }}>
        {devLecturers.length > 0 ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>Pilih Penguji:</span>
              <Select
                value={selectedLecturerId}
                style={{ width: 300 }}
                onChange={handleChangeLecturer}
                placeholder="Pilih Dosen Penilai"
              >
                {devLecturers.map((lecturer) => (
                  <Option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.role})
                  </Option>
                ))}
              </Select>
            </div>

            <h4 style={{ marginTop: 20 }}>Tabel Penilaian Numerik untuk Dosen: <span style={{ color: '#1890ff' }}>
                {selectedLecturerId ? findNameById(devLecturers, selectedLecturerId) : 'Pilih Dosen'}
              </span></h4>
            <p style={{ fontStyle: 'italic', fontSize: '0.9em', color: '#555' }}>
              *Setiap sel menampilkan empat nilai numerik (A, B, C, D) yang dikonversi dari penilaian linguistik.
            </p>

            {selectedLecturerId && numericTableData.length > 0 ? (
              <Table
                dataSource={numericTableData}
                pagination={false}
                rowKey="key" 
                columns={columns}
                scroll={{ x: 'max-content' }}
                bordered
              />
            ) : (
              <Alert 
                message="Informasi" 
                description={
                  selectedLecturerId
                    ? "Tidak ada data penilaian yang ditemukan untuk dosen yang dipilih."
                    : "Pilih dosen dari dropdown untuk menampilkan tabel penilaian numerik."
                } 
                type="info" 
                showIcon 
              />
            )}
          </div>
        ) : (
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
          Halaman Selanjutnya
        </Button>
      </div>
    </div>
  );
};

export default QuizGenerateNumericStep;