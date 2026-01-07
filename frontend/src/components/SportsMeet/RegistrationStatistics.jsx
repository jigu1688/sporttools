import React, { useState, useMemo } from 'react'
import { Card, Row, Col, Table, Button, Select, Space, Typography, message, Tag } from 'antd'
import { DownloadOutlined, BarChartOutlined, PieChartOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { Option } = Select

const RegistrationStatistics = () => {
  const [statisticsType, setStatisticsType] = useState('project') // project, class, gender, grade
  
  const { events, registrations } = useSelector(state => state.sportsMeet)
  const { classes } = useSelector(state => state.data) // 复用班级数据
  
  // 使用useMemo计算统计数据
  const projectStats = useMemo(() => {
    return events.map(event => {
      const eventRegistrations = registrations.filter(reg => reg.eventId === event.id)
      return {
        eventId: event.id,
        eventName: event.name,
        total: eventRegistrations.length,
        male: eventRegistrations.filter(reg => reg.gender === '男' || reg.gender === 'male').length,
        female: eventRegistrations.filter(reg => reg.gender === '女' || reg.gender === 'female').length,
        approved: eventRegistrations.filter(reg => reg.status === '已通过').length,
        pending: eventRegistrations.filter(reg => reg.status === '待审核').length,
        rejected: eventRegistrations.filter(reg => reg.status === '已拒绝').length
      }
    })
  }, [events, registrations])
  
  const classStats = useMemo(() => {
    return classes.map(cls => {
      const classRegistrations = registrations.filter(reg => {
        // 使用classId进行精确匹配，同时兼容旧数据
        const regClassId = typeof reg.classId === 'number' ? reg.classId : parseInt(reg.classId);
        return regClassId === cls.id || reg.className === cls.className;
      });
      return {
        className: cls.className,
        grade: cls.grade,
        total: classRegistrations.length,
        male: classRegistrations.filter(reg => reg.gender === '男' || reg.gender === 'male').length,
        female: classRegistrations.filter(reg => reg.gender === '女' || reg.gender === 'female').length,
        approved: classRegistrations.filter(reg => reg.status === '已通过').length
      }
    }).filter(cls => cls.total > 0) // 只显示有报名的班级
  }, [classes, registrations])
  
  const genderStats = useMemo(() => {
    const totalRegistrations = registrations.length
    const maleCount = registrations.filter(reg => reg.gender === '男' || reg.gender === 'male').length
    const femaleCount = registrations.filter(reg => reg.gender === '女' || reg.gender === 'female').length
    return [
      { gender: '男', count: maleCount, percentage: totalRegistrations > 0 ? ((maleCount / totalRegistrations) * 100).toFixed(1) + '%' : '0%' },
      { gender: '女', count: femaleCount, percentage: totalRegistrations > 0 ? ((femaleCount / totalRegistrations) * 100).toFixed(1) + '%' : '0%' }
    ]
  }, [registrations])
  
  const gradeStats = useMemo(() => {
    const gradeMap = {}
    registrations.forEach(reg => {
      if (!gradeMap[reg.grade]) {
        gradeMap[reg.grade] = { grade: reg.grade, total: 0, male: 0, female: 0 }
      }
      gradeMap[reg.grade].total++
      if (reg.gender === '男' || reg.gender === 'male') {
        gradeMap[reg.grade].male++
      } else {
        gradeMap[reg.grade].female++
      }
    })
    return Object.values(gradeMap)
  }, [registrations])
  
  // 导出Excel数据
  const exportToExcel = () => {
    let exportData = []
    let fileName = '报名统计数据'
    
    switch (statisticsType) {
      case 'project':
        exportData = projectStats.map(stat => ({
          '项目名称': stat.eventName,
          '总报名数': stat.total,
          '男生': stat.male,
          '女生': stat.female,
          '已通过': stat.approved,
          '待审核': stat.pending,
          '已拒绝': stat.rejected
        }))
        fileName = '项目报名统计'
        break
      case 'class':
        exportData = classStats.map(stat => ({
          '年级': stat.grade,
          '班级': stat.className,
          '总报名数': stat.total,
          '男生': stat.male,
          '女生': stat.female,
          '已通过': stat.approved
        }))
        fileName = '班级报名统计'
        break
      case 'gender':
        exportData = genderStats.map(stat => ({
          '性别': stat.gender,
          '报名数': stat.count,
          '占比': stat.percentage
        }))
        fileName = '性别报名统计'
        break
      case 'grade':
        exportData = gradeStats.map(stat => ({
          '年级': stat.grade,
          '总报名数': stat.total,
          '男生': stat.male,
          '女生': stat.female
        }))
        fileName = '年级报名统计'
        break
      default:
        exportData = registrations.map(reg => {
          const event = events.find(e => e.id === reg.eventId)
          return {
            '项目名称': event?.name || '',
            '学生姓名': reg.studentName,
            '班级': reg.className,
            '性别': reg.gender,
            '年级': reg.grade,
            '报名状态': reg.status,
            '报名时间': reg.createdAt
          }
        })
        fileName = '完整报名记录'
    }
    
    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '报名统计')
    
    // 导出文件
    XLSX.writeFile(wb, `${fileName}.xlsx`)
    message.success('数据导出成功')
  }
  
  // 项目统计表格列
  const projectColumns = [
    { title: '项目名称', dataIndex: 'eventName', key: 'eventName', width: 180 },
    { title: '总报名数', dataIndex: 'total', key: 'total', width: 100 },
    { title: '男生', dataIndex: 'male', key: 'male', width: 80 },
    { title: '女生', dataIndex: 'female', key: 'female', width: 80 },
    { title: '已通过', dataIndex: 'approved', key: 'approved', width: 80 },
    { title: '待审核', dataIndex: 'pending', key: 'pending', width: 80 },
    { title: '已拒绝', dataIndex: 'rejected', key: 'rejected', width: 80 }
  ]
  
  // 班级统计表格列
  const classColumns = [
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 80 },
    { title: '班级', dataIndex: 'className', key: 'className', width: 150 },
    { title: '总报名数', dataIndex: 'total', key: 'total', width: 100 },
    { title: '男生', dataIndex: 'male', key: 'male', width: 80 },
    { title: '女生', dataIndex: 'female', key: 'female', width: 80 },
    { title: '已通过', dataIndex: 'approved', key: 'approved', width: 80 }
  ]
  
  // 性别统计表格列
  const genderColumns = [
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
    { title: '报名数', dataIndex: 'count', key: 'count', width: 100 },
    { title: '占比', dataIndex: 'percentage', key: 'percentage', width: 100 }
  ]
  
  // 年级统计表格列
  const gradeColumns = [
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 100 },
    { title: '总报名数', dataIndex: 'total', key: 'total', width: 120 },
    { title: '男生', dataIndex: 'male', key: 'male', width: 100 },
    { title: '女生', dataIndex: 'female', key: 'female', width: 100 }
  ]
  
  // 获取当前统计数据和列配置
  const getCurrentStats = () => {
    switch (statisticsType) {
      case 'project':
        return { data: projectStats, columns: projectColumns }
      case 'class':
        return { data: classStats, columns: classColumns }
      case 'gender':
        return { data: genderStats, columns: genderColumns }
      case 'grade':
        return { data: gradeStats, columns: gradeColumns }
      default:
        return { data: [], columns: [] }
    }
  }
  
  const { data: currentStats, columns: currentColumns } = getCurrentStats()
  
  return (
    <div>
      <Space direction="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>报名统计</Title>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={exportToExcel}
        >
          导出数据
        </Button>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>统计类型：</Text>
        <Select 
          value={statisticsType} 
          onChange={setStatisticsType} 
          style={{ width: 180, marginLeft: 16 }}
        >
          <Option value="project">按项目统计</Option>
          <Option value="class">按班级统计</Option>
          <Option value="gender">按性别统计</Option>
          <Option value="grade">按年级统计</Option>
        </Select>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card title="总报名人数" bordered={false}>
            <Text strong style={{ fontSize: 24 }}>{registrations.length}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="已通过人数" bordered={false}>
            <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
              {registrations.filter(reg => reg.status === '已通过').length}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="待审核人数" bordered={false}>
            <Text strong style={{ fontSize: 24, color: '#1890ff' }}>
              {registrations.filter(reg => reg.status === '待审核').length}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="已拒绝人数" bordered={false}>
            <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>
              {registrations.filter(reg => reg.status === '已拒绝').length}
            </Text>
          </Card>
        </Col>
      </Row>
      
      {/* 统计表格 */}
      <Card title={`${statisticsType === 'project' ? '项目' : statisticsType === 'class' ? '班级' : statisticsType === 'gender' ? '性别' : '年级'}报名统计`}>
        <Table
          columns={currentColumns}
          dataSource={currentStats}
          rowKey={statisticsType === 'project' ? 'eventId' : statisticsType === 'class' ? 'className' : 'gender'}
          bordered
          pagination={{
            pageSize: 10
          }}
        />
      </Card>
      
      {/* 数据可视化（简化版，实际项目中可使用ECharts或Ant Design Charts） */}
      <div style={{ marginTop: 32 }}>
        <Card title="数据可视化">
          <div style={{ padding: 20, textAlign: 'center' }}>
            {statisticsType === 'project' && (
              <div>
                <BarChartOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <Text>项目报名人数柱状图</Text>
                <div style={{ marginTop: 16, color: '#999' }}>（实际项目中可集成ECharts实现）</div>
              </div>
            )}
            {statisticsType === 'gender' && (
              <div>
                <PieChartOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <Text>性别分布饼图</Text>
                <div style={{ marginTop: 16, color: '#999' }}>（实际项目中可集成ECharts实现）</div>
              </div>
            )}
            {statisticsType === 'class' && (
              <div>
                <BarChartOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
                <Text>班级报名人数柱状图</Text>
                <div style={{ marginTop: 16, color: '#999' }}>（实际项目中可集成ECharts实现）</div>
              </div>
            )}
            {statisticsType === 'grade' && (
              <div>
                <BarChartOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                <Text>年级报名人数柱状图</Text>
                <div style={{ marginTop: 16, color: '#999' }}>（实际项目中可集成ECharts实现）</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegistrationStatistics