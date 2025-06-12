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
            questionsWithCriteria: [],
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
            const [quizResponse, usersResponse, rpsResponse] = await Promise.all([
                getQuiz(),
                getUsers(),
                getRPS()
            ]);

            const { content: quizContent } = quizResponse.data;
            const { content: rpsContent } = rpsResponse.data;
            const allUsers = usersResponse.data.content || usersResponse.data;

            if (!Array.isArray(allUsers)) {
                console.error("Diharapkan allUsers adalah array, tetapi diterima:", allUsers);
                throw new Error("Gagal memuat data user: format data tidak benar.");
            }

            const uniqueLecturers = new Map();

            quizContent.forEach(quiz => {
                const matchingRPS = rpsContent.find(rps => rps.idRps === quiz.rps.idRps);

                if (matchingRPS) {
                    const lecturerIdsWithRoles = [];

                    if (quiz.developerId) lecturerIdsWithRoles.push({ id: quiz.developerId.trim().toLowerCase(), role: 'developer' });
                    if (quiz.coordinatorId) lecturerIdsWithRoles.push({ id: quiz.coordinatorId.trim().toLowerCase(), role: 'coordinator' });
                    if (quiz.instructorId) lecturerIdsWithRoles.push({ id: quiz.instructorId.trim().toLowerCase(), role: 'instructor' });

                    const addRPSLecturers = (lecturersArray, role) => {
                        if (Array.isArray(lecturersArray)) {
                            lecturersArray.forEach(l => {
                                if (l && l.id) {
                                    const normalizedId = l.id.trim().toLowerCase();
                                    if (!lecturerIdsWithRoles.some(item => item.id === normalizedId)) {
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
                        quizId: quiz.idQuiz,
                        matchingRPS: matchingRPS
                    });
                }
            });

            const devLecturers = Array.from(uniqueLecturers.values());

            const uniqueQuestionsMap = new Map();
            for (const quiz of quizContent) {
                const matchingRPS = rpsContent.find(rps => rps.idRps === quiz.rps.idRps);
                if (matchingRPS) {
                    const result = await getQuestionsByRPSQuiz1(matchingRPS.idRps);
                    const { content: questions } = result.data;

                    const quizQuestions = questions.filter(q => q.examType2 === 'QUIZ');
                    for (const question of quizQuestions) {
                        if (!uniqueQuestionsMap.has(question.idQuestion)) {
                            if (!question.criteriaValues) {
                                question.criteriaValues = []; 
                            }
                            question.criteriaValues = question.criteriaValues.map(cv => {
                                const mappedCv = {
                                    ...cv,
                                    user: (cv.user || '').trim().toLowerCase(),
                                    role: cv.role || 'unknown',
                                };
                                const rawRatingValue = typeof cv.ratingValue === 'string' ? parseFloat(cv.ratingValue) : cv.ratingValue;

                                if (cv.criterionId) {
                                    try {
                                        const index = parseInt(cv.criterionId.replace('QC', ''));
                                        if (index >= 1 && index <= 10) {
                                            // --- START MODIFICATION IN fetchData ---
                                            // Change `name` to show the value even if it's 0.0 if explicitly set.
                                            // We will rely on `value` property being undefined/null/not found in renderCriteriaValue
                                            // to determine if it's truly "Belum Dinilai".
                                            mappedCv[`value${index}`] = {
                                                name: isNaN(rawRatingValue) ? 'N/A' : rawRatingValue.toFixed(2), // Show 0.0 as 0.00
                                                value: isNaN(rawRatingValue) ? null : rawRatingValue // Store null if NaN, 0 if 0
                                            };
                                            // --- END MODIFICATION IN fetchData ---
                                        }
                                    } catch (e) {
                                        console.warn(`Could not parse criterionId ${cv.criterionId} for mapping.`, e);
                                    }
                                }
                                return mappedCv;
                            });

                            uniqueQuestionsMap.set(question.idQuestion, question);
                        }
                    }
                }
            }

            const questionsWithCriteria = Array.from(uniqueQuestionsMap.values());

            if (this.state.isMounted) {
                this.setState({
                    devLecturers,
                    questionsWithCriteria,
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
        }
    };

    renderCriteriaValue = (text, record, valueIndex) => {
        if (!record.criteriaValues || record.criteriaValues.length === 0) {
            return <Tag color="default">Belum Dinilai</Tag>;
        }

        const rating = record.criteriaValues.find(cv =>
            // Check if user matches AND if there's a specific entry for this valueIndex
            // Use `!== undefined` for checking if the rating for this specific valueIndex exists.
            cv.user === this.state.selectedLecturerId && cv[`value${valueIndex}`]?.value !== undefined
        );

        // --- START MODIFICATION IN renderCriteriaValue ---
        // Change logic: Only show "Belum Dinilai" if the `rating` object for the selected lecturer/criterion is not found,
        // OR if its `value` property is explicitly null (which we now set for NaN).
        // If `value` is 0, it should be displayed as a valid rating of 0.00.
        if (!rating || rating[`value${valueIndex}`]?.value === null) { // Check for `null` to distinguish from `0`
            return <Tag color="default">Belum Dinilai</Tag>;
        }

        // Now, if `rating.value` is defined (could be 0), display it.
        const displayValue = rating[`value${valueIndex}`].name; // This already handles formatting to 0.00

        return (
            <Tag color={this.getColorForRole(rating.role)}>
                {displayValue}
            </Tag>
        );
        // --- END MODIFICATION IN renderCriteriaValue ---
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
        if (!filePath) return null;
        return `http://localhost:8081${filePath}`;
    };

    render() {
        const {
            questionsWithCriteria,
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
                title: "Pertanyaan",
                key: "questionTitle",
                width: 250,
                render: (text, record) => (
                    <div>
                        {record.title || 'No Title Found'}
                        {record.file_path && (
                            <div style={{ marginTop: 8 }}>
                                <Image
                                    src={this.getImageUrl(record.file_path)}
                                    alt="Question Image"
                                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                                    fallback="https://via.placeholder.com/100?text=No+Image"
                                />
                            </div>
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
                                // Filter pertanyaan yang *memiliki* nilai kriteria untuk dosen saat ini
                                // Kriteria untuk memfilter agar ada nilai yang tidak "Belum Dinilai"
                                // Sekarang kita perlu memeriksa apakah ada nilai numerik yang valid (tidak null)
                                const filteredQuestions = questionsWithCriteria.filter(q =>
                                    q.criteriaValues?.some(cv =>
                                        cv.user === lecturer.id &&
                                        Array.from({ length: 10 }, (_, i) => i + 1).some(idx =>
                                            cv[`value${idx}`]?.value !== null && // Filter out explicitly null values
                                            cv[`value${idx}`]?.value !== undefined // Ensure property exists
                                        )
                                    )
                                );

                                // Console log untuk debugging:
                                console.log(`--- Tab Dosen ID (Normalized): ${lecturer.id} ---`);
                                console.log(`--- Jumlah Pertanyaan Terfilter untuk ${lecturer.name} (${lecturer.id}): ${filteredQuestions.length} ---`);
                                if (filteredQuestions.length > 0) {
                                    console.log("Pertanyaan terfilter pertama:", filteredQuestions[0]);
                                    console.log("Judul pertanyaan terfilter pertama:", filteredQuestions[0].title);
                                    console.log("criteriaValues pertanyaan terfilter pertama:", filteredQuestions[0].criteriaValues);
                                }
                                console.log(`--- Data untuk Tabel di Tab ${lecturer.id} ---`);
                                console.log(filteredQuestions);
                                console.log(`-------------------------------------------`);


                                return (
                                    <TabPane
                                        tab={`${lecturer.name} (${lecturer.role})`}
                                        key={lecturer.id}
                                    >
                                        <Table
                                            dataSource={filteredQuestions}
                                            pagination={false}
                                            rowKey={record => record.idQuestion || Math.random()}
                                            locale={{ emptyText: 'Tidak ada pertanyaan tersedia untuk dosen ini' }}
                                            columns={columns}
                                            scroll={{ x: 'max-content' }}
                                        />
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
                    <Button type="primary" onClick={() => this.handleNextPage(quizId)}>
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
            quizID: PropTypes.string,
        }),
    }).isRequired,
};

const QuizGenerateWithRouter = withRouterWrapper(QuizGenerate);
QuizGenerateWithRouter.displayName = 'QuizGenerateWithRouter';
export default QuizGenerateWithRouter;