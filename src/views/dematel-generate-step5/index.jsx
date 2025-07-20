/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin, Alert, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import * as math from 'mathjs';

// Impor semua API yang dibutuhkan (sama seperti step sebelumnya)
import { getAllCausalityRatingsForTask, getCausalityByID, saveDematelWeights } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import TypingCard from "@/components/TypingCard";

// Define the custom order for criteria (same as previous steps)
const CUSTOM_CRITERIA_DISPLAY_ORDER = [
  "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
  "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
];

const DematelGenerateStep5 = () => {
  const { idCausality } = useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [causalityDetails, setCausalityDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [causalityDescription, setCausalityDescription] = useState(`ID: ${idCausality}`);

  // Helper function: find name by ID
  const findNameById = (list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]) === String(id));
    return item ? item[nameKey] : null;
  };

  // Helper functions: get criterion/reviewer name
  const getCriterionName = (criterionId, criteriaList) => {
    return findNameById(criteriaList, criterionId, "id", "name");
  };

  const getReviewerName = (reviewerId, lecturersList) => {
    return findNameById(lecturersList, reviewerId, "id", "name");
  };

  // --- Data Fetching Logic (Copied from previous steps) ---
  const fetchAllNecessaryData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);
    try {
      const [ratingsResponse, criteriaResponse, lecturersResponse, causalityDetailResponse] = await Promise.all([
        getAllCausalityRatingsForTask(idCausality),
        getQuestionCriterias(),
        getLectures(),
        getCausalityByID(idCausality)
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

  // --- Step 1 Aggregation Logic (Calculates numerical Direct Relation Matrix X) ---
  const calculateDirectRelationMatrixXAndNames = (currentRatings, currentCriteria, currentLecturers) => {
    if (!currentCriteria.length || !currentLecturers.length) {
        return { matrixX: [], orderedCriterionNames: [], distinctReviewerNames: [] };
    }
    const allAvailableCriterionNamesFromAPI = currentCriteria.map(c => c.name).filter(name => name);
    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter(name => allAvailableCriterionNamesFromAPI.includes(name));
    const distinctReviewerNames = [];
    if (currentRatings.length > 0) {
        const reviewerIdsWithRatings = Array.from(new Set(currentRatings.map(r => r.reviewerId)));
        const resolvedReviewerNames = reviewerIdsWithRatings.map(id => getReviewerName(id, currentLecturers)).filter(name => name);
        distinctReviewerNames.push(...resolvedReviewerNames.sort());
    }

    const aggregatedData = {};
    currentRatings.forEach(rating => {
      const influencingName = getCriterionName(rating.influencingCriteriaId, currentCriteria);
      const influencedName = getCriterionName(rating.influencedCriteriaId, currentCriteria);
      const ratingValue = rating.numericRatingValue;

      if (influencingName && influencedName && ratingValue !== undefined && ratingValue !== null) {
        const key = `${influencingName}_${influencedName}`;
        if (!aggregatedData[key]) { aggregatedData[key] = { sum: 0, count: 0 }; }
        aggregatedData[key].sum += ratingValue;
        aggregatedData[key].count += 1;
      }
    });

    const matrixX = [];
    orderedCriterionNames.forEach(rowCriterionName => {
      const row = [];
      orderedCriterionNames.forEach(colCriterionName => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        const data = aggregatedData[key];
        let value = 0;
        if (rowCriterionName === colCriterionName) { value = 0; }
        else if (data && data.count > 0) { value = data.sum / data.count; }
        row.push(value);
      });
      matrixX.push(row);
    });
    return { matrixX, orderedCriterionNames, distinctReviewerNames };
  };

  const { matrixX, orderedCriterionNames, distinctReviewerNames } = React.useMemo(() => {
    return calculateDirectRelationMatrixXAndNames(ratings, criteria, lecturers);
  }, [ratings, criteria, lecturers]);

  // --- Step 2: Calculate Total Relation Matrix T ---
  const calculateTotalRelationMatrixT = (numericalMatrixX, orderedCriterionNames) => {
    if (!numericalMatrixX || numericalMatrixX.length === 0 || orderedCriterionNames.length === 0) {
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: "Matriks X atau nama kriteria kosong." };
    }
    const n = orderedCriterionNames.length;
    if (numericalMatrixX.length !== n || numericalMatrixX.some(row => row.length !== n)) {
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: "Dimensi matriks X tidak sesuai dengan jumlah kriteria." };
    }

    try {
        const X_math = math.matrix(numericalMatrixX);
        const I_math = math.identity(n);
        const I_minus_X = math.subtract(I_math, X_math);
        const I_minus_X_inv = math.inv(I_minus_X);
        const T_math = math.multiply(X_math, I_minus_X_inv);
        const totalRelationMatrixT_2D = T_math.toArray();

        const finalTMatrixForDisplay = orderedCriterionNames.map((rowCritName, rowIndex) => {
            const rowData = { id: rowCritName, criterion: rowCritName };
            orderedCriterionNames.forEach((colCritName, colIndex) => {
                const value = totalRelationMatrixT_2D[rowIndex][colIndex];
                rowData[colCritName] = typeof value === 'number' ? value.toFixed(4) : "N/A";
            });
            return rowData;
        });

        return { totalRelationMatrixT: finalTMatrixForDisplay, numericalTotalRelationMatrixT: totalRelationMatrixT_2D, calculationError: null };

    } catch (e) {
        console.error("Error during DEMATEL Total Relation Matrix (T) calculation:", e);
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: `Gagal menghitung Matriks Relasi Total: ${e.message || e.toString()}. Pastikan matriks tidak singular (determinant bukan nol).` };
    }
  };

  const { totalRelationMatrixT, numericalTotalRelationMatrixT, calculationError: tCalculationError } = React.useMemo(() => {
    return calculateTotalRelationMatrixT(matrixX, orderedCriterionNames);
  }, [matrixX, orderedCriterionNames]);

  // --- Step 3: Calculate Di, Rj, D+R, D-R ---
  const calculateDRValues = (numericalTMatrix, orderedCriterionNames) => {
    if (!numericalTMatrix || numericalTMatrix.length === 0 || orderedCriterionNames.length === 0) {
        return { drValues: [], drCalculationError: "Matriks Total Relasi kosong atau kriteria tidak terdefinisi." };
    }
    const n = orderedCriterionNames.length;
    if (numericalTMatrix.length !== n || numericalTMatrix.some(row => row.length !== n)) {
        return { drValues: [], drCalculationError: "Dimensi Matriks Total Relasi tidak sesuai." };
    }

    const Di = Array(n).fill(0);
    const Rj = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const Tij = numericalTMatrix[i][j];
            if (typeof Tij === 'number') {
                Di[i] += Tij;
                Rj[j] += Tij;
            } else {
                console.warn(`Non-numeric value found in T matrix at [${i}][${j}]: ${Tij}`);
            }
        }
    }

    const drValuesRaw = orderedCriterionNames.map((criterionName, index) => {
        const diValue = Di[index];
        const rjValue = Rj[index];
        const dPlusR = diValue + rjValue;
        const dMinusR = diValue - rjValue;
        return {
            id: criterionName, criterion: criterionName,
            Di: diValue, Rj: rjValue, DplusR: dPlusR, DminusR: dMinusR,
        };
    });

    const sortedForRank = [...drValuesRaw].sort((a, b) => b.DplusR - a.DplusR);
    let currentRank = 1;
    for (let i = 0; i < sortedForRank.length; i++) {
      if (i > 0 && sortedForRank[i].DplusR < sortedForRank[i - 1].DplusR) {
        currentRank = i + 1;
      }
      sortedForRank[i].rank = currentRank;
    }

    const drValuesFormatted = sortedForRank.map(item => ({
      ...item,
      Di: item.Di.toFixed(4),
      Rj: item.Rj.toFixed(4),
      DplusR: item.DplusR.toFixed(4),
      DminusR: item.DminusR.toFixed(4),
      causeEffect: item.DminusR > 0 ? "CAUSE" : (item.DminusR < 0 ? "EFFECT" : "NEUTRAL")
    }));

    return { drValues: drValuesFormatted, drCalculationError: null };
  };

  const { drValues, drCalculationError } = React.useMemo(() => {
    return calculateDRValues(numericalTotalRelationMatrixT, orderedCriterionNames);
  }, [numericalTotalRelationMatrixT, orderedCriterionNames]);

  // --- NEW: Step 5 Calculation Logic: Calculate Weights from Ranks ---
  const calculateWeightsFromRanks = (drValues, orderedCriterionNames, currentCriteria) => {
    if (!drValues.length || !orderedCriterionNames.length || !currentCriteria.length) {
      return { dematelWeights: [], weightsCalculationError: "Tidak ada data D+R atau ranking untuk menghitung bobot." };
    }

    const n = orderedCriterionNames.length;
    if (drValues.some(item => !item.rank)) { // Check if all items have a rank
        return { dematelWeights: [], weightsCalculationError: "Beberapa kriteria belum memiliki ranking. Perhitungan bobot tidak dapat dilakukan." };
    }

    const dematelWeightsRaw = drValues.map(item => {
        // Find the original criterion object to get its ID (e.g., QC001 for "Knowledge")
        const originalCriterion = currentCriteria.find(c => c.name === item.criterion);
        const criterionId = originalCriterion ? originalCriterion.id : null; 

        return {
            criterion: item.criterion, // The name of the criterion (e.g., "Knowledge")
            id: item.id, // For Ant Design Table rowKey (which is the criterion name)
            criterionId: criterionId, // THIS IS THE ACTUAL DATABASE ID (e.g., "QC001") FOR BACKEND STORAGE
            rank: item.rank,
            rawWeight: n - item.rank + 1
        };
    }).filter(item => item.criterionId !== null); // Filter out any criteria that couldn't be mapped to a real ID

    const totalRawWeight = dematelWeightsRaw.reduce((sum, item) => sum + item.rawWeight, 0);

    const dematelWeightsFormatted = dematelWeightsRaw.map(item => ({
        ...item,
        // Normalize the raw weight
        normalizedWeight: (item.rawWeight / totalRawWeight).toFixed(4) // Format to 4 decimal places for display
    }));

    dematelWeightsFormatted.sort((a, b) => a.rank - b.rank); // Sort by rank for display

    return { dematelWeights: dematelWeightsFormatted, weightsCalculationError: null };
  };

  const { dematelWeights, weightsCalculationError } = React.useMemo(() => {
    // Pass 'criteria' as it contains the original criterion IDs
    return calculateWeightsFromRanks(drValues, orderedCriterionNames, criteria);
  }, [drValues, orderedCriterionNames, criteria]); // Add 'criteria' to dependencies

  // --- Table Column Definitions ---
  const getWeightsTableColumns = () => {
    const columns = [
      { title: "Kriteria", dataIndex: "criterion", key: "criterion", align: "left", fixed: 'left', width: 150 },
      { title: "Rank", dataIndex: "rank", key: "rank", align: "center", width: 80,
render: (value) => {
 if (value === "belum dinilai") {
 return <Tag color="volcano" style={{ fontStyle: 'italic', fontSize: '0.8em' }}>{value}</Tag>;
          }
          return <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{value}</Tag>
        }
      },
      { title: "Bobot Normalisasi", dataIndex: "normalizedWeight", key: "normalizedWeight", align: "center", width: 150,
        render: (value) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{value}</Tag>
      },
    ];
    return columns;
  };

  // --- UI Handlers ---
  const handleBackToStep4 = () => {
    navigate(`/dematel-generate-step4/${idCausality}`);
  };

  const handleSaveWeights = async () => {
    console.log("--- Debugging handleSaveWeights ---");
    console.log("dematelWeights (bobot yang dihitung):", dematelWeights);
    console.log("dematelWeights.length:", dematelWeights.length);
    console.log("causalityDetails (detail kausalitas dari API):", causalityDetails);
    console.log("causalityDetails?.subject (objek subjek di detail kausalitas):", causalityDetails?.subject);
    console.log("causalityDetails?.subject?.id (ID subjek di detail kausalitas):", causalityDetails?.subject?.id);
    console.log("Kondisi '!dematelWeights.length' adalah:", !dematelWeights.length);
    console.log("Kondisi '!causalityDetails?.subject?.id' adalah:", !causalityDetails?.subject?.id);
    console.log("--- End Debugging handleSaveWeights ---");
    
    if (!dematelWeights.length || !causalityDetails?.subject) { // FIXED: Check directly if subject property exists and is not empty
                 message.error("Tidak ada bobot untuk disimpan atau ID mata kuliah tidak ditemukan.");
                 return;
         }

    const payload = {
        causalityId: idCausality,
        subjectId: causalityDetails.subject, // FIXED: Access subject ID directly (it's already the string ID)
                 weights: dematelWeights.map(w => ({
                         criterionId: w.criterionId,
                         normalizedWeight: parseFloat(w.normalizedWeight)
                    }))
    };

    setLoading(true);
    setTableLoading(true);
    try {
        const result = await saveDematelWeights(payload);
        if (result.status === 200 || result.status === 201) {
            message.success("Bobot kriteria berhasil disimpan!");
        } else {
            message.error(result.data?.message || "Gagal menyimpan bobot. Silakan coba lagi.");
        }
    } catch (err) {
        console.error("Error saving weights:", err);
        message.error(err.response?.data?.message || "Terjadi kesalahan saat menyimpan bobot.");
    } finally {
        setLoading(false);
        setTableLoading(false);
    }
  };

  const cardContent = `Tahap ini menghitung bobot akhir untuk setiap kriteria berdasarkan ranking D+R dari DEMATEL. Bobot ini kemudian akan digunakan sebagai input untuk perhitungan TOPSIS.`;

  return (
    <div className="app-container">
      <TypingCard title="Penentuan Bobot Kriteria (Step 5)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Bobot Kriteria untuk:</span>
            <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
          </div>
        }
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Memuat data untuk perhitungan bobot...</p>
          </div>
        )}
        {error && ( // General data fetching error
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        {tCalculationError && ( // Error from T matrix calculation (from previous steps)
            <Alert
                message="Kesalahan Perhitungan Matriks Total Relasi"
                description={tCalculationError}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
            />
        )}
        {drCalculationError && ( // Error from D/R calculation (from previous steps)
            <Alert
                message="Kesalahan Perhitungan D dan R"
                description={drCalculationError}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
            />
        )}
        {weightsCalculationError && ( // Specific error for weights calculation
            <Alert
                message="Kesalahan Perhitungan Bobot"
                description={weightsCalculationError}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
            />
        )}

        {/* Display Weights Table */}
        {!loading && !error && !tCalculationError && !drCalculationError && !weightsCalculationError && dematelWeights.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <p>
                **Kriteria yang Digunakan:** {orderedCriterionNames.length > 0 ? orderedCriterionNames.map((name) => <Tag key={name} color="blue" style={{ margin: '2px 0px' }}>{name}</Tag>) : "Tidak ada kriteria yang terdefinisi."}
              </p>
              <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                *Bobot dihitung berdasarkan ranking D+R. Rank 1 memiliki bobot tertinggi. Total bobot yang dinormalisasi akan mendekati 1.00.
              </p>
            </div>

            <Table
              bordered
              rowKey="id"
              dataSource={dematelWeights}
              pagination={false}
              loading={tableLoading}
              columns={getWeightsTableColumns()}
              scroll={{ x: 'max-content' }}
            />
            <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="default"
                onClick={handleBackToStep4}
              >
                Kembali ke Step 4
              </Button>
              <Button
                type="primary"
                onClick={handleSaveWeights}
                disabled={loading || error || tCalculationError || drCalculationError || weightsCalculationError || dematelWeights.length === 0}
              >
                Simpan Bobot
              </Button>
            </div>
          </>
        ) : ( // No data or calculation error for weights
          <Alert
            message="Informasi"
            description="Tidak ada data yang cukup untuk menghitung bobot kriteria. Pastikan semua perhitungan DEMATEL sebelumnya berhasil."
            type="info"
            showIcon
          />
 )}
 </Card>
  </div>
 );
};

export default DematelGenerateStep5;