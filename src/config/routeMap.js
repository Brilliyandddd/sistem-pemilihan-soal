import React from 'react';
import Loading from "@/components/Loading";
import Religion from "../views/religion";
import SubjectGroup from "../views/subject-group";
import Student from "../views/student";
import Subject from "../views/subject";
import questionIndex from "../views/question-index";

const Dashboard = React.lazy(() => import(/*webpackChunkName:'Dashboard'*/ "@/views/dashboard"));
const Doc = React.lazy(() => import(/*webpackChunkName:'Doc'*/ "@/views/doc"));
const Guide = React.lazy(() => import(/*webpackChunkName:'Guide'*/ "@/views/guide"));
const Explanation = React.lazy(() => import(/*webpackChunkName:'Explanation'*/ "@/views/permission"));
const AdminPage = React.lazy(() => import(/*webpackChunkName:'AdminPage'*/ "@/views/permission/adminPage"));
const GuestPage = React.lazy(() => import(/*webpackChunkName:'GuestPage'*/ "@/views/permission/guestPage"));
const EditorPage = React.lazy(() => import(/*webpackChunkName:'EditorPage'*/ "@/views/permission/editorPage"));
const RichTextEditor = React.lazy(() => import(/*webpackChunkName:'RichTextEditor'*/ "@/views/components-demo/richTextEditor"));
const Markdown = React.lazy(() => import(/*webpackChunkName:'Markdown'*/ "@/views/components-demo/Markdown"));
const Draggable = React.lazy(() => import(/*webpackChunkName:'Draggable'*/ "@/views/components-demo/draggable"));
const KeyboardChart = React.lazy(() => import(/*webpackChunkName:'KeyboardChart'*/ "@/views/charts/keyboard"));
const LineChart = React.lazy(() => import(/*webpackChunkName:'LineChart'*/ "@/views/charts/line"));
const MixChart = React.lazy(() => import(/*webpackChunkName:'MixChart'*/ "@/views/charts/mixChart"));
const Menu1_1 = React.lazy(() => import(/*webpackChunkName:'Menu1_1'*/ "@/views/nested/menu1/menu1-1"));
const Menu1_2_1 = React.lazy(() => import(/*webpackChunkName:'Menu1_2_1'*/ "@/views/nested/menu1/menu1-2/menu1-2-1"));
const Table = React.lazy(() => import(/*webpackChunkName:'Table'*/ "@/views/table"));
const ExportExcel = React.lazy(() => import(/*webpackChunkName:'ExportExcel'*/ "@/views/excel/exportExcel"));
const UploadExcel = React.lazy(() => import(/*webpackChunkName:'UploadExcel'*/ "@/views/excel/uploadExcel"));
const Zip = React.lazy(() => import(/*webpackChunkName:'Zip'*/ "@/views/zip"));
const Clipboard = React.lazy(() => import(/*webpackChunkName:'Clipboard'*/ "@/views/clipboard"));
const Error404 = React.lazy(() => import(/*webpackChunkName:'Error404'*/ "@/views/error/404"));
const User = React.lazy(() => import(/*webpackChunkName:'User'*/ "@/views/user"));
const Question = React.lazy(() => import(/*webpackChunkName:'Question'*/ "@/views/question"));
const Answer = React.lazy(() => import(/*webpackChunkName:'Answer'*/ "@/views/answer"));
const Department = React.lazy(() => import(/*webpackChunkName:'Department'*/ "@/views/department"));
const StudyProgram = React.lazy(() => import(/*webpackChunkName:'StudyProgram'*/ "@/views/study-program"));
const Lecture = React.lazy(() => import(/*webpackChunkName:'Lecture'*/ "@/views/lecture"));
const RPS = React.lazy(() => import(/*webpackChunkName:'RPS'*/ "@/views/rps"));
const RPSDetail = React.lazy(() => import(/*webpackChunkName:'RPS'*/ "@/views/rps-detail"));
const FormLearning = React.lazy(() => import(/*webpackChunkName:'FormLearning'*/ "@/views/form-learning"));
const LearningMedia = React.lazy(() => import(/*webpackChunkName:'LearningMedia'*/ "@/views/learning-media"));
const LearningMethod = React.lazy(() => import(/*webpackChunkName:'LearningMethod'*/ "@/views/learning-method"));
const AssessmentCriteria = React.lazy(() => import(/*webpackChunkName:'AssessmentCriteria'*/ "@/views/assessment-criteria"));
const QuestionCriteria = React.lazy(() => import(/*webpackChunkName:'QuestionCriteria'*/ "@/views/question-criteria"));
const LinguiticValue = React.lazy(() => import(/*webpackChunkName:'LinguiticValue'*/ "@/views/linguistic-value"));
const TeamTeaching = React.lazy(() => import(/*webpackChunkName:'TeamTeaching'*/ "@/views/team-teaching"));
const CriteriaValue = React.lazy(() => import(/*webpackChunkName:'criteriaValue'*/ "@/views/criteria-value"));
const ListTodo = React.lazy(() => import(/*webpackChunkName:'criteriaValue'*/ "@/views/list-todo"));
const ListTodoAdmin = React.lazy(() => import(/*webpackChunkName:'criteriaValue'*/ "@/views/list-todo-admin"));
const QuestionIndexQuiz1 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/question-index-quiz1"));
const QuestionIndexQuiz2 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/question-index-quiz2"));
const QuizGenerateQuiz1 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-quiz1"));
const QuizGenerateQuizStep2 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-step2"));
const QuizGenerateQuizStep3 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-step3"));
const QuizGenerateQuizStep4 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-step4"));
const QuizGenerateQuizStep5 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-step5"));
const QuizGenerateQuizStep6 = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/quiz-generate-step6"));
const CriteriaIndex = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/criteria-index"));
const ExerciseIndex = React.lazy(() => import(/*webpackChunkName:'questionIndex'*/ "@/views/exercise-index"));
const AppraisalForm = React.lazy(() => import(/*webpackChunkName:'AppraisalForm'*/ "@/views/appraisal-form"));
const Exam = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/exam"));
const Quiz = React.lazy(() => import(/*webpackChunkName:'Quiz'*/ "@/views/quiz"));
const Exercise = React.lazy(() => import(/*webpackChunkName:'Exercise'*/ "@/views/exercise"));
const ResultExam = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/result-exam"));
const ResultQuiz = React.lazy(() => import(/*webpackChunkName:'Quiz'*/ "@/views/result-quiz"));
const ResultExercise = React.lazy(() => import(/*webpackChunkName:'Exercise'*/ "@/views/result-exercise"));
const StudentExam = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/student-exam"));
const DoStudentExam = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/do-student-exam"));
const DoStudentExercise = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/do-student-exercise"));
const DoStudentQuiz = React.lazy(() => import(/*webpackChunkName:'Exam'*/ "@/views/do-student-quiz"));
const StudentQuiz = React.lazy(() => import(/*webpackChunkName:'Quiz'*/ "@/views/student-quiz"));
const StudentExercise = React.lazy(() => import(/*webpackChunkName:'Exercise'*/ "@/views/student-exercise"));
const StudentExerciseReview = React.lazy(() => import(/*webpackChunkName:'Exercise'*/ "@/views/student-exercise-review"));
const Grade = React.lazy(() => import(/*webpackChunkName:'Grade'*/ "@/views/grade"));
const About = React.lazy(() => import(/*webpackChunkName:'About'*/ "@/views/about"));
const Bug = React.lazy(() => import(/*webpackChunkName:'Bug'*/ "@/views/bug"));

