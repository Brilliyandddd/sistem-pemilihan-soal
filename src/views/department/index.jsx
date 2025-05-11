import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const result = await getDepartments();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setDepartments(content);
      }
    } catch (error) {
      message.error("Gagal mengambil data jurusan.");
    } finally {
      setLoading(false);
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
      setLoading(true);
      await deleteDepartment({ id });
      message.success("Berhasil dihapus");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal menghapus, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartmentOk = async ({ id, name, description }) => {
    try {
      setEditDepartmentModalLoading(true);
      await editDepartment({ name, description }, id);  // ✅ Kirim hanya "name" & "description"
      setEditDepartmentModalVisible(false);
      message.success("Berhasil mengedit!");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal mengedit, coba lagi.");
    } finally {
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
      await addDepartment(values);
      setAddDepartmentModalVisible(false);
      message.success("Berhasil menambahkan jurusan!");
      fetchDepartments();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi.");
    } finally {
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
        <Table
          bordered
          rowKey="id"
          dataSource={departments}
          pagination={false}
          loading={loading}
        >
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
                  icon={<EditOutlined />}
                  title="Edit"
                  onClick={() => handleEditDepartment(row)}
                  disabled={loading}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  title="Hapus"
                  onClick={() => handleDeleteDepartment(row)}
                  disabled={loading}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditDepartmentForm
        currentRowData={currentRowData}
        visible={editDepartmentModalVisible}
        confirmLoading={editDepartmentModalLoading}
        onCancel={handleCancel}
        onOk={handleEditDepartmentOk}
      />

      <AddDepartmentForm
        visible={addDepartmentModalVisible}
        confirmLoading={addDepartmentModalLoading}
        onCancel={handleCancel}
        onOk={handleAddDepartmentOk}
      />
    </div>
  );
};

export default Department;
