/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import PropTypes from 'prop-types';
import TypingCard from "@/components/TypingCard";
import { Button, Table, Tabs, Tag, message, Spin, Alert, Image } from "antd";
import {
    getQuestionsByRPSQuiz1,
} from "@/api/quiz";
import { getQuiz } from "@/api/quiz";
import { getRPS } from "@/api/rps";
import { getUsers } from "@/api/user";
import { getDematelWeightsBySubject } from "@/api/causality"; // Pastikan path ini benar

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
            questionsData: [],
            selectedLecturerId: 'all-lecturers-average',
            quizId: '',
            devLecturers: [],
            isMounted: false,
            matchingRPS: '',
            loading: false,
            error: null,
            criteriaWeights: {}, // Ini akan diisi dengan Map<string, number> yang kuncinya NAMA Kriteria (e.g., "Knowledge")
            criteriaTypes: {
                "Knowledge": "BENEFIT",
                "Comprehension": "BENEFIT",
                "Application": "BENEFIT",
                "Analysis": "BENEFIT",
                "Evaluation": "BENEFIT",
                "Difficulty": "COST",
                "Discrimination": "BENEFIT",
                "Reliability": "BENEFIT",
                "Problem Solving": "BENEFIT",
                "Creativity": "BENEFIT",
            },
            denominators: {},
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step3/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        const currentQuizId = this.props.match.params.quizID;
        history.push(`/setting-quiz/generate-quiz/${currentQuizId}`);
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
                console.error("DEBUG QuizGenerate (fetchData): quizID dari URL tidak ditemukan.");
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
                console.error("DEBUG QuizGenerate (fetchData): Kuis dengan ID", currentQuizId, "TIDAK DITEMUKAN.");
                message.error("Kuis tidak ditemukan.");
                this.setState({ error: "Kuis tidak ditemukan." });
                return;
            }

            const uniqueLecturers = new Map();
            let rpsIdForQuestions = '';
            let subjectIdForWeights = null;

            let fullRPSData = null;

            console.log("--- DEBUG fetchData: Memulai proses pengambilan Subject ID ---");

            if (targetQuiz.rps && targetQuiz.rps.idRps) {
                rpsIdForQuestions = targetQuiz.rps.idRps;
                console.log(`DEBUG: idRps dari targetQuiz.rps: ${rpsIdForQuestions}`);

                fullRPSData = rpsContent.find(rps => rps.idRps === rpsIdForQuestions);
                console.log(`DEBUG: fullRPSData dari rpsContent untuk idRps ${rpsIdForQuestions}:`, fullRPSData);

                if (fullRPSData && fullRPSData.subject && fullRPSData.subject.id) {
                    subjectIdForWeights = fullRPSData.subject.id;
                    console.log(`DEBUG: Subject ID berhasil didapatkan dari fullRPSData.subject.id: ${subjectIdForWeights}`);
                } else {
                    console.warn(`DEBUG: fullRPSData untuk RPS ID ${rpsIdForQuestions} tidak memiliki properti 'subject' atau 'subject.id' yang valid.`);
                    console.warn(`DEBUG: Struktur fullRPSData yang ditemukan:`, fullRPSData);
                }
            } else {
                console.error("DEBUG QuizGenerate (fetchData): targetQuiz.rps atau targetQuiz.rps.idRps tidak ditemukan. Tidak dapat menentukan RPS untuk pertanyaan atau subject.");
                message.error("Data RPS kuis tidak lengkap.");
                this.setState({ error: "Data RPS kuis tidak lengkap." });
                return;
            }

            console.log(`DEBUG: Nilai akhir subjectIdForWeights sebelum panggilan Dematel: ${subjectIdForWeights}`);
            console.log("--- DEBUG fetchData: Selesai proses pengambilan Subject ID ---");


            if (fullRPSData) {
                const lecturerIdsWithRoles = [];
                if (targetQuiz.developerId) lecturerIdsWithRoles.push({ id: targetQuiz.developerId.trim().toLowerCase(), role: 'developer' });
                if (targetQuiz.coordinatorId) lecturerIdsWithRoles.push({ id: targetQuiz.coordinatorId.trim().toLowerCase(), role: 'coordinator' });
                if (targetQuiz.instructorId) lecturerIdsWithRoles.push({ id: targetQuiz.instructorId.trim().toLowerCase(), role: 'instructor' });

                const addRPSLecturers = (lecturersArray, role) => {
                    if (Array.isArray(lecturersArray)) {
                        lecturersArray.forEach(l => {
                            if (l && l.id) {
                                const normalizedId = l.id.trim().toLowerCase();
                                const existingEntry = lecturerIdsWithRoles.find(item => item.id === normalizedId);
                                if (existingEntry) {
                                    if (existingEntry.role === 'Unknown' && role !== 'Unknown') {
                                        existingEntry.role = role;
                                    }
                                } else {
                                    lecturerIdsWithRoles.push({ id: normalizedId, role: role });
                                }
                            }
                        });
                    }
                };

                addRPSLecturers(fullRPSData.developerLecturer, 'developer');
                addRPSLecturers(fullRPSData.coordinatorLecturer, 'coordinator');
                addRPSLecturers(fullRPSData.instructorLecturer, 'instructor');

                lecturerIdsWithRoles.forEach(({ id, role }) => {
                    if (id) {
                        const user = allUsers.find(u => (u.id || '').trim().toLowerCase() === id);

                        if (user && !uniqueLecturers.has(id)) {
                            uniqueLecturers.set(id, {
                                id: id,
                                name: user.name,
                                role: role
                            });
                        } else if (user && uniqueLecturers.has(id)) {
                            const existingLecturer = uniqueLecturers.get(id);
                            if (existingLecturer.role === 'Unknown' && role !== 'Unknown') {
                                existingLecturer.role = role;
                                uniqueLecturers.set(id, existingLecturer);
                            }
                        }
                    }
                });

                this.setState({
                    quizId: targetQuiz.idQuiz,
                    matchingRPS: fullRPSData
                });

            } else {
                console.error(`DEBUG QuizGenerate (fetchData): fullRPSData untuk idRps ${rpsIdForQuestions} tidak ditemukan setelah pencarian.`);
            }

            const devLecturers = Array.from(uniqueLecturers.values());

            const questionIdsForThisQuiz = targetQuiz.questions.map(q => q.idQuestion);

            const questionsFromBackendData = await getQuestionsByRPSQuiz1(rpsIdForQuestions);
            const allRPSQuestions = questionsFromBackendData.data?.content || [];

            const quizQuestions = allRPSQuestions.filter(q =>
                questionIdsForThisQuiz.includes(q.idQuestion)
            );

            const criteriaNamesInOrder = [
                "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
                "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
            ];

            // Mapping dari nama kriteria di frontend ke ID kriteria yang diharapkan dari backend
            const criteriaNameToIdMapping = {};
            criteriaNamesInOrder.forEach((name, index) => {
                const qcId = `QC0${index < 9 ? '0' : ''}${index + 1}`;
                criteriaNameToIdMapping[name] = qcId;
            });
            console.log("DEBUG FRONTEND (Criteria Name to ID Mapping):", criteriaNameToIdMapping);


            let fetchedCriteriaWeights = {};
            if (subjectIdForWeights) {
                console.log(`DEBUG: Melakukan panggilan getDematelWeightsBySubject dengan subjectId: ${subjectIdForWeights}`);
                try {
                    const dematelResponse = await getDematelWeightsBySubject(subjectIdForWeights);
                    // Log response API keseluruhan
                    console.log("DEBUG FRONTEND (Full API Response Object):", dematelResponse);

                    let dematelCriteriaWeightsList = [];
                    let apiStatusCode = null;

                    // Adaptasi untuk struktur respons DefaultResponse Anda
                    if (dematelResponse.data && typeof dematelResponse.data === 'object' && Object.prototype.hasOwnProperty.call(dematelResponse.data, 'statusCode')) {
                        apiStatusCode = dematelResponse.data.statusCode;
                        dematelCriteriaWeightsList = dematelResponse.data.content || [];
                        console.log("DEBUG FRONTEND (Detected DefaultResponse structure. Status Code:", apiStatusCode, "Content:", dematelCriteriaWeightsList);
                    } else if (Array.isArray(dematelResponse.data)) {
                        // Jika respons langsung array (tanpa DefaultResponse wrapper)
                        dematelCriteriaWeightsList = dematelResponse.data;
                        apiStatusCode = 200; // Asumsikan 200 OK jika langsung array dan berhasil
                        console.log("DEBUG FRONTEND (Detected direct Array response structure. Content:", dematelCriteriaWeightsList);
                    } else {
                        console.error("DEBUG FRONTEND: Unexpected API response structure for Dematel weights:", dematelResponse.data);
                        message.error('Format respons bobot Dematel tidak terduga.');
                        this.setState({ error: 'Format respons bobot Dematel tidak terduga.' });
                        return; // Hentikan proses lebih lanjut
                    }

                    if (apiStatusCode === 200 && dematelCriteriaWeightsList.length > 0) {
                        console.log("DEBUG FRONTEND (Processing Dematel Weights List):", dematelCriteriaWeightsList);

                        const processedWeightsMap = {};
                        
                        dematelCriteriaWeightsList.forEach(weightItem => {
                            console.log(`DEBUG FRONTEND (Processing weight item): criterionId=${weightItem.criterionId}, normalizedWeight=${weightItem.normalizedWeight}`);

                            const foundCriterionName = Object.keys(criteriaNameToIdMapping).find(
                                key => criteriaNameToIdMapping[key] === weightItem.criterionId
                            );

                            if (foundCriterionName) {
                                processedWeightsMap[foundCriterionName] = weightItem.normalizedWeight;
                                console.log(`DEBUG FRONTEND (Mapped to Name): ${weightItem.criterionId} (${foundCriterionName}) = ${weightItem.normalizedWeight}`);
                            } else {
                                console.warn(`DEBUG FRONTEND (Mapping skipped): No frontend name found for criterionId: ${weightItem.criterionId}. This weight will be skipped.`);
                            }
                        });
                        
                        fetchedCriteriaWeights = processedWeightsMap;
                        console.log("DEBUG FRONTEND (Final Processed Weights Map for state):", fetchedCriteriaWeights);

                    } else {
                        message.warning("Bobot Dematel tidak ditemukan untuk mata kuliah ini.");
                        console.warn("DEBUG FRONTEND: Dematel API returned no content or non-200 status.");
                    }
                } catch (dematelError) {
                    console.error('Error fetching Dematel weights:', dematelError);
                    message.error('Gagal memuat bobot Dematel.');
                }
            } else {
                message.info("Subject ID tidak tersedia untuk mengambil bobot Dematel. Panggilan API dilewati.");
                criteriaNamesInOrder.forEach(name => {
                    fetchedCriteriaWeights[name] = null;
                });
            }

            const initialDenominators = {};
            criteriaNamesInOrder.forEach((name, index) => {
                initialDenominators[`criterion${index + 1}`] = { sumOfSquares: 0, denominator: null };
            });

            const processedQuestions = quizQuestions.map(q => {
                const transformedQuestion = { ...q };

                const questionRatingObject = q.questionRating || {};
                const reviewerRatings = questionRatingObject.reviewerRatings || {};

                for (let i = 1; i <= criteriaNamesInOrder.length; i++) {
                    let sum = 0;
                    let count = 0;

                    devLecturers.forEach(lecturer => {
                        const lecturerIdKey = lecturer.id.trim().toLowerCase();
                        let lecturerRating = reviewerRatings[lecturerIdKey];

                        if (!lecturerRating && lecturerIdKey.length > 0) {
                            const capitalizedLecturerIdKey = lecturerIdKey.charAt(0).toUpperCase() + lecturerIdKey.slice(1);
                            lecturerRating = reviewerRatings[capitalizedLecturerIdKey];
                        }

                        if (lecturerRating && typeof lecturerRating === 'object' && lecturerRating[`averageValue${i}`] !== undefined && lecturerRating[`averageValue${i}`] !== null && !isNaN(lecturerRating[`averageValue${i}`])) {
                            const value = Number(lecturerRating[`averageValue${i}`]);
                            sum += value;
                            count++;
                        }
                    });

                    const overallAverage = count > 0 ? (sum / count) : null;
                    transformedQuestion[`averageCriterion${i}`] = {
                        value: overallAverage,
                        name: overallAverage !== null ? overallAverage.toFixed(2) : 'N/A',
                        role: 'average',
                    };

                    if (overallAverage !== null) {
                        const squaredAverage = overallAverage * overallAverage;
                        initialDenominators[`criterion${i}`].sumOfSquares += squaredAverage;
                    }
                }

                devLecturers.forEach(lecturer => {
                    const lecturerIdKey = lecturer.id.trim().toLowerCase();
                    let lecturerRating = reviewerRatings[lecturerIdKey];
                    if (!lecturerRating && lecturerIdKey.length > 0) {
                        const capitalizedLecturerIdKey = lecturerIdKey.charAt(0).toUpperCase() + lecturerIdKey.slice(1);
                        lecturerRating = reviewerRatings[capitalizedLecturerIdKey];
                    }
                    if (lecturerRating && typeof lecturerRating === 'object') {
                        for (let i = 1; i <= criteriaNamesInOrder.length; i++) {
                            const avgValueKey = `averageValue${i}`;
                            const criterionValueKey = `criteriaValue${i}_${lecturer.id}`;
                            const rawValue = lecturerRating[avgValueKey];
                            transformedQuestion[criterionValueKey] = {
                                value: rawValue,
                                name: rawValue !== undefined && rawValue !== null && !isNaN(rawValue) ? Number(rawValue).toFixed(2) : 'N/A',
                                role: lecturer.role
                            };
                        }
                    } else {
                        for (let i = 1; i <= criteriaNamesInOrder.length; i++) {
                            const criterionValueKey = `criteriaValue${i}_${lecturer.id}`;
                            transformedQuestion[criterionValueKey] = {
                                value: null,
                                name: 'Belum Dinilai',
                                role: lecturer.role
                            };
                        }
                    }
                });

                return transformedQuestion;
            });

            const finalDenominators = {};
            criteriaNamesInOrder.forEach((name, index) => {
                const totalSumOfSquares = initialDenominators[`criterion${index + 1}`].sumOfSquares;
                finalDenominators[`criterion${index + 1}`] = Math.sqrt(totalSumOfSquares);
            });


            if (this.state.isMounted) {
                this.setState({
                    devLecturers,
                    questionsData: processedQuestions,
                    userInfo: allUsers,
                    error: null,
                    quizId: currentQuizId,
                    denominators: finalDenominators,
                    criteriaWeights: fetchedCriteriaWeights, // Ini akan diisi dengan map yang benar
                    selectedLecturerId: 'all-lecturers-average',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (this.state.isMounted) {
                this.setState({ error: 'Gagal memuat data' });
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    getColorForRole = (role) => {
        switch ((role || '').toLowerCase()) {
            case 'developer': return 'blue';
            case 'coordinator': return 'green';
            case 'instructor': return 'orange';
            case 'average': return 'purple';
            case 'info': return 'cyan';
            case 'denominator': return 'volcano';
            case 'not-available-weight': return 'red';
            default: return 'default';
        }
    };

    renderAverageCriteriaValue = (record, valueIndex) => {
        const averageKey = `averageCriterion${valueIndex}`;
        const ratingEntry = record[averageKey];

        if (!ratingEntry || ratingEntry.value === null || ratingEntry.value === undefined || isNaN(ratingEntry.value)) {
            return <Tag color="default">N/A</Tag>;
        }
        return <Tag color={this.getColorForRole('average')}>{ratingEntry.name}</Tag>;
    };

    render() {
        const {
            questionsData,
            quizId,
            loading,
            error,
            criteriaWeights, // Ini yang sekarang akan berisi Map yang benar
            criteriaTypes,
            denominators
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];

        // Buat mapping dari nama kriteria di frontend ke ID kriteria yang sebenarnya (QC001, dst.)
        // Ini digunakan di `render` untuk mencari bobot yang benar di `criteriaWeights`.
        const criteriaNameToQCIdMapping = {};
        criteriaNames.forEach((name, index) => {
            const qcId = `QC0${index < 9 ? '0' : ''}${index + 1}`; // QC001, QC002, ..., QC010
            criteriaNameToQCIdMapping[name] = qcId; // e.g., "Knowledge": "QC001"
        });


        const baseColumns = [
            {
                title: "ID Pertanyaan",
                dataIndex: "idQuestion",
                key: "idQuestion",
                align: "center",
                width: 150,
                fixed: 'left',
                render: (text, record) => {
                    return text;
                }
            },
        ];

        const mainTableColumns = [
            ...baseColumns,
            ...criteriaNames.map((name, index) => ({
                title: name,
                key: `criterion_${index + 1}`,
                width: 150,
                render: (text, record) => this.renderAverageCriteriaValue(record, index + 1)
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
                render: (text, record) => {
                    return <span style={{ fontWeight: 'bold' }}>{text}</span>;
                }
            },
            ...criteriaNames.map((name, index) => ({
                title: name,
                key: `header_criterion_${index + 1}`,
                width: 150,
                render: (text, record) => {
                    if (record.type === 'weights') {
                        // Ambil ID kriteria yang sesuai untuk kolom ini
                        const criterionId = criteriaNameToQCIdMapping[name]; // e.g., "QC001"
                        
                        // Akses bobot langsung dari criteriaWeights menggunakan ID kriteria (yang sekarang menjadi kunci)
                        const weightValue = criteriaWeights[name]; // <--- PERBAIKAN DI SINI

                        // Log nilai yang sedang diakses
                        console.log(`DEBUG FRONTEND (Render Weight): name="${name}", criterionId="${criterionId}", weightValue=${weightValue}, criteriaWeights state:`, criteriaWeights);

                        if (weightValue !== null && weightValue !== undefined) {
                            return <Tag color={this.getColorForRole('info')}>{weightValue.toFixed(4)}</Tag>;
                        }
                        return <Tag color={this.getColorForRole('not-available-weight')}>(Bobot Belum Tersedia)</Tag>;
                    } else if (record.type === 'types') {
                        const type = criteriaTypes[name] !== undefined ? criteriaTypes[name] : 'N/A';
                        return <Tag color={this.getColorForRole('info')}>{type}</Tag>;
                    } else if (record.type === 'denominators') {
                        const denominator = denominators[`criterion${index + 1}`];
                        if (denominator !== null && denominator !== undefined && !isNaN(denominator)) {
                            return <Tag color={this.getColorForRole('denominator')}>{denominator.toFixed(4)}</Tag>;
                        }
                        return <Tag color="default">N/A</Tag>;
                    }
                    return null;
                }
            }))
        ];

        const headerDataSource = [
            { label: 'Bobot', type: 'weights', id: 'header_weights_row' },
            { label: 'Tipe', type: 'types', id: 'header_types_row' },
            { label: 'Pembagi', type: 'denominators', id: 'header_denominators_row' },
        ];


        if (error) {
            return (
                <div className="app-container">
                    <TypingCard source="Daftar Nilai Quiz Berdasarkan Dosen Yang Menilai Dalam bentuk numerik" />
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
                <TypingCard source="Daftar Nilai Quiz Berdasarkan Dosen Yang Menilai Dalam bentuk numerik" />
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p>Memuat data kuis...</p>
                    </div>
                ) : (
                    <Tabs
                        activeKey="all-lecturers-average"
                        style={{ marginBottom: 20 }}
                    >
                        <TabPane
                            tab="Rata-rata Penilaian Dosen & Pembagi"
                            key="all-lecturers-average"
                        >
                            {/* Tabel untuk Bobot, Tipe, Pembagi */}
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
                            {/* Tabel Utama untuk data pertanyaan */}
                            {questionsData.length > 0 ? (
                                <Table
                                    dataSource={questionsData}
                                    pagination={false}
                                    rowKey={record => record.idQuestion || Math.random()}
                                    columns={mainTableColumns}
                                    scroll={{ x: 'max-content' }}
                                    className="main-questions-table"
                                />
                            ) : (
                                <Alert
                                    message="Tidak Ada Data Penilaian Quiz"
                                    description="Tidak ada data penilaian quiz atau dosen yang ditemukan untuk kuis ini."
                                    type="info"
                                    showIcon
                                />
                            )}
                        </TabPane>
                    </Tabs>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <div>
                        <Button type="primary" onClick={() => this.handlePreviousPage()}>
                            Tahap 1
                        </Button>
                    </div>
                    <div>
                        <Button type="primary" onClick={() => this.handleNextPage(quizId)}>
                            Tahap 3
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