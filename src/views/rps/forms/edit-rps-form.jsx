import React, { Component } from "react";
import { Form, Input, Select, Modal, InputNumber } from "antd";

const { TextArea } = Input;

class EditRPSForm extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentRowData !== this.props.currentRowData) {
      this.formRef.current?.setFieldsValue({
        id: this.props.currentRowData.id,
        name: this.props.currentRowData.name,
        sks: this.props.currentRowData.sks,
        semester: this.props.currentRowData.semester,
        cpl_prodi: this.props.currentRowData.cpl_prodi,
        cpl_mk: this.props.currentRowData.cpl_mk,
        learningMediaSoftwares: this.props.currentRowData.learning_media_softwares?.map(software => software.id) || [],
        learningMediaHardwares: this.props.currentRowData.learning_media_hardwares?.map(hardware => hardware.id) || [],
        subjects: this.props.currentRowData.subject?.id,
        dev_lecturers: this.props.currentRowData.dev_lecturers?.map(lecturer => lecturer.id) || [],
        study_program_id: this.props.currentRowData.study_program?.id,
      });
    }
  }

  render() {
    const { visible, onCancel, onOk, confirmLoading, currentRowData } = this.props;

    return (
      <Modal
        title="Mengedit"
        open={visible}
        onCancel={onCancel}
        onOk={() => this.formRef.current.submit()}
        confirmLoading={confirmLoading}
      >
        <Form ref={this.formRef} layout="vertical" onFinish={onOk}>
          <Form.Item label="ID Pengguna:" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Nama:" name="name" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input placeholder="Nama" />
          </Form.Item>
          <Form.Item label="SKS:" name="sks" rules={[{ required: true, message: "SKS wajib diisi" }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="SKS RPS" />
          </Form.Item>
          <Form.Item label="Semester:" name="semester" rules={[{ required: true, message: "Semester wajib diisi" }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Semester" />
          </Form.Item>
          <Form.Item label="CPL Prodi:" name="cpl_prodi" rules={[{ required: true, message: "CPL Prodi wajib diisi" }]}>
            <Input placeholder="CPL Prodi" />
          </Form.Item>
          <Form.Item label="CPL Mata Kuliah:" name="cpl_mk" rules={[{ required: true, message: "CPL Mata Kuliah wajib diisi" }]}>
            <Input placeholder="CPL Mata Kuliah" />
          </Form.Item>
          <Form.Item label="Learning Media Softwares" name="learningMediaSoftwares">
            <Select mode="multiple" placeholder="Pilih Learning Media Softwares">
              {currentRowData?.learning_media_softwares?.map(software => (
                <Select.Option key={software.id} value={software.id}>
                  {software.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Hardware Media Pembelajaran:" name="learningMediaHardwares">
            <Select mode="multiple" placeholder="Pilih Hardware Media Pembelajaran">
              {currentRowData?.learning_media_hardwares?.map(hardware => (
                <Select.Option key={hardware.id} value={hardware.id}>
                  {hardware.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Mata Kuliah" name="subjects">
            <Select placeholder="Pilih Mata Kuliah">
              {currentRowData?.availableSubjects?.map(subject => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Dosen Pengembang:" name="dev_lecturers">
            <Select mode="multiple" placeholder="Pilih Dosen Pengembang">
              {currentRowData?.availableLecturers?.map(lecturer => (
                <Select.Option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Program Studi:" name="study_program_id">
            <Select placeholder="Pilih Program Studi">
              {currentRowData?.availableStudyPrograms?.map(studyProgram => (
                <Select.Option key={studyProgram.id} value={studyProgram.id}>
                  {studyProgram.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default EditRPSForm;