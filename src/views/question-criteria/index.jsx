import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getQuestionCriterias,
  deleteQuestionCriteria,
  editQuestionCriteria,
  addQuestionCriteria,
} from "@/api/questionCriteria";
import TypingCard from "@/components/TypingCard";
import EditQuestionCriteriaForm from "./forms/edit-question-criteria-form";
import AddQuestionCriteriaForm from "./forms/add-question-criteria-form";

const { Column } = Table;

const QuestionCriteria = () => {
  const [questionCriterias, setQuestionCriterias] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  useEffect(() => {
    fetchQuestionCriterias();
  }, []);

  const fetchQuestionCriterias = async () => {
    const result = await getQuestionCriterias();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setQuestionCriterias(content);
    }
  };

  const handleEditQuestionCriteria = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleDeleteQuestionCriteria = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus admin!");
      return;
    }
    await deleteQuestionCriteria({ id: row.id });
    message.success("Berhasil dihapus");
    fetchQuestionCriterias();
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setAddModalVisible(false);
  };

  const handleAddQuestionCriteria = () => {
    setAddModalVisible(true);
  };

  const handleAddQuestionCriteriaOk = async (values) => {
    setAddModalLoading(true);
    await addQuestionCriteria(values);
    message.success("Berhasil ditambahkan");
    setAddModalLoading(false);
    setAddModalVisible(false);
    fetchQuestionCriterias();
  };

  const handleEditQuestionCriteriaOk = async (values) => {
    setEditModalLoading(true);
    await editQuestionCriteria(values, currentRowData.id);
    message.success("Berhasil diedit");
    setEditModalLoading(false);
    setEditModalVisible(false);
    fetchQuestionCriterias();
  };

  return (
    <div className="app-container">
      <TypingCard title="Kriteria Pertanyaan" source="Kriteria Pertanyaan" />
      <br />
      <Card title={<Button type="primary" onClick={handleAddQuestionCriteria}>Tambah Kriteria Pertanyaan</Button>}>
        <Table bordered rowKey="id" dataSource={questionCriterias} pagination={false}>
          <Column title="ID" key="id" align="center" render={(value, record, index) => index + 1} />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi Kriteria Pertanyaan" dataIndex="description" key="description" align="center" />
          <Column title="Kategori" dataIndex="category" key="category" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEditQuestionCriteria(row)} />
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus" onClick={() => handleDeleteQuestionCriteria(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditQuestionCriteriaForm
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={handleCancel}
        onOk={handleEditQuestionCriteriaOk}
        currentRowData={currentRowData}
      />
      <AddQuestionCriteriaForm
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={handleCancel}
        onOk={handleAddQuestionCriteriaOk}
      />
    </div>
  );
};

export default QuestionCriteria;