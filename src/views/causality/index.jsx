/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider, Modal, Form, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SwapOutlined, // Import ikon untuk status
  CalculatorOutlined, // Import ikon untuk perhitungan
} from "@ant-design/icons";
import {
  getCausality,
  deleteCausality,
  editCausality,
  addCausality,
  updateCausalityStatus, // Import API baru
  // calculateCausalityWeights, // Tidak lagi dipanggil langsung dari tombol ini
} from "@/api/causality"; // Pastikan path ini benar
import { getSubjects } from "@/api/subject"; // Import API untuk subjects
import { getLectures } from "@/api/lecture"; // Import API untuk lectures
import TypingCard from "@/components/TypingCard";
import EditCausalityForm from "./forms/edit-causality-form"; // Asumsi Anda akan mengupdate ini juga
import AddCausalityForm from "./forms/add-causality-form";

const { Column } = Table;
const { Option } = Select;

// Helper function to find name by ID (can be moved to a utility file)
const findNameById = (list, id) => {
  const item = list.find((item) => item.id === id);
  return item ? item.name : id || "-";
};

const Causality = () => {
  const [causality, setCausality] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [editCausalityModalVisible, setEditCausalityModalVisible] = useState(false);
  const [editCausalityModalLoading, setEditCausalityModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addCausalityModalVisible, setAddCausalityModalVisible] = useState(false);
  const [addCausalityModalLoading, setAddCausalityModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk modal update status
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [currentCausalityIdForStatus, setCurrentCausalityIdForStatus] = useState(null);
  const [statusForm] = Form.useForm();

  // Render functions for table columns
  const renderSubjectName = (subjectId) => {
    return findNameById(subjects, subjectId);
  };

  const renderLectureName = (lectureId) => {
    return findNameById(lectures, lectureId);
  };

  // Fungsi untuk mengambil data kausalitas
  const fetchCausality = async () => {
    setLoading(true);
    try {
      const result = await getCausality();
      // console.log("Respons API getCausality:", result);

      const { statusCode, content, message: apiMessage } = result.data;

      if (statusCode === 200) {
        if (content && content.length > 0) {
          setCausality(content);
        } else {
          message.info(apiMessage || "Belum ada data kausalitas.");
          setCausality([]);
        }
      } else {
        message.error(apiMessage || "Gagal mengambil data kausalitas.");
        setCausality([]);
      }
    } catch (error) {
      console.error("Error fetching causality:", error);
      message.error("Terjadi kesalahan saat berkomunikasi dengan server saat mengambil kausalitas.");
      setCausality([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil data dropdown (subjects dan lectures)
  const fetchDropdownData = async () => {
    try {
      const subjectResponse = await getSubjects();
      if (subjectResponse.data && subjectResponse.data.content) {
        setSubjects(subjectResponse.data.content);
      } else {
        message.error("Gagal memuat data mata kuliah untuk tampilan tabel: Struktur data tidak sesuai.");
      }

      const lectureResponse = await getLectures();
      if (lectureResponse.data && lectureResponse.data.content) {
        setLectures(lectureResponse.data.content);
      } else {
        message.error("Gagal memuat data dosen untuk tampilan tabel: Struktur data tidak sesuai.");
      }
    } catch (error) {
      console.error("Gagal mengambil data dropdown:", error);
      message.error("Terjadi kesalahan saat memuat data mata kuliah atau dosen.");
    }
  };

  useEffect(() => {
    fetchCausality();
    fetchDropdownData();
  }, []);

  const handleEditCausality = (row) => {
    setCurrentRowData({ ...row });
    setEditCausalityModalVisible(true);
  };

  const handleDeleteCausality = async (row) => {
    const { idCausality } = row;
    try {
      setLoading(true);
      const result = await deleteCausality(idCausality); // Mengirim ID langsung

      if (result.status === 204) {
        message.success("Berhasil dihapus!");
        fetchCausality();
      } else {
        // Asumsi API delete mengembalikan body jika error, atau jika statusCode bukan 204
        message.error(result.data.message || "Gagal menghapus, coba lagi.");
      }
    } catch (error) {
      console.error("Error deleting causality:", error);
      // Periksa apakah error memiliki respons dan pesan
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat menghapus kausalitas.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCausalityOk = async (values) => {
    try {
      setEditCausalityModalLoading(true);
      const { idCausality, ...dataToUpdate } = values; // Pastikan idCausality ada di `values`

      const result = await editCausality(dataToUpdate, idCausality);

      if (result.data && result.data.statusCode === 200) {
        setEditCausalityModalVisible(false);
        message.success("Berhasil mengedit!");
        fetchCausality();
      } else {
        message.error(result.data.message || "Gagal mengedit, coba lagi.");
      }
    } catch (error) {
      console.error("Error editing causality:", error);
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat mengedit kausalitas.";
      message.error(errorMessage);
    } finally {
      setEditCausalityModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditCausalityModalVisible(false);
    setAddCausalityModalVisible(false);
    setStatusModalVisible(false); // Tutup modal status juga
    statusForm.resetFields(); // Reset form status
  };

  const handleAddCausality = () => {
    setAddCausalityModalVisible(true);
  };

  const handleAddCausalityOk = async (values) => {
    try {
      setAddCausalityModalLoading(true);
      const result = await addCausality(values);

      if (result.data && result.data.statusCode === 201) {
        setAddCausalityModalVisible(false);
        message.success("Berhasil menambahkan kausalitas!");
        fetchCausality();
      } else {
        message.error(result.data.message || "Gagal menambahkan, coba lagi.");
      }
    } catch (error) {
      console.error("Error adding causality:", error);
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat menambahkan kausalitas.";
      message.error(errorMessage);
    } finally {
      setAddCausalityModalLoading(false);
    }
  };

  // --- Handler untuk Ubah Status ---
  const handleUpdateStatus = (row) => {
    setCurrentCausalityIdForStatus(row.idCausality);
    statusForm.setFieldsValue({ status: row.status }); // Set status saat ini ke form modal
    setStatusModalVisible(true);
  };

  const handleStatusModalOk = async () => {
    try {
      setStatusModalLoading(true);
      const values = await statusForm.validateFields();
      const newStatus = values.status;

      const result = await updateCausalityStatus(currentCausalityIdForStatus, { status: newStatus });

      if (result.data && result.data.statusCode === 200) {
        message.success(`Status berhasil diubah menjadi "${newStatus}"!`);
        setStatusModalVisible(false);
        fetchCausality();
      } else {
        message.error(result.data.message || "Gagal mengubah status, coba lagi.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat mengubah status.";
      message.error(errorMessage);
    } finally {
      setStatusModalLoading(false);
    }
  };

  // --- Handler untuk Navigasi ke Matriks Penilaian (DEMATEL Awal) ---
  const handleViewDematelMatrix = (row) => {
    // Mengarahkan ke halaman baru untuk menampilkan matriks penilaian dosen
    // Asumsi Anda memiliki sistem routing (misalnya React Router)
    // Untuk tujuan demo ini, kita akan menggunakan window.location.href
    // Di aplikasi nyata, Anda akan menggunakan history.push('/path') atau Link
    window.location.href = `/dematel-generate-step-linguistic/${row.idCausality}`;
    // Anda perlu membuat komponen baru di path ini untuk menampilkan matriks
    // Di komponen tersebut, Anda akan memanggil API getAllCausalityRatingsForTask(row.idCausality)
    // untuk mendapatkan data penilaian dari dosen-dosen.
  };


  const cardContent = `Di sini, Anda dapat mengelola data kausalitas di sistem, seperti menambahkan kausalitas baru, atau mengubah kausalitas yang sudah ada. Setiap kausalitas yang ditambahkan akan menjadi tugas penilaian bagi dosen yang ditunjuk untuk menentukan signifikansi kriteria.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Kausalitas" source={cardContent} />
      <br />
      <Card title={<Button type="primary" onClick={handleAddCausality}>Tambahkan Kausalitas</Button>}>
        <Table
          bordered
          rowKey="idCausality"
          dataSource={causality}
          pagination={false}
          loading={loading}
        >
          <Column title="ID Kausalitas" dataIndex="idCausality" key="idCausalitas" align="center" />
          <Column title="Deskripsi" dataIndex="description" key="description" align="center" />
          <Column
            title="Mata Kuliah"
            dataIndex="subject"
            key="subject"
            align="center"
            render={renderSubjectName}
          />
          <Column title="Semester" dataIndex="semester" key="semester" align="center" />
          <Column
            title="Dosen Pengajar 1"
            dataIndex="teamTeaching1"
            key="teamTeaching1"
            align="center"
            render={renderLectureName}
          />
          <Column
            title="Dosen Pengajar 2"
            dataIndex="teamTeaching2"
            key="teamTeaching2"
            align="center"
            render={renderLectureName}
          />
          <Column
            title="Dosen Pengajar 3"
            dataIndex="teamTeaching3"
            key="teamTeaching3"
            align="center"
            render={renderLectureName}
          />
          <Column title="Status" dataIndex="status" key="status" align="center" />
          <Column
            title="Operasi"
            key="action"
            width={320} // Lebar disesuaikan karena ada 4 tombol
            align="center"
            render={(text, row) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  title="Edit"
                  onClick={() => handleEditCausality(row)}
                  disabled={loading}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  title="Hapus"
                  onClick={() => handleDeleteCausality(row)}
                  disabled={loading}
                />
                <Divider type="vertical" />
                <Button
                  type="default"
                  shape="circle"
                  icon={<SwapOutlined />}
                  title="Ubah Status"
                  onClick={() => handleUpdateStatus(row)}
                  // Nonaktifkan jika sudah 'Completed' atau 'Cancelled' (logika asli)
                  disabled={loading || row.status === 'Completed' || row.status === 'Cancelled'}
                />
                <Divider type="vertical" />
                <Button
                  type="dashed"
                  shape="circle"
                  icon={<CalculatorOutlined />}
                  title="Lihat Matriks Penilaian" // Ubah judul tombol
                  onClick={() => handleViewDematelMatrix(row)} // <-- Fungsi baru
                  // disabled={loading || row.status !== 'Completed'} // <-- Hapus kondisi disabled
                  disabled={loading} // Hanya disable saat loading global
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditCausalityForm
        currentRowData={currentRowData}
        visible={editCausalityModalVisible}
        confirmLoading={editCausalityModalLoading}
        onCancel={handleCancel}
        onOk={handleEditCausalityOk}
        subjects={subjects}
        lectures={lectures}
      />

      <AddCausalityForm
        visible={addCausalityModalVisible}
        confirmLoading={addCausalityModalLoading}
        onCancel={handleCancel}
        onOk={handleAddCausalityOk}
        subjects={subjects}
        lectures={lectures}
      />

      {/* Modal untuk update status */}
      <Modal
        title="Ubah Status Kausalitas"
        open={statusModalVisible}
        onCancel={handleCancel} // Gunakan handleCancel yang sama untuk mereset dan menutup
        onOk={handleStatusModalOk}
        confirmLoading={statusModalLoading}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            label="Status Baru:"
            name="status"
            rules={[{ required: true, message: "Silahkan pilih status baru" }]}
          >
            <Select placeholder="Pilih Status">
              <Option value="Pending">Pending</Option>
              <Option value="InProgress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
              {/* Anda bisa menambahkan status lain sesuai kebutuhan */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Causality;
