import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message } from "antd";
import { getUsers, deleteUser, editUser, addUser } from "@/api/user";
import TypingCard from "@/components/TypingCard";
import EditUserForm from "./forms/edit-user-form";
import AddUserForm from "./forms/add-user-form";

const { Column } = Table;

const User = () => {
  const [users, setUsers] = useState([]);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [editUserModalLoading, setEditUserModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [addUserModalLoading, setAddUserModalLoading] = useState(false);

  const editUserFormRef = useRef(null);
  const addUserFormRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await getUsers();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setUsers(content);
      }
    } catch (error) {
      message.error("Gagal mengambil data pengguna");
    }
  };

  const handleEditUser = (row) => {
    setCurrentRowData({ ...row });
    setEditUserModalVisible(true);
  };

  const handleDeleteUser = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }
    try {
      await deleteUser({ id });
      message.success("Berhasil dihapus");
      fetchUsers();
    } catch (error) {
      message.error("Gagal menghapus pengguna");
    }
  };

  const handleEditUserOk = async () => {
    const form = editUserFormRef.current;
    try {
      const values = await form.validateFields();
      setEditUserModalLoading(true);
      await editUser(values);
      form.resetFields();
      setEditUserModalVisible(false);
      setEditUserModalLoading(false);
      message.success("Berhasil memperbarui pengguna!");
      fetchUsers();
    } catch (error) {
      message.error("Gagal memperbarui pengguna");
      setEditUserModalLoading(false);
    }
  };

  const handleAddUserOk = async () => {
    const form = addUserFormRef.current;
    try {
      const values = await form.validateFields();
      setAddUserModalLoading(true);
      await addUser(values);
      form.resetFields();
      setAddUserModalVisible(false);
      setAddUserModalLoading(false);
      message.success("User berhasil ditambahkan!");
      fetchUsers();
    } catch (error) {
      message.error("Gagal menambahkan pengguna");
      setAddUserModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditUserModalVisible(false);
    setAddUserModalVisible(false);
  };

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Pengguna" source="Di sini, Anda dapat mengelola pengguna di sistem, seperti menambahkan pengguna baru, atau mengubah pengguna yang sudah ada di sistem." />
      <br />
      <Card title={<Button type="primary" onClick={() => setAddUserModalVisible(true)}>Tambahkan pengguna</Button>}>
        <Table bordered rowKey="id" dataSource={users} pagination={false}>
          <Column title="ID Pengguna" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Username" dataIndex="username" key="username" align="center" />
          <Column title="Email" dataIndex="email" key="email" align="center" />
          <Column title="Peran" dataIndex="roles" key="roles" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEditUser(row)} />
                <Button type="danger" shape="circle" icon="delete" title="Hapus" onClick={() => handleDeleteUser(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditUserForm
        ref={editUserFormRef}
        currentRowData={currentRowData}
        visible={editUserModalVisible}
        confirmLoading={editUserModalLoading}
        onCancel={handleCancel}
        onOk={handleEditUserOk}
      />
      <AddUserForm
        ref={addUserFormRef}
        visible={addUserModalVisible}
        confirmLoading={addUserModalLoading}
        onCancel={handleCancel}
        onOk={handleAddUserOk}
      />
    </div>
  );
};

export default User;