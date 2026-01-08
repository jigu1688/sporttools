import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Button, Modal, Form, DatePicker, Select, Space, Typography, message, Calendar, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setSchedules, addSchedule, updateSchedule, deleteSchedule, setVenues, setSportsMeets, setEvents, setReferees, setRegistrations } from '../../store/sportsMeetSlice'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SportsMeetScheduling = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // 分组管理相关状态
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState(null)
  const [groups, setGroups] = useState([])
  
  // 批量操作相关状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  
  const dispatch = useDispatch()
  const { sportsMeets, events, schedules, registrations, referees, venues } = useSelector(state => state.sportsMeet)
  
  // 初始化模拟数据
  useEffect(() => {
    // 初始化运动会信息
    if (sportsMeets.length === 0) {
      const mockSportsMeets = [
        {
          id: '1',
          name: '2026年春季运动会',
          startDate: '2026-04-15',
          endDate: '2026-04-16',
          status: '筹备中',
          description: '小学春季田径运动会'
        }
      ]
      dispatch(setSportsMeets(mockSportsMeets))
    }
    
    // 初始化项目信息
    if (events.length === 0) {
      const mockEvents = [
        { id: '1', name: '50米跑', type: '径赛', description: '短跑项目', isTeamEvent: false },
        { id: '2', name: '100米跑', type: '径赛', description: '短跑项目', isTeamEvent: false },
        { id: '3', name: '200米跑', type: '径赛', description: '短跑项目', isTeamEvent: false },
        { id: '4', name: '400米跑', type: '径赛', description: '中长跑项目', isTeamEvent: false },
        { id: '5', name: '跳远', type: '田赛', description: '跳跃项目', isTeamEvent: false },
        { id: '6', name: '跳高', type: '田赛', description: '跳跃项目', isTeamEvent: false },
        { id: '7', name: '铅球', type: '田赛', description: '投掷项目', isTeamEvent: false },
        { id: '8', name: '4x100米接力', type: '径赛', description: '接力项目', isTeamEvent: true, teamSize: 4 },
        { id: '9', name: '班级迎面接力', type: '径赛', description: '团体项目', isTeamEvent: true, teamSize: 10 },
        { id: '10', name: '拔河比赛', type: '径赛', description: '团体项目', isTeamEvent: true, teamSize: 12 }
      ]
      dispatch(setEvents(mockEvents))
    }
    
    // 初始化裁判信息
    if (referees.length === 0) {
      const mockReferees = [
        { id: '1', name: '张三', position: '主裁判' },
        { id: '2', name: '李四', position: '副裁判' },
        { id: '3', name: '王五', position: '助理裁判' }
      ]
      dispatch(setReferees(mockReferees))
    }
    
    // 初始化报名信息
    if (registrations.length === 0) {
      // 模拟精简的报名信息，减少数据量
      const mockRegistrations = []
      const sportsMeetId = '1'
      const events = ['1', '2', '3', '4', '5'] // 只生成5个项目
      const grades = ['1', '2', '3'] // 只生成3个年级
      const classesPerGrade = 2 // 每个年级2个班
      const studentsPerClassPerEvent = 2 // 每个班每个性别每个项目2人
      const genders = ['男'] // 只生成男生数据
      
      let id = 1
      grades.forEach(grade => {
        events.forEach(eventId => {
          for (let classNum = 1; classNum <= classesPerGrade; classNum++) {
            const className = classNum.toString()
            genders.forEach(gender => {
              for (let i = 0; i < studentsPerClassPerEvent; i++) {
                mockRegistrations.push({
                  id: id.toString(),
                  sportsMeetId: sportsMeetId,
                  eventId: eventId,
                  studentName: `${grade}年级${className}班${gender === '男' ? '男' : '女'}生${i+1}`,
                  className: className,
                  grade: grade,
                  gender: gender,
                  competitionNumber: `${grade}${className}${gender === '男' ? '1' : '2'}${(i+1) % 10}`,
                  status: '已通过',
                  createdAt: '2026-01-05',
                  reviewedAt: '2026-01-06',
                  reviewedBy: '系统管理员',
                  reviewNotes: '审核通过',
                  isTeamEvent: eventId >= '8' // 项目8-10为团体项目
                })
                id++
              }
            })
          }
        })
      })
      
      dispatch(setRegistrations(mockRegistrations))
    }
    
    // 初始化场馆数据
    if (venues.length === 0) {
      const mockVenues = [
        { id: '1', name: '田径场1号跑道', type: 'track', capacity: 8 },
        { id: '2', name: '田径场2号跑道', type: 'track', capacity: 8 },
        { id: '3', name: '跳远沙坑', type: 'field', capacity: 1 },
        { id: '4', name: '铅球场地', type: 'field', capacity: 1 },
        { id: '5', name: '篮球场1', type: 'court', capacity: 2 },
        { id: '6', name: '篮球场2', type: 'court', capacity: 2 }
      ]
      dispatch(setVenues(mockVenues))
    }
  }, [sportsMeets, events, referees, registrations, venues, dispatch])
  
  // 初始化模拟日程数据（仅在没有自动生成的赛程时使用）
  useEffect(() => {
    if (schedules.length === 0 && registrations.length > 0) {
      // 如果有报名信息但没有赛程，自动生成赛程
      // 这里不直接调用handleAutoSchedule，避免多次触发
    }
  }, [schedules, registrations, dispatch])
  
  // 显示创建/编辑模态框
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      // 直接使用原始数据，避免类型转换问题
      form.setFieldsValue({
        sportsMeetId: record.sportsMeetId,
        eventId: record.eventId,
        date: record.date, // 直接使用字符串格式
        startTime: record.startTime,
        endTime: record.endTime,
        venue: record.venue,
        裁判: record.裁判,
        groupCount: record.groupCount, // 直接使用数字格式
        status: record.status
      })
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }
  
  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingId(null)
    form.resetFields()
  }
  
  // 检查时间冲突的通用函数
  const checkTimeConflict = (fieldName, fieldValue, values, editingId) => {
    const { date, startTime, endTime } = values
    
    // 检查同一字段值在同一时间是否已经被分配到其他项目
    const conflictSchedule = schedules.find(schedule => {
      // 排除正在编辑的当前日程
      if (editingId && schedule.id === editingId) return false
      
      // 检查是否为同一字段值
      if (schedule[fieldName] !== fieldValue) return false
      
      // 检查是否为同一天
      if (schedule.date !== date) return false
      
      // 检查时间是否重叠
      const scheduleStart = new Date(`2000-01-01T${schedule.startTime}`)
      const scheduleEnd = new Date(`2000-01-01T${schedule.endTime}`)
      const currentStart = new Date(`2000-01-01T${startTime}`)
      const currentEnd = new Date(`2000-01-01T${endTime}`)
      
      return currentStart < scheduleEnd && currentEnd > scheduleStart
    })
    
    return conflictSchedule
  }
  
  // 检查裁判时间冲突
  const checkRefereeConflict = (values, editingId) => {
    return checkTimeConflict('裁判', values.裁判, values, editingId)
  }
  
  // 检查场馆时间冲突
  const checkVenueConflict = (values, editingId) => {
    return checkTimeConflict('venue', values.venue, values, editingId)
  }
  
  // 检测所有赛程中的冲突 - 优化版本
  const [conflicts, setConflicts] = useState([])
  const [conflictingIds, setConflictingIds] = useState([])
  
  // 仅当schedules变化时才检测冲突
  useEffect(() => {
    if (schedules.length === 0) {
      setConflicts([])
      setConflictingIds([])
      return
    }
    
    // 限制检测冲突的赛程数量，避免性能问题
    const maxCheckSchedules = 1000
    const schedulesToCheck = schedules.slice(0, maxCheckSchedules)
    
    const detectConflicts = () => {
      const tempConflicts = []
      const tempConflictingIds = new Set()
      
      // 检查每对赛程之间的冲突
      for (let i = 0; i < schedulesToCheck.length; i++) {
        for (let j = i + 1; j < schedulesToCheck.length; j++) {
          const schedule1 = schedulesToCheck[i]
          const schedule2 = schedulesToCheck[j]
          
          // 检查是否为同一天
          if (schedule1.date !== schedule2.date) continue
          
          // 检查时间是否重叠
          const time1Start = new Date(`2000-01-01T${schedule1.startTime}`)
          const time1End = new Date(`2000-01-01T${schedule1.endTime}`)
          const time2Start = new Date(`2000-01-01T${schedule2.startTime}`)
          const time2End = new Date(`2000-01-01T${schedule2.endTime}`)
          
          const isTimeOverlap = time1Start < time2End && time1End > time2Start
          
          if (isTimeOverlap) {
            // 检查裁判冲突
            if (schedule1.裁判 === schedule2.裁判) {
              tempConflicts.push({
                id1: schedule1.id,
                id2: schedule2.id,
                type: '裁判冲突',
                reason: `裁判 ${schedule1.裁判} 在 ${schedule1.date} ${schedule1.startTime}-${schedule1.endTime} 时间段同时执裁 ${schedule1.eventName} 和 ${schedule2.eventName}`
              })
              tempConflictingIds.add(schedule1.id)
              tempConflictingIds.add(schedule2.id)
            }
            
            // 检查场馆冲突
            if (schedule1.venue === schedule2.venue) {
              tempConflicts.push({
                id1: schedule1.id,
                id2: schedule2.id,
                type: '场馆冲突',
                reason: `场馆 ${schedule1.venue} 在 ${schedule1.date} ${schedule1.startTime}-${schedule1.endTime} 时间段同时安排 ${schedule1.eventName} 和 ${schedule2.eventName}`
              })
              tempConflictingIds.add(schedule1.id)
              tempConflictingIds.add(schedule2.id)
            }
          }
        }
      }
      
      // 限制显示的冲突数量，避免页面崩溃
      setConflicts(tempConflicts.slice(0, 100))
      setConflictingIds(Array.from(tempConflictingIds))
    }
    
    // 使用setTimeout避免阻塞主线程
    setTimeout(detectConflicts, 0)
  }, [schedules])
  
  // 获取冲突信息（直接返回状态，不再重新计算）
  const getConflictInfo = () => {
    return conflicts
  }
  
  // 获取有冲突的赛程ID列表（直接返回状态，不再重新计算）
  const getConflictingScheduleIds = () => {
    return conflictingIds
  }
  
  // 批量删除功能
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的赛程')
      return
    }
    
    Modal.confirm({
      title: '确认批量删除',
      content: `您确定要删除选中的 ${selectedRowKeys.length} 条赛程吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        selectedRowKeys.forEach(id => {
          dispatch(deleteSchedule(id))
        })
        message.success(`成功删除 ${selectedRowKeys.length} 条赛程`)
        setSelectedRowKeys([])
      }
    })
  }
  
  // 批量导出功能
  const handleBatchExport = () => {
    if (schedules.length === 0) {
      message.warning('没有可导出的数据')
      return
    }
    
    // 生成CSV格式数据
    const headers = ['项目名称', '日期', '开始时间', '结束时间', '场地', '裁判', '组数', '状态']
    const csvContent = [
      headers.join(','),
      ...schedules.map(schedule => [
        schedule.eventName,
        schedule.date,
        schedule.startTime,
        schedule.endTime,
        schedule.venue,
        schedule.裁判,
        schedule.groupCount,
        schedule.status
      ].join(','))
    ].join('\n')
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `运动会赛程_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('赛程导出成功')
    }
  }
  
  // 选择行变化时的回调
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }
  
  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }
  
  // 保存日程安排
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        // 检查裁判时间冲突
        const refereeConflictSchedule = checkRefereeConflict(values, editingId)
        if (refereeConflictSchedule) {
          message.error(`裁判 ${values.裁判} 在 ${values.date} ${values.startTime}-${values.endTime} 时间段已被分配到项目 ${refereeConflictSchedule.eventName}`)
          return
        }
        
        // 检查场馆时间冲突
        const venueConflictSchedule = checkVenueConflict(values, editingId)
        if (venueConflictSchedule) {
          message.error(`场馆 ${values.venue} 在 ${values.date} ${values.startTime}-${values.endTime} 时间段已被分配到项目 ${venueConflictSchedule.eventName}`)
          return
        }
        
        const event = events.find(e => e.id === values.eventId)
        
        // 为手动编排的赛程生成groupDetails，确保与自动编排数据结构一致
        const eventRegistrations = registrations.filter(reg => 
          reg.eventId === values.eventId && 
          reg.sportsMeetId === values.sportsMeetId &&
          reg.status === '已通过'
        )
        
        // 按班级分组，确保每个班级的运动员都被正确分配
        const classRegistrations = {}
        eventRegistrations.forEach(reg => {
          if (!classRegistrations[reg.className]) {
            classRegistrations[reg.className] = []
          }
          classRegistrations[reg.className].push(reg)
        })
        
        // 提取所有班级
        const allClasses = Object.keys(classRegistrations).sort()
        
        const scheduleData = {
          sportsMeetId: values.sportsMeetId,
          eventId: values.eventId,
          eventName: event?.name || '',
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          venue: values.venue,
          裁判: values.裁判,
          groupCount: values.groupCount,
          status: values.status || '已安排',
          // 添加groupDetails字段，与自动编排保持一致
          groupDetails: {
            classes: allClasses,
            athletes: eventRegistrations,
            totalAthletes: eventRegistrations.length
          }
        }
        
        if (editingId) {
          // 更新日程
          dispatch(updateSchedule({ ...scheduleData, id: editingId }))
          message.success('日程更新成功')
        } else {
          // 创建日程
          const newSchedule = { ...scheduleData, id: Date.now().toString() }
          dispatch(addSchedule(newSchedule))
          message.success('日程创建成功')
        }
        
        setIsModalVisible(false)
        setEditingId(null)
        form.resetFields()
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 删除日程
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个日程安排吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteSchedule(id))
        message.success('日程删除成功')
      }
    })
  }
  
  // 小学田径运动会智能自动编排功能
  const handleAutoSchedule = () => {
    // 检查运动会状态，只有编排中才能进行自动编排
    const selectedSportsMeet = sportsMeets[0]
    if (!selectedSportsMeet) {
      message.error('请先添加运动会信息')
      return
    }
    
    // 如果运动会状态不是编排中，尝试设置为编排中
    if (selectedSportsMeet.status !== '编排中') {
      message.warning(`当前运动会状态为"${selectedSportsMeet.status}"，正在设置为"编排中"以便进行自动编排`)
      // 更新运动会状态为编排中
      const updatedSportsMeet = {
        ...selectedSportsMeet,
        status: '编排中'
      }
      dispatch(updateSportsMeet(updatedSportsMeet))
      // 使用更新后的运动会信息
      selectedSportsMeet.status = '编排中'
    }
    
    Modal.confirm({
      title: '自动编排',
      content: '系统将根据年级、性别、班级报名人数自动生成符合小学田径运动会规则的比赛日程，每组由各班一名选手组成。是否继续？',
      okText: '确认',
      okType: 'primary',
      cancelText: '取消',
      onOk: () => {
        // 实现小学田径运动会智能自动编排算法
        if (events.length === 0 || registrations.length === 0) {
          message.error('请先添加项目和报名信息')
          return
        }
        
        // 智能编排核心逻辑
        const autoSchedules = []
        
        // console.log('=== 开始自动编排 ===')
        // console.log('运动会信息:', selectedSportsMeet)
        // console.log('可用项目数:', events.length)
        // console.log('可用报名数:', registrations.length)
        // console.log('可用场馆数:', venues.length)
        // console.log('可用裁判数:', referees.length)
        
        // 按项目类型（田赛在前，径赛在后）和项目名称排序
        const sortedEvents = [...events].sort((a, b) => {
          // 项目类型优先级：田赛 < 径赛 < 其他
          const typeOrder = { '田赛': 0, '径赛': 1, '其他': 2 }
          const typeA = typeOrder[a.type || '其他']
          const typeB = typeOrder[b.type || '其他']
          
          if (typeA !== typeB) {
            return typeA - typeB
          }
          // 同一类型按项目名称排序
          return a.name.localeCompare(b.name)
        })
        
        // console.log('排序后的项目:', sortedEvents.map(e => e.name))
        
        // 统计所有参赛年级
        const allGrades = [...new Set(registrations.map(reg => reg.grade))].sort()
        
        // console.log('参赛年级:', allGrades)
        
        // 初始化时间调度器，避免时间冲突
        const timeScheduler = {
          venues: {}, // 场馆使用时间记录
          referees: {}, // 裁判使用时间记录
          athletes: {} // 运动员使用时间记录，用于体力分配
        }
        
        // 体力分配配置
        const physicalStrengthConfig = {
          minimumRestTime: 60, // 最小休息时间（分钟）
          maximumConsecutiveEvents: 1 // 最大连续比赛项目数
        }
        
        // 遍历所有年级
        allGrades.forEach(grade => {
          // console.log(`\n--- 处理年级 ${grade} ---`)
          
          // 遍历所有项目
          sortedEvents.forEach(event => {
            // console.log(`  处理项目: ${event.name} (ID: ${event.id})`)
            
            // 按性别分别处理 - 优化版本
            const genders = ['男', '女'].filter(gender => {
              // 先检查该性别的报名人数，只处理有报名的性别
              const hasRegistrations = registrations.some(reg => 
                reg.eventId === event.id && 
                reg.sportsMeetId === selectedSportsMeet.id &&
                reg.grade === grade &&
                (reg.gender === gender || reg.gender === (gender === '男' ? 'male' : 'female')) &&
                reg.status === '已通过'
              )
              return hasRegistrations
            })
            
            genders.forEach(gender => {
              // console.log(`    处理性别: ${gender}`)
              
              // 统计该年级该项目该性别的报名信息，只包含已通过审核的报名
              const eventRegistrations = registrations.filter(reg => {
                const match = 
                  reg.eventId === event.id && 
                  reg.sportsMeetId === selectedSportsMeet.id &&
                  reg.grade === grade &&
                  (reg.gender === gender || reg.gender === (gender === '男' ? 'male' : 'female')) &&
                  reg.status === '已通过'
                return match
              })
              
              // console.log(`    报名人数: ${eventRegistrations.length}`)
              
              // 统计每个班级的报名人数
              const classCounts = {} // { className: count }
              eventRegistrations.forEach(reg => {
                classCounts[reg.className] = (classCounts[reg.className] || 0) + 1
              })
              
              // 获取所有参赛班级
              const allClasses = classCounts ? Object.keys(classCounts).sort() : []
              const totalClasses = allClasses.length
              
              // console.log(`    参赛班级: ${allClasses ? allClasses.join(', ') : '无'}`)
              // console.log(`    班级报名数:`, classCounts)
              
              // 计算组数：组数等于各班报名人数的最大值
              const classCountValues = Object.values(classCounts)
              const groupCount = classCountValues.length > 0 ? Math.max(...classCountValues) : 0
              
              // console.log(`    组数: ${groupCount}`)
              
              // 按班级分组报名信息
              const classRegistrations = {} // { className: [registrations] }
              eventRegistrations.forEach(reg => {
                if (!classRegistrations[reg.className]) {
                  classRegistrations[reg.className] = []
                }
                classRegistrations[reg.className].push(reg)
              })
              
              // console.log(`    按班级分组的报名信息:`, Object.keys(classRegistrations).map(cls => `${cls}: ${classRegistrations[cls].length}人`))
              
              // 根据项目类型选择合适的场馆
              const suitableVenues = venues.filter(v => 
                (event.type === '径赛' && v.type === 'track') ||
                (event.type === '田赛' && v.type === 'field') ||
                v.type === 'court'
              )
              
              // 为每个组生成赛程
              for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
                // 分配场馆（避免冲突）
                let assignedVenue = null
                for (const venue of suitableVenues) {
                  // 检查场馆是否可用
                  if (!timeScheduler.venues[venue.name]) {
                    timeScheduler.venues[venue.name] = []
                  }
                  assignedVenue = venue
                  break
                }
                
                if (!assignedVenue) {
                  assignedVenue = venues[0] // 默认使用第一个场馆
                }
                
                // 分配裁判（避免冲突）
                let assignedReferee = null
                for (const referee of referees) {
                  // 检查裁判是否可用
                  if (!timeScheduler.referees[referee.name]) {
                    timeScheduler.referees[referee.name] = []
                  }
                  assignedReferee = referee
                  break
                }
                
                if (!assignedReferee) {
                  // 如果没有裁判数据，使用默认值
                  assignedReferee = { name: '默认裁判' }
                }
                
                // 计算比赛时间，考虑体力分配
                const baseHour = 9
                const baseMinute = 0
                let totalMinutesPassed = groupIndex * 30
                
                // 检查该组运动员的休息时间，确保有足够的休息
                const groupAthletes = allClasses.map(className => {
                  // 确保班级存在且有该组的运动员
                  if (classRegistrations[className] && classRegistrations[className][groupIndex]) {
                    return classRegistrations[className][groupIndex]
                  }
                  return null
                }).filter(Boolean)
                
                // 检查每个运动员的上一场比赛结束时间
                let requiredRestTime = 0
                groupAthletes.forEach(athlete => {
                  if (timeScheduler.athletes[athlete.id]) {
                    const lastEvent = timeScheduler.athletes[athlete.id].slice(-1)[0]
                    if (lastEvent) {
                      const lastEndTime = new Date(`2000-01-01T${lastEvent.endTime}`)
                      const plannedStartTime = new Date(`2000-01-01T${formatTime(baseHour + Math.floor((baseMinute + totalMinutesPassed) / 60), (baseMinute + totalMinutesPassed) % 60)}`)
                      const restTime = plannedStartTime - lastEndTime
                      const restTimeMinutes = restTime / (1000 * 60)
                      
                      if (restTimeMinutes < physicalStrengthConfig.minimumRestTime) {
                        // 需要增加休息时间
                        const neededRest = physicalStrengthConfig.minimumRestTime - restTimeMinutes
                        requiredRestTime = Math.max(requiredRestTime, neededRest)
                      }
                    }
                  }
                })
                
                // 调整总时间，确保足够的休息
                if (requiredRestTime > 0) {
                  totalMinutesPassed += Math.ceil(requiredRestTime)
                }
                
                // 计算最终的开始和结束时间
                const startHour = baseHour + Math.floor((baseMinute + totalMinutesPassed) / 60)
                const startMinute = (baseMinute + totalMinutesPassed) % 60
                const endHour = startHour + Math.floor((startMinute + 30) / 60)
                const endMinute = (startMinute + 30) % 60
                
                // 格式化时间字符串
                const formatTime = (hour, minute) => {
                  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                }
                
                const startTime = formatTime(startHour, startMinute)
                const endTime = formatTime(endHour, endMinute)
                
                // 生成赛程对象
                const schedule = {
                  id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
                  sportsMeetId: selectedSportsMeet.id,
                  eventId: event.id,
                  eventName: event.name,
                  grade: grade,
                  gender: gender,
                  groupName: `第${groupIndex + 1}组`,
                  groupCount: groupCount,
                  date: selectedSportsMeet.startDate,
                  startTime: startTime,
                  endTime: endTime,
                  venue: assignedVenue.name,
                  裁判: assignedReferee.name,
                  status: '已安排',
                  // 保存该组的详细信息，便于后续查看和编辑
                  groupDetails: {
                    classes: allClasses,
                    athletes: allClasses.map(className => {
                      // 获取该班级该组的运动员，严格遵循各班一人原则
                      // 例如：班级1有3人报名，那么第1组取第0个，第2组取第1个，第3组取第2个
                      // 确保班级存在且有该组的运动员
                      if (classRegistrations[className] && classRegistrations[className][groupIndex]) {
                        return classRegistrations[className][groupIndex]
                      }
                      return null
                    }).filter(Boolean),
                    totalAthletes: allClasses.map(className => {
                      // 确保班级存在且有该组的运动员
                      if (classRegistrations[className] && classRegistrations[className][groupIndex]) {
                        return classRegistrations[className][groupIndex]
                      }
                      return null
                    }).filter(Boolean).length
                  }
                }
                
                autoSchedules.push(schedule)
                
                // 记录场馆和裁判的使用时间，避免后续冲突
                if (!timeScheduler.venues[assignedVenue.name]) {
                  timeScheduler.venues[assignedVenue.name] = []
                }
                timeScheduler.venues[assignedVenue.name].push({
                  date: selectedSportsMeet.startDate,
                  startTime: startTime,
                  endTime: endTime
                })
                
                if (assignedReferee.name !== '默认裁判') {
                  if (!timeScheduler.referees[assignedReferee.name]) {
                    timeScheduler.referees[assignedReferee.name] = []
                  }
                  timeScheduler.referees[assignedReferee.name].push({
                    date: selectedSportsMeet.startDate,
                    startTime: startTime,
                    endTime: endTime
                  })
                }
                
                // 记录运动员的比赛时间，用于后续体力分配
                groupAthletes.forEach(athlete => {
                  if (!timeScheduler.athletes[athlete.id]) {
                    timeScheduler.athletes[athlete.id] = []
                  }
                  timeScheduler.athletes[athlete.id].push({
                    date: selectedSportsMeet.startDate,
                    startTime: startTime,
                    endTime: endTime,
                    eventId: event.id,
                    eventName: event.name,
                    scheduleId: schedule.id
                  })
                })
              }
            })
          })
        })
        
        // 保存自动生成的赛程
        // console.log('\n=== 自动编排完成 ===')
        // console.log('生成赛程总数:', autoSchedules.length)
        
        if (autoSchedules.length === 0) {
          message.warning('自动编排完成，但未生成任何赛程。请检查报名数据是否符合条件，或查看浏览器控制台获取详细信息')
        } else {
          dispatch(setSchedules(autoSchedules))
          message.success('自动编排完成，共生成 ' + autoSchedules.length + ' 个赛程')
        }
      }
    })
  }
  
  // 打开分组管理模态框
  const showGroupModal = (schedule) => {
    setCurrentSchedule(schedule)
    
    // 获取该项目的报名学生
    const eventRegistrations = registrations.filter(reg => reg.eventId === schedule.eventId && reg.sportsMeetId === schedule.sportsMeetId)
    
    // 如果已有分组，使用现有分组；否则初始化分组
    if (schedule.groups && schedule.groups.length > 0) {
      setGroups(schedule.groups)
    } else if (schedule.groupDetails && schedule.groupDetails.athletes && schedule.groupDetails.athletes.length > 0) {
      // 优先使用自动编排生成的 groupDetails 数据
      const event = events.find(e => e.id === schedule.eventId)
      const initialGroups = []
      
      if (event && event.isTeamEvent) {
        // 团体项目：按班级分组
        const classTeams = {}
        schedule.groupDetails.athletes.forEach(athlete => {
          if (athlete) {
            if (!classTeams[athlete.className]) {
              classTeams[athlete.className] = []
            }
            classTeams[athlete.className].push(athlete)
          }
        })
        
        Object.keys(classTeams).forEach((className, index) => {
          initialGroups.push({
            groupId: `${schedule.id}-group-${index+1}`,
            groupName: `${className}班团队`,
            athletes: classTeams[className],
            isTeam: true,
            className: className,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || ''
          })
        })
      } else {
        // 个人项目：根据 groupDetails 生成每组运动员
        const { athletes, classes } = schedule.groupDetails
        const groupCount = schedule.groupCount
        
        // 还原自动编排时的分组逻辑：每组包含各班的第groupIndex个运动员
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
          // 获取该组的运动员：每个班级的第groupIndex个运动员
          const groupAthletes = athletes.filter((athlete, idx) => {
            if (!athlete) return false
            // 运动员在数组中的索引idx对应它所在的班级在classes中的索引
            // 而classes中的索引就是组号
            return idx === groupIndex
          })
          
          initialGroups.push({
            groupId: `${schedule.id}-group-${groupIndex+1}`,
            groupName: `第${groupIndex+1}组`,
            athletes: groupAthletes,
            isTeam: false,
            className: '',
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || ''
          })
        }
      }
      
      setGroups(initialGroups)
    } else {
      // 根据项目类型初始化分组
      const event = events.find(e => e.id === schedule.eventId)
      const initialGroups = []
      
      if (event && event.isTeamEvent) {
        // 团体项目：按班级分组，每个班级一个团队
        const classTeams = {}
        eventRegistrations.forEach(reg => {
          if (!classTeams[reg.className]) {
            classTeams[reg.className] = []
          }
          classTeams[reg.className].push(reg)
        })
        
        // 为每个班级创建一个分组
        Object.keys(classTeams).forEach((className, index) => {
          initialGroups.push({
            groupId: `${schedule.id}-group-${index+1}`,
            groupName: `${className}班团队`,
            athletes: classTeams[className],
            isTeam: true,
            className: className,
            startTime: '',
            endTime: ''
          })
        })
      } else {
        // 个人项目：初始化空分组
        for (let i = 0; i < schedule.groupCount; i++) {
          initialGroups.push({
            groupId: `${schedule.id}-group-${i+1}`,
            groupName: `第${i+1}组`,
            athletes: [],
            isTeam: false,
            startTime: '',
            endTime: ''
          })
        }
      }
      
      setGroups(initialGroups)
    }
    
    setIsGroupModalVisible(true)
  }
  
  // 关闭分组管理模态框
  const handleGroupCancel = () => {
    setIsGroupModalVisible(false)
    setCurrentSchedule(null)
    setGroups([])
  }
  
  // 随机生成分组（确保每组每班只有1人参加）
  const generateRandomGroups = () => {
    if (!currentSchedule) return
    
    // 获取该项目的报名学生
    const eventRegistrations = registrations.filter(reg => reg.eventId === currentSchedule.eventId && reg.sportsMeetId === currentSchedule.sportsMeetId)
    
    // 按班级和性别分组
    const classGenderGroups = {}
    eventRegistrations.forEach(reg => {
      const key = `${reg.className}-${reg.gender}`
      if (!classGenderGroups[key]) {
        classGenderGroups[key] = []
      }
      classGenderGroups[key].push(reg)
    })
    
    // 计算实际需要的组数：组数等于各班报名人数的最大值
    const groupCount = Math.max(...Object.values(classGenderGroups).map(group => group.length))
    
    // 为每个班级的每个性别随机排序运动员
    Object.keys(classGenderGroups).forEach(key => {
      classGenderGroups[key] = [...classGenderGroups[key]].sort(() => Math.random() - 0.5)
    })
    
    const newGroups = []
    
    // 生成指定数量的组
    for (let i = 0; i < currentSchedule.groupCount; i++) {
      const groupAthletes = []
      
      // 从每个班级的每个性别中选择一名运动员加入当前组
      Object.values(classGenderGroups).forEach(classGroup => {
        if (i < classGroup.length) {
          groupAthletes.push(classGroup[i])
        }
      })
      
      newGroups.push({
        groupId: `${currentSchedule.id}-group-${i+1}`,
        groupName: `第${i+1}组`,
        athletes: groupAthletes,
        startTime: '',
        endTime: ''
      })
    }
    
    setGroups(newGroups)
    message.success('分组已生成')
  }
  
  // 保存分组
  const saveGroups = () => {
    if (!currentSchedule) return
    
    // 更新赛程数据，添加分组信息
    const updatedSchedule = {
      ...currentSchedule,
      groups: groups
    }
    
    dispatch(updateSchedule(updatedSchedule))
    message.success('分组保存成功')
    setIsGroupModalVisible(false)
    setCurrentSchedule(null)
    setGroups([])
  }
  
  // 视图切换相关状态
  const [activeView, setActiveView] = useState('table')
  
  // 表格列配置
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'eventName',
      key: 'eventName',
      width: 150,
      ellipsis: true,
      tooltip: (text) => text
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      filters: [
        { text: '一年级', value: '1' },
        { text: '二年级', value: '2' },
        { text: '三年级', value: '3' },
        { text: '四年级', value: '4' },
        { text: '五年级', value: '5' },
        { text: '六年级', value: '6' }
      ],
      onFilter: (value, record) => record.grade === value
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      filters: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
        { text: '团体', value: '团体' }
      ],
      onFilter: (value, record) => record.gender === value
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
      width: 150,
      render: (startTime, record) => `${startTime} - ${record.endTime}`
    },
    {
      title: '场地',
      dataIndex: 'venue',
      key: 'venue',
      width: 150,
      ellipsis: true,
      tooltip: (text) => text
    },
    {
      title: '裁判',
      dataIndex: '裁判',
      key: '裁判',
      width: 100,
      ellipsis: true,
      tooltip: (text) => text
    },
    {
      title: '分组',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 80
    },
    {
      title: '组数',
      dataIndex: 'groupCount',
      key: 'groupCount',
      width: 80
    },
    {
      title: '运动员数量',
      key: 'athleteCount',
      width: 100,
      render: (_, record) => {
        // 确保运动员数量正确计算
        if (record.groupDetails?.athletes) {
          return record.groupDetails.athletes.length
        }
        // 对于手动编排的赛程，尝试从报名数据中计算
        if (record.eventId && record.sportsMeetId) {
          // 根据项目和运动会ID计算报名人数
          const registrationsCount = registrations.filter(reg => 
            reg.eventId === record.eventId && 
            reg.sportsMeetId === record.sportsMeetId &&
            reg.status === '已通过'
          ).length
          return registrationsCount
        }
        return 0
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '已安排', value: '已安排' },
        { text: '进行中', value: '进行中' },
        { text: '已完成', value: '已完成' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = '#1890ff'
        if (status === '已完成') {
          color = '#52c41a'
        } else if (status === '进行中') {
          color = '#faad14'
        }
        return <Tag color={color}>{status}</Tag>
      }
    },
    {title: '操作',
    key: 'action',
    width: 320,
    render: (_, record) => (
      <Space size="middle">
        <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
          编辑
        </Button>
        <Button type="link" onClick={() => showGroupModal(record)}>
          分组管理
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          // 导航到成绩记录页面或打开成绩记录模态框
          message.info('请在成绩记录页面进行成绩录入操作');
          // 这里可以添加跳转到成绩记录页面的逻辑
        }}>
          成绩记录
        </Button>
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      </Space>
    )}
  ]
  
  // 日历视图内容渲染
  const calendarContentRender = (value) => {
    const dateString = value.format('YYYY-MM-DD')
    const daySchedules = schedules.filter(schedule => schedule.date === dateString)
    
    return (
      <div style={{ padding: 10 }}>
        {daySchedules.map(schedule => (
          <Card key={schedule.id} size="small" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>{schedule.eventName}</div>
              <div>时间: {schedule.startTime} - {schedule.endTime}</div>
              <div>场馆: {schedule.venue}</div>
              <div>裁判: {schedule.裁判}</div>
              <div>状态: {schedule.status}</div>
            </div>
          </Card>
        ))}
      </div>
    )
  }
  
  // 场馆视图渲染
  const renderVenueView = () => {
    // 按场馆分组
    const venueGroups = {};
    schedules.forEach(schedule => {
      if (!venueGroups[schedule.venue]) {
        venueGroups[schedule.venue] = [];
      }
      venueGroups[schedule.venue].push(schedule);
    });
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {Object.entries(venueGroups).map(([venueName, venueSchedules]) => (
          <Card key={venueName} title={venueName}>
            {venueSchedules.map(schedule => (
              <div key={schedule.id} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{schedule.eventName}</div>
                <div>日期: {schedule.date}</div>
                <div>时间: {schedule.startTime} - {schedule.endTime}</div>
                <div>裁判: {schedule.裁判}</div>
                <div>状态: {schedule.status}</div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div>
      <Space orientation="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>运动会编排</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          手动安排
        </Button>
        <Button type="default" icon={<CalendarOutlined />} onClick={handleAutoSchedule}>
          自动编排
        </Button>
        
        {/* 批量操作按钮 */}
        <Button 
          type="default" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          批量删除
        </Button>
        <Button 
          type="default" 
          onClick={handleBatchExport}
        >
          导出赛程
        </Button>
        <Text style={{ marginLeft: 16 }}>
          已选择 {selectedRowKeys.length} 条记录
        </Text>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>编排说明：</Text>
        <Text style={{ marginLeft: 16 }}>可以手动安排比赛日程，也可以使用自动编排功能生成初步安排后进行调整</Text>
      </div>
      
      {/* 视图切换按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space orientation="horizontal" size="small">
          <Button 
            type={activeView === 'table' ? 'primary' : 'default'} 
            onClick={() => setActiveView('table')}
          >
            表格视图
          </Button>
          <Button 
            type={activeView === 'calendar' ? 'primary' : 'default'} 
            onClick={() => setActiveView('calendar')}
          >
            日历视图
          </Button>
          <Button 
            type={activeView === 'venue' ? 'primary' : 'default'} 
            onClick={() => setActiveView('venue')}
          >
            场馆视图
          </Button>
        </Space>
      </div>
      
      {/* 冲突信息展示 */}
      {activeView === 'table' && (
        <>
          <div style={{ marginBottom: 16 }}>
            {getConflictInfo().length > 0 && (
              <Card title="冲突检测结果" type="warning" style={{ marginBottom: 16 }}>
                <div style={{ color: '#ff4d4f' }}>
                  <strong>检测到 {getConflictInfo().length} 个赛程冲突：</strong>
                  <ul style={{ marginTop: 8 }}>
                    {getConflictInfo().map((conflict, index) => (
                      <li key={index} style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 'bold' }}>{conflict.type}：</span>
                        {conflict.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
          
          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="id"
            bordered
            pagination={false}
            rowSelection={rowSelection}
            rowClassName={(record) => {
              return getConflictingScheduleIds().includes(record.id) ? 'conflict-row' : ''
            }}
            style={{
              '.conflict-row': {
                backgroundColor: '#fff2f0',
                '&:hover': {
                  backgroundColor: '#ffccc7'
                }
              }
            }}
          />
        </>
      )}
      
      {activeView === 'calendar' && (
        <Calendar
          contentRender={calendarContentRender}
          style={{ marginBottom: 24 }}
        />
      )}
      
      {activeView === 'venue' && (
        renderVenueView()
      )}
      
      {/* 创建/编辑模态框 */}
      <Modal
        title={editingId ? "编辑日程" : "手动安排日程"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '已安排'
          }}
        >
          <Form.Item
            name="sportsMeetId"
            label="选择运动会"
            rules={[{ required: true, message: '请选择运动会!' }]}
          >
            <Select placeholder="请选择运动会">
              {sportsMeets.map(meet => (
                <Option key={meet.id} value={meet.id}>{meet.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="eventId"
            label="选择项目"
            rules={[{ required: true, message: '请选择项目!' }]}
          >
            <Select placeholder="请选择项目">
              {events.map(event => (
                <Option key={event.id} value={event.id}>{event.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="date"
            label="比赛日期"
            rules={[{ required: true, message: '请选择比赛日期!' }]}
          >
            <input type="date" placeholder="请选择比赛日期" className="ant-input" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请输入开始时间!' }]}
              >
                <input type="time" placeholder="请输入开始时间" className="ant-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请输入结束时间!' }]}
              >
                <input type="time" placeholder="请输入结束时间" className="ant-input" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="venue"
            label="比赛场地"
            rules={[{ required: true, message: '请选择比赛场地!' }]}
          >
            <Select placeholder="请选择比赛场地">
              {venues.map(venue => (
                <Option key={venue.id} value={venue.name}>{venue.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="裁判"
            label="主裁判"
            rules={[{ required: true, message: '请选择主裁判!' }]}
          >
            <Select placeholder="请选择主裁判">
              {referees.map(referee => (
                <Option key={referee.id} value={referee.name}>{referee.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="groupCount"
            label="组数"
            rules={[
              { required: true, message: '请输入组数!' },
              {
                validator: (_, value) => {
                  if (value && (isNaN(Number(value)) || Number(value) < 1)) {
                    return Promise.reject(new Error('组数必须是大于0的数字'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <input type="number" placeholder="请输入组数" className="ant-input" min="1" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="已安排">已安排</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 分组管理模态框 */}
      <Modal
        title={`${currentSchedule?.eventName} - 分组管理`}
        open={isGroupModalVisible}
        onOk={saveGroups}
        onCancel={handleGroupCancel}
        width={800}
        footer={[
          <Button key="back" onClick={handleGroupCancel}>
            取消
          </Button>,
          <Button key="random" type="default" onClick={generateRandomGroups}>
            随机生成
          </Button>,
          <Button key="submit" type="primary" onClick={saveGroups}>
            保存分组
          </Button>
        ]}
      >
        {currentSchedule && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h4>项目信息</h4>
              <p>运动会：{sportsMeets.find(meet => meet.id === currentSchedule.sportsMeetId)?.name || ''}</p>
              <p>项目：{currentSchedule.eventName}</p>
              <p>比赛日期：{currentSchedule.date}</p>
              <p>场馆：{currentSchedule.venue}</p>
              <p>总报名人数：{registrations.filter(reg => reg.eventId === currentSchedule.eventId && reg.sportsMeetId === currentSchedule.sportsMeetId).length}人</p>
            </div>
            
            <div>
              <h4>分组信息</h4>
              {groups.map((group, index) => (
                <Card key={group.groupId} title={group.groupName} style={{ marginBottom: 16 }}>
                  <div>
                    <h5>运动员列表：</h5>
                    {group.athletes.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {group.athletes.map((athlete, athleteIndex) => (
                          <li key={athlete.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{athleteIndex + 1}. {athlete.studentName}</span>
                              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{athlete.competitionNumber || '-'}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              班级：{athlete.className} | 性别：{athlete.gender}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                        该组暂无运动员
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SportsMeetScheduling