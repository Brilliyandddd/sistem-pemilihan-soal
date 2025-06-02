/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Divider } from "antd";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getRPSDetail,
  deleteRPSDetail,
  editRPSDetail,
  addRPSDetail,
} from "@/api/rpsDetail";
import { getFormLearnings } from "@/api/formLearning";
import { getLearningMethods } from "@/api/learningMethod";
import { getAssessmentCriterias } from "@/api/assessmentCriteria";
import { getAppraisalForms } from "@/api/appraisalForm";
import { getRPSById } from "@/api/rps";
import TypingCard from "@/components/TypingCard";
import EditRPSDetailForm from "./forms/edit-rpsDetail-form";
import AddRPSDetailForm from "./forms/add-rpsDetail-form";
import { EditOutlined, DiffOutlined, DeleteOutlined } from "@ant-design/icons";

const { Column } = Table;

const RPSDetailDetail = () => {
  const { rpsID } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    rpsDetail: [],
    formLearnings: [],
    learningMethods: [],
    dev_lecturers: [],
    assessmentCriterias: [],
    rps: [],
    appraisalForms: [],
    currentRowData: {},
    loading: false,
  });

  const [modal, setModal] = useState({
    editVisible: false,
    editLoading: false,
    addVisible: false,
    addLoading: false,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const [
        detailRes,
        rpsRes,
        formLearningsRes,
        learningMethodsRes,
        assessmentRes,
        appraisalRes,
      ] = await Promise.all([
        getRPSDetail(rpsID),
        getRPSById(rpsID),
        getFormLearnings(),
        getLearningMethods(),
        getAssessmentCriterias(),
        getAppraisalForms(),
      ]);

      setState({
        rpsDetail: detailRes.data.content,
        rps: rpsRes.data.content,
        dev_lecturers: rpsRes.data.content.dev_lecturers || [],
        formLearnings: formLearningsRes.data.content,
        learningMethods: learningMethodsRes.data.content,
        assessmentCriterias: assessmentRes.data.content,
        appraisalForms: appraisalRes.data.content,
        currentRowData: {},
        loading: false,
      });
    } catch (error) {
      message.error("Failed to fetch data");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [rpsID]);

  const handleEdit = (row) => {
    setState(prev => ({ ...prev, currentRowData: row }));
    setModal(prev => ({ ...prev, editVisible: true }));
  };

  const handleDelete = async (row) => {
    if (row.id === "admin") {
      message.error("Cannot delete admin!");
      return;
    }
    
    try {
      await deleteRPSDetail({ id: row.id });
      message.success("Deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  const handleEditSubmit = async (values) => {
    setModal(prev => ({ ...prev, editLoading: true }));
    
    try {
      await editRPSDetail(values);
      message.success("Updated successfully");
      setModal(prev => ({ ...prev, editVisible: false, editLoading: false }));
      fetchData();
    } catch (error) {
      message.error("Update failed");
      setModal(prev => ({ ...prev, editLoading: false }));
    }
  };

  const handleAddSubmit = async (values) => {
    setModal(prev => ({ ...prev, addLoading: true }));
    
    try {
      await addRPSDetail({ ...values, rps_id: rpsID });
      message.success("Added successfully");
      setModal(prev => ({ ...prev, addVisible: false, addLoading: false }));
      fetchData();
    } catch (error) {
      message.error("Failed to add");
      setModal(prev => ({ ...prev, addLoading: false }));
    }
  };

  const cardContent = "Here you can manage RPSDetail according to the courses taught. Below you can display the existing RPSDetail list.";

  return (
    <div className="app-container">
      <TypingCard title="RPSDetail Management" source={cardContent} />
      <br />
      
      <Card
        title={
          <Button 
            type="primary" 
            onClick={() => setModal(prev => ({ ...prev, addVisible: true }))}
          >
            Add RPSDetail
          </Button>
        }
      >
        <Table
          bordered
          rowKey="id"
          dataSource={state.rpsDetail}
          loading={state.loading}
          pagination={false}
        >
          <Column
            title="ID RPS Detail"
            dataIndex="id"
            align="center"
          />
          <Column
           title="RPS"
           dataIndex={["rps", "idRps"]}
           align="center"
          />
          <Column
            title="Minggu ke"
            dataIndex="week"
            align="center"
            sorter={(a, b) => a.week - b.week}
          />
          <Column
            title="Bobot"
            dataIndex="weight"
            align="center"
          />
          <Column
            title="Metode Pembelajaran"
            dataIndex={["form_learning", "name"]}
            align="center"
          />
          <Column
            title="Actions"
            align="center"
            render={(_, record) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Divider type="vertical" />
                <Link to={`/rps/${rpsID}/${record.id}`}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DiffOutlined />}
                  />
                </Link>
                <Divider type="vertical" />
                <Button
                  type="danger"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditRPSDetailForm
        visible={modal.editVisible}
        loading={modal.editLoading}
        onCancel={() => setModal(prev => ({ ...prev, editVisible: false }))}
        onOk={handleEditSubmit}
        initialValues={state.currentRowData}
      />

      <AddRPSDetailForm
        visible={modal.addVisible}
        loading={modal.addLoading}
        onCancel={() => setModal(prev => ({ ...prev, addVisible: false }))}
        onOk={handleAddSubmit}
        formLearnings={state.formLearnings}
        learningMethods={state.learningMethods}
        assessmentCriterias={state.assessmentCriterias}
        appraisalForms={state.appraisalForms}
      />
    </div>
  );
};

export default RPSDetailDetail;