/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { Row, Col } from "antd";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { Card, Table, Tag, Spin, Alert, Button, Divider } from "antd";
import TypingCard from "@/components/TypingCard";

import { getQuiz } from "@/api/quiz";
import { getRPS } from "@/api/rps";
import { reqUserInfo } from "@/api/user";
import { getTasksForTeacher } from "@/api/causality";
import { UserOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons';

const { Column } = Table;

// Helper function to find name by ID (dapat dipindahkan ke util jika sering dipakai)
const findNameById = (list, id) => {
    const item = list.find((item) => item.id === id);
    return item ? item.name : id || "-";
};

class ListTodo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rps: [],
            quiz: [],
            userInfo: null,
            quizMessages: [],
            causalityTasks: [],
            loading: true,
            error: null,
            lectures: [],
            subjects: [],
        };
    }

    fetchDropdownData = async () => {
        try {
            const [subjectResponse, lectureResponse] = await Promise.all([
                import('@/api/subject').then(module => module.getSubjects()),
                import('@/api/lecture').then(module => module.getLectures()),
            ]);

            if (subjectResponse.data && subjectResponse.data.content) {
                this.setState({ subjects: subjectResponse.data.content });
            } else {
                console.error("Failed to load subjects data: Invalid structure.");
            }

            if (lectureResponse.data && lectureResponse.data.content) {
                this.setState({ lectures: lectureResponse.data.content });
            } else {
                console.error("Failed to load lectures data: Invalid structure.");
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
            this.setState({ error: 'Failed to load dropdown data (subjects/lectures).' });
        }
    };

    fetchAllData = async () => {
        try {
            this.setState({ loading: true, error: null });

            const [quizResponse, rpsResponse, userInfoResponse] = await Promise.all([
                getQuiz(),
                getRPS(),
                reqUserInfo()
            ]);

            const { content: quizContent, statusCode: quizStatusCode } = quizResponse.data;
            const { content: rpsContent, statusCode: rpsStatusCode } = rpsResponse.data;

            // Ambil userId langsung dari userInfoResponse.data
            const { id: userId, content: userInfoContent, statusCode: userInfoStatusCode } = userInfoResponse.data;

            console.log('User ID from userInfoResponse (CORRECTED):', userId);
            console.log('userInfoResponse.data (ORIGINAL):', userInfoResponse.data);

            this.setState({
                quiz: quizStatusCode === 200 ? quizContent : [],
                rps: rpsStatusCode === 200 ? rpsContent : [],
                userInfo: userInfoStatusCode === 200 ? userInfoResponse.data : null,
            });

            if (quizStatusCode === 200 && rpsStatusCode === 200 && userId) {
                this.processQuizMessages(quizContent, rpsContent, userId);
                await this.fetchCausalityTasks(userId);
            } else {
                console.warn('User info not available or API calls failed, skipping quiz/causality processing.');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            this.setState({
                error: 'Failed to load data. Please try again.',
                loading: false
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    fetchCausalityTasks = async (teacherId) => {
        console.log('Fetching causality tasks for teacherId:', teacherId);
        try {
            const response = await getTasksForTeacher(teacherId);
            console.log('Response from getTasksForTeacher API:', response);
            if (response.data && response.data.content) {
                const formattedCausalityTasks = response.data.content.map(task => ({
                    ...task,
                    message: task.description || "Tugas Penilaian Kausalitas",
                }));
                this.setState({ causalityTasks: formattedCausalityTasks });
                console.info("Fetched causality tasks:", formattedCausalityTasks);
            } else {
                console.warn("No causality tasks found or invalid data structure for teacher:", teacherId);
                this.setState({ causalityTasks: [] });
            }
        } catch (error) {
            console.error('Error fetching causality tasks:', error);
            this.setState({ error: 'Failed to load causality tasks.' });
        }
    };

    processQuizMessages = (quizContent, rpsContent, userId) => {
        const quizMessages = [];

        const lowerCaseUserId = userId.toLowerCase();

        quizContent.forEach(quiz => {
            const matchingRPS = rpsContent.find(rps => rps.idRps === quiz.rps.idRps);

            const lowerCaseQuizDeveloperId = quiz.developerId ? quiz.developerId.toLowerCase() : '';
            const lowerCaseQuizCoordinatorId = quiz.coordinatorId ? quiz.coordinatorId.toLowerCase() : '';
            const lowerCaseQuizInstructorId = quiz.instructorId ? quiz.instructorId.toLowerCase() : '';

            if (lowerCaseQuizDeveloperId === lowerCaseUserId || lowerCaseQuizCoordinatorId === lowerCaseUserId || lowerCaseQuizInstructorId === lowerCaseUserId) {
                console.log(`User ${userId} IS authorized for Quiz: ${quiz.name}`);
                quizMessages.push({
                    idQuiz: quiz.idQuiz,
                    message: quiz.message,
                    quiz: quiz.name,
                    rpsName: matchingRPS ? matchingRPS.nameRps : 'N/A',
                    rpsId: quiz.rps.idRps,
                    type_quiz: quiz.type_quiz,
                    date_start: quiz.date_start,
                    date_end: quiz.date_end,
                    description: quiz.description,
                    duration: quiz.duration,
                    min_grade: quiz.min_grade,
                    status: this.getQuizStatus(quiz),
                });
            } else {
                console.log(`User ${userId} IS NOT authorized for Quiz: ${quiz.name} (Quiz developerId: ${quiz.developerId}) - Case mismatch or not assigned.`);
            }
        });

        this.setState({ quizMessages });
    };

    getQuizStatus = (quiz) => {
        const now = new Date();
        const startDate = new Date(quiz.date_start);
        const endDate = new Date(quiz.date_end);

        if (now > endDate) {
            return { text: 'Expired', color: 'red' };
        }

        if (now < startDate) {
            return { text: 'Upcoming', color: 'blue' };
        }

        if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            const allQuestionsRated = quiz.questions.every(question => question.is_rated);

            if (allQuestionsRated) {
                return { text: 'Complete', color: 'green' };
            } else {
                return { text: 'Not Complete', color: 'orange' };
            }
        } else {
            return { text: 'Not Complete', color: 'orange' };
        }
    };

    formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    componentDidMount() {
        this.fetchAllData();
        this.fetchDropdownData();
        window.addEventListener('focus', this.handleWindowFocus);
    }

    componentWillUnmount() {
        window.removeEventListener('focus', this.handleWindowFocus);
    }

    handleWindowFocus = () => {
        console.log('Tab browser mendapatkan fokus, memuat ulang data...');
        this.fetchAllData();
    };

    render() {
        const { quizMessages, causalityTasks, loading, error, subjects, lectures } = this.state;
        console.log('Current state causalityTasks in render:', causalityTasks);

        const cardContent = `Di sini, Anda dapat mengetahui daftar tugas yang harus Anda kerjakan, termasuk penilaian kuis dan tugas kausalitas kriteria.`;

        if (loading) {
            return (
                <div className="app-container">
                    <TypingCard title="List To Do" source={cardContent} />
                    <br />
                    <Card>
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>Loading data...</p>
                        </div>
                    </Card>
                </div>
            );
        }

        if (error) {
            return (
                <div className="app-container">
                    <TypingCard title="List To Do" source={cardContent} />
                    <br />
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button onClick={this.fetchAllData}>
                                Retry
                            </Button>
                        }
                    />
                </div>
            );
        }

        const renderSubjectName = (subjectId) => findNameById(subjects, subjectId);
        const renderLectureName = (lectureId) => findNameById(lectures, lectureId);

        return (
            <div className="app-container">
                <TypingCard title="List To Do" source={cardContent} />
                <br />

                {/* --- QUIZ TABLE --- */}
                <Card title={<span>Tugas Penilaian Kuis ({quizMessages.length} items)</span>}>
                    <Table
                        bordered
                        rowKey="idQuiz"
                        dataSource={quizMessages}
                        pagination={quizMessages.length > 10 ? { pageSize: 10 } : false}
                        scroll={{ x: 'max-content' }}
                    >
                        <Column
                            title="Quiz Name"
                            dataIndex="quiz"
                            key="quiz"
                            align="center"
                            width={150}
                        />
                        <Column
                            title="Messages"
                            dataIndex="message"
                            key="message"
                            align="left"
                            ellipsis={{ showTitle: true }}
                        />
                        <Column
                            title="RPS"
                            dataIndex="rpsName"
                            key="rpsName"
                            align="center"
                            width={120}
                        />
                        <Column
                            title="Start Date"
                            dataIndex="date_start"
                            key="date_start"
                            align="center"
                            width={140}
                            render={(date) => this.formatDate(date)}
                        />
                        <Column
                            title="End Date"
                            dataIndex="date_end"
                            key="date_end"
                            align="center"
                            width={140}
                            render={(date) => this.formatDate(date)}
                        />
                        <Column
                            title="Status"
                            dataIndex="status"
                            key="status"
                            align="center"
                            width={100}
                            render={(status) => (
                                <Tag color={status.color}>
                                    {status.text}
                                </Tag>
                            )}
                        />
                        <Column
                            title="Duration"
                            dataIndex="duration"
                            key="duration"
                            align="center"
                            width={80}
                            render={(duration) => `${duration} min`}
                        />
                        <Column
                            title="Min Grade"
                            dataIndex="min_grade"
                            key="min_grade"
                            align="center"
                            width={90}
                            render={(grade) => `${grade}%`}
                        />
                        <Column
                            title="Action"
                            key="action"
                            align="center"
                            width={120}
                            fixed="right"
                            render={(text, record) => (
                                <span>
                                    <Link
                                        to={`/quiz/questions/${record.idQuiz}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Mulai Penilaian
                                    </Link>
                                </span>
                            )}
                        />
                    </Table>
                </Card>

                <br />

                {/* --- CAUSALITY TASKS TABLE --- */}
                <Card title={<span>Tugas Penilaian Kausalitas Kriteria ({causalityTasks.length} items)</span>}>
                    <Table
                        bordered
                        rowKey="idCausality"
                        dataSource={causalityTasks}
                        pagination={causalityTasks.length > 10 ? { pageSize: 10 } : false}
                        scroll={{ x: 'max-content' }}
                    >
                        {/* Kolom "Messages" yang baru, sekarang di paling kiri */}
                        <Column
                            title="Messages"
                            dataIndex="message"
                            key="message"
                            align="left"
                            ellipsis={{ showTitle: true }}
                            width={200} // Memberikan lebar awal
                        />
                        {/* Kolom "ID Tugas" setelah Messages */}
                        {/* <Column
                            title="ID Tugas"
                            dataIndex="idCausality"
                            key="idCausality"
                            align="center"
                            width={100}
                        /> */}
                        {/* Kolom "Deskripsi" yang sebelumnya di kiri, sekarang di sini */}
                        <Column
                            title="Deskripsi Lengkap" // Judul diubah agar jelas ini deskripsi asli
                            dataIndex="description"
                            key="description_full" // Key diubah agar unik
                            align="left"
                            ellipsis={{ showTitle: true }}
                            width={250} // Memberikan lebar awal
                        />
                        <Column
                            title="Mata Kuliah"
                            dataIndex="subject"
                            key="subject"
                            align="center"
                            width={120}
                            render={renderSubjectName}
                        />
                        <Column title="Semester" dataIndex="semester" key="semester" align="center" width={80} />
                        <Column
                            title="Dosen Pengajar 1"
                            dataIndex="teamTeaching1"
                            key="teamTeaching1"
                            align="center"
                            width={120}
                            render={renderLectureName}
                        />
                        <Column
                            title="Dosen Pengajar 2"
                            dataIndex="teamTeaching2"
                            key="teamTeaching2"
                            align="center"
                            width={120}
                            render={renderLectureName}
                        />
                        <Column
                            title="Dosen Pengajar 3"
                            dataIndex="teamTeaching3"
                            key="teamTeaching3"
                            align="center"
                            width={120}
                            render={renderLectureName}
                        />
                        <Column
                            title="Status"
                            dataIndex="status"
                            key="status"
                            align="center"
                            width={100}
                            render={(status) => {
                                let color = 'default';
                                if (status === 'Completed') color = 'green';
                                else if (status === 'InProgress') color = 'blue';
                                else if (status === 'Pending') color = 'gold';
                                else if (status === 'Cancelled') color = 'red';
                                return <Tag color={color}>{status}</Tag>;
                            }}
                        />
                        <Column
                            title="Aksi"
                            key="action"
                            align="center"
                            width={150}
                            fixed="right"
                            render={(text, record) => (
                                <span>
                                    <Link
                                        to={`/causality-rating/${record.idCausality}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Mulai Penilaian
                                    </Link>
                                </span>
                            )}
                        />
                    </Table>
                </Card>
            </div>
        );
    }
}

export default ListTodo;