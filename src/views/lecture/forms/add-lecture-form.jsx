import React, { Component } from "react";
import { Form, Input, Modal, DatePicker, Select } from "antd";
const { TextArea } = Input;
class AddLectureForm extends Component {
  render() {
    const {
      visible,
      onCancel,
      onOk,
      form,
      confirmLoading,
      religion,
      user,
      studyProgram,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal
        title="mengedit"
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        confirmLoading={confirmLoading}
      >
        <Form {...formItemLayout}>
          <Form.Item label="NIDN:">
            {getFieldDecorator("nidn", {
              rules: [{ required: true, message: "NIDN wajib diisi" }],
            })(<Input placeholder="NIDN" />)}
          </Form.Item>
          <Form.Item label="Nama:">
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "Nama depan wajib diisi" }],
            })(<Input placeholder="Nama" />)}
          </Form.Item>
          <Form.Item label="Tempat Lahir:">
            {getFieldDecorator("place_born", {
              rules: [{ required: true, message: "Tempat Lahir wajib diisi" }],
            })(<Input placeholder="Tempat Lahir" />)}
          </Form.Item>
          <Form.Item label="Tanggal Lahir:">
            {getFieldDecorator("date_born", {
              rules: [{ required: true, message: "Tanggal Lahir wajib diisi" }],
            })(<DatePicker placeholder="Tanggal Lahir" />)}
          </Form.Item>
          <Form.Item label="Gender:">
            {getFieldDecorator("gender", {
              rules: [{ required: true, message: "Gender wajib diisi" }],
            })(
              <Select style={{ width: 120 }} placeholder="Gender">
                <Select.Option value="L">Laki-laki</Select.Option>
                <Select.Option value="P">Perempuan</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Nomor Telepon:">
            {getFieldDecorator("phone", {
              rules: [{ required: true, message: "Nomor telefon wajib diisi" }],
            })(<Input type={"number"} placeholder="Nomor Telefon (62)" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("status", {
              initialValue: "dosen",
              rules: [{ required: true, message: "status" }],
            })(<Input type={"number"} placeholder="Status" hidden />)}
          </Form.Item>
          <Form.Item label="Alamat:">
            {getFieldDecorator("address", {
              rules: [{ required: true, message: "Alamat wajib diisi" }],
            })(<TextArea placeholder="Alamat" />)}
          </Form.Item>
          <Form.Item label="Agama:">
            {getFieldDecorator("religion_id", {
              rules: [
                {
                  required: true,
                  message: "Silahkan pilih agama",
                },
              ],
            })(
              <Select style={{ width: 300 }} placeholder="Pilih Agama">
                {religion.map((arr, key) => {
                  return (
                    <Select.Option value={arr.id} key={"religion-" + key}>
                      {arr.name}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Program Study (Prodi):">
            {getFieldDecorator("study_program_id", {
              rules: [
                {
                  required: true,
                  message: "Silahkan pilih prodi",
                },
              ],
            })(
              <Select style={{ width: 300 }} placeholder="Pilih Prodi">
                {studyProgram.map((arr, key) => {
                  return (
                    <Select.Option value={arr.id} key={"study-program-" + key}>
                      {arr.name}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Akun untuk login:">
            {getFieldDecorator("user_id", {
              rules: [
                {
                  required: true,
                  message: "Silahkan pilih akun untuk login",
                },
              ],
            })(
              <Select
                style={{ width: 300 }}
                placeholder="Pilih akun untuk login"
              >
                {user.map((arr, key) => {
                  return (
                    <Select.Option value={arr.id} key={"user-" + key}>
                      {arr.name}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddLectureForm" })(AddLectureForm);
