import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getLinguisticValues,
  deleteLinguisticValue,
  editLinguisticValue,
  addLinguisticValue,
} from "@/api/linguisticValue";
import TypingCard from "@/components/TypingCard";
import EditLinguisticValueForm from "./forms/edit-linguistic-value-form";
import AddLinguisticValueForm from "./forms/add-linguistic-value-form";
const { Column } = Table;

const LinguisticValue = () => {
  const [linguisticValues, setLinguisticValues] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  
  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  const BASE_URL = 'http://hadoop-primary:9870/';

  useEffect(() => {
    fetchLinguisticValues();
  }, []);

  const fetchLinguisticValues = async () => {
    try {
      const result = await getLinguisticValues();
      if (result.data.statusCode === 200) {
        setLinguisticValues(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data");
    }
  };

  const handleEdit = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleDelete = async (row) => {
    try {
      await deleteLinguisticValue({ id: row.id });
      message.success("Berhasil dihapus");
      fetchLinguisticValues();
    } catch (error) {
      message.error("Gagal menghapus data");
    }
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setAddModalVisible(false);
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleAddOk = async () => {
    const form = addFormRef.current;
    try {
      const values = await form.validateFields();
      setAddModalLoading(true);
      const formData = new FormData();
      if (values.file && values.file.fileList.length > 0) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }
      ["name", "value1", "value2", "value3", "value4"].forEach(key => formData.append(key, values[key]));
      await addLinguisticValue(formData);
      message.success("Berhasil ditambahkan!");
      setAddModalVisible(false);
      fetchLinguisticValues();
    } catch (error) {
      message.error("Gagal menambahkan data");
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleEditOk = async () => {
    const form = editFormRef.current;
    try {
      const values = await form.validateFields();
      setEditModalLoading(true);
      await editLinguisticValue(values, currentRowData.id);
      message.success("Berhasil diperbarui!");
      setEditModalVisible(false);
      fetchLinguisticValues();
    } catch (error) {
      message.error("Gagal memperbarui data");
    } finally {
      setEditModalLoading(false);
    }
  };

  return (
    <div className="app-container">
      <TypingCard source="Di sini Anda dapat menambahkan linguistic value beserta gambar yang Anda inginkan." />
      <Card title={<Button type="primary" onClick={handleAdd}>Tambah Nilai Linguistic</Button>}>
        <Table dataSource={linguisticValues} rowKey="id">
          <Column title="ID" key="id" align="center" render={(value, record, index) => index + 1} />
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            render={(text, record) => (
              <>
                {text}
                {record.file_path && (
                  <img src={`${BASE_URL}${record.file_path}`} alt={text} style={{ width: '200px', height: '200px', marginLeft: '10px' }} />
                )}
              </>
            )}
          />
          <Column title="Value 1" dataIndex="value1" key="value1" />
          <Column title="Value 2" dataIndex="value2" key="value2" />
          <Column title="Value 3" dataIndex="value3" key="value3" />
          <Column title="Value 4" dataIndex="value4" key="value4" />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button type="primary" shape="circle" icon="edit" title="Edit" onClick={() => handleEdit(row)} />
                <Divider type="vertical" />
                <Button type="primary" shape="circle" icon="delete" title="Hapus" onClick={() => handleDelete(row)} />
              </span>
            )}
          />
        </Table>
      </Card>
      <EditLinguisticValueForm
        ref={editFormRef}
        visible={editModalVisible}
        confirmLoading={editModalLoading}
        onCancel={handleCancel}
        onOk={handleEditOk}
        currentRowData={currentRowData}
      />
      <AddLinguisticValueForm
        ref={addFormRef}
        visible={addModalVisible}
        confirmLoading={addModalLoading}
        onCancel={handleCancel}
        onOk={handleAddOk}
      />
    </div>
  );
};

export default LinguisticValue;