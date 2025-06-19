/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin, Alert, Tag, Select, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
// NEW: Import the API for linguistic values
import { getLinguisticValues } from "@/api/linguisticValue"; // <--- PASTIKAN PATH INI BENAR!
import TypingCard from "@/components/TypingCard";

// NEW: Define the custom order for criteria (unchanged)
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

const DematelGenerateLinguisticStep = () => {
  const { idCausality } = useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [causalityDetails, setCausalityDetails] = useState(null);
  const [linguisticDefinitions, setLinguisticDefinitions] = useState({}); // NEW STATE for fetched linguistic definitions
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [causalityDescription, setCausalityDescription] = useState(`ID: ${idCausality}`);
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);

  const findNameById = (list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]) === String(id));
    return item ? item[nameKey] : null;
  };

  const getCriterionName = (criterionId, criteriaList) => {
    return findNameById(criteriaList, criterionId, "id", "name");
  };

  const getReviewerName = (reviewerId, lecturersList) => {
    return findNameById(lecturersList, reviewerId, "id", "name");
  };

  // NEW FUNCTION: Translate Linguistic Value ID to its Name using fetched definitions
  const getLinguisticValueName = (valueId) => {
    // Look up the name from the fetched linguisticDefinitions state
    return linguisticDefinitions[valueId] || valueId; // Fallback to ID if not found
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
      const reviewer = lecturers.find(lec => lec.id === reviewerId);
      if (reviewer && !filteredLecturers.some(fl => fl.id === reviewer.id)) {
        filteredLecturers.push(reviewer);
      }
    });

    return filteredLecturers.sort((a, b) => a.name.localeCompare(b.name));
  }, [causalityDetails, lecturers, ratings]);


  const fetchAllNecessaryData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);
    try {
      // Add getLinguisticValues to the Promise.all
      const [ratingsResponse, criteriaResponse, lecturersResponse, causalityDetailResponse, linguisticValuesResponse] = await Promise.all([
        getAllCausalityRatingsForTask(idCausality),
        getQuestionCriterias(),
        getLectures(),
        getCausalityByID(idCausality),
        getLinguisticValues(), // <--- NEW: Call the API to get linguistic values
      ]);

      let fetchedRatings = [];
      if (ratingsResponse.status === 200 && ratingsResponse.data) {
        fetchedRatings = ratingsResponse.data.content || [];
        setRatings(fetchedRatings);
        console.log("Fetched Ratings:", fetchedRatings);
      } else {
        setError(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        message.error(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        setRatings([]);
      }

      let fetchedCriteria = [];
      if (criteriaResponse.status === 200 && criteriaResponse.data && criteriaResponse.data.content) {
        fetchedCriteria = criteriaResponse.data.content;
        setCriteria(fetchedCriteria);
        console.log("Fetched Criteria:", fetchedCriteria);
      } else {
        console.warn("Failed to load actual criteria data. Response:", criteriaResponse);
        setCriteria([]);
      }

      let fetchedLecturers = [];
      if (lecturersResponse.status === 200 && lecturersResponse.data && lecturersResponse.data.content) {
        fetchedLecturers = lecturersResponse.data.content;
        setLecturers(fetchedLecturers);
        console.log("Fetched Lecturers:", fetchedLecturers);
      } else {
        console.warn("Failed to load lecturers data. Response:", lecturersResponse);
        setLecturers([]);
      }

      let fetchedCausalityDetails = null;
      if (causalityDetailResponse.status === 200 && causalityDetailResponse.data && causalityDetailResponse.data.content) {
          fetchedCausalityDetails = causalityDetailResponse.data.content;
          setCausalityDetails(fetchedCausalityDetails);
          setCausalityDescription(fetchedCausalityDetails.description || `ID: ${idCausality}`);
          console.log("Fetched Causality Details:", fetchedCausalityDetails);
      } else {
          console.warn("Failed to load causality details. Response:", causalityDetailResponse);
          setCausalityDetails(null);
      }

      // NEW: Process linguistic values definitions from API response
      if (linguisticValuesResponse && linguisticValuesResponse.status === 200 && linguisticValuesResponse.data && linguisticValuesResponse.data.content) {
        const definitionsMap = {};
        linguisticValuesResponse.data.content.forEach(def => {
          // Assuming each linguistic value object has 'id' (like LV011) and 'name' (like "Rendah")
          definitionsMap[def.id] = def.name;
        });
        setLinguisticDefinitions(definitionsMap);
        console.log("Fetched Linguistic Definitions from API:", definitionsMap);
      } else {
        console.warn("Failed to load linguistic definitions from API.");
        setLinguisticDefinitions({}); // Set empty if failed to fetch
      }


      const reviewerIdsWithRatings = Array.from(new Set(fetchedRatings.map(r => r.reviewerId)));
      console.log("Reviewer IDs with ratings from fetched data:", reviewerIdsWithRatings);

      if (reviewerIdsWithRatings.length > 0 && selectedLecturerId === null) {
        const firstLecturerWithRatings = fetchedLecturers.find(lec => reviewerIdsWithRatings.includes(lec.id));
        if (firstLecturerWithRatings) {
          setSelectedLecturerId(firstLecturerWithRatings.id);
          console.log("Setting initial selected lecturer (with ratings):", firstLecturerWithRatings.name, firstLecturerWithRatings.id);
        } else if (fetchedLecturers.length > 0) {
          setSelectedLecturerId(fetchedLecturers[0].id);
          console.log("Setting initial selected lecturer (first available):", fetchedLecturers[0].name, fetchedLecturers[0].id);
        }
      } else if (selectedLecturerId === null && fetchedLecturers.length > 0) {
        setSelectedLecturerId(fetchedLecturers[0].id);
        console.log("Setting initial selected lecturer (no ratings, first available):", fetchedLecturers[0].name, fetchedLecturers[0].id);
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
      setLinguisticDefinitions({}); // Clear linguistic definitions on error
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

  useEffect(() => {
    if (relevantLecturersForDropdown.length > 0 &&
        (selectedLecturerId === null || !relevantLecturersForDropdown.some(lec => lec.id === selectedLecturerId))) {
      const lecturerWithRatings = relevantLecturersForDropdown.find(lec =>
        ratings.some(r => String(r.reviewerId) === String(lec.id))
      );
      if (lecturerWithRatings) {
        setSelectedLecturerId(lecturerWithRatings.id);
        console.log("Updated selected lecturer based on new data (with ratings):", lecturerWithRatings.name, lecturerWithRatings.id);
      } else {
        setSelectedLecturerId(relevantLecturersForDropdown[0].id);
        console.log("Updated selected lecturer based on new data (first available):", relevantLecturersForDropdown[0].name, relevantLecturersForDropdown[0].id);
      }
    } else if (relevantLecturersForDropdown.length === 0 && selectedLecturerId !== null) {
      setSelectedLecturerId(null);
      console.log("No relevant lecturers, clearing selection.");
    }
  }, [relevantLecturersForDropdown, ratings, selectedLecturerId]);


  const processLinguisticRatings = React.useCallback((currentRatings, currentCriteria, selectedLecturerId, currentLinguisticDefinitions) => {
    console.log("--- Starting processLinguisticRatings ---");
    console.log("Args: currentRatings.length=", currentRatings.length, "currentCriteria.length=", currentCriteria.length, "selectedLecturerId=", selectedLecturerId, "currentLinguisticDefinitions keys:", Object.keys(currentLinguisticDefinitions).length);

    if (!currentCriteria.length || !selectedLecturerId || Object.keys(currentLinguisticDefinitions).length === 0) {
      console.log("processLinguisticRatings: Missing criteria, selected lecturer ID, or linguistic definitions. Returning empty.");
      return { linguisticMatrix: [], distinctCriterionNames: [] };
    }

    const ratingsForSelectedLecturer = currentRatings.filter(
      (rating) => String(rating.reviewerId) === String(selectedLecturerId)
    );
    console.log(`processLinguisticRatings: Ratings found for selected lecturer (${selectedLecturerId}): ${ratingsForSelectedLecturer.length}`);
    if (ratingsForSelectedLecturer.length === 0) {
        console.warn(`processLinguisticRatings: No ratings found for selected lecturer ID: ${selectedLecturerId}.`);
    }

    const allAvailableCriterionNamesFromAPI = currentCriteria
      .map((c) => c.name)
      .filter((name) => name);
    console.log("processLinguisticRatings: All criteria names from API:", allAvailableCriterionNamesFromAPI);

    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter((name) =>
      allAvailableCriterionNamesFromAPI.includes(name)
    );
    console.log("processLinguisticRatings: Ordered criterion names for matrix:", orderedCriterionNames);

    const linguisticData = {};
    ratingsForSelectedLecturer.forEach((rating) => {
      const influencingName = getCriterionName(rating.influencingCriteriaId, currentCriteria);
      const influencedName = getCriterionName(rating.influencedCriteriaId, currentCriteria);
      const linguisticValueId = rating.ratingValue; // This is the LVxxx ID

      if (!influencingName) {
        console.warn(`processLinguisticRatings: Could not find name for influencingCriteriaId: ${rating.influencingCriteriaId}. Skipping this rating.`);
      }
      if (!influencedName) {
        console.warn(`processLinguisticRatings: Could not find name for influencedCriteriaId: ${rating.influencedCriteriaId}. Skipping this rating.`);
      }

      if (influencingName && influencedName && linguisticValueId !== undefined && linguisticValueId !== null) {
        const key = `${influencingName}_${influencedName}`;
        linguisticData[key] = linguisticValueId; // Store the LV ID for now
        // console.log(`processLinguisticRatings: Mapped rating: ${influencingName} -> ${influencedName} = ${linguisticValueId}`);
      } else {
        console.warn("processLinguisticRatings: Skipping rating due to missing or invalid info:", { ratingId: rating.idRating, influencingName, influencedName, linguisticValueId });
      }
    });
    console.log("processLinguisticRatings: Aggregated Linguistic Data (key: LVxxx ID pairs for matrix cells):", linguisticData);

    const linguisticMatrix = [];
    orderedCriterionNames.forEach((rowCriterionName) => {
      const rowData = {
        id: rowCriterionName,
        criterion: rowCriterionName,
      };
      orderedCriterionNames.forEach((colCriterionName) => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        let displayValue;

        if (rowCriterionName === colCriterionName) {
            displayValue = "-"; // Self-influence
        } else if (linguisticData[key]) {
          // Translate the LV ID to its name here using the currentLinguisticDefinitions
          displayValue = currentLinguisticDefinitions[linguisticData[key]] || linguisticData[key]; // Fallback to ID if translation fails
        } else {
          displayValue = "belum dinilai";
        }
        rowData[colCriterionName] = displayValue;
      });
      linguisticMatrix.push(rowData);
    });
    console.log("processLinguisticRatings: Final Linguistic Matrix (ready for table):", linguisticMatrix);
    console.log("--- End processLinguisticRatings ---");

    return { linguisticMatrix, distinctCriterionNames: orderedCriterionNames };
  }, [getCriterionName]); // Dependencies for useCallback: only getCriterionName if it's external and stable

  const { linguisticMatrix, distinctCriterionNames } = React.useMemo(() => {
    // Pass linguisticDefinitions as an argument to the callback, not as a direct dependency of useMemo itself
    return processLinguisticRatings(ratings, criteria, selectedLecturerId, linguisticDefinitions);
  }, [ratings, criteria, selectedLecturerId, linguisticDefinitions, processLinguisticRatings]);


  const getLinguisticMatrixColumns = () => {
    if (distinctCriterionNames.length === 0) {
      console.log("getLinguisticMatrixColumns: No distinct criterion names. Returning empty columns.");
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
          // Value is already the translated name from processLinguisticRatings
          return <Tag color="green" style={{ fontWeight: 'bold' }}>{value}</Tag>;
        },
      })),
    ];
    console.log("getLinguisticMatrixColumns: Generated columns:", columns);
    return columns;
  };

  const cardContent = `Di halaman ini, Anda dapat meninjau matriks penilaian kausalitas dalam bentuk linguistik (misalnya, "Sangat Rendah", "Rendah", "Cukup", "Tinggi", "Sangat Tinggi") yang diberikan oleh masing-masing dosen. Pilih dosen dari daftar dropdown untuk melihat penilaian spesifik mereka. Ini adalah langkah awal sebelum nilai-nilai ini dikonversi menjadi numerik dan diagregasi.`;

  const handleLecturerChange = (value) => {
    setSelectedLecturerId(value);
    setTableLoading(true);
    setTimeout(() => {
      setTableLoading(false);
    }, 100);
  };

  const handleNextStep = () => {
    navigate(`/dematel-generate-step-numeric/${idCausality}`);
  };

  return (
    <div className="app-container">
      <TypingCard title="Matriks Penilaian Kausalitas (Linguistik)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Matriks Pengaruh Antar Kriteria (Linguistik) untuk:</span>
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
                    Matriks Linguistik untuk Dosen: <Tag color="blue" style={{ fontSize: '1em' }}>{getReviewerName(selectedLecturerId, lecturers)}</Tag>
                  </p>
                  <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                    *Catatan: Matriks ini menunjukkan nilai penilaian linguistik langsung yang diberikan oleh dosen yang dipilih. Diagonal matriks (pengaruh kriteria terhadap dirinya sendiri).
                  </p>
                </>
              ) : (
                <Alert
                  message="Pilih Dosen"
                  description="Silakan pilih seorang dosen dari dropdown di atas untuk menampilkan matriks penilaian linguistik mereka."
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />
              )}
            </div>

            {selectedLecturerId && linguisticMatrix.length > 0 ? (
              <>
                <Table
                  bordered
                  rowKey="id"
                  dataSource={linguisticMatrix}
                  pagination={false}
                  loading={tableLoading}
                  columns={getLinguisticMatrixColumns()}
                  scroll={{ x: 'max-content' }}
                />
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={loading || error || linguisticMatrix.some(row => Object.values(row).some(val => val === "belum dinilai" || typeof val === 'string' && val.startsWith("LV")))}
                    // Disable if any "belum dinilai" or untranslated LVxxx values still exist
                  >
                    Lanjutkan ke Matriks Numeric
                  </Button>
                </div>
              </>
            ) : (
              selectedLecturerId && (
                <Alert
                  message="Informasi"
                  description={`Dosen "${getReviewerName(selectedLecturerId, lecturers) || selectedLecturerId}" belum melakukan penilaian untuk kausalitas ini, atau tidak ada data rating yang lengkap.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />
              )
            )}
            {/* Added an alert specifically for missing linguistic definitions */}
            {!loading && !error && Object.keys(linguisticDefinitions).length === 0 && (
                <Alert
                    message="Peringatan Data Linguistik"
                    description="Definisi nilai linguistik (misalnya 'Sangat Rendah', 'Rendah') belum dimuat. Nilai mungkin ditampilkan sebagai ID (LVxxx)."
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

export default DematelGenerateLinguisticStep;