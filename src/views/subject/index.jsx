import React, { Component } from "react";
import { Card, Button, Table, message, Divider } from "antd";
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
const { Column } = Table;
class Subject extends Component {
  state = {
    subjects: [],
    studyPrograms: [],
    subjectGroups: [],
    editSubjectModalVisible: false,
    editSubjectModalLoading: false,
    currentRowData: {},
    addSubjectModalVisible: false,
    addSubjectModalLoading: false,
  };
  getSubjects = async () => {
    const result = await getSubjects();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      this.setState({
        subjects: content,
      });
    }
  };

  getStudyPrograms = async () => {
    const result = await getStudyPrograms();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      this.setState({
        studyPrograms: content,
      });
    }
  };

  getSubjectGroups = async () => {
    const result = await getSubjectGroups();
    const { content, statusCode } = result.data;

    if (statusCode === 200) {
      this.setState({
        subjectGroups: content,
      });
    }
  };

  handleEditSubject = (row) => {
    this.setState({
      currentRowData: Object.assign({}, row),
      editSubjectModalVisible: true,
    });
  };

  handleDeleteSubject = (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("不能menghapusoleh  Admin！");
      return;
    }
    console.log(id);
    deleteSubject({ id }).then((res) => {
      message.success("berhasil dihapus");
      this.getSubjects();
    });
  };

  handleEditSubjectOk = (_) => {
    const { form } = this.editSubjectFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ editModalLoading: true });
      editSubject(values, values.id)
        .then((response) => {
          form.resetFields();
          this.setState({
            editSubjectModalVisible: false,
            editSubjectModalLoading: false,
          });
          message.success("berhasi;!");
          this.getSubjects();
        })
        .catch((e) => {
          message.success("gagal");
        });
    });
  };

  handleCancel = (_) => {
    this.setState({
      editSubjectModalVisible: false,
      addSubjectModalVisible: false,
    });
  };

  handleAddSubject = (row) => {
    this.setState({
      addSubjectModalVisible: true,
    });
  };

  handleAddSubjectOk = (_) => {
    const { form } = this.addSubjectFormRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ addSubjectModalLoading: true });
      addSubject(values)
        .then((response) => {
          form.resetFields();
          this.setState({
            addSubjectModalVisible: false,
            addSubjectModalLoading: false,
          });
          message.success("Berhasil menambahkan mata kuliah!");
          this.getSubjects();
        })
        .catch((e) => {
          message.success("Gagal menambahkan, coba lagi!");
        });
    });
  };
  componentDidMount() {
    this.getSubjects();
    this.getStudyPrograms();
    this.getSubjectGroups();
  }
  render() {
    const { subjects, subjectGroups, studyPrograms } = this.state;
    const title = (
      <span>
        <Button type="primary" onClick={this.handleAddSubject}>
          Tambahkan mata kuliah
        </Button>
      </span>
    );
    const cardContent = `Di sini, Anda dapat mengelola mata kuliah di sistem, seperti menambahkan mata kuliah baru, atau mengubah mata kuliah yang sudah ada di sistem.`;
    return (
      <div className="app-container">
        <TypingCard title="Manajemen Mata Kuliah" source={cardContent} />
        <br />
        <Card title={title}>
          <Table bordered rowKey="id" dataSource={subjects} pagination={false}>
            <Column
              title="ID Mata Kuliah"
              dataIndex="id"
              key="id"
              align="center"
            />
            <Column title="Nama" dataIndex="name" key="name" align="center" />
            <Column
              title="Deskripsi Mata Kuliah"
              dataIndex="description"
              key="description"
              align="center"
            />
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
                    title="mengedit"
                    onClick={this.handleEditSubject.bind(null, row)}
                  />
                  <Divider type="vertical" />
                  <Button
                    type="primary"
                    shape="circle"
                    icon="delete"
                    title="menghapus"
                    onClick={this.handleDeleteSubject.bind(null, row)}
                  />
                </span>
              )}
            />
          </Table>
        </Card>
        <EditSubjectForm
          currentRowData={this.state.currentRowData}
          wrappedComponentRef={(formRef) => (this.editSubjectFormRef = formRef)}
          visible={this.state.editSubjectModalVisible}
          confirmLoading={this.state.editSubjectModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleEditSubjectOk}
        />
        <AddSubjectForm
          wrappedComponentRef={(formRef) => (this.addSubjectFormRef = formRef)}
          visible={this.state.addSubjectModalVisible}
          confirmLoading={this.state.addSubjectModalLoading}
          onCancel={this.handleCancel}
          onOk={this.handleAddSubjectOk}
          subjectGroups={subjectGroups}
          studyPrograms={studyPrograms}
        />
      </div>
    );
  }
}

export default Subject;
