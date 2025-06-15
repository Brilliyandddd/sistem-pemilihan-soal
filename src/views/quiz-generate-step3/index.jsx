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
            questionsData: [],
            selectedLecturerId: 'all-lecturers-average',
            devLecturers: [],
            isMounted: false,
            loading: false,
            error: null,
            criteriaWeights: {},
            criteriaTypes: {
                "Knowledge": "BENEFIT", "Comprehension": "BENEFIT", "Application": "BENEFIT",
                "Analysis": "BENEFIT", "Evaluation": "BENEFIT", "Difficulty": "COST",
                "Discrimination": "BENEFIT", "Reliability": "BENEFIT", "Problem Solving": "BENEFIT",
                "Creativity": "BENEFIT",
            },
            denominators: {},
            normalizedQuestionData: [],
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step4/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        const currentQuizId = this.props.match.params.quizID;
        history.push(`/setting-quiz/generate-quiz-step2/${currentQuizId}`);
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
                console.error("DEBUG Step3 (fetchData): quizID dari URL tidak ditemukan.");
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
            const allUsers = usersResponse.data?.content || usersResponse.data || [];

            const targetQuiz = allQuizzes.find(q => q.idQuiz === currentQuizId);

            if (!targetQuiz) {
                console.error("DEBUG Step3 (fetchData): Kuis dengan ID", currentQuizId, "TIDAK DITEMUKAN.");
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
            let finalDenominators = {}; // Akan diisi di bawah setelah menghitung rata-rata

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
            // --- End Bagian Dematel API (untuk fetchedCriteriaWeights) ---


            // --- Bagian Pengambilan dan Pemrosesan Pertanyaan untuk Menghitung Rata-rata dan Pembagi ---
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
                console.log(`DEBUG Step3 (getAllCriteriaValueByQuestion response for ${q.idQuestion}):`, criteriaResult);

                const questionRatingObject = q.questionRating || {}; 
                console.log(`DEBUG Step3 (Extracted questionRatingObject for ${q.idQuestion}):`, questionRatingObject);
                
                const reviewerRatings = questionRatingObject.reviewerRatings || {};
                console.log(`DEBUG Step3 (Extracted reviewerRatings for ${q.idQuestion}):`, reviewerRatings);
                
                transformedQuestion.averageCriteria = {};
                for (let i = 0; i < criteriaNamesInOrder.length; i++) {
                    const criterionName = criteriaNamesInOrder[i];
                    const avgValueKey = `averageValue${i + 1}`;

                    let sum = 0;
                    let count = 0;
                    
                    Object.values(reviewerRatings).forEach(reviewerRating => {
                        const rawValue = reviewerRating[avgValueKey];
                        console.log(`DEBUG Step3 (Raw value for ${criterionName} (${avgValueKey}) by a reviewer for ${q.idQuestion}):`, rawValue, `(Type: ${typeof rawValue})`);
                        
                        if (rawValue !== undefined && rawValue !== null && !isNaN(rawValue)) {
                            const value = Number(rawValue);
                            sum += value;
                            count++;
                        } else {
                            console.log(`DEBUG Step3 (Skipping invalid/null/NaN value for ${criterionName} for ${q.idQuestion}):`, rawValue);
                        }
                    });

                    const overallAverage = count > 0 ? (sum / count) : null;
                    transformedQuestion.averageCriteria[criterionName] = overallAverage;
                    console.log(`DEBUG Step3 (Overall Average x_ij for ${q.idQuestion} - ${criterionName}):`, overallAverage);

                    if (overallAverage !== null) {
                        tempDenominatorsSumOfSquares[criterionName] += (overallAverage * overallAverage);
                        console.log(`DEBUG Step3 (Accumulated sumOfSquares for ${criterionName}):`, tempDenominatorsSumOfSquares[criterionName]);
                    } else {
                        console.warn(`WARN Step3: overallAverage for question ${q.idQuestion}, criterion ${criterionName} is null. Not contributing to denominator sum. This might lead to 0 denominator.`);
                    }
                }
                return transformedQuestion;
            }));

            criteriaNamesInOrder.forEach(name => {
                const sumOfSquares = tempDenominatorsSumOfSquares[name];
                finalDenominators[`criterion_${name}`] = (sumOfSquares > 0) ? Math.sqrt(sumOfSquares) : 0;
                console.log(`DEBUG Step3 (Final sumOfSquares for ${name}): ${sumOfSquares}, Denominator: ${finalDenominators[`criterion_${name}`]}`);
            });

            const normalizedQuestionData = processedQuestions.map(q => {
                const normalizedQ = { 
                    idQuestion: q.idQuestion,
                    title: q.title, // Pastikan title ada di sini
                    normalizedCriteria: {} 
                };
                criteriaNamesInOrder.forEach(name => {
                    const x_ij = q.averageCriteria[name];
                    const denominator = finalDenominators[`criterion_${name}`];
                    
                    let normalizedValue = null;
                    if (x_ij !== null && x_ij !== undefined && denominator !== null && denominator > 0) {
                        normalizedValue = (x_ij / denominator);
                        console.log(`DEBUG Step3 (Normalizing ${q.idQuestion} - ${name}): x_ij=${x_ij}, denominator=${denominator}, normalizedValue=${normalizedValue}`);
                    } else {
                        console.warn(`WARN Step3: Cannot normalize ${q.idQuestion} - ${name}. x_ij=${x_ij}, denominator=${denominator}`);
                    }
                    normalizedQ.normalizedCriteria[name] = normalizedValue;
                });
                return normalizedQ;
            });


            if (this.state.isMounted) {
                this.setState({
                    questionsData: processedQuestions,
                    denominators: finalDenominators,
                    criteriaWeights: fetchedCriteriaWeights,
                    normalizedQuestionData: normalizedQuestionData,
                    quizId: currentQuizId,
                });
            }
        } catch (error) {
            console.error('Error fetching data in Step 3:', error);
            message.error('Gagal memuat data untuk Tahap 3');
            if (this.state.isMounted) {
                this.setState({ error: 'Gagal memuat data untuk Tahap 3' });
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    renderNormalizedValue = (record, criterionName) => {
        const value = record.normalizedCriteria?.[criterionName];
        if (value !== null && value !== undefined && !isNaN(value)) {
            return <Tag color="blue">{value.toFixed(4)}</Tag>;
        }
        return <Tag color="default">N/A</Tag>;
    };

    render() {
        const {
            normalizedQuestionData,
            quizId,
            loading,
            error,
            criteriaWeights,
            denominators,
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];
        
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
                key: `normalized_${name}`,
                width: 150,
                render: (text, record) => this.renderNormalizedValue(record, name)
            }))
        ];

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
                        const weightValue = criteriaWeights[name];
                        if (weightValue !== null && weightValue !== undefined && !isNaN(weightValue)) {
                            return <Tag color="cyan">{weightValue.toFixed(4)}</Tag>;
                        }
                        return <Tag color="red">(Bobot Belum Tersedia)</Tag>;
                    } else if (record.type === 'denominators') {
                        const denominator = denominators[`criterion_${name}`]; 
                        if (denominator !== null && denominator !== undefined && !isNaN(denominator) && denominator > 0) {
                            return <Tag color="volcano">{denominator.toFixed(4)}</Tag>;
                        }
                        return <Tag color="default">0.0000</Tag>;
                    }
                    return null;
                }
            }))
        ];

        const headerDataSource = [
            { label: 'Bobot', type: 'weights', id: 'header_weights_row' },
            { label: 'Pembagi', type: 'denominators', id: 'header_denominators_row' },
        ];


        if (error) {
            return (
                <div className="app-container">
                    <TypingCard source="Normalisasi Data Kriteria Pertanyaan Quiz (Tahap 3)" />
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
                <TypingCard source="Normalisasi Data Kriteria Pertanyaan Quiz (Tahap 3)" />
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p>Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabel untuk Bobot dan Pembagi */}
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
                        {/* Tabel Utama untuk data pertanyaan yang dinormalisasi */}
                        {normalizedQuestionData.length > 0 ? (
                            <Table
                                dataSource={normalizedQuestionData}
                                columns={mainTableColumns}
                                pagination={false}
                                rowKey="idQuestion"
                                scroll={{ x: 'max-content' }}
                                className="main-questions-table"
                            />
                        ) : (
                            <Alert
                                message="Tidak Ada Data Pertanyaan untuk Normalisasi"
                                description="Tidak ada data pertanyaan yang ditemukan atau dapat dinormalisasi untuk kuis ini."
                                type="info"
                                showIcon
                            />
                        )}
                    </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <div>
                        <Button type="primary" onClick={() => this.handlePreviousPage(quizId)}>
                            Tahap 2
                        </Button>
                    </div>
                    <div>
                        <Button type="primary" onClick={() => this.handleNextPage(quizId)}>
                            Tahap 4
                        </Button>
                    </div>
                </div>

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