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
import { useNavigate, useParams } from 'react-router-dom';
import { getDematelWeightsBySubject } from "@/api/causality"; // Pastikan path ini benar (diperlukan untuk Bobot/Pembagi)

const { Column } = Table;
const { TabPane } = Tabs;

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

class QuizGenerate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rps: [],
            quiz: [],
            userInfo: [],
            questionsData: [], // Akan menyimpan pertanyaan dengan rata-rata (x_ij)
            selectedLecturerId: 'all-lecturers-average', // Default ke tab rata-rata
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
            denominators: {}, // Pembagi
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step3/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        const currentQuizId = this.props.match.params.quizID; // Dapatkan quizId dari URL
        history.push(`/setting-quiz/generate-quiz/${currentQuizId}`); // Kembali ke Step 1
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
        // Deklarasikan variabel di scope ini
        let fetchedCriteriaWeights = {};
        let finalDenominators = {}; 
        
        try {
            const currentQuizId = this.props.match.params.quizID;
            console.log("DEBUG QuizGenerate (fetchData): currentQuizId dari URL:", currentQuizId);

            if (!currentQuizId) {
                console.error("DEBUG QuizGenerate (fetchData): quizID dari URL tidak ditemukan. Pastikan URL dan Route definition benar.");
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

            console.log("DEBUG QuizGenerate (fetchData): allQuizzes yang berhasil diambil:", allQuizzes);

            const targetQuiz = allQuizzes.find(q => q.idQuiz === currentQuizId);

            if (!targetQuiz) {
                console.error("DEBUG QuizGenerate (fetchData): Kuis dengan ID", currentQuizId, "TIDAK DITEMUKAN di daftar kuis yang diambil.");
                message.error("Kuis tidak ditemukan.");
                this.setState({ error: "Kuis tidak ditemukan." });
                return;
            }

            console.log("DEBUG QuizGenerate (fetchData): Kuis target ditemukan:", targetQuiz);

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
                    matchingRPS: '' // Initialize with an empty string or appropriate default value
                });
            } else {
                console.error(`DEBUG QuizGenerate (fetchData): fullRPSData untuk idRps ${rpsIdForQuestions} tidak ditemukan setelah pencarian.`);
                message.error("RPS terkait kuis tidak ditemukan.");
                this.setState({ error: "RPS terkait kuis tidak ditemukan." });
                return;
            }

            const devLecturers = Array.from(uniqueLecturers.values());

            const questionIdsForThisQuiz = targetQuiz.questions.map(q => q.idQuestion);
            console.log("DEBUG QuizGenerate (fetchData): ID pertanyaan untuk kuis ini:", questionIdsForThisQuiz);

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


            // Ambil fetchedCriteriaWeights dan finalDenominators dari Dematel API
            // Ini akan mengisi nilai Bobot dan Pembagi di tampilan.
            if (subjectIdForWeights) {
                console.log(`DEBUG: Melakukan panggilan getDematelWeightsBySubject dengan subjectId: ${subjectIdForWeights}`);
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
                        // Kriteria ini adalah nama yang digunakan di objek `criteriaWeights` di state
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

            // --- Bagian Memproses Pertanyaan dan Menghitung Rata-rata (x_ij) ---
            const actualTempDenominatorsSumOfSquares = {}; // Untuk menghitung pembagi
            criteriaNamesInOrder.forEach(name => {
                actualTempDenominatorsSumOfSquares[name] = 0;
            });

            const processedQuestions = quizQuestions.map(q => {
                const transformedQuestion = { ...q };
                
                // q.questionRating sudah tersedia dari getQuestionsByRPSQuiz1 (dari Step 1)
                const questionRatingObject = q.questionRating || {}; 
                const reviewerRatings = questionRatingObject.reviewerRatings || {};

                transformedQuestion.averageCriteria = {}; // Untuk menyimpan rata-rata x_ij per kriteria
                for (let i = 0; i < criteriaNamesInOrder.length; i++) {
                    const criterionName = criteriaNamesInOrder[i];
                    const avgValueKey = `averageValue${i + 1}`; // e.g., averageValue1, averageValue2

                    let sum = 0;
                    let count = 0;

                    devLecturers.forEach(lecturer => {
                        const lecturerIdKey = lecturer.id.trim().toLowerCase();
                        let lecturerRating = reviewerRatings[lecturerIdKey];
                        
                        if (!lecturerRating && lecturerIdKey.length > 0) {
                            const capitalizedLecturerIdKey = lecturerIdKey.charAt(0).toUpperCase() + lecturerIdKey.slice(1);
                            lecturerRating = reviewerRatings[capitalizedLecturerIdKey];
                        }

                        if (lecturerRating && typeof lecturerRating === 'object' && lecturerRating[avgValueKey] !== undefined && lecturerRating[avgValueKey] !== null && !isNaN(lecturerRating[avgValueKey])) {
                            const value = Number(lecturerRating[avgValueKey]);
                            sum += value;
                            count++;
                        }
                    });

                    const overallAverage = count > 0 ? (sum / count) : null;
                    // FIX: Bulatkan overallAverage ke 2 desimal agar konsisten dengan tampilan dan perhitungan selanjutnya
                    transformedQuestion.averageCriteria[criterionName] = overallAverage !== null ? parseFloat(overallAverage.toFixed(4)) : null;
                }
                return transformedQuestion;
            });

            // HITUNG DENOMINATOR SETELAH semua overallAverage (x_ij) dihitung
            processedQuestions.forEach(q => {
                criteriaNamesInOrder.forEach(name => {
                    const overallAverage = q.averageCriteria[name];
                    if (overallAverage !== null) {
                        actualTempDenominatorsSumOfSquares[name] += (overallAverage * overallAverage);
                    }
                });
            });

            // Finalisasi Pembagi
            criteriaNamesInOrder.forEach(name => {
                const sumOfSquares = actualTempDenominatorsSumOfSquares[name];
                // FIX: Bulatkan pembagi ke 2 desimal
                finalDenominators[`criterion_${name}`] = (sumOfSquares > 0) ? parseFloat(Math.sqrt(sumOfSquares).toFixed(4)) : 0;
            });


            if (this.state.isMounted) {
                this.setState({
                    devLecturers,
                    questionsData: processedQuestions, // questionsData sekarang berisi rata-rata x_ij
                    userInfo: allUsers,
                    error: null,
                    quizId: currentQuizId,
                    denominators: finalDenominators, // Simpan pembagi di state
                    criteriaWeights: fetchedCriteriaWeights, // Simpan bobot di state
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

    // Render fungsi untuk nilai kriteria (rata-rata atau per dosen)
    renderCriteriaValue = (record, valueIndex, criterionName) => {
        const { selectedLecturerId } = this.state;
        let displayValue = 'N/A';
        let color = 'default';

        if (selectedLecturerId === 'all-lecturers-average') {
            const avgValue = record.averageCriteria?.[criterionName]; // Ambil dari averageCriteria
            if (avgValue !== null && avgValue !== undefined && !isNaN(avgValue)) {
                displayValue = avgValue.toFixed(4); // Bulatkan untuk tampilan
                color = this.getColorForRole('average');
            }
        } else {
            const criterionValueKey = `criteriaValue${valueIndex}_${selectedLecturerId}`;
            const ratingEntry = record[criterionValueKey];
            if (ratingEntry && ratingEntry.value !== null && ratingEntry.value !== undefined && !isNaN(ratingEntry.value)) {
                displayValue = ratingEntry.name; // Nama linguistic term
                color = this.getColorForRole(ratingEntry.role);
            } else {
                displayValue = 'Belum Dinilai';
            }
        }
        return <Tag color={color}>{displayValue}</Tag>;
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

    selectLecture = (key) => {
        this.setState({ selectedLecturerId: key });
    };

    getImageUrl = (filePath) => {
        if (!filePath) {
            console.warn("getImageUrl: filePath is null or empty.");
            return "https://via.placeholder.com/200?text=No+Image+Path";
        }

        const imageUrl = `http://localhost:8081${filePath}`;
        return imageUrl;
    };

    render() {
        const {
            questionsData,
            devLecturers,
            quizId,
            loading,
            error,
            selectedLecturerId,
            criteriaWeights,
            criteriaTypes,
            denominators
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];

        const dynamicColumns = [
            {
                title: "ID Pertanyaan",
                dataIndex: "idQuestion",
                key: "idQuestion",
                align: "center",
                width: 120,
            },
            {
                title: "Pertanyaan",
                key: "questionContent",
                width: 250,
                render: (text, record) => (
                    <div>
                        {record.title || 'No Title Found'}
                        {record.questionType === 'IMAGE' && record.file_path && (
                            <div style={{ marginTop: 8 }}>
                                <p>
                                    <Image
                                        src={this.getImageUrl(record.file_path)}
                                        alt="Question Image"
                                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                        fallback="https://via.placeholder.com/200?text=Gambar+Tidak+Dimuat"
                                    />
                                </p>
                            </div>
                        )}
                        {record.description && record.questionType !== 'IMAGE' && (
                            <p>{record.description}</p>
                        )}
                        {record.questionType && record.questionType !== 'IMAGE' && record.questionType !== 'NORMAL' && (
                            <p>Tipe: {record.questionType}</p>
                        )}
                    </div>
                )
            },
            ...criteriaNames.map((name, index) => ({
                title: name,
                key: `criterion_value_${index + 1}`,
                width: 150,
                // FIX: Passing criterion name to renderCriteriaValue
                render: (text, record) => this.renderCriteriaValue(record, index + 1, name)
            }))
        ];

        // Header Table Columns (Bobot, Tipe, Pembagi)
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
            {
                title: "", // Spacer untuk kolom "Pertanyaan"
                key: "spacer",
                width: 250,
                fixed: 'left',
            },
            ...criteriaNames.map((name, index) => ({
                title: name,
                key: `header_criterion_${index + 1}`,
                width: 150,
                render: (text, record) => {
                    if (record.type === 'weights') {
                        const weightValue = criteriaWeights[name];
                        if (weightValue !== null && weightValue !== undefined && !isNaN(weightValue)) {
                            // FIX: Bulatkan bobot ke 2 desimal
                            return <Tag color={this.getColorForRole('info')}>{weightValue.toFixed(4)}</Tag>;
                        }
                        return <Tag color="red">(Bobot Belum Tersedia)</Tag>;
                    } else if (record.type === 'types') {
                        const type = criteriaTypes[name] !== undefined ? criteriaTypes[name] : 'N/A';
                        return <Tag color={this.getColorForRole('info')}>{type}</Tag>;
                    } else if (record.type === 'denominators') {
                        const denominator = denominators[`criterion_${name}`];
                        if (denominator !== null && denominator !== undefined && !isNaN(denominator)) {
                            // FIX: Bulatkan pembagi ke 2 desimal
                            return <Tag color={this.getColorForRole('denominator')}>{denominator.toFixed(4)}</Tag>;
                        }
                        return <Tag color="default">0.00</Tag>;
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
                <TypingCard source="Daftar Nilai Quiz Berdasarkan Dosen Yang Menilai" />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p>Memuat data kuis...</p>
                    </div>
                ) : (
                    <Tabs
                        onChange={this.selectLecture}
                        style={{ marginBottom: 20 }}
                        activeKey={selectedLecturerId}
                    >
                        {/* Tab untuk Rata-rata Semua Dosen */}
                        <TabPane
                            tab="Rata-rata Semua Dosen"
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
                                    columns={dynamicColumns} // Use dynamicColumns for consistency
                                    scroll={{ x: 'max-content' }}
                                />
                            ) : (
                                <Alert
                                    message="Tidak Ada Pertanyaan Quiz"
                                    description="Tidak ada pertanyaan quiz yang ditemukan untuk kuis ini."
                                    type="info"
                                    showIcon
                                />
                            )}
                        </TabPane>

                        {/* Tabs untuk Setiap Dosen */}
                        {devLecturers.length > 0 ? (
                            devLecturers.map((lecturer) => (
                                <TabPane
                                    tab={`${lecturer.name} (${lecturer.role})`}
                                    key={lecturer.id}
                                >
                                    {questionsData.length > 0 ? (
                                        <Table
                                            dataSource={questionsData}
                                            pagination={false}
                                            rowKey={record => record.idQuestion || Math.random()}
                                            columns={dynamicColumns}
                                            scroll={{ x: 'max-content' }}
                                        />
                                    ) : (
                                        <Alert
                                            message="Informasi"
                                            description="Tidak ada dosen yang terlibat dalam kuis ini, atau data dosen tidak dapat dimuat."
                                            type="info"
                                            showIcon
                                        />
                                    )}
                                </TabPane>
                            ))
                        ) : (
                            selectedLecturerId !== 'all-lecturers-average' && (
                                <Alert
                                    message="Informasi"
                                    description="Tidak ada dosen yang terlibat dalam kuis ini, atau data dosen tidak dapat dimuat."
                                    type="info"
                                    showIcon
                                />
                            )
                        )}
                    </Tabs>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button type="primary" onClick={this.handlePreviousPage}>
                        Halaman Sebelumnya
                    </Button>
                    <Button type="primary" onClick={this.handleNextPage.bind(this, quizId)}>
                        Halaman Selanjutnya
                    </Button>
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