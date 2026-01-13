import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, DatePicker, Card, Row, Col, Divider, Checkbox, Tree } from 'antd'
import { EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updateTestRecord, deleteTestRecord, addTestRecord, setTestRecords, fetchPhysicalTestHistory, createPhysicalTest, updatePhysicalTestRecord, deletePhysicalTestRecord } from '../../store/physicalTestSlice'
import { fetchAllStudents } from '../../store/dataSlice'
import { getTestItemsForGrade } from '../../utils/gradeStageMapping'
import { parseGradeCode, parseClassCode } from '../../utils/codeMapping'
import { calculateTotalScore } from '../../utils/scoreCalculator'
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
  
  // 组件加载时获取学生数据和体测历史数据
  useEffect(() => {
    // 获取全部学生列表（分页加载所有数据）
    dispatch(fetchAllStudents())
    // 获取体测历史数据
    dispatch(fetchPhysicalTestHistory({}))
  }, [dispatch])

  // 使用统一字段名同步学生数据到体测记录
  // 始终以学生列表为基础，合并体测记录数据
  const synchronizedData = useMemo(() => {
    try {
      // 创建体测记录的索引Map，支持多种关联方式
      const testRecordsByEducationId = new Map()
      const testRecordsByStudentNo = new Map()
      const testRecordsById = new Map()
      
      testRecords.forEach(record => {
        if (record.education_id) testRecordsByEducationId.set(record.education_id, record)
        if (record.educationId) testRecordsByEducationId.set(record.educationId, record)
        if (record.student_no) testRecordsByStudentNo.set(record.student_no, record)
        if (record.student_id) testRecordsById.set(record.student_id, record)
      })
      
      // 以学生列表为基础，合并体测记录
      return students.map(student => {
        // 查找该学生的体测记录
        let testRecord = null
        if (student.education_id) testRecord = testRecordsByEducationId.get(student.education_id)
        if (!testRecord && student.educationId) testRecord = testRecordsByEducationId.get(student.educationId)
        if (!testRecord && student.student_no) testRecord = testRecordsByStudentNo.get(student.student_no)
        if (!testRecord && student.id) testRecord = testRecordsById.get(student.id)
        
        const rawGrade = student.current_grade || student.grade || '未知'
        const rawClass = student.current_class_name || student.className || '未知'
        const grade = parseGradeCode(rawGrade)
        const className = parseClassCode(rawClass)
        
        // 合并学生信息和体测记录
        return {
          id: testRecord?.id || student.id,
          real_name: student.real_name || student.name || '未知',
          studentName: student.real_name || student.name || '未知',
          educationId: student.education_id || student.educationId,
          education_id: student.education_id || student.educationId,
          student_no: student.student_no,
          student_id: student.id,
          gender: student.gender || 'male',
          grade,
          className,
          // 体测记录字段，如果有记录则使用记录值，否则使用默认值
          testDate: testRecord?.testDate || '',
          totalScore: testRecord?.totalScore || '',
          gradeLevel: testRecord?.gradeLevel || '',
          studentStatus: testRecord?.studentStatus || '正常',
          testItems: testRecord?.testItems || {},
          remark: testRecord?.remark || ''
        }
      })
    } catch (err) {
      console.error('[ScoreManagement] Error in synchronizedData:', err)
      return []
    }
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
    
    // 按学生搜索 - 支持姓名、学籍号、教育ID
    if (searchValues.studentSearch) {
      const searchText = searchValues.studentSearch.toLowerCase()
      result = result.filter(record => 
        record.studentName?.toLowerCase().includes(searchText) ||
        record.real_name?.toLowerCase().includes(searchText) ||
        record.student_no?.toLowerCase().includes(searchText) ||
        record.education_id?.includes(searchText)
      )
    }
    
    // 按考生状态筛选
    if (searchValues.studentStatus) {
      result = result.filter(record => record.studentStatus === searchValues.studentStatus)
    }
    
    return result
  }, [synchronizedData, searchValues])

  // 搜索条件变化时自动更新
  const handleSearchChange = (changedValues) => {
    const values = searchForm.getFieldsValue()
    setSearchValues(values)
    setCurrentPage(1)
  }

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

  // 导入数据处理 - 支持多种导入模式，并持久化到后端
  const handleImportComplete = async (data, importMode = 'merge') => {
    if (!data || data.length === 0) return

    setLoading(true)
    let successCount = 0
    let failCount = 0
    
    // 创建现有记录索引，同时支持 educationId 和 education_id
    const existingRecordsMap = new Map()
    testRecords.forEach(record => {
      const key = record.education_id || record.educationId || record.student_id
      if (key) {
        existingRecordsMap.set(String(key), record)
      }
    })
    
    for (const item of data) {
      try {
        // 计算总分和等级
        let totalScore = item.totalScore || 0
        let gradeLevel = item.gradeLevel || ''
        
        if (Object.keys(item.testItems || {}).length > 0 && !totalScore && !gradeLevel) {
          const result = calculateTotalScore(item.testItems, item.grade, item.gender)
          totalScore = result.totalScore
          gradeLevel = result.gradeLevel
        }
        
        // 转换为后端API需要的格式
        const apiData = {
          student_id: item.student_id,
          class_id: item.class_id || null,
          test_date: item.testDate || new Date().toISOString().split('T')[0],
          test_type: '日常',
          height: item.testItems?.height || null,
          weight: item.testItems?.weight || null,
          vital_capacity: item.testItems?.vitalCapacity ? Math.round(item.testItems.vitalCapacity) : null,
          run_50m: item.testItems?.run50m || null,  // 保留小数
          run_800m: item.testItems?.run800m || null,  // 保留小数（秒）
          run_1000m: item.testItems?.run1000m || null,  // 保留小数（秒）
          sit_and_reach: item.testItems?.sitAndReach || null,
          standing_long_jump: item.testItems?.standingLongJump ? Math.round(item.testItems.standingLongJump) : null,
          pull_up: item.testItems?.pullUps ? Math.round(item.testItems.pullUps) : null,
          skip_rope: item.testItems?.ropeSkipping ? Math.round(item.testItems.ropeSkipping) : null,
          sit_ups: item.testItems?.sitUps ? Math.round(item.testItems.sitUps) : null,
          run_50m_8: item.testItems?.run50m8x || null,  // 保留小数
          total_score: totalScore || null,
          grade: gradeLevel || null,
          is_official: true
        }
        
        // 检查该学生是否已有记录
        const itemKey = String(item.education_id || item.educationId || item.student_id)
        const existingRecord = existingRecordsMap.get(itemKey)
        
        if (existingRecord && existingRecord.id && typeof existingRecord.id === 'number') {
          // 根据导入模式决定如何更新
          if (importMode === 'fillEmpty') {
            // 仅填充空值模式：只更新原本为空的字段
            const updateData = {}
            Object.entries(apiData).forEach(([key, value]) => {
              if (value !== null && (existingRecord[key] === null || existingRecord[key] === undefined)) {
                updateData[key] = value
              }
            })
            if (Object.keys(updateData).length > 0) {
              await dispatch(updatePhysicalTestRecord({ id: existingRecord.id, testData: updateData })).unwrap()
            }
          } else {
            // 智能合并或全量覆盖模式
            await dispatch(updatePhysicalTestRecord({ id: existingRecord.id, testData: apiData })).unwrap()
          }
        } else {
          // 创建新记录
          if (item.student_id) {
            await dispatch(createPhysicalTest(apiData)).unwrap()
          } else {
            console.warn('跳过没有student_id的记录:', item)
            failCount++
            continue
          }
        }
        successCount++
      } catch (error) {
        console.error('保存记录失败:', error, item)
        failCount++
      }
    }
    
    setLoading(false)
    
    // 刷新数据
    dispatch(fetchPhysicalTestHistory({}))
    
    const modeText = {
      merge: '智能合并',
      overwrite: '全量覆盖',
      fillEmpty: '仅填充空值'
    }[importMode] || '智能合并'
    
    if (failCount > 0) {
      message.warning(`[${modeText}] 成功保存 ${successCount} 条，失败 ${failCount} 条`)
    } else {
      message.success(`[${modeText}] 成功保存 ${successCount} 条数据到服务器`)
    }
  }

  // 移除批量审核功能，因为改为考生状态管理

  // 使用 useMemo 缓存年级列表数据
  const gradeList = useMemo(() => {
    try {
      // 使用 current_grade 字段（API原始字段）或 grade 字段（normalizeStudent 标准化后的字段）
      const grades = [...new Set(students.map(student => student.current_grade || student.grade).filter(g => g && g !== '未知'))]
      return grades
    } catch (err) {
      return []
    }
  }, [students])

  // 使用 useMemo 缓存班级列表数据
  const classList = useMemo(() => {
    try {
      let result = [...students]
      if (searchValues?.grade) {
        // 使用 current_grade 字段进行筛选
        result = result.filter(student => (student.current_grade || student.grade) === searchValues.grade)
      }
      // 使用 current_class_name 字段（API原始字段）或 className 字段（normalizeStudent 标准化后的字段）
      const classNames = [...new Set(result.map(student => student.current_class_name || student.className).filter(c => c && c !== '未知'))]
      return classNames
    } catch (err) {
      return []
    }
  }, [students, searchValues])

  // 获取所有年级选项
  // const getGradeOptions = () => {
  //   return gradeOptions
  // }

  // 获取班级选项，支持根据年级过滤
  // const getClassOptions = () => {
  //   return classOptions
  // }

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const { 
        testDate, educationId, studentName, gender, grade, className, 
        isExempt, exemptReason, remark, ...itemScores 
      } = values
      
      const testDateStr = testDate ? testDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      
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
      
      // 查找学生信息获取 student_id 和 class_id
      const student = students.find(s => 
        String(s.education_id || s.educationId) === String(educationId)
      )
      
      if (!student || !student.id) {
        message.error('未找到对应学生信息，无法保存')
        setLoading(false)
        return
      }
      
      // 转换为后端API格式
      const apiData = {
        student_id: student.id,
        class_id: student.current_class_id || student.class_id || null,
        test_date: testDateStr,
        test_type: '日常',
        height: testItems.height || null,
        weight: testItems.weight || null,
        vital_capacity: testItems.vitalCapacity ? Math.round(testItems.vitalCapacity) : null,
        run_50m: testItems.run50m || null,  // 保留小数
        run_800m: testItems.run800m || null,  // 保留小数（秒）
        run_1000m: testItems.run1000m || null,  // 保留小数（秒）
        sit_and_reach: testItems.sitAndReach || null,
        standing_long_jump: testItems.standingLongJump ? Math.round(testItems.standingLongJump) : null,
        pull_up: testItems.pullUps ? Math.round(testItems.pullUps) : null,
        skip_rope: testItems.ropeSkipping ? Math.round(testItems.ropeSkipping) : null,
        sit_ups: testItems.sitUps ? Math.round(testItems.sitUps) : null,
        run_50m_8: testItems.run50m8x || null,  // 保留小数
        total_score: totalScore || null,
        grade: gradeLevel || null,
        test_notes: studentStatus !== '正常' ? studentStatus : (remark || null),
        is_official: true
      }
      
      // 查找是否已有体测记录
      const existingRecord = testRecords.find(record => 
        (record.educationId === educationId || record.education_id === educationId) &&
        record.id && typeof record.id === 'number'
      )
      
      try {
        if (existingRecord) {
          // 更新现有记录
          await dispatch(updatePhysicalTestRecord({ id: existingRecord.id, testData: apiData })).unwrap()
          message.success('体测记录更新成功')
        } else {
          // 创建新记录
          await dispatch(createPhysicalTest(apiData)).unwrap()
          message.success('体测记录添加成功')
        }
        
        // 刷新数据
        dispatch(fetchPhysicalTestHistory({}))
        
        setIsModalVisible(false)
        setEditingId(null)
      } catch (apiError) {
        message.error('保存失败: ' + (apiError.message || apiError))
      }
      
      setLoading(false)
    } catch (info) {
      setLoading(false)
    }
  }

  const handleDelete = (id) => {
    const isTempRecord = String(id).startsWith('temp_')
    
    if (isTempRecord) {
      message.warning('临时记录无法删除，只能编辑添加成绩')
      return
    }
    
    // 检查是否是后端数据库记录（数字ID）
    const isDbRecord = typeof id === 'number'
    
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这条体测记录吗？此操作不可恢复！',
      onOk: async () => {
        try {
          if (isDbRecord) {
            // 调用后端 API 删除
            await dispatch(deletePhysicalTestRecord(id)).unwrap()
            message.success('体测记录删除成功')
            // 刷新数据
            dispatch(fetchPhysicalTestHistory({}))
          } else {
            // 本地临时记录，直接从 Redux 删除
            dispatch(deleteTestRecord(id))
            message.success('记录已移除')
          }
        } catch (error) {
          console.error('[handleDelete] Error:', error)
          message.error('删除失败: ' + (error.message || error))
        }
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

  try {
    return (
      <Card title="体测成绩管理" style={{ marginTop: 16 }} loading={loading}>
        {/* 搜索栏 */}
        <div style={{ marginBottom: 16, padding: '16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Form form={searchForm} onValuesChange={handleSearchChange}>
            <Row gutter={16} align="middle">
              <Col>
                <Form.Item name="grade" label="年级" style={{ marginBottom: 0 }}>
                  <Select 
                    placeholder="选择年级" 
                    style={{ width: 120 }}
                    allowClear
                    onChange={() => {
                      searchForm.setFieldsValue({ className: undefined })
                    }}
                  >
                    {gradeList.map(grade => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="className" label="班级" style={{ marginBottom: 0 }}>
                  <Select 
                    placeholder="选择班级" 
                    style={{ width: 120 }}
                    allowClear
                  >
                    {classList.map(className => (
                      <Option key={className} value={className}>{className}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item name="studentSearch" label="搜索" style={{ marginBottom: 0 }}>
                  <Input placeholder="姓名/学籍号/教育ID" style={{ width: 160 }} allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Col>
              <Col flex="auto" />
              <Col>
                <Space>
                  <PhysicalTestImportExport onImportComplete={handleImportComplete} />
                  <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                  <Button danger onClick={handleClearScores}>清空成绩</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>

        {/* 分屏布局 */}
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* 上半部分：学生列表 */}
          <div style={{ flex: 1, minHeight: 200, overflow: 'auto' }}>
            <Table
              columns={baseColumns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading || reduxLoading}
              size="small"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                onChange: (page, size) => {
                  setCurrentPage(page)
                  if (size !== pageSize) setPageSize(size)
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                size: 'small'
              }}
              scroll={{ x: 1200, y: 'calc(100vh - 520px)' }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys, rows) => {
                  setSelectedRowKeys(keys)
                  setSelectedRows(rows)
                },
                getCheckboxProps: (record) => ({
                  disabled: record.isApproved || String(record.id).startsWith('temp_'),
                  name: record.studentName,
                }),
              }}
              onRow={(record) => ({
                onClick: () => handleRowSelect(null, record),
                onDoubleClick: () => showModal(record),
                style: {
                  backgroundColor: selectedRecord?.id === record.id ? '#e6f7ff' : 'transparent',
                  cursor: 'pointer'
                }
              })}
            />
          </div>
          
          {/* 分割线 - 移除可拖动功能，使用固定高度 */}
          
          {/* 下半部分：成绩详情 */}
          <div 
            style={{
              height: 380,
              overflow: 'auto',
              backgroundColor: '#fff',
              padding: 16,
              borderTop: '1px solid #e8e8e8'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {selectedRecord ? (
              (() => {
                // 计算详细评分
                const scoreResult = calculateTotalScore(
                  selectedRecord.testItems,
                  selectedRecord.grade,
                  selectedRecord.gender
                )
                const { itemScores, bonusItems, standardScore, bonusScore, compositeScore, bmi } = scoreResult
                
                // 获取等级对应的颜色
                const getLevelColor = (level) => {
                  if (level === '优秀') return '#52c41a'
                  if (level === '良好') return '#1890ff'
                  if (level === '及格') return '#faad14'
                  return '#ff4d4f'
                }
                
                // 获取BMI等级描述
                const getBMIDescription = (level) => {
                  if (level === '正常') return { text: '正常', color: '#52c41a' }
                  if (level === '低体重') return { text: '偏瘦', color: '#faad14' }
                  if (level === '超重') return { text: '超重', color: '#faad14' }
                  if (level === '肥胖') return { text: '肥胖', color: '#ff4d4f' }
                  return { text: '-', color: '#999' }
                }
                
                // 根据单项得分获取等级
                const getItemLevel = (score) => {
                  if (score >= 90) return '优秀'
                  if (score >= 80) return '良好'
                  if (score >= 60) return '及格'
                  if (score > 0) return '不及格'
                  return '-'
                }
                
                return (
                  <div>
                    {/* 基本信息行 */}
                    <Row gutter={16} style={{ marginBottom: 12 }}>
                      <Col span={3}>
                        <div style={{ color: '#666', fontSize: 12 }}>教育ID</div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{selectedRecord.educationId || '-'}</div>
                      </Col>
                      <Col span={2}>
                        <div style={{ color: '#666', fontSize: 12 }}>姓名</div>
                        <div style={{ fontWeight: 500 }}>{selectedRecord.studentName}</div>
                      </Col>
                      <Col span={2}>
                        <div style={{ color: '#666', fontSize: 12 }}>性别</div>
                        <div style={{ fontWeight: 500 }}>{selectedRecord.gender === 'male' ? '男' : '女'}</div>
                      </Col>
                      <Col span={2}>
                        <div style={{ color: '#666', fontSize: 12 }}>年级</div>
                        <div style={{ fontWeight: 500 }}>{selectedRecord.grade}</div>
                      </Col>
                      <Col span={2}>
                        <div style={{ color: '#666', fontSize: 12 }}>班级</div>
                        <div style={{ fontWeight: 500 }}>{selectedRecord.className}</div>
                      </Col>
                      <Col span={3}>
                        <div style={{ color: '#666', fontSize: 12 }}>测试日期</div>
                        <div style={{ fontWeight: 500 }}>{selectedRecord.testDate || '-'}</div>
                      </Col>
                      <Col span={3}>
                        <div style={{ color: '#666', fontSize: 12 }}>BMI</div>
                        <div style={{ fontWeight: 500 }}>
                          {bmi ? (
                            <>
                              <span>{bmi.toFixed(1)}</span>
                              <span style={{ marginLeft: 4, fontSize: 12, color: getBMIDescription(itemScores?.bmi?.level).color }}>
                                ({getBMIDescription(itemScores?.bmi?.level).text})
                              </span>
                            </>
                          ) : '-'}
                        </div>
                      </Col>
                      <Col span={5}>
                        <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => showModal(selectedRecord)}>编辑</Button>
                      </Col>
                    </Row>
                    
                    {/* 分数汇总行 */}
                    <Row gutter={16} style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#f0f7ff', borderRadius: 6 }}>
                      <Col span={4}>
                        <div style={{ color: '#666', fontSize: 12 }}>标准分（总分）</div>
                        <div style={{ fontWeight: 600, color: '#1890ff', fontSize: 20 }}>{standardScore || '-'}</div>
                      </Col>
                      <Col span={4}>
                        <div style={{ color: '#666', fontSize: 12 }}>加分</div>
                        <div style={{ fontWeight: 600, color: bonusScore > 0 ? '#52c41a' : '#999', fontSize: 20 }}>
                          {bonusScore > 0 ? `+${bonusScore}` : '0'}
                        </div>
                      </Col>
                      <Col span={4}>
                        <div style={{ color: '#666', fontSize: 12 }}>综合分</div>
                        <div style={{ fontWeight: 600, color: '#722ed1', fontSize: 20 }}>{compositeScore || '-'}</div>
                      </Col>
                      <Col span={4}>
                        <div style={{ color: '#666', fontSize: 12 }}>等级</div>
                        <div style={{ fontWeight: 600, color: getLevelColor(scoreResult.gradeLevel), fontSize: 18 }}>
                          {scoreResult.gradeLevel || '-'}
                        </div>
                      </Col>
                      <Col span={8}>
                        {bonusScore > 0 && (
                          <div>
                            <div style={{ color: '#666', fontSize: 12 }}>加分项目</div>
                            <div style={{ fontSize: 12 }}>
                              {Object.values(bonusItems).map((item, idx) => (
                                <span key={idx} style={{ marginRight: 8, color: '#52c41a' }}>
                                  {item.name}: +{item.bonus}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    {/* 测试项目详情 - 显示得分和等级 */}
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>测试项目成绩详情</div>
                    <Row gutter={[12, 8]}>
                      {(() => {
                        const grade = selectedRecord.grade
                        const gender = selectedRecord.gender
                        const items = getVisibleTestItems(grade, gender)
                        return items.map(item => {
                          const itemScore = itemScores[item.code]
                          const value = selectedRecord.testItems?.[item.code]
                          const score = itemScore?.score || 0
                          const level = getItemLevel(score)
                          const levelColor = getLevelColor(level)
                          
                          // 检查是否有加分
                          const bonusItem = bonusItems[item.code]
                          
                          return (
                            <Col span={6} key={item.code}>
                              <div style={{ 
                                padding: '6px 10px', 
                                backgroundColor: '#fafafa', 
                                borderRadius: 4,
                                border: bonusItem ? '1px solid #b7eb8f' : '1px solid #f0f0f0'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: '#666', fontSize: 12 }}>{item.name}</span>
                                  <span style={{ fontSize: 12, color: levelColor, fontWeight: 500 }}>{level}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                  <span style={{ fontWeight: 500, fontSize: 14 }}>{value ?? '-'}</span>
                                  <span style={{ color: '#1890ff', fontWeight: 600 }}>
                                    {score > 0 ? `${score}分` : '-'}
                                    {bonusItem && <span style={{ color: '#52c41a', marginLeft: 4 }}>+{bonusItem.bonus}</span>}
                                  </span>
                                </div>
                              </div>
                            </Col>
                          )
                        })
                      })()}
                    </Row>
                    
                    <div style={{ marginTop: 8, textAlign: 'center', color: '#999', fontSize: 11 }}>
                      提示：双击此区域或表格行可快速编辑成绩 | 加分项目：跳绳(小学最高+20)、引体向上/仰卧起坐/耐力跑(中学最高+10)
                    </div>
                  </div>
                )
              })()
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                <span>👆 点击上方表格选择学生查看详情</span>
              </div>
            )}
          </div>
        </div>

        {/* 编辑成绩弹窗 */}
        <Modal
          title={editingId ? '编辑体测成绩' : '添加体测成绩'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="educationId" label="教育ID">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="studentName" label="学生姓名">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="gender" label="性别">
                  <Select disabled>
                    <Option value="male">男</Option>
                    <Option value="female">女</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="grade" label="年级">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="className" label="班级">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="testDate" label="测试日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider orientation="left">考生状态</Divider>
            
            <Form.Item name="isExempt" valuePropName="checked">
              <Checkbox>免测/缺考</Checkbox>
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.isExempt !== currentValues.isExempt}
            >
              {({ getFieldValue }) => {
                const isExempt = getFieldValue('isExempt')
                if (!isExempt) return null
                return (
                  <Form.Item name="exemptReason" label="免测原因" rules={[{ required: true, message: '请选择免测原因' }]}>
                    <Select placeholder="选择免测原因" style={{ width: 200 }}>
                      <Option value="伤病免测">伤病免测</Option>
                      <Option value="残疾免测">残疾免测</Option>
                      <Option value="缺考">缺考</Option>
                      <Option value="其他">其他</Option>
                    </Select>
                  </Form.Item>
                )
              }}
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.isExempt !== currentValues.isExempt || 
                prevValues.grade !== currentValues.grade ||
                prevValues.gender !== currentValues.gender
              }
            >
              {({ getFieldValue }) => {
                const isExempt = getFieldValue('isExempt')
                if (isExempt) return null
                
                const grade = getFieldValue('grade') || selectedRecord?.grade
                const gender = getFieldValue('gender') || selectedRecord?.gender
                const items = getVisibleTestItems(grade, gender)
                
                return (
                  <>
                    <Divider orientation="left">测试项目成绩</Divider>
                    <Row gutter={16}>
                      {items.map(item => (
                        <Col span={8} key={item.code}>
                          <Form.Item 
                            name={item.code} 
                            label={item.name}
                          >
                            <Input placeholder="输入成绩" />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                  </>
                )
              }}
            </Form.Item>
            
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="输入备注信息" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    )
  } catch (err) {
    console.error('[ScoreManagement] Render error:', err)
    console.error('[ScoreManagement] Error stack:', err.stack)
    throw err
  }
}

console.log('[ScoreManagement.jsx] Module loaded')
export default ScoreManagement
