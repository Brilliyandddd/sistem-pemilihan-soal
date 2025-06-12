/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect , useState} from "react";
import { Form, Input, Modal, Select, message } from "antd";
import {reqUserInfo} from "@/api/user";
import { getQuestionsByRPS } from "@/api/question";
import { useParams } from "react-router-dom";

const AddCriteriaValueForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  questionID, // This is the ID passed from CriteriaIndex
  userID, // This is the ID of the logged-in user passed from CriteriaIndex
  linguisticValues = [],
  criteriaData = [],
}) => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null); // This user state isn't strictly needed if userID prop is always passed
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionTitle, setSelectedQuestionTitle] = useState(''); // State untuk judul pertanyaan
  const { questionID: paramQuestionID } = useParams();


  const formItemLayout = {
    labelCol: {
      xs: { span: 10 },
      sm: { span: 9 },
    },
    wrapperCol: {
      xs: { span: 15 },
      sm: { span: 10 },
    },
  };

  const loadQuestions = async () => {
    try {
      const result = await getQuestionsByRPS("RPS-PBO-001");
      if (result?.data) {
        const { content, statusCode } = result.data;
        if (statusCode === 200) {
          const question = content.find(q => q.idQuestion === questionID); // Gunakan prop questionID
          setQuestions(content);
          setSelectedQuestionTitle(question?.title || ''); // Atur judul pertanyaan
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    // Fetch user info (only if userID prop is not consistently provided by parent)
    const fetchUserInfo = async () => {
      try {
        const response = await reqUserInfo();
        if (response && response.data) {
          setUser(response.data.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUser(null);
      }
    };
    fetchUserInfo();
    loadQuestions();
  }, [questionID]); // Ubah dependency menjadi questionID agar loadQuestions jalan saat questionID berubah

  // Use useEffect to set form values when props change or modal becomes visible
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        // Tidak perlu set idQuestion ke input yang disabled
        userId: userID // Set the value for the hidden user ID input
      });
      console.log("Form values set:", { questionID: questionID, userId: userID });
    } else {
      form.resetFields(); // Reset fields when modal closes
      setSelectedQuestionTitle(''); // Reset judul pertanyaan saat modal ditutup
    }
  }, [visible, questionID, userID, form]);


  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        // Ambil idQuestion dari prop, bukan dari form.values
        const actualQuestionID = questionID;

        if (!values.userId) {
          throw new Error("User session not found. Please log in again.");
        }

        const requestData = {
          idQuestion: actualQuestionID, // Gunakan idQuestion dari prop
          user_id: values.userId,
        };

        criteriaData.forEach((criteria, index) => {
          const backendFieldName = `value${index + 1}`;
          requestData[backendFieldName] = values[backendFieldName];
        });

        onOk(requestData);
      })
      .catch((error) => {
        message.error(error.message || "Please complete all required fields");
      });
  };

  return (
    <Modal
      open={visible}
      title="Berikan Nilai Untuk Soal"
      okText="Add"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={800}
    >
      <Form {...formItemLayout} form={form} layout="horizontal">
        {/* Field untuk menampilkan judul pertanyaan (disabled) */}
        <Form.Item
          label="Question Title" // Label diubah
        >
          <Input value={selectedQuestionTitle} disabled /> {/* Menampilkan judul */}
        </Form.Item>

        {/* Field tersembunyi untuk idQuestion (nilai ID sebenarnya) */}
        <Form.Item
          name="idQuestion" // Ini akan diisi dengan questionID sebenarnya
          hidden
          initialValue={questionID} // Mengatur nilai awal dari prop questionID
        >
          <Input type="hidden" />
        </Form.Item>

        {/* Field tersembunyi untuk userId */}
        <Form.Item
          name="userId"
          hidden
        >
          <Input type="hidden" />
        </Form.Item>

        {criteriaData.map((criteria, index) => (
          <Form.Item
            key={criteria.id}
            label={`${criteria.name} (${criteria.category})`}
            name={`value${index + 1}`}
            rules={[{
              required: true,
              message: `Silahkan pilih nilai untuk ${criteria.name}`
            }]}
          >
            <Select
              style={{ width: 300 }}
              placeholder={`Pilih Nilai ${criteria.name}`}
            >
              {linguisticValues.map((linguisticValue) => (
                <Select.Option
                  key={linguisticValue.id}
                  value={linguisticValue.id}
                >
                  {linguisticValue.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default AddCriteriaValueForm;