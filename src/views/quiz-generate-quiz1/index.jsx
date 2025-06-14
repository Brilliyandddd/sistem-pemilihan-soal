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
            questionsData: [], 
            selectedLecturerId: '', 
            quizId: '',
            devLecturers: [], 
            isMounted: false,
            matchingRPS: '',
            loading: false,
            error: null
        };
    }

    handleNextPage = (quizId) => {
        const { history } = this.props;
        history.push(`/setting-quiz/generate-quiz-step2/${quizId}`);
    };

    handlePreviousPage = () => {
        const { history } = this.props;
        history.push(`/setting-quiz/`);
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

            const matchingRPS = rpsContent.find(rps => rps.idRps === targetQuiz.rps.idRps);

            if (matchingRPS) {
                rpsIdForQuestions = matchingRPS.idRps; 
                console.log("DEBUG QuizGenerate (fetchData): RPS ID untuk pertanyaan:", rpsIdForQuestions); 
                
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

                addRPSLecturers(matchingRPS.developerLecturer, 'developer');
                addRPSLecturers(matchingRPS.coordinatorLecturer, 'coordinator');
                addRPSLecturers(matchingRPS.instructorLecturer, 'instructor');

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
                    matchingRPS: matchingRPS
                });
            } else {
                console.error("DEBUG QuizGenerate (fetchData): RPS terkait kuis tidak ditemukan untuk ID Kuis:", currentQuizId); 
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

            console.log("--- DEBUG: Memeriksa Struktur Data Mentah dari Backend ---");
            quizQuestions.forEach(q => { 
                console.log(`Question ID: ${q.idQuestion}`);
                console.log(`       q.questionRating (as received):`, q.questionRating);
                if (q.questionRating && typeof q.questionRating === 'object') {
                    if (q.questionRating.reviewerRatings) { 
                        console.log(`       q.questionRating.reviewerRatings (nested):`, q.questionRating.reviewerRatings);
                        console.log(`       Keys dalam q.questionRating.reviewerRatings:`, Object.keys(q.questionRating.reviewerRatings));
                        if (Object.keys(q.questionRating.reviewerRatings).length > 0) {
                            console.log(`       Contoh entry pertama di q.questionRating.reviewerRatings:`, Object.values(q.questionRating.reviewerRatings)[0]);
                        }
                    } else {
                        console.log(`       q.questionRating is object, but reviewerRatings property is missing or empty.`);
                    }
                } else {
                    console.log(`       Peringatan: q.questionRating bukan objek atau null. Type: ${typeof q.questionRating}`);
                }
                console.log('----------------------------------------------------');
            });

            const processedQuestions = quizQuestions.map(q => { 
                const transformedQuestion = { ...q };

                const questionRatingObject = q.questionRating || {}; 
                const reviewerRatings = questionRatingObject.reviewerRatings || {}; 

                devLecturers.forEach(lecturer => {
                    const lecturerIdKey = lecturer.id.trim().toLowerCase();
                    
                    let lecturerRating = reviewerRatings[lecturerIdKey];
                    if (!lecturerRating && lecturerIdKey.length > 0) {
                        const capitalizedLecturerIdKey = lecturerIdKey.charAt(0).toUpperCase() + lecturerIdKey.slice(1);
                        lecturerRating = reviewerRatings[capitalizedLecturerIdKey];
                    }
                    
                    if (lecturerRating && typeof lecturerRating === 'object') {
                        for (let i = 1; i <= 10; i++) {
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
                        for (let i = 1; i <= 10; i++) {
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

            console.log("Frontend: Data pertanyaan KUIS yang DITERIMA DARI BACKEND setelah re-fetch (PROCESSED):");
            processedQuestions.forEach((q, index) => {
              console.log(`        Question ${index + 1} (ID: ${q.idQuestion}):`, q); 
              devLecturers.forEach(lecturer => {
                  for (let i = 1; i <= 10; i++) {
                      const criterionValueKey = `criteriaValue${i}_${lecturer.id}`;
                      if (q[criterionValueKey]) {
                          console.log(`         - Transformed ${criterionValueKey}:`, q[criterionValueKey]);
                      }
                  }
              });
            });
            console.log("--- END PROCESSED DEBUG LOGGING ---");

            if (this.state.isMounted) {
                this.setState({
                    devLecturers,
                    questionsData: processedQuestions, 
                    userInfo: allUsers,
                    error: null,
                    selectedLecturerId: devLecturers[0]?.id || '' 
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

    renderCriteriaValue = (text, record, valueIndex) => {
        const criterionValueKey = `criteriaValue${valueIndex}_${this.state.selectedLecturerId}`;
        const ratingEntry = record[criterionValueKey];

        if (!ratingEntry || ratingEntry.value === null || ratingEntry.value === undefined || isNaN(ratingEntry.value)) {
            return <Tag color="default">Belum Dinilai</Tag>;
        }

        const displayValue = ratingEntry.name; 
        const role = ratingEntry.role; 

        return (
            <Tag color={this.getColorForRole(role)}>
                {displayValue}
            </Tag>
        );
    };

    getColorForRole = (role) => {
        switch ((role || '').toLowerCase()) {
            case 'developer': return 'blue';
            case 'coordinator': return 'green';
            case 'instructor': return 'orange';
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
    
    // Asumsi filePath yang diterima dari backend adalah seperti "/images/questions/RPS001-D001-Q007.png"
    // URL dasar aplikasi Spring Boot adalah http://localhost:8081
    const imageUrl = `http://localhost:8081${filePath}`; 
    
    console.log(`getImageUrl DEBUG: Original filePath (from backend): ${filePath}, Generated Static URL: ${imageUrl}`);
    return imageUrl;
};

    render() {
        const {
            questionsData, 
            devLecturers,
            quizId,
            loading,
            error,
            selectedLecturerId
        } = this.state;

        const criteriaNames = [
            "Knowledge", "Comprehension", "Application", "Analysis", "Evaluation",
            "Difficulty", "Discrimination", "Reliability", "Problem Solving", "Creativity"
        ];

        const columns = [
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
                        {/* Judul Pertanyaan */}
                        {record.title || 'No Title Found'}

                        {/* Menampilkan Gambar jika questionType adalah IMAGE dan ada file_path */}
                        {record.questionType === 'IMAGE' && record.file_path && (
                            <div style={{ marginTop: 8 }}>
                                <p>
                                  <Image
                                      src={this.getImageUrl(record.file_path)}
                                      alt="Question Image"
                                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                      fallback="https://via.placeholder.com/200?text=Gambar+Tidak+Dimuat" // Pesan fallback yang lebih jelas
                                  />
                                </p>
                            </div>
                        )}
                        {/* Menampilkan Deskripsi jika questionType bukan IMAGE */}
                        {record.description && record.questionType !== 'IMAGE' && (
                            <p>{record.description}</p>
                        )}
                        {/* Informasi Tipe Pertanyaan jika bukan Normal atau Gambar */}
                        {record.questionType && record.questionType !== 'IMAGE' && record.questionType !== 'NORMAL' && (
                            <p>Tipe: {record.questionType}</p>
                        )}
                    </div>
                )
            },
            ...criteriaNames.map((name, index) => ({
                title: name,
                key: `value${index + 1}`, 
                width: 150,
                render: (text, record) => this.renderCriteriaValue(text, record, index + 1)
            }))
        ];

        if (error) {
            return (
                <div className="app-container">
                    <TypingCard source="Daftar Nilai Quiz Berdasarkan Dosen Yang Menilai" />
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
                        {devLecturers.length > 0 ? (
                            devLecturers.map((lecturer) => {
                                const questionsToShow = questionsData; 

                                console.log(`--- Tab Dosen ID (Normalized): ${lecturer.id} ---`);
                                console.log(`--- Jumlah Pertanyaan Ditampilkan untuk ${lecturer.name} (${lecturer.id}): ${questionsToShow.length} ---`);
                                if (questionsToShow.length > 0) {
                                    console.log("Pertanyaan pertama di tab ini:", questionsToShow[0]);
                                }
                                console.log(`-------------------------------------------`);

                                return (
                                    <TabPane
                                        tab={`${lecturer.name} (${lecturer.role})`}
                                        key={lecturer.id}
                                    >
                                        {questionsToShow.length > 0 ? (
                                            <Table
                                                dataSource={questionsToShow} 
                                                pagination={false}
                                                rowKey={record => record.idQuestion || Math.random()}
                                                columns={columns}
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
                                );
                            })
                        ) : (
                            <Alert
                                message="Informasi"
                                description="Tidak ada dosen yang terlibat dalam kuis ini, atau data dosen tidak dapat dimuat."
                                type="info"
                                showIcon
                            />
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