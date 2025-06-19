// src/pages/Dematel/DematelGenerateNumericStep.jsx

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Table, message, Spin, Alert, Tag, Select, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import { getLinguisticValues } from "@/api/linguisticValue";
import TypingCard from "@/components/TypingCard";

// Custom order for criteria (unchanged)
const CUSTOM_CRITERIA_DISPLAY_ORDER = [
  "Knowledge",
  "Comprehension",
  "Application",
  "Analysis",
  "Evaluation",
  "Difficulty",
  "Discrimination",
  "Reliability",
  "Problem Solving",
  "Creativity"
];

const { Option } = Select;

// NEW: Define a color map for each criterion name
// You can expand and customize these colors as needed.
const CRITERION_COLOR_MAP = {
  "Knowledge": "blue",
  "Comprehension": "green",
  "Application": "purple",
  "Analysis": "cyan",
  "Evaluation": "magenta",
  "Difficulty": "orange", // Ant Design 'gold' or 'orange'
  "Discrimination": "volcano", // Ant Design 'red' or 'volcano'
  "Reliability": "lime",   // Ant Design 'lime' or 'geekblue'
  "Problem Solving": "geekblue",
  "Creativity": "red"
  // Add more as needed, or choose from Ant Design's preset colors
  // or use hex codes like "#FF5733"
};


