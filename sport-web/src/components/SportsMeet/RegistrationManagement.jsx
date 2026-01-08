import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Select, Space, Typography, message, Tabs, Checkbox, Card, Row, Col, Input } from 'antd'
import { PlusOutlined, MinusOutlined, CheckOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setRegistrations, batchAddRegistrations, deleteRegistration, updateRegistration } from '../../store/sportsMeetSlice'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

const RegistrationManagement = () => {
  const [form] = Form.useForm()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState({ male: [], female: [] })
  const [isModalVisible, setIsModalVisible] = useState(false)
  
  // 手动修改编号相关状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState(null)
  const [editForm] = Form.useForm()
  const [searchForm] = Form.useForm()
  
  const dispatch = useDispatch()
  const { events, registrations, sportsMeets } = useSelector(state => state.sportsMeet)
  const { students, classes } = useSelector(state => state.data) // 复用学生管理数据
  
  // 筛选相关状态
  const [filteredRegistrations, setFilteredRegistrations] = useState(registrations)
  const [searchValues, setSearchValues] = useState({})
  
  // 初始化数据
  useEffect(() => {
    const mockData = [
      {
        id: '1',
        sportsMeetId: '1',
        eventId: '1',
        studentId: '1',
        studentName: '张三',
        className: '一年级1班',
        gender: '男',
        grade: '一年级',
        status: '已报名',
        createdAt: '2026-01-05'
      },
      {
        id: '2',
        sportsMeetId: '1',
        eventId: '1',
        studentId: '2',
        studentName: '李四',
        className: '一年级1班',
        gender: '男',
        grade: '一年级',
        status: '已报名',
        createdAt: '2026-01-05'
      }
    ]
    if (registrations.length === 0) {
      dispatch(setRegistrations(mockData))
    }
  }, [registrations, dispatch])
  
  // 处理搜索表单变化
  const handleSearchChange = (values) => {
    setSearchValues(values)
  }
  
  // 筛选报名列表
  useEffect(() => {
    let result = [...registrations]
    
    // 按项目筛选
    if (searchValues.searchEvent) {
      result = result.filter(reg => reg.eventId === searchValues.searchEvent)
    }
    
    // 按年级筛选
    if (searchValues.searchGrade) {
      result = result.filter(reg => reg.grade === searchValues.searchGrade)
    }
    
    // 按班级筛选
    if (searchValues.searchClass) {
      result = result.filter(reg => reg.className === searchValues.searchClass)
    }
    
    // 按性别筛选
    if (searchValues.searchGender) {
      // 支持中英文性别格式
      const gender = searchValues.searchGender
      result = result.filter(reg => 
        reg.gender === gender || 
        (gender === '男' && reg.gender === 'male') || 
        (gender === '女' && reg.gender === 'female')
      )
    }
    
    setFilteredRegistrations(result)
  }, [registrations, searchValues])
  
  // 使用useMemo确保班级分组数据实时更新
  const classGroups = React.useMemo(() => {
    const groups = {}
    
    // 初始化班级分组
    classes.forEach(cls => {
      groups[cls.id] = {
        id: cls.id,
        grade: cls.grade,
        className: cls.className,
        male: [],
        female: []
      }
    })
    
    // 按班级和性别分组学生
    students.forEach(student => {
      // 优先使用classId关联班级，而不是className
      const classId = student.classId
      const gender = student.gender
      
      if (groups[classId]) {
        // 支持中文性别和英文性别两种格式
        groups[classId][(gender === '男' || gender === 'male') ? 'male' : 'female'].push(student)
      }
    })
    
    return groups
  }, [classes, students])
  
  // 获取已报名的学生ID列表
  const getRegisteredStudentIds = (eventId) => {
    const sportsMeetId = form.getFieldValue('sportsMeetId') || '1'
    return registrations
      .filter(reg => reg.eventId === eventId && reg.sportsMeetId === sportsMeetId)
      .map(reg => reg.studentId)
  }
  
  // 显示报名模态框
  const showModal = (event, classId) => {
    // 检查项目状态，只有报名中才能报名
    if (event.status !== '报名中') {
      message.warning(`当前项目状态为"${event.status}"，只有"报名中"状态才能进行报名操作`)
      return
    }
    
    setSelectedEvent(event)
    setSelectedClass(classId)
    setSelectedStudents({ male: [], female: [] })
    setIsModalVisible(true)
  }
  
  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedEvent(null)
    setSelectedClass(null)
    setSelectedStudents({ male: [], female: [] })
  }
  
  // 处理学生选择变化
  const handleStudentSelect = (gender, selected) => {
    setSelectedStudents(prev => ({
      ...prev,
      [gender]: selected
    }))
  }
  
  // 处理全选
  const handleSelectAll = (gender, checked) => {
    if (selectedClass && selectedEvent && classGroups[selectedClass]) {
      const classStudents = classGroups[selectedClass][gender]
      const registeredIds = getRegisteredStudentIds(selectedEvent.id)
      const availableStudents = classStudents.filter(student => !registeredIds.includes(student.id))
      
      setSelectedStudents(prev => ({
        ...prev,
        [gender]: checked ? availableStudents.map(student => student.id) : []
      }))
    }
  }
  
  // 生成比赛编号
  const generateCompetitionNumber = (student, existingRegistrations, sportsMeetId = '1') => {
    // 检查学生是否已在同一场运动会中有编号
    const existingReg = existingRegistrations.find(
      reg => reg.studentId === student.id && reg.sportsMeetId === sportsMeetId
    );
    
    // 如果已有编号，直接返回
    if (existingReg && existingReg.competitionNumber) {
      return existingReg.competitionNumber;
    }
    
    // 1. 年级转换：一年级->1, 二年级->2, ..., 六年级->6
    const gradeMap = {
      '一年级': '1',
      '二年级': '2',
      '三年级': '3',
      '四年级': '4',
      '五年级': '5',
      '六年级': '6'
    }
    const gradeNum = gradeMap[student.grade] || '1' // 默认一年级
    
    // 2. 班级转换：从班级名称提取班级号
    // 支持格式："1班", "主校区2班", "三年级3班"等
    const classMatch = student.className.match(/(\d+)班/)
    let classNum = '1' // 默认1班
    if (classMatch && classMatch[1]) {
      // 确保班级号为1位数字，超过9班取个位
      classNum = String(parseInt(classMatch[1]) % 10)
    }
    
    // 3. 性别转换：男/1, 女/2
    const genderNum = (student.gender === '男' || student.gender === 'male') ? '1' : '2'
    
    // 4. 序号生成：按年级-班级-性别组合计算序号，确保编号唯一
    let sequence = 1
    let competitionNumber = ''
    let isUnique = false
    
    // 检查编号是否已存在
    const isNumberExists = (num) => {
      return existingRegistrations.some(
        reg => reg.competitionNumber === num && reg.sportsMeetId === sportsMeetId
      );
    }
    
    // 生成唯一编号
    while (!isUnique) {
      // 确保序号为1位数字，超过9循环从1开始
      const sequenceNum = String(sequence % 10)
      
      // 组合生成4位比赛编号
      competitionNumber = gradeNum + classNum + genderNum + sequenceNum
      
      // 检查编号是否已存在
      if (!isNumberExists(competitionNumber)) {
        isUnique = true
      } else {
        // 编号已存在，增加序号继续尝试
        sequence++
        
        // 防止无限循环（最多尝试10次）
        if (sequence > 10) {
          // 如果10个序号都被占用，使用时间戳生成唯一编号
          competitionNumber = gradeNum + classNum + genderNum + Date.now().toString().slice(-1)
          break
        }
      }
    }
    
    return competitionNumber
  }
  
  // 提交报名
  const handleSubmitRegistration = () => {
    if (!selectedEvent || !selectedClass) return
    
    const allSelectedStudents = [...selectedStudents.male, ...selectedStudents.female]
    if (allSelectedStudents.length === 0) {
      message.warning('请选择要报名的学生')
      return
    }
    
    // 获取班级信息
    const classInfo = classGroups[selectedClass];
    // 获取表单中选择的运动会ID
    const sportsMeetId = form.getFieldValue('sportsMeetId') || '1' // 默认使用第一个运动会
    
    // 获取现有报名数据，用于计算序号
    const existingRegistrations = [...registrations]
    
    // 创建报名数据
        const newRegistrations = allSelectedStudents.map(studentId => {
          const student = students.find(s => s.id === studentId)
          if (!student) return null
          
          // 生成比赛编号，传递运动会ID
          const competitionNumber = generateCompetitionNumber(student, existingRegistrations, sportsMeetId)
          
          const registrationData = {
            id: Date.now().toString() + '-' + studentId,
            sportsMeetId: sportsMeetId,
            eventId: selectedEvent.id,
            studentId: studentId,
            studentName: student.name,
            classId: selectedClass,
            className: classInfo?.className || '',
            gender: student.gender,
            grade: student.grade,
            competitionNumber: competitionNumber, // 添加比赛编号
            status: '待审核', // 报名后需要审核
            createdAt: new Date().toISOString().split('T')[0],
            // 新增字段，完善报名数据结构
            isTeamEvent: selectedEvent.isTeamEvent || false, // 是否为团体项目
            teamId: selectedEvent.isTeamEvent ? `${sportsMeetId}-${selectedEvent.id}-${classInfo?.className}` : null, // 团体项目的团队ID
            teamName: selectedEvent.isTeamEvent ? `${classInfo?.grade} ${classInfo?.className}` : null, // 团队名称
            notes: '', // 报名备注
            // 审核相关字段
            reviewedBy: null, // 审核人
            reviewedAt: null, // 审核时间
            reviewNotes: '' // 审核备注
          }
          
          // 将新生成的报名添加到现有列表中，用于后续学生的序号计算
          existingRegistrations.push(registrationData)
          
          return registrationData
        }).filter(Boolean) // 过滤掉null值
    
    // 批量添加报名
    dispatch(batchAddRegistrations(newRegistrations))
    message.success(`成功报名 ${newRegistrations.length} 名学生`)
    handleCancel()
  }
  
  // 取消报名
  const handleCancelRegistration = (registrationId) => {
    Modal.confirm({
      title: '确认取消',
      content: '您确定要取消该学生的报名吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteRegistration(registrationId))
        message.success('报名已取消')
      }
    })
  }
  
  // 编辑编号
  const handleEditNumber = (registration) => {
    setEditingRegistration(registration)
    // Set all form fields when editing a new registration
    editForm.setFieldsValue({
      competitionNumber: registration.competitionNumber,
      studentInfo: `${registration.studentName} - ${registration.className}`,
      currentNumber: registration.competitionNumber
    })
    setIsEditModalVisible(true)
  }
  
  // 关闭编辑模态框
  const handleEditCancel = () => {
    setIsEditModalVisible(false)
    setEditingRegistration(null)
    editForm.resetFields()
  }
  
  // 保存编辑的编号
  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        const { competitionNumber } = values
        
        // 检查编号是否已被其他学生使用
        const isNumberUsed = registrations.some(reg => 
          reg.competitionNumber === competitionNumber && 
          reg.id !== editingRegistration.id &&
          reg.sportsMeetId === editingRegistration.sportsMeetId
        )
        
        if (isNumberUsed) {
          message.error('该编号已被使用，请选择其他编号')
          return
        }
        
        // 检查编号格式是否为4位数字
        if (!/^\d{4}$/.test(competitionNumber)) {
          message.error('编号必须为4位数字')
          return
        }
        
        // 更新编号
        const updatedRegistration = {
          ...editingRegistration,
          competitionNumber: competitionNumber
        }
        
        dispatch(updateRegistration(updatedRegistration))
        message.success('编号更新成功')
        setIsEditModalVisible(false)
        setEditingRegistration(null)
        editForm.resetFields()
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 表格列配置
  const registrationColumns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '比赛编号',
      dataIndex: 'competitionNumber',
      key: 'competitionNumber',
      width: 100,
      render: (competitionNumber) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {competitionNumber || '-'}
        </span>
      )
    },
    {
      title: '项目名称',
      dataIndex: ['event', 'name'],
      key: 'eventName',
      width: 150,
      render: (text, record) => {
        const event = events.find(e => e.id === record.eventId)
        return event?.name || ''
      }
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
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => {
        // 英文性别转中文显示
        return gender === 'male' || gender === '男' ? '男' : '女'
      }
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleEditNumber(record)}
          >
            编辑编号
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleCancelRegistration(record.id)}
          >
            取消
          </Button>
        </Space>
      )
    }
  ]
  
  return (
    <div>
      <Space orientation="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>报名管理</Title>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>报名操作：</Text>
        <Text style={{ marginLeft: 16 }}>选择运动会项目，然后点击班级卡片进行报名</Text>
      </div>
      
      {/* 运动会和项目选择 */}
      <div style={{ marginBottom: 24 }}>
        <Form form={form} layout="inline">
          <Form.Item label="选择运动会" name="sportsMeetId">
            <Select 
              placeholder="请选择运动会" 
              style={{ width: 200 }}
              defaultValue="1" // 默认选择第一个运动会
              onChange={(value) => {
                form.setFieldsValue({ sportsMeetId: value })
              }}
            >
              {sportsMeets.map(meet => (
                <Option key={meet.id} value={meet.id}>{meet.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="选择项目" name="eventId">
            <Select 
              placeholder="请选择运动会项目" 
              style={{ width: 200 }}
              onChange={(value) => {
                form.setFieldsValue({ eventId: value })
              }}
            >
              {events.map(event => (
                <Option key={event.id} value={event.id}>{event.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
      
      {/* 班级卡片列表 */}
      <Row gutter={[16, 16]}>
        {Object.values(classGroups).map((classData) => (
          <Col key={classData.id} xs={24} sm={12} md={8} lg={6}>
            <Card 
              title={`${classData.grade} ${classData.className}`}
              extra={
                <Button 
                  type="primary" 
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const eventId = form.getFieldValue('eventId')
                    const event = events.find(e => e.id === eventId)
                    const sportsMeetId = form.getFieldValue('sportsMeetId') || '1'
                    const sportsMeet = sportsMeets.find(meet => meet.id === sportsMeetId)
                    
                    if (!event) {
                      message.warning('请先选择运动会项目')
                      return
                    }
                    
                    if (!sportsMeet) {
                      message.warning('请先选择运动会')
                      return
                    }
                    
                    // 检查运动会状态，只有报名中才能报名
                    if (sportsMeet.status !== '报名中') {
                      message.warning(`当前运动会状态为"${sportsMeet.status}"，只有"报名中"状态才能进行报名操作`)
                      return
                    }
                    
                    showModal(event, classData.id)
                  }}
                >
                  报名
                </Button>
              }
            >
              <div style={{ marginBottom: 12 }}>
                <Text strong>男生：</Text>
                <Text>{classData.male.length} 人</Text>
              </div>
              <div>
                <Text strong>女生：</Text>
                <Text>{classData.female.length} 人</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* 搜索和筛选表单 */}
      <div style={{ marginTop: 32 }}>
        <Title level={4} style={{ marginBottom: 16 }}>报名列表</Title>
        
        <Form 
          form={searchForm} 
          layout="inline" 
          style={{ marginBottom: 16 }}
          onValuesChange={handleSearchChange}
        >
          {/* 项目筛选 */}
          <Form.Item label="项目" name="searchEvent">
            <Select 
              placeholder="请选择项目" 
              style={{ width: 150 }}
              allowClear
            >
              {events.map(event => (
                <Option key={event.id} value={event.id}>{event.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* 年级筛选 */}
          <Form.Item label="年级" name="searchGrade">
            <Select 
              placeholder="请选择年级" 
              style={{ width: 120 }}
              allowClear
            >
              {/* 获取所有唯一的年级 */}
              {Array.from(new Set(registrations.map(reg => reg.grade))).map(grade => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* 班级筛选 */}
          <Form.Item label="班级" name="searchClass">
            <Select 
              placeholder="请选择班级" 
              style={{ width: 120 }}
              allowClear
            >
              {/* 获取所有唯一的班级 */}
              {Array.from(new Set(registrations.map(reg => reg.className))).map(className => (
                <Option key={className} value={className}>{className}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* 性别筛选 */}
          <Form.Item label="性别" name="searchGender">
            <Select 
              placeholder="请选择性别" 
              style={{ width: 100 }}
              allowClear
            >
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>
        </Form>
        
        <Table
          columns={registrationColumns}
          dataSource={filteredRegistrations}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 10
          }}
        />
      </div>
      
      {/* 报名模态框 */}
      <Modal
        title={`${selectedEvent?.name} - ${selectedClass ? classGroups[selectedClass]?.grade + ' ' + classGroups[selectedClass]?.className : ''} 报名`}
        open={isModalVisible}
        onOk={handleSubmitRegistration}
        onCancel={handleCancel}
        width={800}
        okText="确认报名"
        cancelText="取消"
      >
        {selectedEvent && selectedClass && classGroups[selectedClass] && (
          <Tabs defaultActiveKey="male">
            {/* 男生报名 */}
            <TabPane tab="男生" key="male">
              <div style={{ marginBottom: 16 }}>
                <Checkbox 
                  onChange={(e) => handleSelectAll('male', e.target.checked)}
                >
                  全选男生（{classGroups[selectedClass].male.length}人）
                </Checkbox>
              </div>
              <Checkbox.Group
                options={classGroups[selectedClass].male.map(student => {
                  const isRegistered = getRegisteredStudentIds(selectedEvent.id).includes(student.id)
                  return {
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{student.name}（{student.studentNo || student.id}）</span>
                        {isRegistered && (
                          <CheckOutlined 
                            style={{ marginLeft: 8, color: '#52c41a' }} 
                            title="已报名"
                          />
                        )}
                      </div>
                    ),
                    value: student.id,
                    disabled: isRegistered
                  }
                })}
                value={selectedStudents.male}
                onChange={(selected) => handleStudentSelect('male', selected)}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              />
            </TabPane>
            
            {/* 女生报名 */}
            <TabPane tab="女生" key="female">
              <div style={{ marginBottom: 16 }}>
                <Checkbox 
                  onChange={(e) => handleSelectAll('female', e.target.checked)}
                >
                  全选女生（{classGroups[selectedClass].female.length}人）
                </Checkbox>
              </div>
              <Checkbox.Group
                options={classGroups[selectedClass].female.map(student => {
                  const isRegistered = getRegisteredStudentIds(selectedEvent.id).includes(student.id)
                  return {
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{student.name}（{student.studentNo || student.id}）</span>
                        {isRegistered && (
                          <CheckOutlined 
                            style={{ marginLeft: 8, color: '#52c41a' }} 
                            title="已报名"
                          />
                        )}
                      </div>
                    ),
                    value: student.id,
                    disabled: isRegistered
                  }
                })}
                value={selectedStudents.female}
                onChange={(selected) => handleStudentSelect('female', selected)}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
      
      {/* 编辑编号模态框 */}
      <Modal
        title="编辑比赛编号"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        width={400}
        okText="确认修改"
        cancelText="取消"
      >
        {editingRegistration && (
          <Form
            form={editForm}
            layout="vertical"
          >
            <Form.Item
              label="学生信息"
              name="studentInfo"
            >
              <Input disabled style={{ backgroundColor: '#f0f2f5' }} />
            </Form.Item>
            
            <Form.Item
              label="当前编号"
              name="currentNumber"
            >
              <Input disabled style={{ backgroundColor: '#f0f2f5' }} />
            </Form.Item>
            
            <Form.Item
              name="competitionNumber"
              label="新编号"
              rules={[
                { required: true, message: '请输入新的比赛编号!' },
                { pattern: /^\d{4}$/, message: '编号必须为4位数字!' }
              ]}
            >
              <Input placeholder="请输入4位数字编号" />
            </Form.Item>
            
            <Form.Item label="编号规则说明">
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p>1. 编号格式：[年级][班级][性别][序号]</p>
                <p>2. 年级：1-6（对应一年级到六年级）</p>
                <p>3. 班级：1-9（从班级名称提取）</p>
                <p>4. 性别：1=男，2=女</p>
                <p>5. 序号：1-9（按报名顺序）</p>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationManagement