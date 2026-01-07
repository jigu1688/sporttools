import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message, Tabs, Tag, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setResults, addResult, updateResult, deleteResult } from '../../store/sportsMeetSlice'

const { Title, Text } = Typography
const { Option } = Select

const ResultRecord = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('single')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [groupResults, setGroupResults] = useState([])
  
  // 筛选条件状态
  const [searchForm] = Form.useForm()
  const [filters, setFilters] = useState({
    grade: '',
    className: '',
    eventId: '',
    gender: '',
    studentName: '',
    status: ''
  })
  
  const dispatch = useDispatch()
  const { results, schedules, events, registrations, sportsMeets } = useSelector(state => state.sportsMeet)
  
  // 获取所有年级选项
  const gradeOptions = [...new Set(schedules.map(schedule => schedule.grade))].map(grade => ({
    value: grade,
    label: grade
  }))
  
  // 获取所有班级选项
  const classOptions = [...new Set(schedules.map(schedule => schedule.className))].map(className => ({
    value: className,
    label: className
  }))
  
  // 获取所有项目选项
  const eventOptions = events.map(event => ({
    value: event.id,
    label: event.name
  }))
  
  // 处理筛选条件变化
  const handleFilterChange = (changedValues) => {
    setFilters(prev => ({ ...prev, ...changedValues }))
  }
  
  // 重置筛选条件
  const handleResetFilters = () => {
    searchForm.resetFields()
    setFilters({
      grade: '',
      className: '',
      eventId: '',
      gender: '',
      studentName: '',
      status: ''
    })
  }
  
  // 应用筛选条件
  const filteredResults = results.filter(result => {
    // 年级筛选
    if (filters.grade && result.grade !== filters.grade) return false
    
    // 班级筛选
    if (filters.className && result.className !== filters.className) return false
    
    // 项目筛选
    if (filters.eventId && result.eventId !== filters.eventId) return false
    
    // 性别筛选
    if (filters.gender && result.gender !== filters.gender) return false
    
    // 学生姓名搜索
    if (filters.studentName && !result.studentName.includes(filters.studentName)) return false
    
    // 状态筛选
    if (filters.status && result.status !== filters.status) return false
    
    return true
  })
  
  // 计算班级总分
  const calculateClassScores = () => {
    const classScores = {}
    
    // 按班级和年级分组计算积分
    results.forEach(result => {
      const { grade, className, points } = result
      const key = `${grade}-${className}`
      
      if (!classScores[key]) {
        classScores[key] = {
          grade,
          className,
          totalPoints: 0,
          eventCount: 0
        }
      }
      
      classScores[key].totalPoints += parseInt(points) || 0
      classScores[key].eventCount += 1
    })
    
    // 转换为数组并按年级和积分排序
    const classScoresArray = Object.values(classScores)
    
    // 按年级分组并排序
    const gradeGroups = {}
    classScoresArray.forEach(score => {
      if (!gradeGroups[score.grade]) {
        gradeGroups[score.grade] = []
      }
      gradeGroups[score.grade].push(score)
    })
    
    // 对每个年级的班级按积分排序
    Object.keys(gradeGroups).forEach(grade => {
      gradeGroups[grade].sort((a, b) => b.totalPoints - a.totalPoints)
      
      // 添加班级排名
      gradeGroups[grade].forEach((score, index) => {
        score.ranking = index + 1
      })
    })
    
    return gradeGroups
  }
  
  // 班级总分统计结果
  const classScoresByGrade = calculateClassScores()
  
  // 班级总分表格列配置
  const classScoreColumns = [
    {
      title: '班级排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      align: 'center',
      render: (ranking) => {
        if (ranking === 1) {
          return <Tag color="gold">{ranking}</Tag>
        } else if (ranking === 2) {
          return <Tag color="silver">{ranking}</Tag>
        } else if (ranking === 3) {
          return <Tag color="brown">{ranking}</Tag>
        } else {
          return ranking
        }
      }
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 120,
      align: 'center'
    },
    {
      title: '总积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 100,
      align: 'center',
      sorter: (a, b) => b.totalPoints - a.totalPoints
    },
    {
      title: '参与项目数',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 120,
      align: 'center'
    }
  ]
  
  // 初始化模拟成绩数据
  useEffect(() => {
    if (results.length === 0) {
      const mockResults = [
        {
          id: '1',
          scheduleId: '1',
          registrationId: '1',
          eventId: '1',
          studentName: '张三',
          className: '一年级1班',
          grade: '一年级',
          gender: '男',
          competitionNumber: '1111',
          result: '8.5',
          unit: '秒',
          ranking: '1',
          points: '10',
          status: '已确认'
        },
        {
          id: '2',
          scheduleId: '1',
          registrationId: '2',
          eventId: '1',
          studentName: '李四',
          className: '一年级1班',
          grade: '一年级',
          gender: '男',
          competitionNumber: '1112',
          result: '8.8',
          unit: '秒',
          ranking: '2',
          points: '8',
          status: '已确认'
        }
      ]
      dispatch(setResults(mockResults))
    }
  }, [results, dispatch])
  
  // 显示成绩记录模态框
  const showModal = (schedule) => {
    setSelectedSchedule(schedule)
    // 初始化分组成绩
    if (schedule.groupDetails) {
      const initialGroupResults = schedule.groupDetails.athletes.map(athlete => {
        // 检查是否已有成绩记录
        const existingResult = results.find(result => result.registrationId === athlete.id)
        return {
          registrationId: athlete.id,
          studentName: athlete.studentName,
          className: athlete.className,
          competitionNumber: athlete.competitionNumber,
          result: existingResult?.result || '',
          unit: existingResult?.unit || getEventUnit(schedule.eventId),
          ranking: existingResult?.ranking || '',
          points: existingResult?.points || '',
          status: existingResult?.status || '待确认'
        }
      })
      setGroupResults(initialGroupResults)
    }
    setIsModalVisible(true)
  }
  
  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedSchedule(null)
    setGroupResults([])
    form.resetFields()
  }
  
  // 获取项目单位
  const getEventUnit = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return '秒'
    
    // 根据项目类型自动选择单位
    const eventName = event.name
    if (eventName.includes('米') && (eventName.includes('跑') || eventName.includes('接力'))) {
      return '秒'
    } else if (eventName.includes('跳远') || eventName.includes('跳高')) {
      return '米'
    } else if (eventName.includes('铅球')) {
      return '米'
    } else {
      return '秒'
    }
  }
  
  // 自动计算排名
  const calculateRanking = (results) => {
    // 按成绩排序，考虑不同项目的成绩优劣（时间越短越好，距离越长越好）
    const event = events.find(e => e.id === selectedSchedule?.eventId)
    const sortedResults = [...results].sort((a, b) => {
      const aVal = parseFloat(a.result)
      const bVal = parseFloat(b.result)
      
      if (isNaN(aVal) || isNaN(bVal)) return 0
      
      // 根据项目类型决定排序规则
      const eventName = event?.name || ''
      if (eventName.includes('跑') || eventName.includes('接力') || eventName.includes('跨栏')) {
        // 时间越短越好
        return aVal - bVal
      } else {
        // 距离/数量越长越好
        return bVal - aVal
      }
    })
    
    // 计算排名，支持并列
    let rank = 1
    return sortedResults.map((result, index) => {
      if (index > 0) {
        const prevResult = parseFloat(sortedResults[index - 1].result)
        const currResult = parseFloat(result.result)
        if (currResult !== prevResult) {
          rank = index + 1
        }
      }
      return {
        ...result,
        ranking: rank
      }
    })
  }
  
  // 自动计算积分
  const calculatePoints = (rank) => {
    // 积分规则：1-8名分别获得10,8,6,5,4,3,2,1分
    const pointsMap = {
      1: 10,
      2: 8,
      3: 6,
      4: 5,
      5: 4,
      6: 3,
      7: 2,
      8: 1
    }
    return pointsMap[rank] || 0
  }
  
  // 自动计算所有成绩的排名和积分
  const autoCalculateResults = () => {
    // 先计算排名
    const resultsWithRanking = calculateRanking(groupResults)
    
    // 再计算积分
    const resultsWithPoints = resultsWithRanking.map(result => ({
      ...result,
      points: calculatePoints(result.ranking)
    }))
    
    setGroupResults(resultsWithPoints)
    message.success('已自动计算排名和积分')
  }
  
  // 保存成绩
  const handleSaveResults = () => {
    if (!selectedSchedule) return
    
    // 验证成绩数据
    const invalidResults = groupResults.filter(result => !result.result)
    if (invalidResults.length > 0) {
      message.error('请填写所有运动员的成绩')
      return
    }
    
    // 保存成绩
    const savedResults = []
    groupResults.forEach(result => {
      // 检查是否已有成绩记录
      const existingResultIndex = results.findIndex(r => r.registrationId === result.registrationId)
      
      const resultData = {
        id: existingResultIndex >= 0 ? results[existingResultIndex].id : Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        scheduleId: selectedSchedule.id,
        registrationId: result.registrationId,
        eventId: selectedSchedule.eventId,
        studentName: result.studentName,
        className: result.className,
        grade: selectedSchedule.grade,
        gender: selectedSchedule.gender,
        competitionNumber: result.competitionNumber,
        result: result.result,
        unit: result.unit,
        ranking: result.ranking,
        points: result.points,
        status: result.status
      }
      
      if (existingResultIndex >= 0) {
        // 更新现有成绩
        dispatch(updateResult(resultData))
      } else {
        // 添加新成绩
        dispatch(addResult(resultData))
      }
      
      savedResults.push(resultData)
    })
    
    message.success(`成功保存 ${savedResults.length} 条成绩记录`)
    handleCancel()
  }
  
  // 更新分组成绩
  const updateGroupResult = (index, field, value) => {
    const newGroupResults = [...groupResults]
    newGroupResults[index][field] = value
    setGroupResults(newGroupResults)
  }
  
  // 成绩记录表格列配置
  const resultColumns = [
    {
      title: '项目名称',
      dataIndex: 'eventId',
      key: 'eventId',
      width: 150,
      render: (eventId) => {
        const event = events.find(e => e.id === eventId)
        return event?.name || ''
      }
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => {
        return gender === '男' || gender === 'male' ? '男' : '女'
      }
    },
    {
      title: '比赛编号',
      dataIndex: 'competitionNumber',
      key: 'competitionNumber',
      width: 100
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 120
    },
    {
      title: '成绩',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result, record) => `${result} ${record.unit}`
    },
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      render: (ranking) => {
        if (ranking === '1') {
          return <Tag color="gold">{ranking}</Tag>
        } else if (ranking === '2') {
          return <Tag color="silver">{ranking}</Tag>
        } else if (ranking === '3') {
          return <Tag color="brown">{ranking}</Tag>
        } else {
          return ranking
        }
      }
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === '已确认') {
          return <Tag color="green">{status}</Tag>
        } else {
          return <Tag color="orange">{status}</Tag>
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => dispatch(deleteResult(record.id))}>
            删除
          </Button>
        </Space>
      )
    }
  ]
  
  return (
    <div>
      <Space direction="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>成绩记录</Title>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>成绩记录说明：</Text>
        <Text style={{ marginLeft: 16 }}>选择比赛项目，然后点击成绩记录按钮记录运动员成绩</Text>
      </div>
      
      {/* 选择运动会 */}
      <div style={{ marginBottom: 24 }}>
        <Form form={form} layout="inline">
          <Form.Item label="选择运动会" name="sportsMeetId">
            <Select 
              placeholder="请选择运动会" 
              style={{ width: 200 }}
              defaultValue="1" // 默认选择第一个运动会
            >
              {sportsMeets.map(meet => (
                <Option key={meet.id} value={meet.id}>{meet.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
      
      {/* 赛程列表，用于成绩记录 */}
      <Table
        columns={[
          {
            title: '项目名称',
            dataIndex: 'eventName',
            key: 'eventName',
            width: 150
          },
          {
            title: '年级',
            dataIndex: 'grade',
            key: 'grade',
            width: 80
          },
          {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            width: 80
          },
          {
            title: '分组',
            dataIndex: 'groupName',
            key: 'groupName',
            width: 80
          },
          {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            width: 120
          },
          {
            title: '时间',
            dataIndex: 'startTime',
            key: 'time',
            width: 120,
            render: (startTime, record) => `${startTime} - ${record.endTime}`
          },
          {
            title: '场地',
            dataIndex: 'venue',
            key: 'venue',
            width: 150
          },
          {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => showModal(record)}
              >
                成绩记录
              </Button>
            )
          }
        ]}
        dataSource={schedules}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 24 }}
      />
      
      {/* 成绩筛选表单 */}
      <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
        <Title level={5} style={{ marginBottom: 16 }}>成绩查询筛选</Title>
        <Form
          form={searchForm}
          layout="horizontal"
          onValuesChange={handleFilterChange}
          initialValues={filters}
        >
          <Form.Item label="年级" name="grade">
            <Select placeholder="请选择年级" style={{ width: 150 }}>
              {gradeOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="班级" name="className">
            <Select placeholder="请选择班级" style={{ width: 150 }}>
              {classOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="项目" name="eventId">
            <Select placeholder="请选择项目" style={{ width: 200 }}>
              {eventOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="性别" name="gender">
            <Select placeholder="请选择性别" style={{ width: 100 }}>
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="学生姓名" name="studentName">
            <Input placeholder="请输入学生姓名" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="状态" name="status">
            <Select placeholder="请选择状态" style={{ width: 100 }}>
              <Option value="待确认">待确认</Option>
              <Option value="已确认">已确认</Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginLeft: 16 }}>
            <Space>
              <Button type="primary" onClick={() => searchForm.submit()}>查询</Button>
              <Button onClick={handleResetFilters}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      
      {/* 成绩记录列表 */}
      <Title level={5}>已记录成绩列表</Title>
      <Table
        columns={resultColumns}
        dataSource={filteredResults}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
      />
      
      {/* 班级总分统计 */}
      <div style={{ marginTop: 32 }}>
        <Title level={5}>班级总分统计</Title>
        
        {/* 按年级分组显示班级积分 */}
        {Object.keys(classScoresByGrade).length > 0 ? (
          Object.entries(classScoresByGrade).map(([grade, classScores]) => (
            <div key={grade} style={{ marginBottom: 24 }}>
              <Title level={6}>{grade} 班级积分排名</Title>
              <Table
                columns={classScoreColumns}
                dataSource={classScores}
                rowKey="className"
                bordered
                pagination={false}
                size="middle"
                style={{ marginBottom: 16 }}
              />
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 40, backgroundColor: '#fafafa' }}>
            <Text type="secondary">暂无班级积分数据，请先记录成绩</Text>
          </div>
        )}
      </div>
      
      {/* 成绩记录模态框 */}
      <Modal
        title={`${selectedSchedule?.eventName} - ${selectedSchedule?.groupName} 成绩记录`}
        open={isModalVisible}
        onOk={handleSaveResults}
        onCancel={handleCancel}
        width={1000}
        okText="保存成绩"
        cancelText="取消"
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button 
            key="autoCalculate" 
            onClick={autoCalculateResults} 
            icon={<SaveOutlined />}
          >
            自动计算排名积分
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSaveResults} 
            icon={<SaveOutlined />}
          >
            保存成绩
          </Button>
        ]}
      >
        {selectedSchedule && (
          <div>
            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f0f2f5', borderRadius: 8 }}>
              <p><strong>项目：</strong>{selectedSchedule.eventName}</p>
              <p><strong>年级：</strong>{selectedSchedule.grade}</p>
              <p><strong>性别：</strong>{selectedSchedule.gender}</p>
              <p><strong>分组：</strong>{selectedSchedule.groupName}</p>
              <p><strong>日期：</strong>{selectedSchedule.date}</p>
              <p><strong>时间：</strong>{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
              <p><strong>场地：</strong>{selectedSchedule.venue}</p>
            </div>
            
            {/* 分组成绩记录表格 */}
            <div style={{ marginBottom: 24 }}>
              <Table
                columns={[
                  {
                    title: '序号',
                    dataIndex: 'index',
                    key: 'index',
                    width: 60,
                    align: 'center',
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: '比赛编号',
                    dataIndex: 'competitionNumber',
                    key: 'competitionNumber',
                    width: 120,
                    align: 'center'
                  },
                  {
                    title: '学生姓名',
                    dataIndex: 'studentName',
                    key: 'studentName',
                    width: 100,
                    align: 'center'
                  },
                  {
                    title: '班级',
                    dataIndex: 'className',
                    key: 'className',
                    width: 100,
                    align: 'center'
                  },
                  {
                    title: '成绩',
                    dataIndex: 'result',
                    key: 'result',
                    width: 120,
                    align: 'center',
                    render: (text, record, index) => (
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="请输入成绩"
                        value={record.result}
                        onChange={(value) => updateGroupResult(index, 'result', value)}
                        step={0.1}
                        precision={2}
                        required
                      />
                    )
                  },
                  {
                    title: '单位',
                    dataIndex: 'unit',
                    key: 'unit',
                    width: 100,
                    align: 'center',
                    render: (text, record, index) => (
                      <Select
                        style={{ width: '100%' }}
                        value={record.unit}
                        onChange={(value) => updateGroupResult(index, 'unit', value)}
                      >
                        <Option value="秒">秒</Option>
                        <Option value="米">米</Option>
                        <Option value="厘米">厘米</Option>
                        <Option value="个">个</Option>
                      </Select>
                    )
                  },
                  {
                    title: '排名',
                    dataIndex: 'ranking',
                    key: 'ranking',
                    width: 100,
                    align: 'center',
                    render: (text, record, index) => (
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="自动计算"
                        value={record.ranking}
                        onChange={(value) => updateGroupResult(index, 'ranking', value)}
                        step={1}
                        min={1}
                      />
                    )
                  },
                  {
                    title: '积分',
                    dataIndex: 'points',
                    key: 'points',
                    width: 100,
                    align: 'center',
                    render: (text, record, index) => (
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="自动计算"
                        value={record.points}
                        onChange={(value) => updateGroupResult(index, 'points', value)}
                        step={1}
                        min={0}
                      />
                    )
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    align: 'center',
                    render: (text, record, index) => (
                      <Select
                        style={{ width: '100%' }}
                        value={record.status}
                        onChange={(value) => updateGroupResult(index, 'status', value)}
                      >
                        <Option value="待确认">待确认</Option>
                        <Option value="已确认">已确认</Option>
                      </Select>
                    )
                  }
                ]}
                dataSource={groupResults}
                rowKey="registrationId"
                bordered
                pagination={false}
                size="middle"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ResultRecord
