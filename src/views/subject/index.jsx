import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider, Modal } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getSubjects,
  deleteSubject,
  editSubject,
  addSubject,
} from "@/api/subject";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, programsRes, groupsRes] = await Promise.all([
        getSubjects(),
        getStudyPrograms(),
        getSubjectGroups(),
      ]);
      setSubjects(subjectsRes?.data?.content || []);
      setStudyPrograms(programsRes?.data?.content || []);
      setSubjectGroups(groupsRes?.data?.content || []);
    } catch (error) {
      message.error("Gagal mengambil data");
    }
  };

  const handleEdit = (row) => {
    setCurrentRowData({
      ...row,
      year_commenced: String(row.year_commenced),
    });
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

  const handleEditOk = async (values) => {
    try {
      setEditModalLoading(true);
      await editSubject(values, currentRowData.id);
      message.success("Mata kuliah berhasil diperbarui!");
      setEditModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Gagal edit:", error);
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
      console.error("Gagal tambah:", error);
      message.error("Gagal menambahkan, coba lagi!");
    } finally {
      setAddModalLoading(false);
    }
  };

  const renderColumns = () => [
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    { title: "Nama", dataIndex: "name", key: "name", align: "center" },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "Kredit",
      dataIndex: "credit_point",
      key: "credit_point",
      align: "center",
    },
    {
      title: "Tahun",
      dataIndex: "year_commenced",
      key: "year_commenced",
      align: "center",
    },
    {
      title: "Prodi",
      dataIndex: ["studyProgram", "name"],
      key: "studyProgram",
      align: "center",
    },
    {
      title: "Rumpun",
      dataIndex: ["subject_group", "name"],
      key: "subject_group",
      align: "center",
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (text, row) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(row)}
          />
          <Divider type="vertical" />
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(row)}
          />
        </>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Mata Kuliah"
        source="Kelola data mata kuliah di sini."
      />
      <br />
      <Card
        title={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Mata Kuliah
          </Button>
        }
      >
        <Table
          bordered
          rowKey="id"
          dataSource={subjects}
          pagination={{ pageSize: 10 }}
          columns={renderColumns()}
        />
      </Card>

      <EditSubjectForm
        currentRowData={currentRowData}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditOk}
        subjectGroups={subjectGroups}
        studyPrograms={studyPrograms}
      />

      <AddSubjectForm
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddOk} // ubah dari onOk jadi onSubmit
        subjectGroups={subjectGroups}
        studyPrograms={studyPrograms}
      />
    </div>
  );
};

export default Subject;
