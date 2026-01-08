import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button, Table, Form, DatePicker, Modal, message, Statistic, Row, Col, Tag, Space, Spin } from 'antd'
import { PlusOutlined, CheckOutlined, DeleteOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons'
import { addSchoolYear, completeSchoolYear, setCurrentSchoolYear, updateSchoolYear, deleteSchoolYear, updateSchoolYears } from '../store/dataSlice'
import dayjs from 'dayjs'
import apiClient from '../utils/apiClient'

const { confirm } = Modal
const { RangePicker } = DatePicker

const SchoolYearManagement = () => {
  const dispatch = useDispatch()
  const { schoolYears, currentSchoolYear, students, classes } = useSelector(state => state.data)
  const { user, token, isAuthenticated } = useSelector(state => state.auth)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEditId, setCurrentEditId] = useState(null)

  // 从API获取学年数据
  const fetchSchoolYears = async () => {
    setIsLoading(true)
    try {
      // 从API获取所有学年数据
      const response = await apiClient.get('/school-years')
      
      // 直接使用response，因为拦截器已经处理了response.data
      const schoolYearsData = response
      
      // 确保schoolYearsData是数组
      const processedData = Array.isArray(schoolYearsData) ? schoolYearsData : []
      
      // 更新Redux store中的学年列表
      dispatch(updateSchoolYears(processedData))
      
      // 从API获取当前活跃学年，处理没有活跃学年的情况
      try {
        const activeYearResponse = await apiClient.get('/school-years/active/current')
        const activeYear = activeYearResponse
        // 更新Redux store中的当前学年
        dispatch(setCurrentSchoolYear(activeYear))
      } catch (activeYearError) {
        // 如果没有活跃学年，不影响其他功能
        if (processedData.length > 0) {
          // 查找状态为active的学年
          const activeYear = processedData.find(year => year.status === 'active')
          if (activeYear) {
            // 如果有活跃学年，设置为当前学年
            dispatch(setCurrentSchoolYear(activeYear))
          } else {
            // 如果没有活跃学年，设置一个空的currentSchoolYear
            dispatch(setCurrentSchoolYear({
              id: null,
              year_name: '',
              start_date: '',
              end_date: '',
              status: ''
            }))
          }
        }
      }
      
      setIsLoading(false)
    } catch (error) {
      let errorMessage = '获取学年数据失败'
      if (error.response) {
        // 服务器返回了错误响应
        if (error.response.status === 401) {
          errorMessage = '认证失败，请重新登录'
          // 跳转到登录页
          window.location.href = '/login'
        } else if (error.response.status === 403) {
          errorMessage = '权限不足，无法访问学年数据'
        } else if (error.response.data) {
          errorMessage = `获取学年数据失败：${error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data)}`
        }
      } else if (error.request) {
        // 请求已发出，但没有收到响应
        errorMessage = '获取学年数据失败：服务器无响应'
      } else {
        // 请求配置有误
        errorMessage = `获取学年数据失败：${error.message}`
      }
      message.error(errorMessage)
      setIsLoading(false)
    }
  }

  // 组件加载时获取学年数据，确保在认证完成后再获取
  useEffect(() => {
    fetchSchoolYears()
  }, [])

  // 显示创建/编辑新学年弹窗
  const showModal = (record = null) => {
    if (record) {
      setIsEditMode(true)
      setCurrentEditId(record.id)
      form.setFieldsValue({
        dateRange: [dayjs(record.start_date), dayjs(record.end_date)]
      })
    } else {
      setIsEditMode(false)
      setCurrentEditId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭创建/编辑新学年弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setIsEditMode(false)
    setCurrentEditId(null)
  }

  // 创建或编辑学年
  const handleSaveSchoolYear = () => {
    form.validateFields()
      .then(values => {
        setIsLoading(true)
        const start_date = values.dateRange[0].format('YYYY-MM-DD')
        const end_date = values.dateRange[1].format('YYYY-MM-DD')
        const year_name = `${start_date.slice(0, 4)}-${end_date.slice(0, 4)}学年`
        const academic_year = `${start_date.slice(0, 4)}`
        
        const schoolYearData = {
          year_name,
          start_date,
          end_date,
          academic_year,
          status: 'inactive'
        }
        
        if (isEditMode && currentEditId) {
          // 编辑学年
          apiClient.put(`/school-years/${currentEditId}`, schoolYearData)
            .then(response => {
              message.success('学年更新成功')
              fetchSchoolYears()
              handleCancel()
            })
            .catch(error => {
              message.error('更新学年失败：' + (error.response?.data?.detail || error.message))
            })
            .finally(() => setIsLoading(false))
        } else {
          // 创建学年
          apiClient.post('/school-years', schoolYearData)
            .then(response => {
              message.success('新学年创建成功')
              fetchSchoolYears()
              handleCancel()
            })
            .catch(error => {
              message.error('创建学年失败：' + (error.response?.data?.detail || error.message))
            })
            .finally(() => setIsLoading(false))
        }
      })
      .catch(info => {
        message.error('表单验证失败：' + info)
        setIsLoading(false)
      })
  }

  // 设置当前学年
  const handleSetCurrentYear = (year) => {
    confirm({
      title: '设置当前学年',
      icon: <ExclamationCircleOutlined />,
      content: `确定要将 ${year.year_name} 设置为当前学年吗？`,
      onOk() {
        setIsLoading(true)
        apiClient.put(`/school-years/${year.id}/set-active`)
          .then(response => {
            message.success('当前学年设置成功')
            fetchSchoolYears()
            // 更新Redux store中的当前学年
            dispatch(setCurrentSchoolYear(year))
          })
          .catch(error => {
            message.error('设置当前学年失败：' + (error.response?.data?.detail || error.message))
          })
          .finally(() => setIsLoading(false))
      },
      onCancel() {
        // 取消操作
      }
    })
  }

  // 结束当前学年
  const handleCompleteYear = () => {
    if (!currentSchoolYear) {
      message.error('当前学年未设置')
      return
    }
    
    confirm({
      title: '结束当前学年',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要结束当前学年吗？</p>
          <p>此操作将：</p>
          <ul>
            <li>将当前学年学生数据归档到历史记录</li>
            <li>清空当前学生和班级数据</li>
            <li>学年状态将变为已完成</li>
          </ul>
          <p>操作不可逆，请谨慎执行！</p>
        </div>
      ),
      onOk() {
        setIsLoading(true)
        apiClient.put(`/school-years/${currentSchoolYear.id}/complete`)
          .then(response => {
            message.success('学年结束操作成功')
            // 刷新学年数据，包括更新currentSchoolYear
            fetchSchoolYears()
          })
          .catch(error => {
            message.error('结束学年失败：' + (error.response?.data?.detail || error.message))
          })
          .finally(() => setIsLoading(false))
      },
      onCancel() {
        // 取消操作
      }
    })
  }

  // 删除学年
  const handleDeleteYear = (year) => {
    confirm({
      title: '删除学年',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除 ${year.year_name} 吗？此操作将删除该学年的所有相关数据，包括班级和学生关联。`,
      onOk() {
        setIsLoading(true)
        apiClient.delete(`/school-years/${year.id}`)
          .then(response => {
            message.success('学年删除成功')
            fetchSchoolYears()
            // 更新Redux store
            dispatch(deleteSchoolYear(year.id))
          })
          .catch(error => {
            message.error('删除学年失败：' + (error.response?.data?.detail || error.message))
          })
          .finally(() => setIsLoading(false))
      },
      onCancel() {
        // 取消操作
      }
    })
  }

  // 表格列配置
  const columns = [
    {
      title: '学年名称',
      dataIndex: 'year_name',
      key: 'year_name',
      width: 180
    },
    {
      title: '起始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      render: (start_date) => start_date ? dayjs(start_date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
      render: (end_date) => end_date ? dayjs(end_date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'completed' ? 'red' : 'blue'}>
          {status === 'active' ? '当前' : status === 'completed' ? '已完成' : '未激活'}
        </Tag>
      )
    },
    {
      title: '导入时间',
      dataIndex: 'imported_at',
      key: 'imported_at',
      width: 160,
      render: (imported_at) => imported_at ? dayjs(imported_at).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '导入人',
      dataIndex: 'imported_by',
      key: 'imported_by',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          {record.status !== 'active' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={() => handleSetCurrentYear(record)}
            >
              设置为当前
            </Button>
          )}
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="danger" 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteYear(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  // 筛选出非当前学年的数据
  const historyYears = schoolYears.filter(year => {
    // 如果currentSchoolYear.id为null或undefined，返回true（显示所有学年）
    if (!currentSchoolYear.id) {
      return true
    }
    // 否则，返回非当前学年的数据
    return year.id !== currentSchoolYear.id
  })
  
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>学年管理</h1>
      
      {/* 当前学年信息卡片 */}
      <Card title="当前学年信息" style={{ marginBottom: 24 }}>
        <Spin spinning={!currentSchoolYear || isLoading} tip="加载中...">
          {currentSchoolYear && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="学年名称" value={currentSchoolYear.year_name} />
                </Col>
                <Col span={8}>
                  <Statistic title="起始日期" value={currentSchoolYear.start_date ? dayjs(currentSchoolYear.start_date).format('YYYY-MM-DD') : '-'} />
                </Col>
                <Col span={8}>
                  <Statistic title="结束日期" value={currentSchoolYear.end_date ? dayjs(currentSchoolYear.end_date).format('YYYY-MM-DD') : '-'} />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="学生数量" 
                    value={students.length} 
                    suffix="人"
                    styles={{ content: { color: '#3f8600' } }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="班级数量" 
                    value={classes.length} 
                    suffix="个"
                    styles={{ content: { color: '#1890ff' } }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="学年状态" 
                    value={currentSchoolYear.status === 'active' ? '当前' : '已完成'}
                    styles={{ content: { color: currentSchoolYear.status === 'active' ? '#3f8600' : '#722ed1' } }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleCompleteYear}
                  disabled={students.length === 0}
                >
                  结束当前学年
                </Button>
              </div>
            </>
          )}
        </Spin>
      </Card>

      {/* 操作栏和历史学年列表 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>历史学年</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          创建新学年
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={historyYears} 
        rowKey="id"
        pagination={false}
        bordered
      />

      {/* 创建新学年弹窗 */}
      <Modal
        title={isEditMode ? "编辑学年" : "创建新学年"}
        open={isModalVisible}
        onOk={handleSaveSchoolYear}
        onCancel={handleCancel}
        okText={isEditMode ? "保存" : "创建"}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            dateRange: [dayjs(), dayjs().add(1, 'year')]
          }}
        >
          <Form.Item
            name="dateRange"
            label="学年起止日期"
            rules={[{ required: true, message: '请选择学年起止日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SchoolYearManagement