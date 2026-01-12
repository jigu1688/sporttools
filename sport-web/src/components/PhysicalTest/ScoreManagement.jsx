import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, DatePicker, Card, Row, Col, Divider, Checkbox, Tree } from 'antd'
import { EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updateTestRecord, deleteTestRecord, addTestRecord, setTestRecords, fetchPhysicalTestHistory } from '../../store/physicalTestSlice'
import { getTestItemsForGrade } from '../../utils/gradeStageMapping'
import { parseGradeCode, parseClassCode } from '../../utils/codeMapping'
import { calculateTotalScore } from '../../utils/scoreStandards'
import PhysicalTestImportExport from './PhysicalTestImportExport'

import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const ScoreManagement = () => {
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  // 搜索条件状态
  const [searchForm] = Form.useForm()
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  // 批量操作状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  
  // 分屏模式状态
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [splitHeight, setSplitHeight] = useState(300) // 默认分屏高度
  const [isResizing, setIsResizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const splitRef = useRef(null)

  const dispatch = useDispatch()
  const { testRecords, loading: reduxLoading } = useSelector(state => state.physicalTest)
  const { students, schoolInfo } = useSelector(state => state.data)
  
  // 组件加载时获取体测历史数据
  useEffect(() => {
    dispatch(fetchPhysicalTestHistory({}))
  }, [dispatch])

  const synchronizedData = useMemo(() => {
    const studentsMap = new Map()
    students.forEach(student => {
      studentsMap.set(student.educationId, student)
    })
    
    return testRecords.map(record => {
      const student = studentsMap.get(record.educationId)
      // 获取原始年级和班级数据
      const rawGrade = student?.grade || record.grade || '未知'
      const rawClass = student?.className || record.className || '未知'
      
      // 转换年级编码为中文名称
      const grade = parseGradeCode(rawGrade)
      // 转换班级编码为中文名称
      const className = parseClassCode(rawClass)
      
      return {
        ...record,
        studentName: student?.name || record.studentName || '未知',
        gender: student?.gender || record.gender || 'male',
        grade,
        className
      }
    })
  }, [testRecords, students])

  // 使用状态存储搜索条件，确保useMemo能正确响应变化
  const [searchValues, setSearchValues] = useState({})

  const filteredData = useMemo(() => {
    let result = [...synchronizedData]
    
    // 按年级筛选
    if (searchValues.grade) {
      result = result.filter(record => record.grade === searchValues.grade)
    }
    
    // 按班级筛选
    if (searchValues.className) {
      result = result.filter(record => record.className === searchValues.className)
    }
    
    // 按学生搜索
    if (searchValues.studentSearch) {
      const searchText = searchValues.studentSearch.toLowerCase()
      result = result.filter(record => 
        record.studentName?.toLowerCase().includes(searchText) ||
        record.educationId.includes(searchText)
      )
    }
    
    // 按考生状态筛选
    if (searchValues.studentStatus) {
      result = result.filter(record => record.studentStatus === searchValues.studentStatus)
    }
    
    return result
  }, [synchronizedData, searchValues])

  // 搜索功能
  const handleSearch = () => {
    // 获取表单值并更新searchValues状态
    const values = searchForm.getFieldsValue()
    setSearchValues(values)
    // 搜索时重置到第一页
    setCurrentPage(1)
    const result = filteredData.length
    message.success(`找到 ${result} 条记录`)
  }

  // 重置搜索条件
  const handleReset = () => {
    searchForm.resetFields()
    setSearchValues({})
    setCurrentPage(1)
  }

  // 清空成绩功能
  const handleClearScores = () => {
    Modal.confirm({
      title: '确认清空成绩',
      content: '您确定要清空所有学生的体测成绩吗？此操作不可恢复！',
      okText: '确认清空',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        // 清空所有测试记录
        dispatch(setTestRecords([]))
        message.success('所有成绩已清空')
      }
    })
  }

  const getVisibleTestItems = (grade, gender) => {
    const primaryGrades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
    let stage = primaryGrades.includes(grade) ? 'primary' : 'secondary'
    
    // 根据学校学段信息过滤
    const schoolLevel = schoolInfo.schoolLevel || 'primary-middle' // 默认小学+中学
    
    // 处理年级未知的情况，确保能返回测试项目
    if (grade === '未知') {
      // 如果学校只设小学，返回小学必测项目
      if (schoolLevel === 'primary') {
        stage = 'primary'
      }
      // 否则默认返回中学项目
    }
    
    // 如果学校只设小学，过滤掉中学项目
    if (schoolLevel === 'primary' && stage !== 'primary') {
      return []
    }
    
    // 如果学校只设中学，过滤掉小学项目
    if (schoolLevel === 'middle' && stage === 'primary') {
      return []
    }
    
    return getTestItemsForGrade(grade, gender)
  }

  const handleExport = () => {
    let dataToExport = filteredData
    
    // 如果有选中记录，只导出选中记录
    if (selectedRowKeys.length > 0) {
      dataToExport = selectedRows
    }
    
    const exportData = dataToExport.map(record => {
      const items = getVisibleTestItems(record.grade, record.gender)
      const itemData = {}
      items.forEach(item => {
        itemData[item.name] = record.testItems[item.code] || ''
      })
      
      return {
        '教育ID': record.educationId,
        '姓名': record.studentName,
        '性别': record.gender === 'male' ? '男' : '女',
        '年级': record.grade,
        '班级': record.className,
        '测试日期': record.testDate,
        ...itemData,
        '总分': record.totalScore,
        '等级': record.gradeLevel,
        '审核状态': record.isApproved ? '已审核' : '未审核',
        '审核人': record.approvedBy,
        '审核时间': record.approvedTime
      }
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '体测数据')
    
    // 优化导出文件名，包含时间戳
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    XLSX.writeFile(wb, `体测成绩_${timestamp}.xlsx`)
    message.success('数据导出成功')
  }

  // 导入数据处理
  const handleImportComplete = (data) => {
    if (data && data.length > 0) {
      // 处理导入的数据
      const existingRecords = new Set(testRecords.map(record => record.educationId))
      const newRecords = []
      const updatedRecords = []
      
      data.forEach(item => {
        // 计算总分和等级
        let totalScore = item.totalScore || 0
        let gradeLevel = item.gradeLevel || ''
        
        if (Object.keys(item.testItems || {}).length > 0 && !totalScore && !gradeLevel) {
          const result = calculateTotalScore(item.testItems, item.grade, item.gender)
          totalScore = result.totalScore
          gradeLevel = result.gradeLevel
        }
        
        const processedItem = {
          ...item,
          totalScore,
          gradeLevel
        }
        
        if (existingRecords.has(item.educationId)) {
          // 更新现有记录
          updatedRecords.push(processedItem)
        } else {
          // 添加新记录
          newRecords.push({
            id: Date.now() + Math.random(), // 生成唯一ID
            ...processedItem,
            isApproved: false,
            approvedBy: '',
            approvedTime: ''
          })
        }
      })
      
      // 更新现有记录
      updatedRecords.forEach(item => {
        const existingRecord = testRecords.find(record => record.educationId === item.educationId)
        if (existingRecord) {
          dispatch(updateTestRecord({
            ...existingRecord,
            ...item,
            // 合并testItems字段，确保新导入的测试项目数据正确保存
            testItems: {
              ...existingRecord.testItems,
              ...item.testItems
            },
            id: existingRecord.id
          }))
        }
      })
      
      // 添加新记录
      newRecords.forEach(item => {
        dispatch(addTestRecord(item))
      })
      
      message.success(`成功导入 ${newRecords.length} 条新数据，更新 ${updatedRecords.length} 条现有数据`)
    }
  }

  // 移除批量审核功能，因为改为考生状态管理

  // 获取所有年级选项
  const getGradeOptions = () => {
    const grades = [...new Set(students.map(student => student.grade))]
    return grades.map(grade => (
      <Option key={grade} value={grade}>{grade}</Option>
    ))
  }

  // 获取班级选项，支持根据年级过滤
  const getClassOptions = () => {
    const values = searchForm.getFieldsValue(true)
    let result = [...students]
    if (values?.grade) {
      result = result.filter(student => student.grade === values.grade)
    }
    const classNames = [...new Set(result.map(student => student.className))]
    return classNames.map(className => (
      <Option key={className} value={className}>{className}</Option>
    ))
  }

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      const isExempt = record.studentStatus !== '正常'
      const formValues = {
        ...record,
        testDate: record.testDate ? dayjs(record.testDate) : null,
        isExempt,
        exemptReason: isExempt ? record.studentStatus : undefined,
        remark: record.remark || '',
        ...record.testItems
      }
      form.setFieldsValue(formValues)
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingId(null)
  }

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        setLoading(true)
        setTimeout(() => {
          const { 
            testDate, educationId, studentName, gender, grade, className, 
            isExempt, exemptReason, remark, ...itemScores 
          } = values
          
          const testDateStr = testDate ? testDate.format('YYYY-MM-DD') : ''
          
          // 处理考生状态
          const studentStatus = isExempt && exemptReason ? exemptReason : '正常'
          
          // 如果是免测,清空测试项目数据
          const testItems = isExempt ? {} : { ...itemScores }
          
          // 计算总分和等级
          let totalScore = 0
          let gradeLevel = ''
          
          if (!isExempt && Object.keys(testItems).length > 0) {
            const result = calculateTotalScore(testItems, grade, gender)
            totalScore = result.totalScore
            gradeLevel = result.gradeLevel
          }
          
          const updatedRecord = {
            educationId,
            studentName,
            gender,
            grade,
            className,
            testDate: testDateStr,
            testItems,
            totalScore,
            gradeLevel,
            studentStatus,
            remark: remark || ''
          }
          
          if (editingId) {
            const isTempRecord = String(editingId).startsWith('temp_')
            
            if (isTempRecord) {
              const newId = Date.now()
              dispatch(addTestRecord({ ...updatedRecord, id: newId }))
              message.success('体测记录添加成功')
            } else {
              const originalRecord = testRecords.find(record => record.id === editingId)
              if (originalRecord) {
                dispatch(updateTestRecord({ ...updatedRecord, id: editingId }))
                message.success('体测记录更新成功')
              }
            }
          } else {
            // 新增记录，根据educationId查找是否已存在
            const existingRecord = testRecords.find(record => record.educationId === educationId)
            if (existingRecord) {
              // 已存在，更新记录
              dispatch(updateTestRecord({ ...updatedRecord, id: existingRecord.id }))
              message.success('体测记录更新成功')
            } else {
              // 不存在，添加新记录
              const newId = Date.now()
              dispatch(addTestRecord({ ...updatedRecord, id: newId }))
              message.success('体测记录添加成功')
            }
          }
          setIsModalVisible(false)
          setLoading(false)
          setEditingId(null)
        }, 500)
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    const isTempRecord = String(id).startsWith('temp_')
    
    if (isTempRecord) {
      message.warning('临时记录无法删除，只能编辑添加成绩')
      return
    }
    
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这条体测记录吗？',
      onOk: () => {
        dispatch(deleteTestRecord(id))
        message.success('体测记录删除成功')
      }
    })
  }
  
  // 分屏调整事件处理
  const handleMouseDown = (e) => {
    setIsResizing(true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const handleMouseMove = (e) => {
    if (isResizing && splitRef.current) {
      const containerRect = splitRef.current.parentElement.getBoundingClientRect()
      const newHeight = containerRect.height - (e.clientY - containerRect.top)
      setSplitHeight(Math.max(100, Math.min(newHeight, containerRect.height - 100)))
    }
  }
  
  const handleMouseUp = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  // 双击进入编辑模式
  const handleDoubleClick = () => {
    if (selectedRecord) {
      setIsEditing(true)
      showModal(selectedRecord)
    }
  }
  
  // 行选择事件
  const handleRowSelect = (_, record) => {
    setSelectedRecord(record)
    setIsEditing(false)
  }

  // 移除单个审核功能，因为改为考生状态管理

  // 获取所有可能的测试项目列
  const getAllTestItemColumns = () => {
    // 收集所有记录的年级和性别
    const gradeGenderSet = new Set()
    filteredData.forEach(record => {
      gradeGenderSet.add(`${record.grade}-${record.gender}`)
    })
    
    // 获取所有可能的测试项目
    const allItems = []
    const itemCodeSet = new Set()
    
    // 如果没有数据，返回空数组
    if (gradeGenderSet.size === 0) {
      return []
    }
    
    // 遍历所有年级-性别组合，获取所有可能的测试项目
    gradeGenderSet.forEach(gradeGender => {
      const [grade, gender] = gradeGender.split('-')
      const items = getVisibleTestItems(grade, gender)
      
      items.forEach(item => {
        if (!itemCodeSet.has(item.code)) {
          itemCodeSet.add(item.code)
          allItems.push(item)
        }
      })
    })
    
    // 按标准顺序排序
    // 小学顺序：身高、体重、肺活量、50米跑、坐位体前屈、一分钟跳绳、一分钟仰卧起坐、50米×8往返跑
    // 初高中顺序：身高、体重、肺活量、50米跑、立定跳远、坐位体前屈、800米、仰卧起坐、1000米、引体向上
    const itemOrder = ['height', 'weight', 'vitalCapacity', 'run50m', 'sitAndReach', 
                      'ropeSkipping', 'sitUps', 'run50m8x', 'standingLongJump', 
                      'run800m', 'run1000m', 'pullUps']
    
    allItems.sort((a, b) => {
      return itemOrder.indexOf(a.code) - itemOrder.indexOf(b.code)
    })
    
    // 生成表格列
    return allItems.map(item => ({
      title: item.name,
      dataIndex: ['testItems', item.code],
      key: item.code,
      width: 120,
      // 允许非必测项目值为空
      render: (value) => value !== undefined ? value : ''
    }))
  }

  const baseColumns = [
    {
      title: '教育ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
      fixed: 'left'
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => gender === 'male' ? '男' : '女'
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
      title: '测试日期',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80
    },
    {
      title: '等级',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
      width: 80
    },
    {title: '考生状态',
      dataIndex: 'studentStatus',
      key: 'studentStatus',
      width: 120,
      render: (studentStatus = '正常') => (
        <span style={{ 
          color: studentStatus === '正常' ? '#52c41a' : 
                 studentStatus.includes('免测') ? '#1890ff' : '#faad14' 
        }}>
          {studentStatus}
        </span>
      )
    },
    {title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const getColumnsWithTestItems = () => {
    const testItemColumns = getAllTestItemColumns()
    // 分离操作列和其他基础列
    const baseColumnsWithoutAction = baseColumns.filter(col => col.key !== 'action')
    const actionColumn = baseColumns.find(col => col.key === 'action')
    const totalWidth = testItemColumns.reduce((sum, col) => sum + (col.width || 120), 0)
    return {
      columns: [...baseColumnsWithoutAction, ...testItemColumns, actionColumn],
      scrollX: 1000 + totalWidth
    }
  }

  return (
    <div>
      <Title level={3}>体测成绩管理</Title>
      
      <Card style={{ marginBottom: 20 }}>
        <Form
          form={searchForm}
          layout="horizontal"
          initialValues={{
            grade: '',
            className: '',
            studentSearch: '',
            studentStatus: ''
          }}
        >
          <Row gutter={[8, 8]} align="middle" justify="space-between">
            <Row gutter={[8, 8]} align="middle">
              <Col>
                <Form.Item name="grade" label="年级" style={{ marginBottom: 0 }}>
                  <Select 
                    placeholder="年级" 
                    style={{ width: 120 }}
                    onChange={() => {
                      // 年级变化时，清空班级选择
                      searchForm.setFieldsValue({ className: '' })
                    }}
                  >
                    <Option value="">全部</Option>
                    {getGradeOptions()}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="className" label="班级" style={{ marginBottom: 0 }}>
                  <Select placeholder="班级" style={{ width: 150 }}>
                    <Option value="">全部</Option>
                    {getClassOptions()}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="studentSearch" label="学生" style={{ marginBottom: 0 }}>
                  <Input placeholder="ID或姓名" allowClear style={{ width: 200 }} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="studentStatus" label="考生状态" style={{ marginBottom: 0 }}>
                  <Select placeholder="考生状态" style={{ width: 150 }}>
                    <Option value="">全部</Option>
                    <Option value="正常">正常</Option>
                    <Option value="因病免体">因病免体</Option>
                    <Option value="因伤免体">因伤免体</Option>
                    <Option value="重疾免测">重疾免测</Option>
                    <Option value="残疾免测">残疾免测</Option>
                    <Option value="其他免测">其他免测</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ marginRight: 8 }}>
                  搜索
                </Button>
              </Col>
              <Col>
                <Button onClick={handleReset} style={{ marginRight: 8 }}>
                  重置
                </Button>
              </Col>
              <Col>
                <Button danger onClick={handleClearScores} style={{ marginRight: 8 }}>
                  清空成绩
                </Button>
              </Col>

            </Row>
            <Row gutter={[8, 8]} align="middle">
              <Col>
                <PhysicalTestImportExport 
                  onImportComplete={handleImportComplete}
                />
              </Col>
              <Col>
                <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
                  导出成绩
                </Button>
              </Col>
            </Row>
          </Row>
        </Form>
      </Card>

      {/* 分屏布局 */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', border: '1px solid #f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
        {/* 上半部分：成绩列表 */}
        <div style={{ flex: `0 0 ${splitHeight}px`, overflow: 'auto' }}>
          {filteredData.length > 0 ? (
            (() => {
              const { columns, scrollX } = getColumnsWithTestItems()
              
              // 分页计算
              const startIndex = (currentPage - 1) * pageSize
              const endIndex = startIndex + pageSize
              const paginatedData = filteredData.slice(startIndex, endIndex)
              
              return (
                <Table
                  columns={columns}
                  dataSource={paginatedData}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredData.length,
                    onChange: (page, size) => {
                      setCurrentPage(page)
                      setPageSize(size)
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                  scroll={{ x: scrollX }}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedRowKeys(selectedRowKeys)
                      setSelectedRows(selectedRows)
                    },
                    getCheckboxProps: (record) => ({
                      disabled: record.isApproved || String(record.id).startsWith('temp_'),
                      name: record.studentName,
                    }),
                  }}
                  onRow={(record) => ({
                    onClick: () => handleRowSelect(null, record),
                    style: {
                      backgroundColor: selectedRecord?.id === record.id ? '#f0f7ff' : 'transparent',
                      cursor: 'pointer'
                    }
                  })}
                />
              )
            })()
          ) : (
            <Table
              columns={baseColumns}
              dataSource={[]}
              rowKey="id"
              loading={loading}
              pagination={{
                current: 1,
                pageSize: pageSize,
                total: 0,
                onChange: (page, size) => {
                  setCurrentPage(page)
                  setPageSize(size)
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `共 ${total} 条记录`
              }}
              scroll={{ x: 800 }}
              rowSelection={{
                selectedRowKeys: [],
                onChange: () => {},
                getCheckboxProps: () => ({
                  disabled: true
                })
              }}
            />
          )}
        </div>
        
        {/* 分割线，支持拖动调整高度 */}
        <div 
          ref={splitRef}
          style={{
            height: '8px',
            backgroundColor: '#f0f0f0',
            cursor: 'ns-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            userSelect: 'none',
            ...(isResizing && { backgroundColor: '#1890ff', cursor: 'ns-resize' })
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{
            width: '40px',
            height: '2px',
            backgroundColor: '#999',
            borderRadius: '1px',
            ...(isResizing && { backgroundColor: '#fff' })
          }} />
        </div>
        
        {/* 下半部分：成绩详情 */}
        <div 
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#fafafa',
            padding: 16
          }}
          onDoubleClick={handleDoubleClick}
        >
          {selectedRecord ? (
            <Card title="成绩详情" bordered={true}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>教育ID:</div>
                  <div>{selectedRecord.educationId}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>学生姓名:</div>
                  <div>{selectedRecord.studentName}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>性别:</div>
                  <div>{selectedRecord.gender === 'male' ? '男' : '女'}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>年级:</div>
                  <div>{selectedRecord.grade}</div>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>班级:</div>
                  <div>{selectedRecord.className}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>测试日期:</div>
                  <div>{selectedRecord.testDate}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>总分:</div>
                  <div style={{ fontSize: 18, color: '#1890ff', fontWeight: 'bold' }}>{selectedRecord.totalScore}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontWeight: 'bold' }}>等级:</div>
                  <div>{selectedRecord.gradeLevel}</div>
                </Col>
              </Row>
              
              <Divider orientation="left">测试项目成绩</Divider>
              
              <Row gutter={16}>
                {(() => {
                  const grade = selectedRecord.grade
                  const gender = selectedRecord.gender
                  const items = getVisibleTestItems(grade, gender)
                  return items.map(item => (
                    <Col span={12} key={item.code}>
                      <Row gutter={8} align="middle">
                        <Col span={12}>
                          <div>{item.name}:</div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            {selectedRecord.testItems[item.code] || '-'}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  ))
                })()}
              </Row>
              
              <div style={{ marginTop: 24, textAlign: 'center', color: '#999', fontSize: 14 }}>
                双击此处可进入编辑模式
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
              请选择一条记录查看详情
            </div>
          )}
        </div>
      </div>

      <Modal
        title="编辑体测成绩"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"

        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="educationId"
                label="教育ID"
              >
                <Input disabled placeholder="教育ID" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="studentName"
                label="学生姓名"
              >
                <Input disabled placeholder="学生姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
              >
                <Input disabled placeholder="性别" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="grade"
                label="年级"
              >
                <Input disabled placeholder="年级" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="className"
                label="班级"
              >
                <Input disabled placeholder="班级" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="testDate"
                label="测试日期"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!getFieldValue('isExempt') && !value) {
                        return Promise.reject(new Error('请选择测试日期!'));
                      }
                      return Promise.resolve();
                    },
                  })
                ]}
              >
                <DatePicker placeholder="请选择测试日期" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">特殊情况</Divider>

          {/* 使用变量存储免测状态 */}
          <Form.Item noStyle shouldUpdate>
            {() => {
              const isExempt = form.getFieldValue('isExempt') || false;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {/* 圆形选择框 */}
                  <Form.Item
                    name="isExempt"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox 
                      style={{ borderRadius: '50%', marginRight: '8px' }}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // 当勾选状态变化时,清空免测原因和备注
                        if (!checked) {
                          form.setFieldsValue({ exemptReason: undefined, remark: '' });
                        }
                        // 触发免测原因的验证
                        form.validateFields(['exemptReason']).catch(() => {});
                        
                        // 触发所有测试项目字段的验证,清除错误提示
                        const grade = form.getFieldValue('grade');
                        const gender = form.getFieldValue('gender');
                        if (grade && gender) {
                          const items = getVisibleTestItems(grade, gender);
                          const itemCodes = items.map(item => item.code);
                          // 当勾选免测时,清除所有测试项目的验证错误
                          if (checked) {
                            form.validateFields(itemCodes).catch(() => {});
                          }
                        }
                      }}
                    >
                      免测申请
                    </Checkbox>
                  </Form.Item>
                  
                  {/* 免测原因选择框 */}
                  <Form.Item
                    name="exemptReason"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (getFieldValue('isExempt') && !value) {
                            return Promise.reject(new Error('请选择免测原因!'));
                          }
                          return Promise.resolve();
                        },
                      })
                    ]}
                    style={{ marginBottom: 0, minWidth: '180px' }}
                  >
                    <Select 
                      placeholder="请选择免测原因" 
                      style={{ width: '180px' }} 
                      disabled={!isExempt}
                      onChange={() => {
                        // 触发表单验证
                        form.validateFields(['exemptReason']);
                      }}
                    >
                      <Option value="因病免体">因病免体</Option>
                      <Option value="因伤免体">因伤免体</Option>
                      <Option value="重疾免测">重疾免测</Option>
                      <Option value="残疾免测">残疾免测</Option>
                      <Option value="其他免测">其他免测</Option>
                    </Select>
                  </Form.Item>
                  
                  {/* 备注说明文字 */}
                  <span>备注说明</span>
                  
                  {/* 备注输入框 */}
                  <Form.Item
                    name="remark"
                    style={{ marginBottom: 0, minWidth: '300px' }}
                  >
                    <Input 
                      placeholder="请输入备注说明（非必填）" 
                      style={{ width: '300px' }} 
                      showCount 
                      maxLength={200} 
                      disabled={!isExempt}
                    />
                  </Form.Item>
                </div>
              );
            }}
          </Form.Item>

          <Divider titlePlacement="left">测试项目</Divider>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.grade !== currentValues.grade || 
            prevValues.gender !== currentValues.gender ||
            prevValues.isExempt !== currentValues.isExempt
          }>
            {() => {
              const grade = form.getFieldValue('grade')
              const gender = form.getFieldValue('gender')
              const isExempt = form.getFieldValue('isExempt') || false
              // 使用record中的grade和gender作为备选值，确保测试项目始终显示
              const recordGrade = editingId ? testRecords.find(r => r.id === editingId)?.grade : null
              const recordGender = editingId ? testRecords.find(r => r.id === editingId)?.gender : null
              const finalGrade = grade || recordGrade || '未知'
              const finalGender = gender || recordGender || 'male'
              const items = getVisibleTestItems(finalGrade, finalGender)
              const rows = []
              for (let i = 0; i < items.length; i += 2) {
                const item1 = items[i]
                const item2 = items[i + 1]
                rows.push(
                  <Row gutter={16} key={i}>
                    <Col span={12}>
                      <Form.Item
                        name={item1.code}
                        label={item1.name}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                            const isExempt = getFieldValue('isExempt');
                            // 免测状态下不验证
                            if (isExempt) {
                              return Promise.resolve();
                            }
                            // 非免测状态下验证是否为空
                            if (!value && value !== 0) {
                              return Promise.reject(new Error(`请输入${item1.name}!`));
                            }
                            // 验证是否为有效数字
                            if (isNaN(Number(value))) {
                              return Promise.reject(new Error('请输入数字!'));
                            }
                            return Promise.resolve();
                          },
                        })
                        ]}
                      >
                        <Input type="number" placeholder={`请输入${item1.name}`} step="0.1" style={{ width: '100%' }} disabled={isExempt} />
                      </Form.Item>
                    </Col>
                    {item2 && (
                      <Col span={12}>
                        <Form.Item
                          name={item2.code}
                          label={item2.name}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const isExempt = getFieldValue('isExempt');
                                // 免测状态下不验证
                                if (isExempt) {
                                  return Promise.resolve();
                                }
                                // 非免测状态下验证是否为空
                                if (!value && value !== 0) {
                                  return Promise.reject(new Error(`请输入${item2.name}!`));
                                }
                                // 验证是否为有效数字
                                if (isNaN(Number(value))) {
                                  return Promise.reject(new Error('请输入数字!'));
                                }
                                return Promise.resolve();
                              },
                            })
                          ]}
                        >
                          <Input type="number" placeholder={`请输入${item2.name}`} step="0.1" style={{ width: '100%' }} disabled={isExempt} />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                )}
              return rows
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ScoreManagement
