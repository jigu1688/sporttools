import React, { useState } from 'react'
import { Card, Button, Select, Space, Typography, message, Modal, Table } from 'antd'
import { DownloadOutlined, BarChartOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { Title, Text } = Typography
const { Option } = Select

const ReportGeneration = () => {
  const [selectedReportType, setSelectedReportType] = useState('registration')
  const [selectedSportsMeet, setSelectedSportsMeet] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [reportData, setReportData] = useState([])
  const [reportColumns, setReportColumns] = useState([])
  const [reportTitle, setReportTitle] = useState('')
  
  const { sportsMeets, registrations, results, schedules } = useSelector(state => state.sportsMeet)
  
  // 生成报名报表
  const generateRegistrationReport = (sportsMeetId) => {
    const reportRegistrations = registrations.filter(reg => reg.sportsMeetId === sportsMeetId)
    
    const columns = [
      { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_, __, idx) => idx + 1 },
      { title: '比赛编号', dataIndex: 'competitionNumber', key: 'competitionNumber', width: 100 },
      { title: '项目名称', dataIndex: 'eventId', key: 'eventId', width: 150, render: (eventId) => {
        // 这里可以根据eventId获取项目名称，假设我们有eventId到eventName的映射
        return `项目${eventId}`
      }},
      { title: '学生姓名', dataIndex: 'studentName', key: 'studentName', width: 100 },
      { title: '班级', dataIndex: 'className', key: 'className', width: 120 },
      { title: '性别', dataIndex: 'gender', key: 'gender', width: 80, render: (gender) => {
        return gender === '男' || gender === 'male' ? '男' : '女'
      }},
      { title: '年级', dataIndex: 'grade', key: 'grade', width: 80 },
      { title: '报名状态', dataIndex: 'status', key: 'status', width: 100 },
      { title: '报名时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 }
    ]
    
    return { columns, data: reportRegistrations, title: '运动会报名报表' }
  }
  
  // 生成成绩报表
  const generateResultReport = (sportsMeetId) => {
    const reportResults = results.filter(result => {
      const schedule = schedules.find(s => s.id === result.scheduleId)
      return schedule && schedule.sportsMeetId === sportsMeetId
    })
    
    const columns = [
      { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_, __, idx) => idx + 1 },
      { title: '项目名称', dataIndex: 'eventId', key: 'eventId', width: 150, render: (eventId) => {
        // 这里可以根据eventId获取项目名称，假设我们有eventId到eventName的映射
        return `项目${eventId}`
      }},
      { title: '年级', dataIndex: 'grade', key: 'grade', width: 80 },
      { title: '性别', dataIndex: 'gender', key: 'gender', width: 80, render: (gender) => {
        return gender === '男' || gender === 'male' ? '男' : '女'
      }},
      { title: '比赛编号', dataIndex: 'competitionNumber', key: 'competitionNumber', width: 100 },
      { title: '学生姓名', dataIndex: 'studentName', key: 'studentName', width: 100 },
      { title: '班级', dataIndex: 'className', key: 'className', width: 120 },
      { title: '成绩', dataIndex: 'result', key: 'result', width: 100, render: (result, record) => `${result} ${record.unit}` },
      { title: '排名', dataIndex: 'ranking', key: 'ranking', width: 80 },
      { title: '积分', dataIndex: 'points', key: 'points', width: 80 },
      { title: '状态', dataIndex: 'status', key: 'status', width: 100 }
    ]
    
    return { columns, data: reportResults, title: '运动会成绩报表' }
  }
  
  // 生成分组报表
  const generateGroupReport = (sportsMeetId) => {
    const reportSchedules = schedules.filter(schedule => schedule.sportsMeetId === sportsMeetId)
    
    // 展开分组数据，生成扁平化的报表
    const flattenedData = []
    reportSchedules.forEach(schedule => {
      if (schedule.groupDetails) {
        const { athletes, groupName } = schedule.groupDetails
        athletes.forEach(athlete => {
          flattenedData.push({
            ...athlete,
            eventName: schedule.eventName,
            grade: schedule.grade,
            gender: schedule.gender,
            groupName: groupName,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            venue: schedule.venue
          })
        })
      }
    })
    
    const columns = [
      { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_, __, idx) => idx + 1 },
      { title: '项目名称', dataIndex: 'eventName', key: 'eventName', width: 150 },
      { title: '年级', dataIndex: 'grade', key: 'grade', width: 80 },
      { title: '性别', dataIndex: 'gender', key: 'gender', width: 80, render: (gender) => {
        return gender === '男' || gender === 'male' ? '男' : '女'
      }},
      { title: '分组', dataIndex: 'groupName', key: 'groupName', width: 80 },
      { title: '比赛编号', dataIndex: 'competitionNumber', key: 'competitionNumber', width: 100 },
      { title: '学生姓名', dataIndex: 'studentName', key: 'studentName', width: 100 },
      { title: '班级', dataIndex: 'className', key: 'className', width: 120 },
      { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
      { title: '时间', dataIndex: 'startTime', key: 'time', width: 150, render: (startTime, record) => `${startTime} - ${record.endTime}` },
      { title: '场地', dataIndex: 'venue', key: 'venue', width: 150 }
    ]
    
    return { columns, data: flattenedData, title: '运动会分组报表' }
  }
  
  // 导出报表为Excel
  const exportToExcel = (data, columns, filename) => {
    // 这里使用简单的CSV导出，实际项目中可以使用更高级的Excel库
    const headers = columns.map(col => col.title)
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return columns.map(col => {
          // 处理自定义渲染
          if (col.render) {
            return col.render(row[col.dataIndex], row, 0)
          }
          return row[col.dataIndex] || ''
        }).join(',')
      })
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('报表导出成功')
    }
  }
  
  // 生成报表
  const generateReport = () => {
    if (!selectedSportsMeet) {
      message.warning('请选择运动会')
      return
    }
    
    let reportInfo
    switch (selectedReportType) {
      case 'registration':
        reportInfo = generateRegistrationReport(selectedSportsMeet)
        break
      case 'result':
        reportInfo = generateResultReport(selectedSportsMeet)
        break
      case 'group':
        reportInfo = generateGroupReport(selectedSportsMeet)
        break
      default:
        reportInfo = generateRegistrationReport(selectedSportsMeet)
    }
    
    setReportData(reportInfo.data)
    setReportColumns(reportInfo.columns)
    setReportTitle(reportInfo.title)
    setIsModalVisible(true)
  }
  
  // 关闭报表预览模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setReportData([])
    setReportColumns([])
    setReportTitle('')
  }
  
  return (
    <div>
      <Space direction="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>报表生成</Title>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>报表生成说明：</Text>
        <Text style={{ marginLeft: 16 }}>选择运动会和报表类型，生成相应的报表</Text>
      </div>
      
      {/* 报表生成选项 */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text strong>选择运动会：</Text>
            <Select 
              style={{ width: 300 }}
              placeholder="请选择运动会"
              value={selectedSportsMeet}
              onChange={setSelectedSportsMeet}
            >
              {sportsMeets.map(meet => (
                <Option key={meet.id} value={meet.id}>{meet.name}</Option>
              ))}
            </Select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text strong>选择报表类型：</Text>
            <Select 
              style={{ width: 300 }}
              placeholder="请选择报表类型"
              value={selectedReportType}
              onChange={setSelectedReportType}
            >
              <Option value="registration" icon={<FileTextOutlined />}>报名报表</Option>
              <Option value="result" icon={<BarChartOutlined />}>成绩报表</Option>
              <Option value="group" icon={<FileExcelOutlined />}>分组报表</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<DownloadOutlined />}
              onClick={generateReport}
              disabled={!selectedSportsMeet}
            >
              生成报表
            </Button>
          </div>
        </Space>
      </Card>
      
      {/* 报表预览模态框 */}
      <Modal
        title={reportTitle}
        open={isModalVisible}
        onCancel={handleCancel}
        width={1200}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            关闭
          </Button>,
          <Button 
            key="export" 
            type="primary" 
            icon={<FileExcelOutlined />}
            onClick={() => exportToExcel(reportData, reportColumns, reportTitle)}
          >
            导出Excel
          </Button>
        ]}
      >
        <Table
          columns={reportColumns}
          dataSource={reportData}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
          scroll={{ y: 600 }}
        />
      </Modal>
    </div>
  )
}

export default ReportGeneration