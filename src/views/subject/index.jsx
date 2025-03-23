import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider, Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { getSubjects, deleteSubject, editSubject, addSubject } from "@/api/subject";
import { getStudyPrograms } from "@/api/studyProgram";
import { getSubjectGroups } from "@/api/subjectGroup";
import TypingCard from "@/components/TypingCard";
import EditSubjectForm from "./forms/edit-subject-form";
import AddSubjectForm from "./forms/add-subject-form";

const { confirm } = Modal;

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);

  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, programsRes, groupsRes] = await Promise.all([
        getSubjects(),
        getStudyPrograms(),
        getSubjectGroups()
      ]);
      setSubjects(subjectsRes?.data?.content || []);
      setStudyPrograms(programsRes?.data?.content || []);
      setSubjectGroups(groupsRes?.data?.content || []);
    } catch (error) {
      message.error("Gagal mengambil data");
    }
  };

  const handleEdit = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleDelete = (row) => {
    confirm({
      title: "Apakah Anda yakin ingin menghapus mata kuliah ini?",
      icon: <ExclamationCircleOutlined />, 
      onOk: async () => {
        try {
          await deleteSubject({ id: row.id });
          message.success("Berhasil dihapus");
          fetchData();
        } catch (error) {
          message.error("Gagal menghapus, coba lagi");
        }
      },
    });
  };

  const handleEditOk = async () => {
    try {
      const values = await editFormRef.current.validateFields();
      setEditModalLoading(true);
      await editSubject(values);
      message.success("Berhasil diperbarui!");
      setEditModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Gagal memperbarui, coba lagi!");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleAddOk = async (values) => {
    try {
      setAddModalLoading(true);
      await addSubject(values);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddModalLoading(false);
    }
  };

  const renderColumns = () => [
    { title: "ID Mata Kuliah", dataIndex: "id", key: "id", align: "center" },
    { title: "Nama", dataIndex: "name", key: "name", align: "center" },
    { title: "Deskripsi", dataIndex: "description", key: "description", align: "center" },
    { title: "Point Kredit", dataIndex: "credit_point", key: "credit_point", align: "center" },
    { title: "Tahun Mata Kuliah", dataIndex: "year_commenced", key: "year_commenced", align: "center" },
    { 
      title: "Program Studi", 
      dataIndex: ["studyProgram", "name"], 
      key: "name", 
      align: "center" 
    },
    { 
      title: "Rumpun Mata Kuliah", 
      dataIndex: ["subjectGroup", "name"], 
      key: "name", 
      align: "center" 
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (text, row) => (
        <>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
          <Divider type="vertical" />
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
        </>
      ),
    },
  ];

  const renderTable = () => (
    <Table bordered rowKey="id" dataSource={subjects} pagination={{ pageSize: 10 }} columns={renderColumns()} />
  );

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Mata Kuliah" source="Di sini, Anda dapat mengelola mata kuliah." />
      <br />
      <Card title={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Tambahkan Mata Kuliah</Button>}>
        {renderTable()}
      </Card>
      <EditSubjectForm
        ref={editFormRef}
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditOk}
      />
      <AddSubjectForm
        ref={addFormRef}
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddOk}
        subjectGroups={subjectGroups}
        studyPrograms={studyPrograms}
      />
    </div>
  );
};

export default Subject;