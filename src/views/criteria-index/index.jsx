/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Image } from "antd"; // Pastikan Image diimpor
import { useParams } from "react-router-dom";
import {
  getAllCriteriaValueByQuestion,
  addCriteriaValue,
  deleteCriteriavalue,
} from "@/api/criteriaValue";
import { getAnswers as fetchAnswers } from "@/api/answer";
import { getLinguisticValues as fetchLinguisticValues } from "@/api/linguisticValue";
import { getQuestionsByRPS } from "@/api/question";
import { reqUserInfo } from "@/api/user";
import TypingCard from "@/components/TypingCard";
import AddCriteriaValueForm from "./form/add-criteria-value-form";
import { DeleteOutlined } from '@ant-design/icons'; // Import Ant Design icons

const { Column } = Table;

const CriteriaIndex = () => {
  const { questionID: paramQuestionID } = useParams();
  const [criteriaValues, setCriteriaValues] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [linguisticValues, setLinguisticValues] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [answers, setAnswers] = useState([]);
  const [selectedQuestionTitle, setSelectedQuestionTitle] = useState("");
  const [questionImagePath, setQuestionImagePath] = useState(""); // State baru untuk path gambar soal
  const [userId, setUserId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Perbarui criteriaData untuk mencakup 'fieldKey' yang sesuai dengan nama properti di backend
  const criteriaData = [
    { id: "QC001", name: "Knowledge", category: "Cognitive", fieldKey: "value1" },
    { id: "QC002", name: "Comprehension", category: "Cognitive", fieldKey: "value2" },
    { id: "QC003", name: "Application", category: "Cognitive", fieldKey: "value3" },
    { id: "QC004", name: "Analysis", category: "Cognitive", fieldKey: "value4" },
    { id: "QC005", name: "Evaluation", category: "Cognitive", fieldKey: "value5" },
    { id: "QC006", name: "Difficulty", category: "Non-Cognitive", fieldKey: "value6" },
    { id: "QC007", name: "Discrimination", category: "Non-Cognitive", fieldKey: "value7" },
    { id: "QC008", name: "Reliability", category: "Non-Cognitive", fieldKey: "value8" },
    { id: "QC009", name: "Problem Solving", category: "Meta-Cognitive", fieldKey: "value9" },
    { id: "QC010", name: "Creativity", category: "Meta-Cognitive", fieldKey: "value10" }
  ];

  const loadCriteriaValues = async (questionID) => {
    try {
      setLoading(true);
      if (!userId) {
          console.warn("userId is not yet available for filtering criteria values.");
          return;
      }
      const result = await getAllCriteriaValueByQuestion(questionID);
      
      if (result?.data) {
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          const filteredContent = content.filter(item => item.user?.id === userId || item.user === userId);
          setCriteriaValues(filteredContent);
        } else {
            message.error(result.data.message || "Failed to load criteria values.");
        }
      }
    } catch (error) {
      console.error("Error fetching criteria values:", error);
      message.error("Failed to load criteria values.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriteriaValue = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus admin.");
      return;
    }

    try {
      await deleteCriteriavalue(id);
      message.success("Berhasil dihapus!");
      loadCriteriaValues(paramQuestionID);
    } catch (error) {
      console.error("Error deleting criteria value:", error);
      message.error("Gagal menghapus.");
    }
  };

  const loadQuestions = async () => {
    try {
      const result = await getQuestionsByRPS("RPS-PBO-001");
      if (result?.data) {
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          const question = content.find(q => q.idQuestion === paramQuestionID);
          setQuestions(content);
          setSelectedQuestionTitle(question?.title || 'Unknown Question');
          // Set question image path if available
          setQuestionImagePath(question?.file_path || '');
        } else {
            message.error(result.data.message || "Failed to load questions by RPS.");
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("Gagal memuat pertanyaan.");
    }
  };

  const loadAnswers = async (questionID) => {
    try {
      const result = await fetchAnswers(questionID);
      if (result?.data) {
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          setAnswers(Array.isArray(content) ? content : []);
        } else {
            message.error(result.data.message || "Failed to load answers.");
        }
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
      message.error("Gagal memuat jawaban.");
    }
  };

  const loadLinguisticValues = async () => {
    try {
      const result = await fetchLinguisticValues();
      if (result?.data) {
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          setLinguisticValues(Array.isArray(content) ? content : []);
        } else {
            message.error(result.data.message || "Failed to load linguistic values.");
        }
      }
    } catch (error) {
      console.error("Error fetching linguistic values:", error);
      message.error("Gagal memuat nilai linguistik.");
    }
  };

  const handleAddCriteriaValue = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleAddCriteriaValueOk = async (formData) => {
    try {
      setModalLoading(true);
      
      if (!userId) {
        throw new Error("Sesi pengguna telah berakhir. Harap segarkan halaman.");
      }
      
      const requestBody = { ...formData };
      const questionIdForUrl = formData.idQuestion;

      console.log("Submitting criteria values:", requestBody);
      console.log("Question ID for URL:", questionIdForUrl);

      const response = await addCriteriaValue(requestBody, questionIdForUrl);
      
        message.success("Nilai kriteria berhasil disimpan!");
        setModalVisible(false);
        loadCriteriaValues(paramQuestionID);
        message.error(response.data.message || "Gagal menyimpan nilai kriteria.");
      
    } catch (error) {
      console.error("Error saving criteria values:", error);
      message.error(error.message || "Terjadi kesalahan yang tidak terduga saat menyimpan nilai kriteria.");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await reqUserInfo();
        if (response && response.data && response.data.id) {
          setUserId(response.data.id);
        } else {
          console.warn("ID pengguna tidak ditemukan dalam respons informasi pengguna.");
          message.error("Sesi pengguna tidak ditemukan. Harap login kembali.");
          setUserId(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        message.error("Gagal memuat informasi pengguna.");
        setUserId(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (paramQuestionID && userId) {
      const initData = async () => {
        await Promise.all([
          loadQuestions(),
          loadLinguisticValues(),
          loadAnswers(paramQuestionID),
        ]);
        loadCriteriaValues(paramQuestionID);
      };
      initData();
    }
  }, [paramQuestionID, userId]);

  // Hasilkan kolom berdasarkan data kriteria yang baru
  const columns = criteriaData.map((criteria) => (
    <Column
      title={`${criteria.name}`}
      // Menggunakan 'fieldKey' yang baru untuk mencocokkan nama properti backend (value1, value2, dll.)
      // Dan kemudian mengakses properti 'name' dari objek LinguisticValue di dalamnya.
      dataIndex={[criteria.fieldKey, 'name']}
      key={`${criteria.fieldKey}.name`}
      align="center"
    />
  ));

  const title = (
    <span>
      <Button type="primary" onClick={handleAddCriteriaValue}>
        Berikan Nilai ke soal
      </Button>
    </span>
  );

  const cardContent = "Di sini, Anda dapat menilai pertanyaan di sistem, lalu memberinya nilai masing masing kriteria.";

  // Fungsi untuk mendapatkan URL gambar dari path
  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    const imageName = filePath.substring(filePath.lastIndexOf('/') + 1);
    // Pastikan http://localhost:8081 sesuai dengan alamat backend Anda
    return `http://localhost:8081${filePath}`;
  };

  return (
    <div>
      <TypingCard title={title} source={cardContent} />

      <Card title={''} loading={loading}> 
        <h3>{`Soal: ${selectedQuestionTitle}`}</h3>
        {/* Tampilkan gambar soal di sini */}
        {questionImagePath && (
          <Image
            src={getImageUrl(questionImagePath)}
            alt="Question Image"
            style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain', marginBottom: '16px' }}
            // Opsional: fallback gambar jika gambar utama gagal dimuat
            // fallback="path/to/default-image.png" 
          />
        )}
        <h3>List Jawaban:</h3>
        {answers.length > 0 ? (
          <ul>
            {answers.map((answer, index) => (
              <li key={answer.id || index}>{answer.title || `Jawaban ${index + 1}`}</li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada jawaban tersedia</p>
        )}

        <Table 
          dataSource={criteriaValues} 
          rowKey="id"
          loading={loading}
          pagination={false}
        >
          {columns}
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, record) => (
              <span>
                {/* <Divider type="vertical" /> */}
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  title="menghapus"
                  onClick={() => handleDeleteCriteriaValue(record)}
                />
              </span>
            )}
          />
        </Table>
      </Card>
      
      <AddCriteriaValueForm
        visible={modalVisible}
        confirmLoading={modalLoading}
        onCancel={handleCancel}
        onOk={handleAddCriteriaValueOk}
        linguisticValues={linguisticValues}
        questionID={paramQuestionID}
        userID={userId}
        criteriaData={criteriaData}
      />
    </div>
  );
};

export default CriteriaIndex;