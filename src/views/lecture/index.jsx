import React, { Component } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import {
  getLectures,
  deleteLecture,
  editLecture,
  addLecture,
} from "@/api/lecture";
import { getReligions } from "@/api/religion";
import { getUsersNotUsedInLectures } from "@/api/user";
import { getStudyPrograms } from "@/api/studyProgram";

import TypingCard from "@/components/TypingCard";
import EditLectureForm from "./forms/edit-lecture-form";
import AddLectureForm from "./forms/add-lecture-form";

const { Column } = Table;

class Lecture extends Component {
  constructor(props) {
    super(props);

    // ✅ Tambahkan ref di constructor
    this.addLectureFormRef = React.createRef();
    this.editLectureFormRef = React.createRef();

    this.state = {
      lectures: [],
      religions: [],
      users: [],
      studyPrograms: [],
      editLectureModalVisible: false,
      editLectureModalLoading: false,
      currentRowData: {},
      addLectureModalVisible: false,
      addLectureModalLoading: false,
    };
  }

  componentDidMount() {
    this.fetchInitialData();
  }

  fetchInitialData = async () => {
    await Promise.all([
      this.getLectures(),
      this.getReligions(),
      this.getUsers(),
      this.getStudyPrograms(),
    ]);
  };

  getLectures = async () => {
    const result = await getLectures();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      this.setState({ lectures: content });
    }
  };

  getReligions = async () => {
    const result = await getReligions();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      this.setState({ religions: content });
    }
  };

  getUsers = async () => {
    const result = await getUsersNotUsedInLectures();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      this.setState({ users: content });
    }
  };

  getStudyPrograms = async () => {
    const result = await getStudyPrograms();
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      this.setState({ studyPrograms: content });
    }
  };

  handleEditLecture = (row) => {
    this.setState({
      currentRowData: { ...row },
      editLectureModalVisible: true,
    });
  };

  handleDeleteLecture = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }
    try {
      await deleteLecture({ id });
      message.success("Dosen berhasil dihapus");
      this.getLectures();
      this.getUsers();
    } catch (error) {
      message.error("Gagal menghapus dosen");
    }
  };

  handleEditLectureOk = () => {
    const form = this.editLectureFormRef.current;
    if (!form) {
      console.error("Form edit belum siap.");
      return;
    }

    form
      .validateFields()
      .then(async (values) => {
        this.setState({ editLectureModalLoading: true });
        try {
          const response = await editLecture(values, values.id);
          console.log("RESPON EDIT:", response); // cek struktur datanya
          form.resetFields();
          this.setState({
            editLectureModalVisible: false,
            editLectureModalLoading: false,
          });
          message.success("Dosen berhasil diubah!");
          this.getLectures();
          this.getUsers();
        } catch (error) {
          console.error("ERROR SAAT EDIT:", error.response || error);
          message.error("Gagal mengubah dosen");
          this.setState({ editLectureModalLoading: false });
        }
        
      })
      .catch((err) => {
        console.warn("Validasi gagal:", err);
      });
  };

  handleAddLecture = async() => {
    await this.getUsers();
    this.setState({ addLectureModalVisible: true });
  };

  handleAddLectureOk = () => {
    const form = this.addLectureFormRef.current;
    if (!form) {
      console.error("Form belum siap.");
      return;
    }

    form
      .validateFields()
      .then(async (values) => {
        this.setState({ addLectureModalLoading: true });
        try {
          console.log("Data yang dikirim:", values);
          await addLecture(values);
          form.resetFields();
          this.setState({
            addLectureModalVisible: false,
            addLectureModalLoading: false,
          });
          message.success("Dosen berhasil ditambahkan!");
          this.getLectures();
          this.getUsers();
        } catch (error) {
          console.error(error.response?.data);
          message.error("Gagal menambahkan dosen, coba lagi!");
          this.setState({ addLectureModalLoading: false });
        }
      })
      .catch((err) => {
        console.warn("Validasi gagal:", err);
      });
      
  };

  handleCancel = () => {
    this.setState({
      editLectureModalVisible: false,
      addLectureModalVisible: false,
    });
  };

  render() {
    const {
      lectures,
      religions,
      users,
      studyPrograms,
      editLectureModalVisible,
      editLectureModalLoading,
      currentRowData,
      addLectureModalVisible,
      addLectureModalLoading,
    } = this.state;

    const cardContent = `Di sini, Anda dapat mengelola dosen di sistem, seperti menambahkan dosen baru, atau mengubah dosen yang sudah ada di sistem.`;

    return (
      <div className="app-container">
        <TypingCard title="Manajemen Dosen" source={cardContent} />
        <br />
        <Card
          title={
            <Button type="primary" onClick={this.handleAddLecture}>
              Tambahkan Dosen
            </Button>
          }
        >
          <Table bordered rowKey="id" dataSource={lectures} pagination={false}>
            <Column title="NIDN" dataIndex="nidn" key="nidn" align="center" />
            <Column title="Nama Depan" dataIndex="name" key="name" align="center" />
            <Column title="Peran" dataIndex={["user", "id"]} key="user" align="center" />
            <Column title="Tempat Lahir" dataIndex="place_born" key="place_born" align="center" />
            <Column title="Agama" dataIndex={["religion", "name"]} key="religion" align="center" />
            <Column title="Telepon" dataIndex="phone" key="phone" align="center" />
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
                    onClick={() => this.handleEditLecture(row)}
                  />
                  <Divider type="vertical" />
                  <Button
                    type="danger"
                    shape="circle"
                    icon="delete"
                    title="Hapus"
                    onClick={() => this.handleDeleteLecture(row)}
                  />
                </span>
              )}
            />
          </Table>
        </Card>

        <EditLectureForm
          currentRowData={currentRowData}
          formRef={this.editLectureFormRef}
          visible={editLectureModalVisible}
          confirmLoading={editLectureModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditLectureOk}
          religion={religions}
          user={users}
          studyProgram={studyPrograms}
        />

        <AddLectureForm
          formRef={this.addLectureFormRef}
          visible={addLectureModalVisible}
          confirmLoading={addLectureModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddLectureOk}
          religion={religions}
          user={users}
          studyProgram={studyPrograms}
        />
      </div>
    );
  }
}

export default Lecture;
