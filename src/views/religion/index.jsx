import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, message, Divider, Modal, Form, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { getReligions, deleteReligion, editReligion, addReligion } from "@/api/religion";

const { Column } = Table;
const { confirm } = Modal;

const Religion = () => {
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState(null);
  const [form] = Form.useForm();

  const fetchReligions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getReligions();
      if (result.data.statusCode === 200) {
        setReligions(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data agama.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReligions();
  }, [fetchReligions]);

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Apakah Anda yakin ingin menghapus agama ini?",
      icon: <ExclamationCircleOutlined />,
      content: "Data yang dihapus tidak dapat dikembalikan.",
      okText: "Ya",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await deleteReligion({ id });
          message.success("Berhasil dihapus");
          fetchReligions();
        } catch (error) {
          message.error("Gagal menghapus, coba lagi!");
        }
      },
    });
  };

  const handleEdit = (religion) => {
    setSelectedReligion(religion);
    form.setFieldsValue(religion);
    setEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      await editReligion(values, selectedReligion.id);
      message.success("Berhasil diperbarui!");
      setEditModalVisible(false);
      fetchReligions();
    } catch (error) {
      message.error("Gagal memperbarui, coba lagi!");
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      await addReligion(values);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchReligions();
    } catch (error) {
      message.error("Gagal menambahkan, coba lagi!");
    }
  };

  return (
    <div className="app-container">
      <Card title={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}> Tambahkan Agama </Button>}>
        <Table bordered rowKey="id" dataSource={religions} loading={loading} pagination={{ pageSize: 10 }}>
          <Column title="ID Agama" dataIndex="id" key="id" align="center" />
          <Column title="Nama" dataIndex="name" key="name" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={200}
            align="center"
            render={(_, religion) => (
              <>
                <Button type="primary" icon={<EditOutlined />} title="Edit" onClick={() => handleEdit(religion)} />
                <Divider type="vertical" />
                <Button type="danger" icon={<DeleteOutlined />} title="Delete" onClick={() => showDeleteConfirm(religion.id)} />
              </>
            )}
          />
        </Table>
      </Card>
      {/* Modal Edit */}
      <Modal
        title="Edit Agama"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditOk}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal Tambah */}
      <Modal
        title="Tambahkan Agama"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddOk}
        okText="Tambah"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Religion;