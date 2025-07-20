/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin, Alert, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import * as math from 'mathjs'; // Import mathjs

import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import TypingCard from "@/components/TypingCard";

// Define the custom order for criteria (same as Step 1 & 2)
const CUSTOM_CRITERIA_DISPLAY_ORDER = [
  "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
  "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
];

const DematelGenerateStep3 = () => {
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

  // --- Data Fetching Logic (Copied from Step 2) ---
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

  // --- Step 1 Aggregation Logic (Copied from Step 2, for numerical X) ---
  const calculateDirectRelationMatrixXAndNames = (currentRatings, currentCriteria, currentLecturers) => {
    if (!currentCriteria.length || !currentLecturers.length) {
        return { matrixX: [], orderedCriterionNames: [], distinctReviewerNames: [] };
    }

    const allAvailableCriterionNamesFromAPI = currentCriteria
        .map(c => c.name)
        .filter(name => name);

    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter(name =>
        allAvailableCriterionNamesFromAPI.includes(name)
    );

    const distinctReviewerNames = [];
    if (currentRatings.length > 0) {
        const reviewerIdsWithRatings = Array.from(new Set(currentRatings.map(r => r.reviewerId)));
        const resolvedReviewerNames = reviewerIdsWithRatings
            .map(id => getReviewerName(id, currentLecturers))
            .filter(name => name);
        distinctReviewerNames.push(...resolvedReviewerNames.sort());
    }

    const aggregatedData = {};
    currentRatings.forEach(rating => {
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

    const matrixX = [];
    orderedCriterionNames.forEach(rowCriterionName => {
      const row = [];
      orderedCriterionNames.forEach(colCriterionName => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        const data = aggregatedData[key];
        let value = 0;

        if (rowCriterionName === colCriterionName) {
            value = 0;
        } else if (data && data.count > 0) {
            value = data.sum / data.count;
        }
        row.push(value);
      });
      matrixX.push(row);
    });

    return { matrixX, orderedCriterionNames, distinctReviewerNames };
  };

  // Memoized numerical Direct Relation Matrix X and names
  const { matrixX, orderedCriterionNames, distinctReviewerNames } = React.useMemo(() => {
    return calculateDirectRelationMatrixXAndNames(ratings, criteria, lecturers);
  }, [ratings, criteria, lecturers]);

  // --- Step 2: Calculate Total Relation Matrix T (Copied from Step 2, for numerical T) ---
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

        // Format for display
        const finalTMatrixForDisplay = orderedCriterionNames.map((rowCritName, rowIndex) => {
            const rowData = {
                id: rowCritName,
                criterion: rowCritName
            };
            orderedCriterionNames.forEach((colCritName, colIndex) => {
                const value = totalRelationMatrixT_2D[rowIndex][colIndex];
                rowData[colCritName] = typeof value === 'number' ? value.toFixed(4) : "N/A";
            });
            return rowData;
        });

        return { totalRelationMatrixT: finalTMatrixForDisplay, numericalTotalRelationMatrixT: totalRelationMatrixT_2D, calculationError: null };

    } catch (e) {
        console.error("Error during DEMATEL Total Relation Matrix (T) calculation:", e);
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: `Gagal menghitung Matriks Relasi Total: ${e.message || e.toString()}. Pastikan matriks tidak singular.` };
    }
  };

  // Memoized Total Relation Matrix T (display & numerical) and any calculation errors
  const { totalRelationMatrixT, numericalTotalRelationMatrixT, calculationError: tCalculationError } = React.useMemo(() => {
    return calculateTotalRelationMatrixT(matrixX, orderedCriterionNames);
  }, [matrixX, orderedCriterionNames]);


  // --- NEW: Step 3 Calculation Logic (Di, Rj, D+R, D-R) ---
  const calculateDRValues = (numericalTMatrix, orderedCriterionNames) => {
    if (!numericalTMatrix || numericalTMatrix.length === 0 || orderedCriterionNames.length === 0) {
        return { drValues: [], drCalculationError: "Matriks Total Relasi kosong atau kriteria tidak terdefinisi." };
    }

    const n = orderedCriterionNames.length;
    if (numericalTMatrix.length !== n || numericalTMatrix.some(row => row.length !== n)) {
        return { drValues: [], drCalculationError: "Dimensi Matriks Total Relasi tidak sesuai." };
    }

    const Di = Array(n).fill(0); // D_i: sum of rows
    const Rj = Array(n).fill(0); // R_j: sum of columns

    // Calculate D_i (sum of rows) and R_j (sum of columns)
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const Tij = numericalTMatrix[i][j];
            if (typeof Tij === 'number') {
                Di[i] += Tij;
                Rj[j] += Tij;
            } else {
                console.warn(`Non-numeric value found in T matrix at [${i}][${j}]: ${Tij}`);
                // Handle non-numeric values gracefully, e.g., by skipping them
            }
        }
    }

    const drValues = orderedCriterionNames.map((criterionName, index) => {
        const diValue = Di[index];
        const rjValue = Rj[index];
        const dPlusR = diValue + rjValue;
        const dMinusR = diValue - rjValue;

        return {
            id: criterionName, // Unique ID for table row
            criterion: criterionName,
            Di: diValue.toFixed(4),
            Rj: rjValue.toFixed(4),
            DplusR: dPlusR.toFixed(4),
            DminusR: dMinusR.toFixed(4),
        };
    });

    return { drValues, drCalculationError: null };
  };

  // Memoized Di, Rj, D+R, D-R values
  const { drValues, drCalculationError } = React.useMemo(() => {
    return calculateDRValues(numericalTotalRelationMatrixT, orderedCriterionNames);
  }, [numericalTotalRelationMatrixT, orderedCriterionNames]);


  // --- Table Column Definitions ---
  const getTMatrixColumns = () => {
    if (orderedCriterionNames.length === 0) {
      return [];
    }
    const columns = [
      { title: "Kriteria", dataIndex: "criterion", key: "criterionName", align: "left", fixed: 'left', width: 180 },
      ...orderedCriterionNames.map((criterionName) => ({
        title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{criterionName}</span>,
        dataIndex: criterionName,
        key: `col-${criterionName}`,
        align: "center",
        width: 120,
        render: (value) => <Tag color="green" style={{ fontWeight: 'bold' }}>{value}</Tag>,
      })),
    ];
    return columns;
  };

  const getDRTableColumns = () => {
    if (orderedCriterionNames.length === 0) {
      return [];
    }
    const columns = [
      { title: "Kriteria", dataIndex: "criterion", key: "drCriterionName", align: "left", fixed: 'left', width: 180 },
      { title: "Di", dataIndex: "Di", key: "Di", align: "center", width: 100,
        render: (value) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{value}</Tag>
      },
      { title: "Rj", dataIndex: "Rj", key: "Rj", align: "center", width: 100,
        render: (value) => <Tag color="purple" style={{ fontWeight: 'bold' }}>{value}</Tag>
      },
      { title: "Di + Rj (Prominence)", dataIndex: "DplusR", key: "DplusR", align: "center", width: 150,
        render: (value) => <Tag color="volcano" style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{value}</Tag>
      },
      { title: "Di - Rj (Relation)", dataIndex: "DminusR", key: "DminusR", align: "center", width: 150,
        render: (value) => {
          const numValue = parseFloat(value);
          let color = numValue > 0 ? "success" : (numValue < 0 ? "error" : "default"); // Green for Cause, Red for Effect
          return <Tag color={color} style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{value}</Tag>;
        }
      },
    ];
    return columns;
  };

  // --- UI Handlers ---
  const handleBackToStep2 = () => {
    navigate(`/dematel-generate-step2/${idCausality}`);
  };

  const handleNextStep = () => {
    navigate(`/dematel-generate-step4/${idCausality}`); // Future Step 4 button
  };

  // --- Render Section ---
  const cardContent = `Tahap ini melibatkan penentuan faktor penyebab dan akibat berdasarkan Matriks Total Relasi (T). Ini dilakukan dengan menghitung jumlah baris (D_i) dan jumlah kolom (R_j) dari matriks T, kemudian menghitung D+R dan D-R untuk setiap kriteria.`;

  return (
    <div className="app-container">
      <TypingCard title="Menentukan Faktor Penyebab & Akibat (Step 3)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Analisis Kriteria untuk:</span>
            <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
          </div>
        }
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Memuat data untuk perhitungan...</p>
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
        {!loading && !error && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p>
                **Kriteria yang Digunakan:** {orderedCriterionNames.length > 0 ? orderedCriterionNames.map((name) => <Tag key={name} color="blue" style={{ margin: '2px 0px' }}>{name}</Tag>) : "Tidak ada kriteria yang terdefinisi."}
              </p>
              <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                *Perhitungan ini berdasarkan Matriks Total Relasi (T) yang didapat dari Step 2.
              </p>
            </div>

            {tCalculationError && ( // Error from T matrix calculation
                <Alert
                    message="Kesalahan Perhitungan Matriks Total Relasi"
                    description={tCalculationError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            )}
            {drCalculationError && ( // Error from D/R calculation
                <Alert
                    message="Kesalahan Perhitungan D dan R"
                    description={drCalculationError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* Display D, R, D+R, D-R Table */}
            {!tCalculationError && !drCalculationError && drValues.length > 0 ? (
              <>
                <Table
                  bordered
                  rowKey="id"
                  dataSource={drValues}
                  pagination={false}
                  loading={tableLoading}
                  columns={getDRTableColumns()}
                  scroll={{ x: 'max-content' }}
                  // Summary row for D/R table typically sums D or R values, which might be done later.
                  // For now, no specific summary implemented.
                />
                <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    type="default"
                    onClick={handleBackToStep2}
                  >
                    Kembali ke Step 2
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleNextStep} // Future Step 4 button
                    disabled={false} // Disable for now as Step 4 isn't implemented
                  >
                    Lanjutkan ke Step 4
                  </Button>
                </div>
              </>
            ) : ( // No data or calculation error for D/R values
              !tCalculationError && !drCalculationError && ( // Only show if no prior calculation errors
                <Alert
                  message="Informasi"
                  description="Tidak ada data yang cukup untuk menghitung D, R, D+R, dan D-R. Pastikan Matriks Total Relasi (T) berhasil dihitung di Step 2."
                  type="info"
                  showIcon
                />
              )
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default DematelGenerateStep3;