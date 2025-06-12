import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  Collapse,
  Form,
  Input,
  Radio,
  Select,
  Table,
  message,
  Tag,
  Spin,
  Alert,
} from "antd";
import { FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { getAttemptQuizByQuizID } from "@/api/attemptQuiz";
import TypingCard from "@/components/TypingCard";

const { Column } = Table;
const { Panel } = Collapse;

class ResultQuiz extends Component {
  state = {
    quiz: [],
    filename: "file-nilai",
    bookType: "xlsx",
    autoWidth: true,
    selectedRows: [],
    selectedRowKeys: [],
    downloadLoading: false,
    loading: true,
    error: null,
  };

  getResultQuiz = async (idQuiz) => {
    try {
      this.setState({ loading: true, error: null });
      
      const result = await getAttemptQuizByQuizID(idQuiz);
      const { content, statusCode } = result.data;
      
      console.log("Quiz Result Response:", result);
      console.log("Quiz Result Data:", result.data);
      
      if (statusCode === 200) {
        this.setState({
          quiz: content || [],
          loading: false,
        });
      } else {
        throw new Error("Failed to fetch quiz results");
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      this.setState({
        error: "Gagal memuat data hasil kuis. Silakan coba lagi.",
        loading: false,
      });
      message.error("Gagal memuat data hasil kuis");
    }
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRows, selectedRowKeys });
  };

  handleDownload = (type) => {
    if (type === "selected" && this.state.selectedRowKeys.length === 0) {
      message.error("Pilih minimal satu item untuk diekspor");
      return;
    }
    
    this.setState({
      downloadLoading: true,
    });
    
    import("@/lib/Export2Excel")
      .then((excel) => {
        const tHeader = [
          "ID",
          "Nama Mahasiswa",
          "Nilai Minimum",
          "Nilai",
          "Status",
          "Tanggal Pengerjaan",
        ];
        const filterVal = [
          "id",
          "student.name",
          "quiz.min_grade",
          "grade",
          "state",
          "createdAt",
        ];
        const list = type === "all" ? this.state.quiz : this.state.selectedRows;
        const data = this.formatJson(filterVal, list);
        
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.state.filename,
          autoWidth: this.state.autoWidth,
          bookType: this.state.bookType,
        });
        
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
          downloadLoading: false,
        });
        
        message.success(`Berhasil mengekspor ${list.length} item`);
      })
      .catch((error) => {
        console.error("Export error:", error);
        message.error("Gagal mengekspor data");
        this.setState({ downloadLoading: false });
      });
  };

  formatJson(filterVal, jsonData) {
    return jsonData.map((obj) =>
      filterVal.map((property) => {
        const nestedProperties = property.split(".");
        let value = obj;
        
        for (const nestedProperty of nestedProperties) {
          if (value && typeof value === "object" && nestedProperty in value) {
            value = value[nestedProperty];
          } else {
            value = "-";
            break;
          }
        }
        
        // Format date if it's a date field
        if (property === "createdAt" && value && value !== "-") {
          try {
            value = new Date(value).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        return value;
      })
    );
  }

  autoWidthChange = (e) => {
    this.setState({
      autoWidth: e.target.value,
    });
  };

  filenameChange = (e) => {
    this.setState({
      filename: e.target.value || "file-nilai",
    });
  };

  bookTypeChange = (value) => {
    this.setState({
      bookType: value,
    });
  };

  renderStatus = (status) => {
    const statusConfig = {
      'COMPLETED': { color: 'green', text: 'Selesai' },
      'IN_PROGRESS': { color: 'blue', text: 'Sedang Berlangsung' },
      'NOT_STARTED': { color: 'default', text: 'Belum Dimulai' },
      'EXPIRED': { color: 'red', text: 'Kedaluwarsa' },
      'PASSED': { color: 'green', text: 'Lulus' },
      'FAILED': { color: 'red', text: 'Tidak Lulus' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  renderGrade = (grade, record) => {
    const minGrade = record.quiz?.min_grade || 0;
    const numericGrade = parseFloat(grade) || 0;
    const isPassed = numericGrade >= minGrade;
    
    return (
      <span style={{ 
        color: isPassed ? '#52c41a' : '#ff4d4f',
        fontWeight: 'bold'
      }}>
        {numericGrade.toFixed(1)}
      </span>
    );
  };

  formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  componentDidMount() {
    const quizId = this.props.match?.params?.idQuiz;
    if (quizId) {
      this.getResultQuiz(quizId);
    } else {
      this.setState({
        error: "ID Quiz tidak ditemukan",
        loading: false,
      });
    }
  }

  render() {
    const { selectedRowKeys, quiz, loading, error, downloadLoading } = this.state;
    
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: !record.student?.name, // Disable checkbox if no student name
      }),
    };

    const title = (
      <span>
        Hasil Kuis ({quiz.length} peserta)
      </span>
    );

    const cardContent = "Di sini, Anda dapat mengelola hasil kuis sesuai dengan mata kuliah yang diampu. Anda dapat melihat daftar hasil kuis dan mengekspornya ke berbagai format file.";

    if (loading) {
      return (
        <div className="app-container">
          <TypingCard title="Manajemen Hasil Kuis" source={cardContent} />
          <br />
          <Card>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px' }}>Memuat data hasil kuis...</p>
            </div>
          </Card>
        </div>
      );
    }

    if (error) {
      return (
        <div className="app-container">
          <TypingCard title="Manajemen Hasil Kuis" source={cardContent} />
          <br />
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button 
                size="small" 
                type="primary" 
                onClick={() => this.getResultQuiz(this.props.match?.params?.idQuiz)}
              >
                Coba Lagi
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="app-container">
        <TypingCard title="Manajemen Hasil Kuis" source={cardContent} />
        <br />
        
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Opsi Ekspor Data" key="1">
            <Form layout="inline">
              <Form.Item label="Nama File:">
                <Input
                  style={{ width: "250px" }}
                  prefix={<FileTextOutlined />}
                  placeholder="Masukkan nama file (default: file-nilai)"
                  value={this.state.filename}
                  onChange={this.filenameChange}
                />
              </Form.Item>
              
              <Form.Item label="Lebar sel adaptif:">
                <Radio.Group
                  onChange={this.autoWidthChange}
                  value={this.state.autoWidth}
                >
                  <Radio value={true}>Ya</Radio>
                  <Radio value={false}>Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="Format File:">
                <Select
                  value={this.state.bookType}
                  style={{ width: 120 }}
                  onChange={this.bookTypeChange}
                >
                  <Select.Option value="xlsx">XLSX</Select.Option>
                  <Select.Option value="csv">CSV</Select.Option>
                  <Select.Option value="txt">TXT</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => this.handleDownload("all")}
                  loading={downloadLoading}
                  disabled={quiz.length === 0}
                >
                  Ekspor Semua
                </Button>
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="default"
                  icon={<FileExcelOutlined />}
                  onClick={() => this.handleDownload("selected")}
                  loading={downloadLoading}
                  disabled={selectedRowKeys.length === 0}
                >
                  Ekspor Terpilih ({selectedRowKeys.length})
                </Button>
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>
        
        <br />
        
        <Card title={title}>
          <Table
            bordered
            rowKey={(record) => record.idQuiz}
            dataSource={quiz}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} dari ${total} peserta`,
            }}
            rowSelection={rowSelection}
            loading={downloadLoading}
            scroll={{ x: 800 }}
          >
            <Column
              title="Nama Mahasiswa"
              dataIndex={["student", "name"]}
              key="student.name"
              align="left"
              ellipsis={true}
              render={(name) => name || "-"}
            />
            
            <Column
              title="NIM/ID"
              dataIndex={["student", "nim"]}
              key="student.nim"
              align="center"
              width={120}
              render={(nim) => nim || "-"}
            />
            
            <Column
              title="Nilai Minimum"
              dataIndex={["quiz", "min_grade"]}
              key="quiz.min_grade"
              align="center"
              width={120}
              render={(grade) => grade ? `${grade}%` : "-"}
            />
            
            <Column
              title="Nilai"
              dataIndex="grade"
              key="grade"
              align="center"
              width={100}
              render={this.renderGrade}
            />
            
            <Column
              title="Status"
              dataIndex="state"
              key="state"
              align="center"
              width={140}
              render={this.renderStatus}
            />
            
            <Column
              title="Tanggal Pengerjaan"
              dataIndex="createdAt"
              key="createdAt"
              align="center"
              width={160}
              render={this.formatDate}
            />
          </Table>
        </Card>
      </div>
    );
  }
}

ResultQuiz.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      idQuiz: PropTypes.string
    })
  })
};

export default ResultQuiz;