const DematelGenerateNumericStep = () => {
  const { idCausality } = useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [causalityDetails, setCausalityDetails] = useState(null);
  const [linguisticDefinitions, setLinguisticDefinitions] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [causalityDescription, setCausalityDescription] = useState(`ID: ${idCausality}`);
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);

  const findNameById = useCallback((list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]) === String(id));
    return item ? item[nameKey] : null;
  }, []);

  const getCriterionName = useCallback((criterionId, criteriaList) => {
    return findNameById(criteriaList, criterionId, "id", "name");
  }, [findNameById]);

  const getReviewerName = useCallback((reviewerId, lecturersList) => {
    return findNameById(lecturersList, reviewerId, "id", "name");
  }, [findNameById]);

  const getABCDValuesFromLinguisticId = useCallback((linguisticId) => {
    const def = linguisticDefinitions[linguisticId];
    if (def) {
      return {
        A: def.value1 !== undefined ? def.value1 : null,
        B: def.value2 !== undefined ? def.value2 : null,
        C: def.value3 !== undefined ? def.value3 : null,
        D: def.value4 !== undefined ? def.value4 : null,
      };
    }
    return { A: null, B: null, C: null, D: null };
  }, [linguisticDefinitions]);

  const relevantLecturersForDropdown = useMemo(() => {
    if (!causalityDetails || lecturers.length === 0) return [];

    const teamTeachingIds = [
      causalityDetails.teamTeaching1,
      causalityDetails.teamTeaching2,
      causalityDetails.teamTeaching3
    ].filter(id => id);

    const filteredLecturers = lecturers.filter(lec => teamTeachingIds.includes(lec.id));

    const reviewerIdsFromRatings = Array.from(new Set(ratings.map(r => r.reviewerId)));
    reviewerIdsFromRatings.forEach(reviewerId => {
      const reviewer = lecturers.find(lec => lec.id === reviewerId);
      if (reviewer && !filteredLecturers.some(fl => fl.id === reviewer.id)) {
        filteredLecturers.push(reviewer);
      }
    });

    return filteredLecturers.sort((a, b) => a.name.localeCompare(b.name));
  }, [causalityDetails, lecturers, ratings]);


  const fetchAllNecessaryData = useCallback(async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);
    try {
      const [ratingsResponse, criteriaResponse, lecturersResponse, causalityDetailResponse, linguisticValuesResponse] = await Promise.all([
        getAllCausalityRatingsForTask(idCausality),
        getQuestionCriterias(),
        getLectures(),
        getCausalityByID(idCausality),
        getLinguisticValues(),
      ]);

      let fetchedRatings = [];
      if (ratingsResponse.status === 200 && ratingsResponse.data) {
        fetchedRatings = ratingsResponse.data.content || [];
        setRatings(fetchedRatings);
      } else {
        setError(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        message.error(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        setRatings([]);
      }

      let fetchedCriteria = [];
      if (criteriaResponse.status === 200 && criteriaResponse.data && criteriaResponse.data.content) {
        fetchedCriteria = criteriaResponse.data.content;
        setCriteria(fetchedCriteria);
      } else {
        console.warn("Failed to load actual criteria data. Response:", criteriaResponse);
        setCriteria([]);
      }

      let fetchedLecturers = [];
      if (lecturersResponse.status === 200 && lecturersResponse.data && lecturersResponse.data.content) {
        fetchedLecturers = lecturersResponse.data.content;
        setLecturers(fetchedLecturers);
      } else {
        console.warn("Failed to load lecturers data. Response:", lecturersResponse);
        setLecturers([]);
      }

      let fetchedCausalityDetails = null;
      if (causalityDetailResponse.status === 200 && causalityDetailResponse.data && causalityDetailResponse.data.content) {
          fetchedCausalityDetails = causalityDetailResponse.data.content;
          setCausalityDetails(fetchedCausalityDetails);
          setCausalityDescription(fetchedCausalityDetails.description || `ID: ${idCausality}`);
      } else {
          console.warn("Failed to load causality details. Response:", causalityDetailResponse);
          setCausalityDetails(null);
      }

      if (linguisticValuesResponse && linguisticValuesResponse.status === 200 && linguisticValuesResponse.data && linguisticValuesResponse.data.content) {
        const definitionsMap = {};
        linguisticValuesResponse.data.content.forEach(def => {
          definitionsMap[def.id] = def;
        });
        setLinguisticDefinitions(definitionsMap);
      } else {
        console.warn("Failed to load linguistic definitions from API for numeric conversion.");
        setLinguisticDefinitions({});
      }

      if (selectedLecturerId === null && fetchedLecturers.length > 0) {
          const reviewerIdsWithRatings = Array.from(new Set(fetchedRatings.map(r => r.reviewerId)));
          const currentRelevantLecturers = fetchedLecturers.filter(lec => 
              [fetchedCausalityDetails?.teamTeaching1, fetchedCausalityDetails?.teamTeaching2, fetchedCausalityDetails?.teamTeaching3]
              .filter(id => id)
              .includes(lec.id) || reviewerIdsWithRatings.includes(lec.id)
          );

          if (currentRelevantLecturers.length > 0) {
              const firstLecturerWithRatings = currentRelevantLecturers.find(lec => reviewerIdsWithRatings.includes(lec.id));
              if (firstLecturerWithRatings) {
                  setSelectedLecturerId(firstLecturerWithRatings.id);
              } else {
                  setSelectedLecturerId(currentRelevantLecturers[0].id);
              }
          }
      }

    } catch (err) {
      console.error("Error fetching all data:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat memuat data DEMATEL.";
      setError(errorMessage);
      message.error(errorMessage);
      setRatings([]);
      setCriteria([]);
      setLecturers([]);
      setCausalityDetails(null);
      setLinguisticDefinitions({});
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [idCausality, selectedLecturerId]);

  useEffect(() => {
    if (idCausality) {
      fetchAllNecessaryData();
    }
  }, [idCausality, fetchAllNecessaryData]);

  useEffect(() => {
    if (relevantLecturersForDropdown.length > 0 &&
        (selectedLecturerId === null || !relevantLecturersForDropdown.some(lec => lec.id === selectedLecturerId))) {
      const lecturerWithRatings = relevantLecturersForDropdown.find(lec =>
        ratings.some(r => String(r.reviewerId) === String(lec.id))
      );
      if (lecturerWithRatings) {
        setSelectedLecturerId(lecturerWithRatings.id);
      } else {
        setSelectedLecturerId(relevantLecturersForDropdown[0].id);
      }
    } else if (relevantLecturersForDropdown.length === 0 && selectedLecturerId !== null) {
      setSelectedLecturerId(null);
    }
  }, [relevantLecturersForDropdown, ratings, selectedLecturerId]);


  const processNumericMatricesForSelectedLecturer = useCallback(() => {
    if (!criteria.length || Object.keys(linguisticDefinitions).length === 0 || !selectedLecturerId) {
      return { numericMatrix: [], distinctCriterionNames: [] };
    }

    const ratingsForSelectedLecturer = ratings.filter(
      (rating) => String(rating.reviewerId) === String(selectedLecturerId)
    );

    const allAvailableCriterionNamesFromAPI = criteria
      .map((c) => c.name)
      .filter((name) => name);

    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter((name) =>
      allAvailableCriterionNamesFromAPI.includes(name)
    );

    const cellABCDValues = {}; // Stores {influencing_influenced: {A, B, C, D} objects}

    ratingsForSelectedLecturer.forEach(rating => {
      const influencingName = getCriterionName(rating.influencingCriteriaId, criteria);
      const influencedName = getCriterionName(rating.influencedCriteriaId, criteria);
      const linguisticValueId = rating.ratingValue; // LVxxx ID

      const abcdValues = getABCDValuesFromLinguisticId(linguisticValueId);

      const areAllValuesValid = [abcdValues.A, abcdValues.B, abcdValues.C, abcdValues.D].every(val => typeof val === 'number' && val !== null);

      if (influencingName && influencedName && areAllValuesValid) {
        const key = `${influencingName}_${influencedName}`;
        cellABCDValues[key] = { // Store the object directly
          A: abcdValues.A.toFixed(2),
          B: abcdValues.B.toFixed(2),
          C: abcdValues.C.toFixed(2),
          D: abcdValues.D.toFixed(2)
        };
      }
    });

    const numericMatrix = [];

    orderedCriterionNames.forEach(rowCriterionName => {
      const rowData = {
        id: rowCriterionName,
        criterion: rowCriterionName
      };
      orderedCriterionNames.forEach(colCriterionName => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        let cellContent;

        if (rowCriterionName === colCriterionName) {
            // Diagonal elements get a special value
            cellContent = { A: '-', B: '-', C: '-', D: '-' }; // Mark A,B,C,D as '-'
        } else {
            const values = cellABCDValues[key];
            if (values) {
                cellContent = values; // Store the {A, B, C, D} object
            } else {
                cellContent = { A: 'belum dinilai', B: 'belum dinilai', C: 'belum dinilai', D: 'belum dinilai' }; // All parts are 'belum dinilai'
            }
        }
        rowData[colCriterionName] = cellContent; // Store the object {A,B,C,D} or '-' object
      });
      numericMatrix.push(rowData);
    });

    return { numericMatrix, distinctCriterionNames: orderedCriterionNames };
  }, [ratings, criteria, linguisticDefinitions, selectedLecturerId, getCriterionName, getABCDValuesFromLinguisticId]);

  const { numericMatrix, distinctCriterionNames } = useMemo(() => {
    return processNumericMatricesForSelectedLecturer();
  }, [processNumericMatricesForSelectedLecturer]);


  const getNumericMatrixColumns = useCallback(() => {
    if (distinctCriterionNames.length === 0) {
      return [];
    }

    const columns = [
      {
        title: "Kriteria",
        dataIndex: "criterion",
        key: "criterionName",
        align: "left",
        fixed: 'left',
        width: 180,
      },
      ...distinctCriterionNames.map((criterionName) => ({
        // Main column header, now has children
        title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{criterionName}</span>,
        key: `col-${criterionName}`,
        align: "center", // Align the parent column header
        children: [ // Nested columns for A, B, C, D
          {
            title: 'A',
            dataIndex: criterionName, // Refers to the cellContent object in rowData
            key: `${criterionName}-A`,
            width: 45, // Further adjusted width for each sub-column
            align: "center", // Center align value in sub-column
            render: (cellContent) => {
              const value = cellContent.A;
              const color = CRITERION_COLOR_MAP[criterionName] || 'blue'; // Use criterion-specific color
              if (value === 'belum dinilai') {
                return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.7em' }}>{value}</Tag>;
              }
              if (value === '-') { // For diagonal
                return <Tag color="default" style={{ fontWeight: 'bold' }}>{value}</Tag>;
              }
              return <Tag color={color} style={{ fontWeight: 'bold', fontSize: '0.75em' }}>{value}</Tag>;
            },
          },
          {
            title: 'B',
            dataIndex: criterionName,
            key: `${criterionName}-B`,
            width: 45, // Adjusted width
            align: "center",
            render: (cellContent) => {
              const value = cellContent.B;
              const color = CRITERION_COLOR_MAP[criterionName] || 'blue'; // Use criterion-specific color
              if (value === 'belum dinilai') {
                return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.7em' }}>{value}</Tag>;
              }
              if (value === '-') {
                return <Tag color="default" style={{ fontWeight: 'bold' }}>{value}</Tag>;
              }
              return <Tag color={color} style={{ fontWeight: 'bold', fontSize: '0.75em' }}>{value}</Tag>;
            },
          },
          {
            title: 'C',
            dataIndex: criterionName,
            key: `${criterionName}-C`,
            width: 45, // Adjusted width
            align: "center",
            render: (cellContent) => {
              const value = cellContent.C;
              const color = CRITERION_COLOR_MAP[criterionName] || 'blue'; // Use criterion-specific color
              if (value === 'belum dinilai') {
                return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.7em' }}>{value}</Tag>;
              }
              if (value === '-') {
                return <Tag color="default" style={{ fontWeight: 'bold' }}>{value}</Tag>;
              }
              return <Tag color={color} style={{ fontWeight: 'bold', fontSize: '0.75em' }}>{value}</Tag>;
            },
          },
          {
            title: 'D',
            dataIndex: criterionName,
            key: `${criterionName}-D`,
            width: 45, // Adjusted width
            align: "center",
            render: (cellContent) => {
              const value = cellContent.D;
              const color = CRITERION_COLOR_MAP[criterionName] || 'blue'; // Use criterion-specific color
              if (value === 'belum dinilai') {
                return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.7em' }}>{value}</Tag>;
              }
              if (value === '-') {
                return <Tag color="default" style={{ fontWeight: 'bold' }}>{value}</Tag>;
              }
              return <Tag color={color} style={{ fontWeight: 'bold', fontSize: '0.75em' }}>{value}</Tag>;
            },
          },
        ],
      })),
    ];
    return columns;
  }, [distinctCriterionNames]);


  const cardContent = `Di sini, Anda dapat melihat matriks pengaruh langsung awal (Direct Relation Matrix) yang menampilkan nilai numerik A, B, C, dan D untuk setiap pasangan kriteria, seperti yang ditentukan oleh dosen yang dipilih. Setiap kriteria memiliki empat sub-kolom (A, B, C, D) untuk kejelasan. Diagonal matriks (pengaruh kriteria terhadap dirinya sendiri) ditandai dengan "-". Sel "belum dinilai" berarti tidak ada data rating untuk pasangan kriteria tersebut oleh dosen yang dipilih.`;

  const handleLecturerChange = useCallback((value) => {
    setSelectedLecturerId(value);
  }, []);

  const handleNextStep = useCallback(() => {
    navigate(`/dematel-generate-step1/${idCausality}`);
  }, [navigate, idCausality]);

  return (
    <div className="app-container">
      <TypingCard title="Matriks Pengaruh Langsung (Numerik IVIF-DEMATEL)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Matriks Pengaruh Antar Kriteria (Numerik A,B,C,D) untuk:</span>
            <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
          </div>
        }
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Memuat data...</p>
          </div>
        )}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        {!loading && !error && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Pilih Dosen Penguji:</p>
              <Select
                value={selectedLecturerId}
                style={{ width: 250 }}
                onChange={handleLecturerChange}
                placeholder="Pilih dosen"
                disabled={relevantLecturersForDropdown.length === 0 || loading}
              >
                {relevantLecturersForDropdown.length > 0 ? (
                  relevantLecturersForDropdown.map(lecturer => (
                    <Option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled value="">Tidak ada dosen tersedia</Option>
                )}
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              {selectedLecturerId && getReviewerName(selectedLecturerId, lecturers) ? (
                <>
                  <p>
                    Matriks Numerik untuk Dosen: <Tag color="blue" style={{ fontSize: '1em' }}>{getReviewerName(selectedLecturerId, lecturers)}</Tag>
                  </p>
                </>
              ) : (
                <Alert
                  message="Pilih Dosen"
                  description="Silakan pilih seorang dosen dari dropdown di atas untuk menampilkan matriks penilaian numerik mereka."
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />
              )}
              <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                *Catatan: Matriks ini menampilkan nilai numerik (A, B, C, D) yang dikonversi dari penilaian linguistik oleh dosen yang dipilih. Diagonal matriks (pengaruh kriteria terhadap dirinya sendiri) ditandai dengan &quot;-&quot;.
              </p>
            </div>

            {selectedLecturerId && numericMatrix.length > 0 ? (
              <>
                <Table
                  bordered
                  rowKey="id"
                  dataSource={numericMatrix}
                  pagination={false}
                  loading={tableLoading}
                  columns={getNumericMatrixColumns()}
                  scroll={{ x: 'max-content' }} // This will enable horizontal scrolling if content overflows
                />
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={
                      loading ||
                      error ||
                      !selectedLecturerId ||
                      Object.keys(linguisticDefinitions).length === 0 ||
                      numericMatrix.some(row =>
                        Object.values(row).some(cellValue =>
                          (typeof cellValue === 'object' && (
                            cellValue.A === 'belum dinilai' || cellValue.B === 'belum dinilai' ||
                            cellValue.C === 'belum dinilai' || cellValue.D === 'belum dinilai' ||
                            cellValue.A === 'N/A' || cellValue.B === 'N/A' ||
                            cellValue.C === 'N/A' || cellValue.D === 'N/A'
                          ))
                        )
                      )
                    }
                  >
                    Lanjutkan ke Step 1
                  </Button>
                </div>
              </>
            ) : (
              selectedLecturerId && (
                <Alert
                  message="Informasi"
                  description={`Dosen "${getReviewerName(selectedLecturerId, lecturers) || selectedLecturerId}" belum melakukan penilaian untuk kausalitas ini, atau data definisi linguistik (A,B,C,D) tidak lengkap.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />
              )
            )}
            {!loading && !error && Object.keys(linguisticDefinitions).length === 0 && (
                <Alert
                    message="Peringatan Data Linguistik"
                    description="Definisi nilai linguistik (A, B, C, D dari LVxxx) belum dimuat. Matriks mungkin tidak dapat dihitung dengan benar."
                    type="warning"
                    showIcon
                    style={{ marginTop: 20 }}
                />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default DematelGenerateNumericStep;