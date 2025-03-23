import React, { Component } from "react";
import { Form, Input, Modal } from "antd";

const { TextArea } = Input;

class EditReligionForm extends Component {
  formRef = React.createRef();

  componentDidUpdate(prevProps) {
    if (this.props.currentRowData !== prevProps.currentRowData) {
      this.formRef.current?.setFieldsValue(this.props.currentRowData);
    }
  }

  handleOk = () => {
    this.formRef.current
      .validateFields()
      .then((values) => {
        this.props.onOk(values);
      })
      .catch((info) => {
        console.log("Validasi gagal:", info);
      });
  };

  render() {
    const { visible, onCancel, confirmLoading } = this.props;

    return (
      <Modal
        title="Edit Agama"
        open={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
      >
        <Form ref={this.formRef}>
          <Form.Item label="ID Agama:" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Nama Agama:"
            name="name"
            rules={[{ required: true, message: "Silahkan isikan nama agama" }]}
          >
            <Input placeholder="Nama Agama" />
          </Form.Item>
          <Form.Item
            label="Deskripsi Agama:"
            name="description"
            rules={[{ required: true, message: "Silahkan isikan deskripsi agama" }]}
          >
            <TextArea rows={4} placeholder="Deskripsi Agama" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default EditReligionForm;
