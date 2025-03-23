import React, { useState } from "react";
import { Form, Input, Modal, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const AddLinguisticValueForm = ({ visible, onCancel, onOk, confirmLoading }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const handleBeforeUpload = (file) => {
        setFileList([file]);
        return false; // Prevent automatic upload
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                onOk({ ...values, file: fileList[0] });
                form.resetFields();
                setFileList([]);
            })
            .catch(info => {
                message.error("Silakan isi semua bidang yang diperlukan");
            });
    };

    return (
        <Modal
            title="Tambah Nilai Linguistik"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={confirmLoading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Level Index"
                    name="name"
                    rules={[{ required: true, message: "Silahkan isikan nama" }]}
                >
                    <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                    label="Value 1"
                    name="value1"
                    rules={[{ required: true, message: "Silahkan isikan value 1" }]}
                >
                    <Input placeholder="Value 1" />
                </Form.Item>
                <Form.Item
                    label="Value 2"
                    name="value2"
                    rules={[{ required: true, message: "Silahkan isikan value 2" }]}
                >
                    <Input placeholder="Value 2" />
                </Form.Item>
                <Form.Item
                    label="Value 3"
                    name="value3"
                    rules={[{ required: true, message: "Silahkan isikan value 3" }]}
                >
                    <Input placeholder="Value 3" />
                </Form.Item>
                <Form.Item
                    label="Value 4"
                    name="value4"
                    rules={[{ required: true, message: "Silahkan isikan value 4" }]}
                >
                    <Input placeholder="Value 4" />
                </Form.Item>
                <Form.Item label="File">
                    <Dragger beforeUpload={handleBeforeUpload} fileList={fileList} maxCount={1}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single upload.</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddLinguisticValueForm;