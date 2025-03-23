import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getDepartments,
  deleteDepartment,
  editDepartment,
  addDepartment,
} from "@/api/department";
import TypingCard from "@/components/TypingCard";
import EditDepartmentForm from "./forms/edit-department-form";
import AddDepartmentForm from "./forms/add-department-form";

const { Column } = Table;

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [editDepartmentModalVisible, setEditDepartmentModalVisible] = useState(false);
  const [editDepartmentModalLoading, setEditDepartmentModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addDepartmentModalVisible, setAddDepartmentModalVisible] = useState(false);
  const [addDepartmentModalLoading, setAddDepartmentModalLoading] = useState(false);

  const editDepartmentFormRef = useRef(null);
  const addDepartmentFormRef = useRef(null);

  const fetchDepartments = async () => {
    try {
      const result = await getDepartments();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setDepartments(content);
      }
    } catch (error) {
      message.error("Gagal mengambil data jurusan.");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEditDepartment = (row) => {
    setCurrentRowData({ ...row });
    setEditDepartmentModalVisible(true);
  };

  const handleDeleteDepartment = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }
    try {
      await deleteDepartment({ id });
      message.success("Berhasil dihapus");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal menghapus, coba lagi.");
    }
  };

  const handleEditDepartmentOk = async () => {
    const form = editDepartmentFormRef.current;
    try {
      const values = await form.validateFields();
      setEditDepartmentModalLoading(true);
      await editDepartment(values, values.id);
      form.resetFields();
      setEditDepartmentModalVisible(false);
      setEditDepartmentModalLoading(false);
      message.success("Berhasil mengedit!");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal mengedit, coba lagi.");
      setEditDepartmentModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditDepartmentModalVisible(false);
    setAddDepartmentModalVisible(false);
  };

  const handleAddDepartment = () => {
    setAddDepartmentModalVisible(true);
  };

  const handleAddDepartmentOk = async (values) => {
    try {
      setAddDepartmentModalLoading(true);
      console.log(values);
      await addDepartment(values);
      setAddDepartmentModalVisible(false);
      setAddDepartmentModalLoading(false);
      message.success("Berhasil menambahkan jurusan!");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi.");
      setAddDepartmentModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Jurusan"
        source="Di sini, Anda dapat mengelola jurusan di sistem, seperti menambahkan jurusan baru, atau mengubah jurusan yang sudah ada di sistem."
      />
      <br />
      <Card title={<Button type="primary" onClick={handleAddDepartment}>Tambahkan jurusan</Button>}>
        <Table bordered rowKey="id" dataSource={departments} pagination={false}>
          <Column title="ID Jurusan" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi Jurusan" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon="edit"
                  title="Edit"
                  onClick={() => handleEditDepartment(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="Hapus"
                  onClick={() => handleDeleteDepartment(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditDepartmentForm
        ref={editDepartmentFormRef}
        currentRowData={currentRowData}
        visible={editDepartmentModalVisible}
        confirmLoading={editDepartmentModalLoading}
        onCancel={handleCancel}
        onOk={handleEditDepartmentOk}
      />

      <AddDepartmentForm
        ref={addDepartmentFormRef}
        visible={addDepartmentModalVisible}
        confirmLoading={addDepartmentModalLoading}
        onCancel={handleCancel}
        onOk={handleAddDepartmentOk}
      />
    </div>
  );
};

export default Department;
