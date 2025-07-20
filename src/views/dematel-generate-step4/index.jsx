/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Card, Table, message, Spin, Alert, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import * as math from 'mathjs';
import {
 ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import TypingCard from "@/components/TypingCard";

const CUSTOM_CRITERIA_DISPLAY_ORDER = [
 "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
 "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
];

const CustomTooltip = ({ active, payload }) => {
 if (active && payload && payload.length) {
  const data = payload[0].payload;
  return (
   <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <p><strong>{data.criterion}</strong></p>
    <p>D+R: {data.DplusR}</p>
    <p>D-R: {data.DminusR}</p>
    <p>Cause/Effect: {data.causeEffect}</p>
    <p>Rank: {data.rank}</p>
   </div>
  );
 }
 return null;
};

const DematelGenerateStep4 = () => {
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

  // Create initial DR values with raw numbers
  const drValuesRaw = orderedCriterionNames.map((criterionName, index) => {
    const diValue = Di[index];
    const rjValue = Rj[index];
    const dPlusR = diValue + rjValue;
    const dMinusR = diValue - rjValue;

    return {
      id: criterionName,
      criterion: criterionName,
      Di: diValue,
      Rj: rjValue,
      DplusR: dPlusR,
      DminusR: dMinusR,
    };
  });

  // Calculate Ranks based on DplusR (highest D+R is rank 1)
  const sortedForRankCalculation = [...drValuesRaw].sort((a, b) => b.DplusR - a.DplusR);
  let currentRank = 1;
  for (let i = 0; i < sortedForRankCalculation.length; i++) {
   if (i > 0 && sortedForRankCalculation[i].DplusR < sortedForRankCalculation[i - 1].DplusR) {
    currentRank = i + 1;
   }
   sortedForRankCalculation[i].rank = currentRank;
  }

    // Re-order drValuesFormatted based on CUSTOM_CRITERIA_DISPLAY_ORDER
    const drValuesFormatted = orderedCriterionNames.map(criterionName => {
        const item = sortedForRankCalculation.find(d => d.criterion === criterionName);
        if (item) {
            return {
                ...item,
                Di: item.Di.toFixed(4),
                Rj: item.Rj.toFixed(4),
                DplusR: item.DplusR.toFixed(4),
                DminusR: item.DminusR.toFixed(4),
                causeEffect: item.DminusR > 0 ? "CAUSE" : (item.DminusR < 0 ? "EFFECT" : "NEUTRAL") // Classify Cause/Effect
            };
        }
        return null; // Should not happen if orderedCriterionNames is derived from available criteria
    }).filter(Boolean); // Remove any nulls if a criterion wasn't found (shouldn't happen)


  return { drValues: drValuesFormatted, drCalculationError: null };
 };

 const { drValues, drCalculationError } = React.useMemo(() => {
  return calculateDRValues(numericalTotalRelationMatrixT, orderedCriterionNames);
 }, [numericalTotalRelationMatrixT, orderedCriterionNames]);

 // --- Table Column Definitions ---

 const getCauseEffectColumns = () => {
  const columns = [
   { title: "Kriteria", dataIndex: "criterion", key: "criterion", align: "left", fixed: 'left', width: 150 },
   { title: "D-R", dataIndex: "DminusR", key: "DminusR", align: "center", width: 100,
    render: (value) => {
     const numValue = parseFloat(value);
     let color = numValue > 0 ? "success" : (numValue < 0 ? "error" : "default");
     return <Tag color={color} style={{ fontWeight: 'bold' }}>{value}</Tag>;
    }
   },
   { title: "Cause/Effect", dataIndex: "causeEffect", key: "causeEffect", align: "center", width: 120,
    render: (text) => {
      let color;
      if (text === "CAUSE") color = "green";
      else if (text === "EFFECT") color = "red";
      else color = "default";
      return <Tag color={color}>{text}</Tag>;
    }
   },
  ];
  return columns;
 };

 const getRankColumns = () => {
  const columns = [
   { title: "Kriteria", dataIndex: "criterion", key: "criterion", align: "left", fixed: 'left', width: 150 },
   { title: "D+R", dataIndex: "DplusR", key: "DplusR", align: "center", width: 100,
    render: (value) => <Tag color="volcano" style={{ fontWeight: 'bold' }}>{value}</Tag>
   },
   { title: "Rank", dataIndex: "rank", key: "rank", align: "center", width: 80,
    render: (value) => <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{value}</Tag>
   },
  ];
  return columns;
 };

 // --- UI Handlers ---
 const handleBackToStep3 = () => {
  navigate(`/dematel-generate-step3/${idCausality}`);
 };

 const handleNextStep = () => {
  navigate(`/dematel-generate-step5/${idCausality}`); // Future Step 5 button
 };

 // --- Render Section ---
 const cardContent = `Ini adalah Diagram Kausal (Causal Diagram) dan Tabel Analisis Faktor Penyebab & Akibat serta Peringkat Kriteria berdasarkan nilai D+R dan D-R.`;

 return (
  <div className="app-container">
   <TypingCard title="Diagram Kausal & Analisis Faktor (Step 4)" source={cardContent} />
   <br />
   <Card
    title={
     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>Analisis Kausalitas untuk:</span>
      <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
     </div>
    }
   >
    {loading && (
     <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" />
      <p style={{ marginTop: '16px' }}>Memuat data untuk analisis...</p>
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
    {tCalculationError && (
      <Alert
        message="Kesalahan Perhitungan Matriks Total Relasi"
        description={tCalculationError}
        type="error"
        showIcon
        style={{ marginBottom: 20 }}
      />
    )}
    {drCalculationError && (
      <Alert
        message="Kesalahan Perhitungan D dan R"
        description={drCalculationError}
        type="error"
        showIcon
        style={{ marginBottom: 20 }}
      />
    )}

    {!loading && !error && !tCalculationError && !drCalculationError && drValues.length > 0 ? (
     <>
      <div style={{ marginBottom: 24 }}>
       <p>
        **Kriteria yang Digunakan:** {orderedCriterionNames.length > 0 ? orderedCriterionNames.map((name) => <Tag key={name} color="blue" style={{ margin: '2px 0px' }}>{name}</Tag>) : "Tidak ada kriteria yang terdefinisi."}
       </p>
      </div>

      {/* Table: D-R and Cause/Effect */}
      <h3 style={{ marginTop: '40px', marginBottom: '20px', textAlign: 'center' }}>Analisis Faktor Penyebab & Akibat (D-R)</h3>
      <Table
       bordered
       rowKey="id"
       dataSource={drValues}
       pagination={false}
       loading={tableLoading}
       columns={getCauseEffectColumns()}
       scroll={{ x: 'max-content' }}
       style={{ marginBottom: '40px' }}
      />

      {/* Table: D+R and Rank */}
      <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Peringkat Kepentingan Kriteria (D+R)</h3>
      <Table
       bordered
       rowKey="id"
       dataSource={drValues} // Removed .sort((a, b) => parseFloat(a.rank) - parseFloat(b.rank))
       pagination={false}
       loading={tableLoading}
       columns={getRankColumns()}
       scroll={{ x: 'max-content' }}
      />

      <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
       <Button
        type="default"
        onClick={handleBackToStep3}
       >
        Kembali ke Step 3
       </Button>
       <Button
        type="primary"
        onClick={handleNextStep} // Future Step 5 button
        disabled={false} // Disable for now as Step 5 isn't implemented
       >
        Lanjutkan ke Step 5
       </Button>
      </div>
     </>
    ) : (
     <Alert
      message="Informasi"
      description="Tidak ada data yang cukup untuk membuat Diagram Kausal dan Analisis Faktor. Pastikan semua perhitungan sebelumnya berhasil."
      type="info"
      showIcon
     />
    )}
   </Card>
  </div>
 );
};

CustomTooltip.propTypes = {
 active: PropTypes.bool,
 payload: PropTypes.arrayOf(PropTypes.shape({
  payload: PropTypes.shape({ // Recharts often nests the actual data point inside 'payload'
   criterion: PropTypes.string,
   DplusR: PropTypes.string, // These are strings from .toFixed(2)
   DminusR: PropTypes.string, // These are strings from .toFixed(2)
   causeEffect: PropTypes.string,
   rank: PropTypes.number // Rank is a number, not formatted to string
  })
 }))
};

export default DematelGenerateStep4;