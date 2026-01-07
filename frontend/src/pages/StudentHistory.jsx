import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Form, Select, Input, Button, Table, Modal, message, Space, Tag, Row, Col } from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select
const { TextArea } = Input

const StudentHistory = () => {
  const { studentHistories, schoolYears } = useSelector(state => state.data)
  const [form] = Form.useForm()
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [filteredHistories, setFilteredHistories] = useState(studentHistories)

  // 筛选历史记录
  const handleSearch = () => {
    form.validateFields()
      .then(values => {
        let result = [...studentHistories]
        
        // 按学年筛选
        if (values.schoolYearId) {
          result = result.filter(history => history.schoolYearId === values.schoolYearId)
        }
        
        // 按年级筛选
        if (values.grade) {
          result = result.filter(history => history.grade === values.grade)
        }
        
        // 按班级筛选
        if (values.className) {
          result = result.filter(history => history.className === values.className)
        }
        
        // 按学生搜索
        if (values.studentSearch) {
          const searchText = values.studentSearch.toLowerCase()
          result = result.filter(history => 
            history.educationId.toLowerCase().includes(searchText) ||
            history.name.toLowerCase().includes(searchText)
          )
        }
        
        setFilteredHistories(result)
        message.success(`找到 ${result.length} 条记录`)
      })
      .catch(info => {
        message.error('表单验证失败：' + info)
      })
  }

  // 重置筛选条件
  const handleReset = () => {
    form.resetFields()
    setFilteredHistories(studentHistories)
  }

  // 显示学生成绩详情
  const showDetailModal = (student) => {
    setSelectedStudent(student)
    setIsDetailModalVisible(true)
  }

  // 关闭学生成绩详情弹窗
  const handleDetailCancel = () => {
    setIsDetailModalVisible(false)
    setSelectedStudent(null)
  }

  // 导出历史数据
  const handleExport = () => {
    if (filteredHistories.length === 0) {
      message.error('没有数据可导出')
      return
    }
    
    // 准备导出数据
    const exportData = filteredHistories.map(history => ({
      '学年': history.schoolYearName,
      '教育ID': history.educationId,
      '姓名': history.name,
      '年级': history.grade,
      '班级': history.className,
      '性别': history.gender === 'male' ? '男' : '女',
      '年龄': history.age,
      '状态': history.status,
      '最终成绩': history.finalScore,
      '等级': history.gradeLevel
    }))
    
    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '学生历史记录')
    
    // 导出文件
    XLSX.writeFile(workbook, `学生历史记录_${new Date().toISOString().slice(0, 10)}.xlsx`)
    message.success('数据导出成功')
  }

  // 获取所有年级选项
  const getGradeOptions = () => {
    const grades = [...new Set(studentHistories.map(history => history.grade))]
    return grades.map(grade => (
      <Option key={grade} value={grade}>{grade}</Option>
    ))
  }

  // 获取班级选项，支持根据年级过滤
  const getClassOptions = (grade) => {
    let result = [...studentHistories]
    if (grade) {
      result = result.filter(history => history.grade === grade)
    }
    const classNames = [...new Set(result.map(history => history.className))]
    return classNames.map(className => (
      <Option key={className} value={className}>{className}</Option>
    ))
  }

  // 表格列配置
  const columns = [
    {
      title: '学年',
      dataIndex: 'schoolYearName',
      key: 'schoolYearName',
      width: 120
    },
    {
      title: '教育ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 120
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? '男' : '女'}
        </Tag>
      )
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (age) => `${age}岁`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '在学' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '最终成绩',
      dataIndex: 'finalScore',
      key: 'finalScore',
      width: 100
    },
    {
      title: '等级',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
      width: 100,
      render: (level) => (
        <Tag color={
          level === '优秀' ? 'gold' :
          level === '良好' ? 'green' :
          level === '及格' ? 'blue' :
          level === '不及格' ? 'red' : 'default'
        }>
          {level}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>学生历史记录</h1>
      
      {/* 查询条件卡片 */}
      <Card title="查询条件" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="horizontal"
          initialValues={{
            schoolYearId: '',
            grade: '',
            className: '',
            studentSearch: ''
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="schoolYearId" label="学年">
                <Select placeholder="请选择学年" style={{ width: '100%' }}>
                  <Option value="">全部学年</Option>
                  {schoolYears.map(year => (
                    <Option key={year.id} value={year.id}>{year.yearName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="grade" label="年级">
                <Select 
                  placeholder="请选择年级" 
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    // 年级变化时，清空班级选择
                    form.setFieldsValue({ className: '' })
                  }}
                >
                  <Option value="">全部年级</Option>
                  {getGradeOptions()}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="className" label="班级">
                <Select placeholder="请选择班级" style={{ width: '100%' }}>
                  <Option value="">全部班级</Option>
                  {getClassOptions(form.getFieldValue('grade'))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="studentSearch" label="学生搜索">
                <Input placeholder="请输入教育ID或姓名" allowClear />
              </Form.Item>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  查询
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                  导出数据
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 历史记录列表 */}
      <Card title={`历史记录列表（共 ${filteredHistories.length} 条）`}>
        <Table 
          columns={columns} 
          dataSource={filteredHistories} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          bordered
        />
      </Card>

      {/* 学生成绩详情弹窗 */}
      <Modal
        title="学生成绩详情"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        footer={null}
        width={600}
      >
        {selectedStudent && (
          <div>
            <h3>{selectedStudent.name} - {selectedStudent.educationId}</h3>
            <div style={{ margin: '20px 0' }}>
              <p><strong>学年：</strong>{selectedStudent.schoolYearName}</p>
              <p><strong>年级：</strong>{selectedStudent.grade}</p>
              <p><strong>班级：</strong>{selectedStudent.className}</p>
              <p><strong>性别：</strong>{selectedStudent.gender === 'male' ? '男' : '女'}</p>
              <p><strong>年龄：</strong>{selectedStudent.age}岁</p>
              <p><strong>状态：</strong>{selectedStudent.status}</p>
              <p><strong>最终成绩：</strong>{selectedStudent.finalScore}</p>
              <p><strong>等级：</strong>{selectedStudent.gradeLevel}</p>
            </div>
            <div>
              <h4>测试记录</h4>
              {selectedStudent.testRecords.length > 0 ? (
                <ul>
                  {selectedStudent.testRecords.map((recordId, index) => (
                    <li key={index}>测试记录 ID: {recordId}</li>
                  ))}
                </ul>
              ) : (
                <p>暂无测试记录</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudentHistory