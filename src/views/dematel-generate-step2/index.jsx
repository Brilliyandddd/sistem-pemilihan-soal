/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin, Alert, Tag, Select, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import * as math from 'mathjs'; // Import mathjs

import { getAllCausalityRatingsForTask, getCausalityByID } from "@/api/causality";
import { getQuestionCriterias } from "@/api/questionCriteria";
import { getLectures } from "@/api/lecture";
import TypingCard from "@/components/TypingCard";

// Define the custom order for criteria (same as Step 1)
const CUSTOM_CRITERIA_DISPLAY_ORDER = [
  "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
  "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
];

const { Option } = Select; // Destructure Option from Select

const DematelGenerateStep2 = () => {
  const { idCausality } = useParams();
  const navigate = useNavigate(); // Initialize navigate hook

  const [ratings, setRatings] = useState([]);
  const [criteria, setCriteria] = useState([]); // Holds actual criteria objects with 'id' and 'name'
  const [lecturers, setLecturers] = useState([]); // Holds lecturer objects with 'id' and 'name'
  const [causalityDetails, setCausalityDetails] = useState(null); // To store specific causality task details
  const [loading, setLoading] = useState(false); // Global loading for initial fetch
  const [tableLoading, setTableLoading] = useState(false); // Specific loading for table data processing
  const [error, setError] = useState(null); // General error for data fetching
  const [causalityDescription, setCausalityDescription] = useState(`ID: ${idCausality}`);

  // Helper function: find name by ID in a list
  const findNameById = (list, id, idKey = "id", nameKey = "name") => {
    const item = list.find((item) => String(item[idKey]) === String(id));
    return item ? item[nameKey] : null; // Return null if not found
  };

  // Helper functions: get criterion name from criteria list
  const getCriterionName = (criterionId, criteriaList) => {
    return findNameById(criteriaList, criterionId, "id", "name");
  };

  // Helper functions: get reviewer name from lecturers list
  const getReviewerName = (reviewerId, lecturersList) => {
    return findNameById(lecturersList, reviewerId, "id", "name");
  };

  // --- Data Fetching Logic ---
  const fetchAllNecessaryData = async () => {
    setLoading(true); // Start global loading
    setTableLoading(true); // Start table loading
    setError(null); // Clear previous errors
    try {
      // Fetch all required data concurrently
      const [ratingsResponse, criteriaResponse, lecturersResponse, causalityDetailResponse] = await Promise.all([
        getAllCausalityRatingsForTask(idCausality),
        getQuestionCriterias(), // API for criteria list
        getLectures(), // API for all lecturers
        getCausalityByID(idCausality) // API for specific causality details
      ]);

      // Handle ratings data response
      if (ratingsResponse.status === 200 && ratingsResponse.data) {
        setRatings(ratingsResponse.data.content || []);
      } else {
        setError(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        message.error(ratingsResponse.data?.message || `Gagal mengambil data penilaian kausalitas. Status: ${ratingsResponse.status}`);
        setRatings([]);
      }

      // Handle criteria data response
      if (criteriaResponse.status === 200 && criteriaResponse.data && criteriaResponse.data.content) {
        setCriteria(criteriaResponse.data.content);
      } else {
        console.warn("Failed to load actual criteria data. Response:", criteriaResponse);
        setCriteria([]);
      }

      // Handle lecturers data response
      if (lecturersResponse.status === 200 && lecturersResponse.data && lecturersResponse.data.content) {
        setLecturers(lecturersResponse.data.content);
      } else {
        console.warn("Failed to load lecturers data. Response:", lecturersResponse);
        setLecturers([]);
      }

      // Handle causality details response
      if (causalityDetailResponse.status === 200 && causalityDetailResponse.data && causalityDetailResponse.data.content) {
          setCausalityDetails(causalityDetailResponse.data.content);
          // Update causalityDescription from the detailed response
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
      setCausalityDetails(null); // Reset causality details on error
    } finally {
      setLoading(false); // End global loading
      setTableLoading(false); // End table loading
    }
  };

  // Effect hook to fetch all data on component mount or idCausality change
  useEffect(() => {
    if (idCausality) {
      fetchAllNecessaryData();
    }
  }, [idCausality]);

  // --- Step 1 Aggregation Logic: Calculates the numerical Direct Relation Matrix X ---
  const calculateDirectRelationMatrixXAndNames = (currentRatings, currentCriteria, currentLecturers) => {
    // Return empty results if master data is not yet available
    if (!currentCriteria.length || !currentLecturers.length) {
        return { matrixX: [], orderedCriterionNames: [], distinctReviewerNames: [] };
    }

    // Get all criterion names actually fetched from the API and sort them by custom order
    const allAvailableCriterionNamesFromAPI = currentCriteria
        .map(c => c.name)
        .filter(name => name); // Ensure name is not null/empty

    const orderedCriterionNames = CUSTOM_CRITERIA_DISPLAY_ORDER.filter(name =>
        allAvailableCriterionNamesFromAPI.includes(name)
    );

    // Determine distinct reviewer names who have provided ratings
    const distinctReviewerNames = [];
    if (currentRatings.length > 0) {
        const reviewerIdsWithRatings = Array.from(new Set(currentRatings.map(r => r.reviewerId)));
        const resolvedReviewerNames = reviewerIdsWithRatings
            .map(id => getReviewerName(id, currentLecturers))
            .filter(name => name); // Filter out any IDs that couldn't be resolved to a name
        distinctReviewerNames.push(...resolvedReviewerNames.sort()); // Sort names alphabetically
    }

    const aggregatedData = {}; // Stores sum and count for each (influencing, influenced) pair

    currentRatings.forEach(rating => {
      const influencingName = getCriterionName(rating.influencingCriteriaId, currentCriteria);
      const influencedName = getCriterionName(rating.influencedCriteriaId, currentCriteria);
      const ratingValue = rating.numericRatingValue; // Use the numerical rating value

      // Only aggregate if both criterion names are successfully resolved and ratingValue is valid
      if (influencingName && influencingName !== '-' &&
          influencedName && influencedName !== '-' &&
          ratingValue !== undefined && ratingValue !== null) {

        const key = `${influencingName}_${influencedName}`;
        if (!aggregatedData[key]) {
          aggregatedData[key] = { sum: 0, count: 0 };
        }
        aggregatedData[key].sum += ratingValue;
        aggregatedData[key].count += 1;
      }
    });

    const matrixX = []; // This will be the numerical Direct Relation Matrix X (2D array)
    orderedCriterionNames.forEach(rowCriterionName => {
      const row = [];
      orderedCriterionNames.forEach(colCriterionName => {
        const key = `${rowCriterionName}_${colCriterionName}`;
        const data = aggregatedData[key];
        let value = 0; // Default value for unrated pairs or diagonal elements

        if (rowCriterionName === colCriterionName) {
            value = 0; // Diagonal elements of X are usually 0 in DEMATEL
        } else if (data && data.count > 0) {
            value = data.sum / data.count; // Calculate average numerical rating
        }
        row.push(value);
      });
      matrixX.push(row);
    });

    return { matrixX, orderedCriterionNames, distinctReviewerNames };
  };

  // Memoized numerical Direct Relation Matrix X (from Step 1 aggregation) and names
  const { matrixX, orderedCriterionNames, distinctReviewerNames } = React.useMemo(() => {
    // Note: selectedLecturerId is not used here, as matrixX is always the aggregated matrix for T calculation
    return calculateDirectRelationMatrixXAndNames(ratings, criteria, lecturers);
  }, [ratings, criteria, lecturers]); // Recalculate if raw ratings, criteria, or lecturers change

  // --- Step 2 Calculation Logic: Calculates the Total Relation Matrix T ---
  const calculateTotalRelationMatrixT = (numericalMatrixX, orderedCriterionNames) => {
    // If matrixX is empty or invalid, return empty results and an error
    if (!numericalMatrixX || numericalMatrixX.length === 0 || orderedCriterionNames.length === 0) {
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: "Matriks X atau nama kriteria kosong." };
    }

    const n = orderedCriterionNames.length; // Dimension of the matrix
    // Ensure matrixX is square and its dimensions match the number of criteria
    if (numericalMatrixX.length !== n || numericalMatrixX.some(row => row.length !== n)) {
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: "Dimensi matriks X tidak sesuai dengan jumlah kriteria." };
    }

    try {
        const X_math = math.matrix(numericalMatrixX); // Convert 2D array to math.js Matrix object
        const I_math = math.identity(n); // Create an Identity matrix of size n x n

        // Calculate (I - X)
        const I_minus_X = math.subtract(I_math, X_math);

        // Calculate (I - X)^-1 (Inverse)
        // This step can throw an error if the matrix is singular (determinant is zero)
        const I_minus_X_inv = math.inv(I_minus_X);

        // Calculate T = X * (I - X)^-1 (Total Relation Matrix)
        const T_math = math.multiply(X_math, I_minus_X_inv);

        const totalRelationMatrixT_2D = T_math.toArray(); // Convert math.js Matrix T back to a 2D array of numbers

        // Format the numerical T matrix for Ant Design Table display
        const finalTMatrixForDisplay = orderedCriterionNames.map((rowCritName, rowIndex) => {
            const rowData = {
                id: rowCritName, // Unique ID for table row (using criterion name)
                criterion: rowCritName // First column for criterion name
            };
            orderedCriterionNames.forEach((colCritName, colIndex) => {
                const value = totalRelationMatrixT_2D[rowIndex][colIndex];
                rowData[colCritName] = typeof value === 'number' ? value.toFixed(2) : "N/A"; // Format to 2 decimal places
            });
            return rowData;
        });

        // Return both the display-formatted matrix and the numerical 2D array for further calculations in Step 3
        return { totalRelationMatrixT: finalTMatrixForDisplay, numericalTotalRelationMatrixT: totalRelationMatrixT_2D, calculationError: null };

    } catch (e) {
        console.error("Error during DEMATEL Total Relation Matrix (T) calculation:", e);
        // Return empty matrices and an error message on calculation failure
        return { totalRelationMatrixT: [], numericalTotalRelationMatrixT: [], calculationError: `Gagal menghitung Matriks Relasi Total: ${e.message || e.toString()}. Pastikan matriks tidak singular (determinant bukan nol).` };
    }
  };

  // Memoized Total Relation Matrix T (display & numerical) and any calculation errors
  const { totalRelationMatrixT, numericalTotalRelationMatrixT, calculationError } = React.useMemo(() => {
    return calculateTotalRelationMatrixT(matrixX, orderedCriterionNames);
  }, [matrixX, orderedCriterionNames]); // Recalculate if matrixX or criterion order changes

  // --- Table Column Definition for T Matrix ---
  const getTMatrixColumns = () => {
    if (orderedCriterionNames.length === 0) {
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
      ...orderedCriterionNames.map((criterionName) => ({
        title: <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>{criterionName}</span>,
        dataIndex: criterionName,
        key: `col-${criterionName}`,
        align: "center",
        width: 120,
        render: (value) => {
          // Values should always be numbers (or "N/A") from calculation
          return <Tag color="green" style={{ fontWeight: 'bold' }}>{value}</Tag>; // Style for calculated values
        },
      })),
    ];
    return columns;
  };

  // --- UI Handlers ---
  const handleBackToStep1 = () => {
    navigate(`/dematel-generate-step1/${idCausality}`);
  };

  const handleNextStep = () => {
    // Pass idCausality to Step 3
    navigate(`/dematel-generate-step3/${idCausality}`);
  };

  // --- Render Section ---
  const cardContent = `Ini adalah Matriks Total Relasi (Total Relation Matrix - T) yang dihitung dari Matriks Pengaruh Langsung Awal (X). Matriks T menunjukkan pengaruh langsung dan tidak langsung antara semua kriteria. Rumus: T = X(I - X)^-1`;

  return (
    <div className="app-container">
      <TypingCard title="Matriks Total Relasi (Step 2)" source={cardContent} />
      <br />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Matriks Total Relasi untuk:</span>
            <Tag color="geekblue" style={{ fontSize: '1em', padding: '4px 8px' }}>{causalityDescription}</Tag>
          </div>
        }
      >
        {loading && ( // Show global loading spinner during initial data fetch
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Memuat data untuk perhitungan matriks...</p>
          </div>
        )}
        {error && ( // Display general data fetching error
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        {/* Render content only if not loading and no general error */}
        {!loading && !error && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p>
                **Kriteria yang Digunakan:** {orderedCriterionNames.length > 0 ? orderedCriterionNames.map((name, index) => <Tag key={name} color="blue" style={{ margin: '2px 0px' }}>{name}</Tag>) : "Tidak ada kriteria yang terdefinisi."}
              </p>
              <p style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
                *Matriks ini dihitung menggunakan rata-rata penilaian dari semua dosen.
              </p>
            </div>

            {calculationError && ( // Display specific calculation error (e.g., singular matrix)
                <Alert
                    message="Kesalahan Perhitungan Matriks"
                    description={calculationError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* Display the table if calculation was successful and matrix has data */}
            {!calculationError && totalRelationMatrixT.length > 0 ? (
              <>
                <Table
                  bordered
                  rowKey="id"
                  dataSource={totalRelationMatrixT}
                  pagination={false}
                  loading={tableLoading} // Table-specific loading
                  columns={getTMatrixColumns()}
                  scroll={{ x: 'max-content' }}
                />
                <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    type="default"
                    onClick={handleBackToStep1}
                  >
                    Kembali ke Step 1
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleNextStep} // Enable the button to navigate to Step 3
                    disabled={loading || error || calculationError || totalRelationMatrixT.length === 0} // Disable if any issue
                  >
                    Lanjutkan ke Step 3
                  </Button>
                </div>
              </>
            ) : ( // Display info message if no data for T matrix (and no calculation error)
              !calculationError && (
                <Alert
                  message="Informasi"
                  description="Tidak ada data yang cukup untuk menghitung Matriks Total Relasi. Pastikan ada data penilaian di Step 1."
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

export default DematelGenerateStep2;