export default [
  {
    path: "/dashboard",
    component: Dashboard,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },
  {
    path: "/doc",
    component: Doc,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },
  {
    path: "/guide",
    component: Guide,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/permission/explanation",
    component: Explanation,
    roles: ["ROLE_ADMINISTRATOR"],
  },
  {
    path: "/permission/adminPage",
    component: AdminPage,
    roles: ["ROLE_ADMINISTRATOR"],
  },
  {
    path: "/permission/guestPage",
    component: GuestPage,
    roles: ["ROLE_STUDENT"],
  },
  {
    path: "/permission/editorPage",
    component: EditorPage,
    roles: ["ROLE_LECTURE"],
  },
  {
    path: "/components/richTextEditor",
    component: RichTextEditor,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/components/Markdown",
    component: Markdown,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/components/draggable",
    component: Draggable,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/charts/keyboard",
    component: KeyboardChart,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/charts/line",
    component: LineChart,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/charts/mix-chart",
    component: MixChart,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/nested/menu1/menu1-1",
    component: Menu1_1,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/nested/menu1/menu1-2/menu1-2-1",
    component: Menu1_2_1,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/table",
    component: Table,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/excel/export",
    component: ExportExcel,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/excel/upload",
    component: UploadExcel,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/zip",
    component: Zip,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/clipboard",
    component: Clipboard,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  { path: "/user", component: User, roles: ["ROLE_ADMINISTRATOR"] },
  { path: "/department", component: Department, roles: ["ROLE_ADMINISTRATOR"] },
  {
    path: "/study-program",
    component: StudyProgram,
    roles: ["ROLE_ADMINISTRATOR"],
  },
  { path: "/religion", component: Religion, roles: ["ROLE_ADMINISTRATOR"] },
  {
    path: "/subject-group",
    component: SubjectGroup,
    roles: ["ROLE_ADMINISTRATOR"],
  },
  { path: "/subject", component: Subject, roles: ["ROLE_ADMINISTRATOR"] },
  { path: "/lecture", component: Lecture, roles: ["ROLE_ADMINISTRATOR"] },
  {
    path: "/question-criteria",
    component: QuestionCriteria,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  },
  {
    path: "/team-teaching",
    component: TeamTeaching,
    roles: ["ROLE_ADMINISTRATOR"],
  },
  {
    path: "/linguistic-value",
    component: LinguiticValue,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  },
  {
    path: "/criteria-value",
    component : CriteriaValue,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  {
    path: "/list-todo",
    component : ListTodo,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  {
    path: "/list-todo-admin",
    component : ListTodoAdmin,
    roles: ["ROLE_ADMINISTRATOR"]
  },
  // {
  //   path: "/index/question/:rpsID",
  //   component : QuestionIndex,
  //   roles: ["ROLE_ADMINISTRATOR"]
  // },
  {
    path: "/index/question/quiz1/:rpsID",
    component : QuestionIndexQuiz1,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  {
    path: "/index/question/quiz2/:rpsID",
    component : QuestionIndexQuiz2,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  {
    path: "/index/criteria/:questionID",
    component : CriteriaIndex,
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  {
    path: "/index/exercise/:exerciseID",
    component : ExerciseIndex,
    roles: ["ROLE_ADMINISTRATOR"]
  },
  { path: "/student", component: Student, roles: ["ROLE_ADMINISTRATOR"] },
  {
    path: "/rps",
    component: RPS,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/rps/:rpsID",
    component: RPSDetail,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/question",
    component: Question,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/rps/:rpsID/:rpsDetailID",
    component: Question,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/rps/:rpsID/:rpsDetailID/:questionID",
    component: Answer,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/form-learning",
    component: FormLearning,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/learning-media",
    component: LearningMedia,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/learning-method",
    component: LearningMethod,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/assessment-criteria",
    component: AssessmentCriteria,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/appraisal-form",
    component: AppraisalForm,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-exam",
    component: Exam,
    roles: ["ROLE_ADMINISTRATOR"],
    exact: true,
  },
  {
    path: "/setting-quiz",
    component: Quiz,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/setting-exercise",
    component: Exercise,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
    exact: true,
  },
  {
    path: "/exam",
    component: StudentExam,
    roles: ["ROLE_STUDENT"],
    exact: true,
  },
  {
    path: "/quiz",
    component: StudentQuiz,
    roles: ["ROLE_STUDENT"],
    exact: true,
  },
  {
    path: "/exercise",
    component: StudentExercise,
    roles: ["ROLE_STUDENT"],
    exact: true,
  },
  {
    path: "/exercise-review/:id",
    component: StudentExerciseReview,
    roles: ["ROLE_STUDENT"],
    exact: true,
  },
  { path: "/exam/do/:id", component: DoStudentExam, roles: ["ROLE_STUDENT"] },
  { path: "/quiz/do/:id", component: DoStudentQuiz, roles: ["ROLE_STUDENT"] },
  {
    path: "/exercise/do/:id",
    component: DoStudentExercise,
    roles: ["ROLE_STUDENT"],
  },

  {
    path: "/setting-exam/result/:id",
    component: ResultExam,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/result/:id",
    component: ResultQuiz,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz/:id",
    component: QuizGenerateQuiz1,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz-step2/:id",
    component: QuizGenerateQuizStep2,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz-step3/:id",
    component: QuizGenerateQuizStep3,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz-step4/:id",
    component: QuizGenerateQuizStep4,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz-step5/:id",
    component: QuizGenerateQuizStep5,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-quiz/generate-quiz-step6/:id",
    component: QuizGenerateQuizStep6,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    path: "/setting-exercise/result/:id",
    component: ResultExercise,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },

  { path: "/grade", component: Grade, roles: ["ROLE_ADMINISTRATOR"] },
  {
    path: "/about",
    component: About,
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },
  { path: "/bug", component: Bug, roles: ["ROLE_ADMINISTRATOR"] },
  { path: "/error/404", component: Error404 },
];
