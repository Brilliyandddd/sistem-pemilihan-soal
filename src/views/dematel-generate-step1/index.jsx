/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin, Alert, Tag, Select, Button } from "antd"; // Import Button
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality"; // Corrected getCausalityById spelling
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import TypingCard from "@/components/TypingCard";

// NEW: Define the custom order for criteria
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

const DematelGenerateStep1 = () => {
  const { idCausality } = useParams();
  const navigate = useNavigate(); // Initialize navigate hook

  const [ratings, setRatings] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [causalityDetails, setCausalityDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [causalityDescription, setCausalityDescription] = useState(`ID: ${idCausality}`);
  const [selectedLecturerId, setSelectedLecturerId] = useState('all');

  const findNameById = (list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]) === String(id));
    return item ? item[nameKey] : null;
  };

  const fetchAllNecessaryData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);
    try {
      const [ratingsResponse, criteriaResponse, lecturersResponse, causalityDetailResponse] = await Promise.all([
        getAllCausalityRatingsForTask(idCausality),
        getQuestionCriterias(),
        getLectures(),
        getCausalityByID(idCausality) // Using getCausalityById as per your previous change
      ]);

      if (ratingsResponse.status === 200 && ratingsResponse.data) {
        setRatings(ratingsResponse.data.content || []);
      } else {
        setError(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        message.error(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        setRatings([]);
      }

      if (criteriaResponse.status === 200 && criteriaResponse.data && criteriaResponse.data.content) {
        setCriteria(criteriaResponse.data.content);
      } else {
        console.warn("Failed to load actual criteria data. Response:", criteriaResponse);
        setCriteria([]);
      }

      if (lecturersResponse.status === 200 && lecturersResponse.data && lecturersResponse.data.content) {
        setLecturers(lecturersResponse.data.content);
      } else {
        console.warn("Failed to load lecturers data. Response:", lecturersResponse);
        setLecturers([]);
      }

      if (causalityDetailResponse.status === 200 && causalityDetailResponse.data && causalityDetailResponse.data.content) {
          setCausalityDetails(causalityDetailResponse.data.content);
          setCausalityDescription(causalityDetailResponse.data.content.description || `ID: ${idCausality}`);
      } else {
          console.warn("Failed to load causality details. Response:", causalityDetailResponse);
          setCausalityDetails(null);
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
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (idCausality) {
      fetchAllNecessaryData();
    }
  }, [idCausality]);

  const getCriterionName = (criterionId, criteriaList) => {
    return findNameById(criteriaList, criterionId, "id", "name");
  };

  const getReviewerName = (reviewerId, lecturersList) => {
    return findNameById(lecturersList, reviewerId, "id", "name");
  };

  const relevantLecturersForDropdown = React.useMemo(() => {
    if (!causalityDetails || lecturers.length === 0) return [];

    const teamTeachingIds = [
      causalityDetails.teamTeaching1,
      causalityDetails.teamTeaching2,
      causalityDetails.teamTeaching3
    ].filter(id => id);

    const filteredLecturers = lecturers.filter(lec => teamTeachingIds.includes(lec.id));

    const reviewerIdsFromRatings = Array.from(new Set(ratings.map(r => r.reviewerId)));
    reviewerIdsFromRatings.forEach(reviewerId => {
      if (!teamTeachingIds.includes(reviewerId)) {
        const reviewer = lecturers.find(lec => lec.id === reviewerId);
        if (reviewer && !filteredLecturers.some(fl => fl.id === reviewer.id)) {
          filteredLecturers.push(reviewer);
        }
      }
    });

    return filteredLecturers.sort((a, b) => a.name.localeCompare(b.name));
  }, [causalityDetails, lecturers, ratings]);

  const processAndAggregateRatings = (currentRatings, currentCriteria, currentLecturers, selectedLecturerId) => {
    if (!currentCriteria.length || !currentLecturers.length) {
        return { aggregatedMatrix: [], distinctReviewerNames: [], distinctCriterionNames: [] };
    }

    const ratingsToProcess = selectedLecturerId === 'all'
      ? currentRatings
      : currentRatings.filter(rating => String(rating.reviewerId) === String(selectedLecturerId));

    const allAvailableCriterionNamesFromAPI = currentCriteria
        .map(c => c.name)
        .filter(name => name);

    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter(name =>
        allAvailableCriterionNamesFromAPI.includes(name)
    );

    const distinctReviewerNames = [];
    if (selectedLecturerId === 'all') {
        const reviewerIdsWithRatings = Array.from(new Set(currentRatings.map(r => r.reviewerId)));
        const resolvedReviewerNames = reviewerIdsWithRatings
            .map(id => getReviewerName(id, currentLecturers))
            .filter(name => name);
        distinctReviewerNames.push(...resolvedReviewerNames.sort());
    } else {
        const selectedName = getReviewerName(selectedLecturerId, currentLecturers);
        if (selectedName) {
            distinctReviewerNames.push(selectedName);
        }
    }

    const aggregatedData = {};

    ratingsToProcess.forEach(rating => {
      const influencingName = getCriterionName(rating.influencingCriteriaId, currentCriteria);
      const influencedName = getCriterionName(rating.influencedCriteriaId, currentCriteria);
      const ratingValue = rating.numericRatingValue;

      if (influencingName && influencedName && ratingValue !== undefined && ratingValue !== null) {
        const key = `${influencingName}_${influencedName}`;
        if (!aggregatedData[key]) {
          aggregatedData[key] = { sum: 0, count: 0 };
        }
        aggregatedData[key].sum += ratingValue;
        aggregatedData[key].count += 1;
      }
    });

    const aggregatedMatrix = [];

    orderedCriterionNames.forEach(rowCriterionName => {
      const rowData = {
        id: rowCriterionName,
        criterion: rowCriterionName
      };
      orderedCriterionNames.forEach(colCriterionName => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        const data = aggregatedData[key];
        let displayValue;

        if (rowCriterionName === colCriterionName) {
            displayValue = "0.00";
        } else if (data && data.count > 0) {
            displayValue = (data.sum / data.count).toFixed(2);
        } else {
            displayValue = "belum dinilai";
        }
        rowData[colCriterionName] = displayValue;
      });
      aggregatedMatrix.push(rowData);
    });

    return { aggregatedMatrix, distinctReviewerNames, distinctCriterionNames: orderedCriterionNames };
  };

  const { aggregatedMatrix, distinctReviewerNames, distinctCriterionNames } = React.useMemo(() => {
    return processAndAggregateRatings(ratings, criteria, lecturers, selectedLecturerId);
  }, [ratings, criteria, lecturers, selectedLecturerId]);

  const getAggregatedMatrixColumns = () => {
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
        title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{criterionName}</span>,
        dataIndex: criterionName,
        key: `col-${criterionName}`,
        align: "center",
        width: 120,
        render: (value) => {
          if (value === "belum dinilai") {
            return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.8em' }}>{value}</Tag>;
          }
          return <Tag color="blue" style={{ fontWeight: 'bold' }}>{value}</Tag>;
        },
      })),
    ];
    return columns;
  };

  const cardContent = `Di sini, Anda dapat melihat matriks pengaruh langsung awal (Direct Relation Matrix) yang dihasilkan dari penilaian kausalitas kriteria. Setiap sel menunjukkan tingkat pengaruh rata-rata dari kriteria di baris terhadap kriteria di kolom. Sel yang bertuliskan "belum dinilai" berarti belum ada data penilaian untuk pasangan kriteria tersebut.`;

  const handleLecturerChange = (value) => {
    setSelectedLecturerId(value);
  };

  // const relevantLecturersForDropdown = React.useMemo(() => {
  //   if (!causalityDetails || lecturers.length === 0) return [];

  //   const teamTeachingIds = [
  //     causalityDetails.teamTeaching1,
  //     causalityDetails.teamTeaching2,
  //     causalityDetails.teamTeaching3
  //   ].filter(id => id);

  //   const filteredLecturers = lecturers.filter(lec => teamTeachingIds.includes(lec.id));

  //   const reviewerIdsFromRatings = Array.from(new Set(ratings.map(r => r.reviewerId)));
  //   reviewerIdsFromRatings.forEach(reviewerId => {
  //     if (!teamTeachingIds.includes(reviewerId)) {
  //       const reviewer = lecturers.find(lec => lec.id === reviewerId);
  //       if (reviewer && !filteredLecturers.some(fl => fl.id === reviewer.id)) {
  //         filteredLecturers.push(reviewer);
  //       }
  //     }
  //   });

  //   return filteredLecturers.sort((a, b) => a.name.localeCompare(b.name));
  // }, [causalityDetails, lecturers, ratings]);

  const handlePreviousStep = () => {
    // Navigate back to the previous step, which is the numeric ratings page
    navigate(`/dematel-generate-step-numeric/${idCausality}`);
  };

  // Handler for "Lanjutkan ke Step 2" button
  const handleNextStep = () => {
    // Navigate to the next step, passing the causality ID
    // You might also want to pass the aggregatedMatrix or its key properties
    // if the next step needs to perform calculations based on it.
    navigate(`/dematel-generate-step2/${idCausality}`);
  };

  return (
    <div className="app-container">
      <TypingCard title="Matriks Penilaian Kausalitas (Awal)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Matriks Pengaruh Antar Kriteria Step 1 untuk:</span>
            <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
          </div>
        }
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Memuat data penilaian dan kriteria...</p>
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
              <p style={{ margin: 0, fontWeight: 'bold' }}>Lihat Penilaian Dosen:</p>
              <Select
                value={selectedLecturerId}
                style={{ width: 250 }}
                onChange={handleLecturerChange}
                disabled={relevantLecturersForDropdown.length === 0 && selectedLecturerId === 'all'}
              >
                <Option value="all">Semua Dosen (Rata-rata)</Option>
                {relevantLecturersForDropdown.map(lecturer => (
                  <Option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              {selectedLecturerId === 'all' ? (
                <>
                  <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    Dosen Penguji yang telah menilai:
                    {distinctReviewerNames.length > 0 ? (
                      distinctReviewerNames.map((name, index) => (
                        <Tag key={name} color="blue" style={{ margin: '2px 0px' }}>{name}</Tag>
                      ))
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#888' }}>Belum ada dosen yang melakukan penilaian.</span>
                    )}
                  </p>
                  <p>
                    Jumlah Dosen Penguji yang sudah menilai: <Tag color="cyan" style={{ fontSize: '1em' }}>{distinctReviewerNames.length}</Tag>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Matriks untuk Dosen: <Tag color="blue" style={{ fontSize: '1em' }}>{getReviewerName(selectedLecturerId, lecturers) || 'Dosen tidak dikenal'}</Tag>
                  </p>
                  <p>
                    Status Penilaian Dosen: {distinctReviewerNames.includes(getReviewerName(selectedLecturerId, lecturers)) ? "Sudah Menilai" : "Belum Menilai"}
                  </p>
                </>
              )}
              <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                *Catatan: Matriks ini menunjukkan nilai rata-rata dari semua penilaian yang tersedia (atau individual jika dosen dipilih). Diagonal matriks (pengaruh kriteria terhadap dirinya sendiri) diatur menjadi 0.00.
              </p>
            </div>

            {aggregatedMatrix.length > 0 ? (
              <>
                <Table
                  bordered
                  rowKey="id"
                  dataSource={aggregatedMatrix}
                  pagination={false}
                  loading={tableLoading}
                  columns={getAggregatedMatrixColumns()}
                  scroll={{ x: 'max-content' }}
                  
                />
                <div style={{ textAlign: 'right', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    type="primary"
                    onClick={handlePreviousStep}
                    disabled={loading || error}>
                      Kembali ke Numeric
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={loading || error || aggregatedMatrix.length === 0} // Disable if any issue
                  >
                    Lanjutkan ke Step 2
                  </Button>
                </div>
              </>
            ) : (
              <Alert
                message="Informasi"
                description={
                  selectedLecturerId === 'all'
                    ? "Tidak ada data penilaian yang cukup atau kriteria yang terdefinisi untuk membentuk matriks gabungan. Pastikan kausalitas ini memiliki kriteria dan sudah dinilai oleh dosen."
                    : `Dosen "${getReviewerName(selectedLecturerId, lecturers) || selectedLecturerId}" belum melakukan penilaian untuk kausalitas ini, atau tidak ada data yang relevan.`
                }
                type="info"
                showIcon
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default DematelGenerateStep1;