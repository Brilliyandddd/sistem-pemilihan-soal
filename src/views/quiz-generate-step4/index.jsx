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
import { getDematelWeightsBySubject } from "@/api/causality"; // Untuk mendapatkan bobot w_i

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
const { TabPane } = Tabs; // Menggunakan Tabs untuk konsistensi, meskipun mungkin tidak ada tab di sini

class QuizGenerate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rps: [],
            quiz: [],
            userInfo: [],
            quizId: '',
            questionsData: [], // Masih akan menyimpan rata-rata x_ij untuk perhitungan
            isMounted: false,
            loading: false,
            error: null,
            criteriaWeights: {}, // Bobot w_i dari Dematel
            denominators: {}, // Pembagi dari Step 3 (digunakan untuk mendapatkan r_ij)
            normalizedQuestionData: [], // r_ij dari Step 3
            weightedNormalizedMatrix: [], // Y_ij hasil Step 4
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step5/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        const currentQuizId = this.props.match.params.quizID;
        history.push(`/setting-quiz/generate-quiz-step3/${currentQuizId}`);
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
                console.error("DEBUG Step4 (fetchData): quizID dari URL tidak ditemukan.");
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
                console.error("DEBUG Step4 (fetchData): Kuis dengan ID", currentQuizId, "TIDAK DITEMUKAN.");
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

            let fetchedCriteriaWeights = {}; // Bobot w_i dari Dematel
            let finalDenominators = {}; // Pembagi dari Step 3

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


            // --- BARU: Perhitungan Y_ij = w_i * r_ij (Step 4) ---
            const weightedNormalizedMatrix = normalizedQuestionData.map(r_q => {
                const weightedQ = {
                    idQuestion: r_q.idQuestion,
                    title: r_q.title,
                    weightedNormalizedCriteria: {} // Y_ij akan disimpan di sini
                };
                criteriaNamesInOrder.forEach(name => {
                    const r_ij = r_q.normalizedCriteria[name]; // r_ij dari Step 3
                    const w_i = fetchedCriteriaWeights[name]; // Bobot w_i dari Dematel
                    
                    let y_ij = null;
                    if (r_ij !== null && r_ij !== undefined && w_i !== null && w_i !== undefined && !isNaN(w_i)) {
                        y_ij = r_ij * w_i;
                    }
                    weightedQ.weightedNormalizedCriteria[name] = y_ij;
                });
                return weightedQ;
            });
            // console.log("DEBUG Step4 (Weighted Normalized Matrix Y_ij):", weightedNormalizedMatrix);


            if (this.state.isMounted) {
                this.setState({
                    questionsData: processedQuestions, // Rata-rata asli
                    denominators: finalDenominators, // Pembagi
                    criteriaWeights: fetchedCriteriaWeights, // Bobot Dematel
                    normalizedQuestionData: normalizedQuestionData, // r_ij
                    weightedNormalizedMatrix: weightedNormalizedMatrix, // Y_ij
                    quizId: currentQuizId,
                });
            }
        } catch (error) {
            console.error('Error fetching data in Step 4:', error);
            message.error('Gagal memuat data untuk Tahap 4');
            if (this.state.isMounted) {
                this.setState({ error: 'Gagal memuat data untuk Tahap 4' });
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    renderWeightedNormalizedValue = (record, criterionName) => {
        const value = record.weightedNormalizedCriteria?.[criterionName];
        if (value !== null && value !== undefined && !isNaN(value)) {
            return <Tag color="green">{value.toFixed(4)}</Tag>; // Warna hijau untuk Y_ij
        }
        return <Tag color="default">N/A</Tag>;
    };

    render() {
        const {
            weightedNormalizedMatrix, // Data yang akan ditampilkan di tabel utama (Y_ij)
            quizId,
            loading,
            error,
            criteriaWeights, // Bobot w_i
            // denominators,    // Pembagi (tidak lagi ditampilkan di header)
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];
        
        // --- Kolom untuk tabel utama (matriks Y_ij) ---
        const mainTableColumns = [
            {
                title: "ID Pertanyaan",
                dataIndex: "idQuestion",
                key: "idQuestion",
                align: "center",
                width: 150,
                fixed: 'left',
            },
            // Kolom "Pertanyaan" dihapus di sini
            ...criteriaNames.map((name) => ({
                title: name,
                key: `weighted_normalized_${name}`,
                width: 150,
                render: (text, record) => this.renderWeightedNormalizedValue(record, name)
            }))
        ];

        // --- Kolom untuk tabel header (HANYA Bobot) ---
        const headerTableColumns = [
            {
                title: "",
                dataIndex: "label",
                key: "label",
                align: "center",
                width: 150,
                fixed: 'left',
                render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
            },
            // Kolom "spacer" dihapus di sini
            ...criteriaNames.map((name) => ({
                title: name,
                key: `header_${name}`,
                width: 150,
                render: (text, record) => {
                    if (record.type === 'weights') {
                        const weightValue = criteriaWeights[name]; // Akses bobot dengan nama kriteria
                        if (weightValue !== null && weightValue !== undefined && !isNaN(weightValue)) {
                            return <Tag color="cyan">{weightValue.toFixed(4)}</Tag>; // Bobot
                        }
                        return <Tag color="red">(Bobot Belum Tersedia)</Tag>;
                    }
                    // Baris 'Pembagi' dihapus
                    return null;
                }
            }))
        ];

        // Data source untuk tabel header (HANYA 'Bobot')
        const headerDataSource = [
            { label: 'Bobot', type: 'weights', id: 'header_weights_row' },
            // Baris 'Pembagi' dihapus dari sini
        ];


        if (error) {
            return (
                <div className="app-container">
                    <TypingCard source="Matriks Keputusan Ternormalisasi Berbobot (Tahap 4)" />
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
                <TypingCard source="Matriks Keputusan Ternormalisasi Berbobot (Tahap 4)" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    {/* Buttons moved below the tables */}
                </div>

                <br />
                <br />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p>Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabel untuk Bobot saja */}
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
                        {/* Tabel Utama untuk matriks Y_ij */}
                        {weightedNormalizedMatrix.length > 0 ? (
                            <Table
                                dataSource={weightedNormalizedMatrix}
                                columns={mainTableColumns}
                                pagination={false}
                                rowKey="idQuestion"
                                scroll={{ x: 'max-content' }}
                                className="main-questions-table"
                            />
                        ) : (
                            <Alert
                                message="Tidak Ada Data Pertanyaan untuk Normalisasi Berbobot"
                                description="Tidak ada data pertanyaan yang ditemukan atau dapat dinormalisasi berbobot untuk kuis ini."
                                type="info"
                                showIcon
                            />
                        )}
                        {/* Buttons moved here */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                            <div>
                                <Button type="primary" onClick={() => this.handlePreviousPage(quizId)}>
                                    Tahap 3
                                </Button>
                            </div>
                            <div>
                                <Button type="primary" onClick={() => this.handleNextPage(quizId)}>
                                    Tahap 5
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