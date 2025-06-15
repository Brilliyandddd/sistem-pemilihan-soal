/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import PropTypes from 'prop-types';
import TypingCard from "@/components/TypingCard";
import { Button, Table, Tabs, Tag, message, Spin, Alert, Image } from "antd";
import {
    getQuestionsByRPSQuiz1,
} from "@/api/quiz";
import { getAllCriteriaValueByQuestion } from "@/api/criteriaValue";
import { getQuiz } from "@/api/quiz";
import { getRPS } from "@/api/rps";
import { getUsers } from "@/api/user";
import { getDematelWeightsBySubject } from "@/api/causality";

import { useNavigate, useParams } from 'react-router-dom';

function withRouterWrapper(Component) {
    return function ComponentWithRouterProp(props) {
        const navigate = useNavigate();
        const params = useParams();

        const history = {
            push: (path) => navigate(path),
            goBack: () => navigate(-1),
        };

        const match = {
            params: params,
        };

        return (
            <Component
                {...props}
                history={history}
                match={match}
            />
        );
    };
}


const { Column } = Table;
const { TabPane } = Tabs;

class QuizGenerate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rps: [],
            quiz: [],
            userInfo: [],
            quizId: '',
            questionsData: [], // Untuk menyimpan rata-rata x_ij
            isMounted: false,
            loading: false,
            error: null,
            criteriaWeights: {}, // w_i
            denominators: {},    // Pembagi
            normalizedQuestionData: [], // r_ij
            weightedNormalizedMatrix: [], // Y_ij
            criteriaTypes: { // Kriteria Tipe (BENEFIT/COST) - PENTING untuk Step 5
                "Knowledge": "BENEFIT", "Comprehension": "BENEFIT", "Application": "BENEFIT",
                "Analysis": "BENEFIT", "Evaluation": "BENEFIT", "Difficulty": "COST",
                "Discrimination": "BENEFIT", "Reliability": "BENEFIT", "Problem Solving": "BENEFIT",
                "Creativity": "BENEFIT",
            },
            idealPositiveSolution: {}, // y_j^+
            idealNegativeSolution: {}, // y_j^-
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step6/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        const currentQuizId = this.props.match.params.quizID;
        history.push(`/setting-quiz/generate-quiz-step4/${currentQuizId}`);
    };

    async componentDidMount() {
        this.setState({ isMounted: true, loading: true });
        try {
            await this.fetchData();
        } catch (error) {
            console.error('Error in componentDidMount:', error);
            message.error('Gagal memuat data');
            this.setState({ error: 'Gagal memuat data' });
        } finally {
            this.setState({ loading: false });
        }
    }

    componentWillUnmount() {
        this.setState({ isMounted: false });
    }

    fetchData = async () => {
        try {
            const currentQuizId = this.props.match.params.quizID;

            if (!currentQuizId) {
                console.error("DEBUG Step5 (fetchData): quizID dari URL tidak ditemukan.");
                message.error("ID kuis tidak ditemukan di URL. Mohon periksa kembali navigasi.");
                this.setState({ error: "ID kuis tidak ditemukan di URL." });
                return;
            }

            const [quizResponse, usersResponse, rpsResponse] = await Promise.all([
                getQuiz(),
                getUsers(),
                getRPS()
            ]);

            const allQuizzes = quizResponse.data?.content || [];
            const rpsContent = rpsResponse.data?.content || [];
            // const allUsers = usersResponse.data?.content || usersResponse.data || []; // Tidak digunakan di Step ini

            const targetQuiz = allQuizzes.find(q => q.idQuiz === currentQuizId);

            if (!targetQuiz) {
                console.error("DEBUG Step5 (fetchData): Kuis dengan ID", currentQuizId, "TIDAK DITEMUKAN.");
                message.error("Kuis tidak ditemukan.");
                this.setState({ error: "Kuis tidak ditemukan." });
                return;
            }

            let rpsIdForQuestions = '';
            let subjectIdForWeights = null;
            let fullRPSData = null;

            if (targetQuiz.rps && targetQuiz.rps.idRps) {
                rpsIdForQuestions = targetQuiz.rps.idRps;
                fullRPSData = rpsContent.find(rps => rps.idRps === rpsIdForQuestions);
                if (fullRPSData && fullRPSData.subject && fullRPSData.subject.id) {
                    subjectIdForWeights = fullRPSData.subject.id;
                }
            } else {
                message.error("Data RPS kuis tidak lengkap.");
                this.setState({ error: "Data RPS kuis tidak lengkap." });
                return;
            }
            
            const criteriaNamesInOrder = [
                "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
                "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
            ];

            let fetchedCriteriaWeights = {};
            let finalDenominators = {}; 

            // --- Ambil Bobot Dematel (w_i) ---
            if (subjectIdForWeights) {
                try {
                    const dematelResponse = await getDematelWeightsBySubject(subjectIdForWeights);
                    let dematelCriteriaWeightsList = [];
                    let apiStatusCode = null;

                    if (dematelResponse.data && typeof dematelResponse.data === 'object' && Object.prototype.hasOwnProperty.call(dematelResponse.data, 'statusCode')) {
                        apiStatusCode = dematelResponse.data.statusCode;
                        dematelCriteriaWeightsList = dematelResponse.data.content || [];
                    } else if (Array.isArray(dematelResponse.data)) {
                        dematelCriteriaWeightsList = dematelResponse.data;
                        apiStatusCode = 200;
                    }

                    if (apiStatusCode === 200 && dematelCriteriaWeightsList.length > 0) {
                        const processedWeightsMap = {};
                        const backendCriterionIdToFrontendName = {
                            "QC001": "Knowledge", "QC002": "Comprehension", "QC003": "Application",
                            "QC004": "Analysis", "QC005": "Evaluation", "QC006": "Difficulty",
                            "QC007": "Discrimination", "QC008": "Reliability", "QC009": "Problem Solving",
                            "QC010": "Creativity",
                        };

                        dematelCriteriaWeightsList.forEach(weightItem => {
                            const frontendKey = backendCriterionIdToFrontendName[weightItem.criterionId];
                            if (frontendKey) {
                                processedWeightsMap[frontendKey] = weightItem.normalizedWeight;
                            }
                        });
                        fetchedCriteriaWeights = processedWeightsMap;
                        
                    } else {
                        message.warning("Bobot Dematel tidak ditemukan untuk mata kuliah ini.");
                    }
                } catch (dematelError) {
                    console.error('Error fetching Dematel weights:', dematelError);
                    message.error('Gagal memuat bobot Dematel.');
                }
            } else {
                message.info("Subject ID tidak tersedia untuk mengambil bobot Dematel. Panggilan API dilewati.");
            }
            // --- End Ambil Bobot Dematel ---


            // --- Bagian Perhitungan r_ij (Seperti di Step 3) ---
            const questionIdsForThisQuiz = targetQuiz.questions.map(q => q.idQuestion);
            const questionsFromBackendData = await getQuestionsByRPSQuiz1(rpsIdForQuestions);
            const allRPSQuestions = questionsFromBackendData.data?.content || [];

            const quizQuestions = allRPSQuestions.filter(q =>
                questionIdsForThisQuiz.includes(q.idQuestion)
            );

            const tempDenominatorsSumOfSquares = {};
            criteriaNamesInOrder.forEach(name => {
                tempDenominatorsSumOfSquares[name] = 0;
            });


            const processedQuestions = await Promise.all(quizQuestions.map(async (q) => {
                const transformedQuestion = { ...q };
                
                const criteriaResult = await getAllCriteriaValueByQuestion(q.idQuestion);
                const questionRatingObject = q.questionRating || {}; 
                const reviewerRatings = questionRatingObject.reviewerRatings || {};
                
                transformedQuestion.averageCriteria = {};
                for (let i = 0; i < criteriaNamesInOrder.length; i++) {
                    const criterionName = criteriaNamesInOrder[i];
                    const avgValueKey = `averageValue${i + 1}`;

                    let sum = 0;
                    let count = 0;
                    
                    Object.values(reviewerRatings).forEach(reviewerRating => {
                        const rawValue = reviewerRating[avgValueKey];
                        if (rawValue !== undefined && rawValue !== null && !isNaN(rawValue)) {
                            const value = Number(rawValue);
                            sum += value;
                            count++;
                        }
                    });

                    const overallAverage = count > 0 ? (sum / count) : null;
                    transformedQuestion.averageCriteria[criterionName] = overallAverage;

                    if (overallAverage !== null) {
                        tempDenominatorsSumOfSquares[criterionName] += (overallAverage * overallAverage);
                    }
                }
                return transformedQuestion;
            }));

            criteriaNamesInOrder.forEach(name => {
                const sumOfSquares = tempDenominatorsSumOfSquares[name];
                finalDenominators[`criterion_${name}`] = (sumOfSquares > 0) ? Math.sqrt(sumOfSquares) : 0;
            });

            const normalizedQuestionData = processedQuestions.map(q => {
                const normalizedQ = { 
                    idQuestion: q.idQuestion,
                    title: q.title,
                    normalizedCriteria: {} 
                };
                criteriaNamesInOrder.forEach(name => {
                    const x_ij = q.averageCriteria[name];
                    const denominator = finalDenominators[`criterion_${name}`];
                    
                    let normalizedValue = null;
                    if (x_ij !== null && x_ij !== undefined && denominator !== null && denominator > 0) {
                        normalizedValue = (x_ij / denominator);
                    }
                    normalizedQ.normalizedCriteria[name] = normalizedValue;
                });
                return normalizedQ;
            });
            // --- End Perhitungan r_ij ---


            // --- Perhitungan Y_ij = w_i * r_ij (Seperti di Step 4) ---
            const weightedNormalizedMatrix = normalizedQuestionData.map(r_q => {
                const weightedQ = {
                    idQuestion: r_q.idQuestion,
                    title: r_q.title,
                    weightedNormalizedCriteria: {}
                };
                criteriaNamesInOrder.forEach(name => {
                    const r_ij = r_q.normalizedCriteria[name];
                    const w_i = fetchedCriteriaWeights[name];
                    
                    let y_ij = null;
                    if (r_ij !== null && r_ij !== undefined && w_i !== null && w_i !== undefined && !isNaN(w_i)) {
                        y_ij = r_ij * w_i;
                    }
                    weightedQ.weightedNormalizedCriteria[name] = y_ij;
                });
                return weightedQ;
            });
            // --- End Perhitungan Y_ij ---


            // --- BARU: Perhitungan Solusi Ideal Positif y_j^+ dan Negatif y_j^- (Step 5) ---
            const idealPositiveSolution = {}; // y_j^+
            const idealNegativeSolution = {}; // y_j^-
            const { criteriaTypes } = this.state; // Dapatkan criteriaTypes dari state

            criteriaNamesInOrder.forEach(criterionName => {
                const criterionType = criteriaTypes[criterionName]; // Get type from state
                const y_ij_values_for_criterion = weightedNormalizedMatrix
                    .map(item => item.weightedNormalizedCriteria[criterionName])
                    .filter(value => value !== null && value !== undefined && !isNaN(value));

                if (y_ij_values_for_criterion.length > 0) {
                    if (criterionType === "BENEFIT") {
                        idealPositiveSolution[criterionName] = Math.max(...y_ij_values_for_criterion);
                        idealNegativeSolution[criterionName] = Math.min(...y_ij_values_for_criterion);
                    } else if (criterionType === "COST") {
                        idealPositiveSolution[criterionName] = Math.min(...y_ij_values_for_criterion);
                        idealNegativeSolution[criterionName] = Math.max(...y_ij_values_for_criterion);
                    } else {
                        console.warn(`WARN Step5: Unknown criterion type for ${criterionName}: ${criterionType}. Ideal solutions cannot be calculated.`);
                        idealPositiveSolution[criterionName] = null;
                        idealNegativeSolution[criterionName] = null;
                    }
                } else {
                    console.warn(`WARN Step5: No valid Y_ij values for criterion ${criterionName}. Ideal solutions set to null.`);
                    idealPositiveSolution[criterionName] = null;
                    idealNegativeSolution[criterionName] = null;
                }
            });
            // --- End Perhitungan Solusi Ideal ---


            if (this.state.isMounted) {
                this.setState({
                    questionsData: processedQuestions,
                    denominators: finalDenominators,
                    criteriaWeights: fetchedCriteriaWeights,
                    normalizedQuestionData: normalizedQuestionData,
                    weightedNormalizedMatrix: weightedNormalizedMatrix,
                    idealPositiveSolution: idealPositiveSolution,
                    idealNegativeSolution: idealNegativeSolution,
                    quizId: currentQuizId,
                });
            }
        } catch (error) {
            console.error('Error fetching data in Step 5:', error);
            message.error('Gagal memuat data untuk Tahap 5');
            if (this.state.isMounted) {
                this.setState({ error: 'Gagal memuat data untuk Tahap 5' });
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    // Render fungsi untuk menampilkan Y_ij (tidak digunakan lagi di tabel utama Step 5)
    renderWeightedNormalizedValue = (record, criterionName) => {
        const value = record.weightedNormalizedCriteria?.[criterionName];
        if (value !== null && value !== undefined && !isNaN(value)) {
            return <Tag color="green">{value.toFixed(2)}</Tag>;
        }
        return <Tag color="default">N/A</Tag>;
    };

    // Render fungsi untuk menampilkan Ideal Solutions di tabel header
    renderIdealSolution = (idealSolutionMap, criterionName) => {
        const value = idealSolutionMap[criterionName];
        if (value !== null && value !== undefined && !isNaN(value)) {
            return <Tag color="blue">{value.toFixed(2)}</Tag>;
        }
        return <Tag color="default">N/A</Tag>;
    };

    render() {
        const {
            idealPositiveSolution,
            idealNegativeSolution,
            quizId,
            loading,
            error,
            criteriaWeights,
            criteriaTypes,
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];
        
        // --- Kolom untuk tabel header (Kriteria, Bobot, Tipe Kriteria, y_j^+, y_j^-) ---
        const headerTableColumns = [
            {
                title: "",
                dataIndex: "label",
                key: "label",
                align: "center",
                width: 150, // Sesuaikan lebar agar sesuai dengan desain
                fixed: 'left',
                render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
            },
            // Kolom "spacer" dihapus karena tidak ada tabel utama di bawah
            ...criteriaNames.map((name) => ({
                title: name, // Ini akan menjadi header kolom di atas nilai
                key: `header_${name}`,
                width: 150,
                render: (text, record) => {
                    if (record.type === 'criteria_names') { // Baris untuk nama kriteria
                        return <Tag color="purple">{name}</Tag>;
                    } else if (record.type === 'weights') {
                        const weightValue = criteriaWeights[name];
                        if (weightValue !== null && weightValue !== undefined && !isNaN(weightValue)) {
                            return <Tag color="cyan">{weightValue.toFixed(2)}</Tag>;
                        }
                        return <Tag color="red">(Bobot Belum Tersedia)</Tag>;
                    } else if (record.type === 'types') {
                        const type = criteriaTypes[name];
                        if (type !== null && type !== undefined) {
                            return <Tag color={type === 'BENEFIT' ? 'green' : 'red'}>{type}</Tag>;
                        }
                        return <Tag color="default">N/A</Tag>;
                    } else if (record.type === 'ideal_positive') {
                        return this.renderIdealSolution(idealPositiveSolution, name);
                    } else if (record.type === 'ideal_negative') {
                        return this.renderIdealSolution(idealNegativeSolution, name);
                    }
                    return null;
                }
            }))
        ];

        // Data source untuk tabel header
        const headerDataSource = [
            { label: 'Kriteria', type: 'criteria_names', id: 'header_criteria_names_row' },
            { label: 'Bobot', type: 'weights', id: 'header_weights_row' },
            { label: 'Tipe Kriteria', type: 'types', id: 'header_types_row' },
            { label: 'Ideal Positif (y+)', type: 'ideal_positive', id: 'header_ideal_positive_row' },
            { label: 'Ideal Negatif (y-)', type: 'ideal_negative', id: 'header_ideal_negative_row' },
        ];


        if (error) {
            return (
                <div className="app-container">
                    <TypingCard source="Solusi Ideal Positif dan Negatif (Tahap 5)" />
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button
                                size="small"
                                type="primary"
                                onClick={this.fetchData}
                            >
                                Coba Lagi
                            </Button>
                        }
                    />
                </div>
            );
        }

        return (
            <div className="app-container">
                <TypingCard source="Solusi Ideal Positif dan Negatif (Tahap 5)" />
                
                <br />
                <br />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p>Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabel untuk Header (Kriteria, Bobot, Tipe Kriteria, y+, y-) */}
                        <Table
                            dataSource={headerDataSource}
                            columns={headerTableColumns}
                            pagination={false}
                            showHeader={false}
                            rowKey="id"
                            scroll={{ x: 'max-content' }}
                            style={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
                            className="criteria-header-table"
                        />
                        {/* Tabel Utama Y_ij sudah dihapus */}
                        
                        {/* Buttons moved here */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                            <div>
                                <Button type="primary" onClick={() => this.handlePreviousPage(quizId)}>
                                    Tahap 4
                                </Button>
                            </div>
                            <div>
                                <Button type="primary" onClick={() => this.handleNextPage(quizId)}>
                                    Tahap 6
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
}

QuizGenerate.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        goBack: PropTypes.func,
    }).isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            quizID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
};

const QuizGenerateWithRouter = withRouterWrapper(QuizGenerate);
QuizGenerateWithRouter.displayName = 'QuizGenerateWithRouter';
export default QuizGenerateWithRouter;