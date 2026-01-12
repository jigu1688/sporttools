import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button, Table, Form, DatePicker, Modal, message, Statistic, Row, Col, Tag, Space, Spin, Typography } from 'antd'
import { PlusOutlined, CheckOutlined, DeleteOutlined, ExclamationCircleOutlined, EditOutlined, ArrowUpOutlined } from '@ant-design/icons'
import {
  fetchSchoolYears,
  fetchActiveSchoolYear,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  activateSchoolYear,
  completeSchoolYear,
  promoteSchoolYear,
  fetchSchoolYearStatistics,
  selectSchoolYears,
  selectActiveSchoolYear,
  selectSchoolYearStatistics,
  selectSchoolYearLoading,
  selectSchoolYearPagination,
  setSchoolYearFilters,
  clearSchoolYearError
} from '../store/schoolYearSlice'

import dayjs from 'dayjs'
import { PermissionGuard } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'

const { confirm } = Modal
const { RangePicker } = DatePicker

const { Title } = Typography

const SchoolYearManagement = () => {
  const dispatch = useDispatch()
  const schoolYears = useSelector(selectSchoolYears)
  const currentSchoolYear = useSelector(selectActiveSchoolYear)
  const schoolYearStatistics = useSelector(selectSchoolYearStatistics)
  const loading = useSelector(selectSchoolYearLoading)
  const { students, classes } = useSelector(state => state.data)
  
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEditId, setCurrentEditId] = useState(null)

  // 加载学年数据
  const loadSchoolYears = async () => {
    try {
      await dispatch(fetchSchoolYears()).unwrap()
      try {
        await dispatch(fetchActiveSchoolYear()).unwrap()
      } catch (error) {
        // 如果没有活跃学年，不影响其他功能
        console.log('当前没有活跃学年')
      }
    } catch (error) {
      console.error('加载学年数据失败:', error)
      message.error('加载学年数据失败')
    }
  }

  // 加载当前学年的统计信息
  const loadStatistics = async () => {
    if (currentSchoolYear?.id) {
      try {
        await dispatch(fetchSchoolYearStatistics(currentSchoolYear.id)).unwrap()
      } catch (error) {
        console.error('加载学年统计失败:', error)
      }
    }
  }

  // 组件加载时获取学年数据
  useEffect(() => {
    loadSchoolYears()
  }, [])

  // 当前学年变化时加载统计信息
  useEffect(() => {
    loadStatistics()
  }, [currentSchoolYear])

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
  const handleSaveSchoolYear = async () => {
    try {
      const values = await form.validateFields()
      const start_date = values.dateRange[0].format('YYYY-MM-DD')
      const end_date = values.dateRange[1].format('YYYY-MM-DD')
      const startYear = start_date.slice(0, 4)
      const endYear = end_date.slice(0, 4)
      const year_name = `${startYear}-${endYear}学年`
      // 使用完整学年标识避免重复，如 "2026-2027"
      const academic_year = `${startYear}-${endYear}`
      
      const schoolYearData = {
        year_name,
        start_date,
        end_date,
        academic_year,
        status: 'inactive'
      }
      
      if (isEditMode && currentEditId) {
        await dispatch(updateSchoolYear({ 
          id: currentEditId, 
          schoolYearData 
        })).unwrap()
        message.success('学年更新成功')
      } else {
        await dispatch(createSchoolYear(schoolYearData)).unwrap()
        message.success('新学年创建成功')
      }
      
      handleCancel()
      loadSchoolYears()
    } catch (error) {
      console.error('保存学年失败:', error)
      message.error(error?.message || '保存学年失败')
    }
  }

  // 设置当前学年
  const handleSetCurrentYear = (year) => {
    Modal.confirm({
      title: '设置当前学年',
      icon: <ExclamationCircleOutlined />,
      content: `确定要将 ${year.year_name} 设置为当前学年吗？`,
      onOk: async () => {
        try {
          await dispatch(activateSchoolYear(year.id)).unwrap()
          message.success('当前学年设置成功')
          loadSchoolYears()
        } catch (error) {
          console.error('设置当前学年失败:', error)
          message.error(error?.message || '设置当前学年失败')
        }
      }
    })
  }

  // 升级学年 - 结束当前学年，创建新学年，升级班级年级
  const handlePromoteYear = () => {
    if (!currentSchoolYear) {
      message.error('当前学年未设置')
      return
    }
    
    // 计算新学年信息
    const startDate = currentSchoolYear.start_date
    const startYear = parseInt(startDate.slice(0, 4))
    const newStartYear = startYear + 1
    const newYearName = `${newStartYear}-${newStartYear + 1}学年`
    
    Modal.confirm({
      title: '升级学年',
      icon: <ExclamationCircleOutlined />,
      width: 500,
      content: (
        <div>
          <p><strong>确定要升级到新学年吗？</strong></p>
          <p>此操作将：</p>
          <ul>
            <li>将当前学年 <strong>{currentSchoolYear.year_name}</strong> 标记为已完成</li>
            <li>自动创建新学年 <strong>{newYearName}</strong>（{newStartYear}年9月1日 - {newStartYear + 1}年8月31日）</li>
            <li>所有班级升级到下一年级（如：一年级1班 → 二年级1班）</li>
            <li>六年级班级升级为七年级（小升初）</li>
            <li>九年级学生标记为毕业</li>
          </ul>
          <p style={{ color: '#ff4d4f', marginTop: 16 }}>⚠️ 此操作不可逆，请确认在新学年开始时执行！</p>
        </div>
      ),
      okText: '确认升级',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await dispatch(promoteSchoolYear(currentSchoolYear.id)).unwrap()
          const newYear = result.new_school_year
          message.success(
            `学年升级成功！已创建 ${newYear?.year_name || '新学年'}，升级 ${result.promoted_classes || 0} 个班级，${result.promoted_students || 0} 名学生，${result.graduated_students || 0} 名学生毕业`
          )
          // 刷新数据
          loadSchoolYears()
        } catch (error) {
          console.error('升级学年失败:', error)
          message.error(error?.message || '升级学年失败')
        }
      }
    })
  }

  // 结束当前学年
  const handleCompleteYear = () => {
    if (!currentSchoolYear) {
      message.error('当前学年未设置')
      return
    }
    
    Modal.confirm({
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
      onOk: async () => {
        try {
          await dispatch(completeSchoolYear({ 
            id: currentSchoolYear.id, 
            completedBy: 'current_user' 
          })).unwrap()
          message.success('学年结束操作成功')
          loadSchoolYears()
        } catch (error) {
          console.error('结束学年失败:', error)
          message.error(error?.message || '结束学年失败')
        }
      }
    })
  }

  // 删除学年
  const handleDeleteYear = (year) => {
    Modal.confirm({
      title: '删除学年',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除 ${year.year_name} 吗？此操作将删除该学年的所有相关数据，包括班级和学生关联。`,
      onOk: async () => {
        try {
          await dispatch(deleteSchoolYear(year.id)).unwrap()
          message.success('学年删除成功')
          loadSchoolYears()
        } catch (error) {
          console.error('删除学年失败:', error)
          message.error(error?.message || '删除学年失败')
        }
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (created_at) => created_at ? dayjs(created_at).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '学年ID',
      dataIndex: 'academic_year',
      key: 'academic_year',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_MANAGE}>
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
          </PermissionGuard>
          
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_WRITE}>
            <Button 
              type="default" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_DELETE}>
            <Button 
              type="danger" 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteYear(record)}
            >
              删除
            </Button>
          </PermissionGuard>
        </Space>
      )
    }
  ]

  // 筛选出非当前学年的数据
  const historyYears = schoolYears.filter(year => {
    if (!currentSchoolYear?.id) {
      return true
    }
    return year.id !== currentSchoolYear.id
  })
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3}>学年管理</Title>
        <Space>
          <Button 
            type="primary"
            icon={<ArrowUpOutlined />}
            onClick={handlePromoteYear}
            disabled={!currentSchoolYear || currentSchoolYear.status !== 'active'}
            loading={loading}
          >
            升级学年
          </Button>
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_WRITE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              创建新学年
            </Button>
          </PermissionGuard>
        </Space>
      </div>
      
      {/* 当前学年信息卡片 */}
      <Card title="当前学年信息" style={{ marginBottom: 24 }}>
        <Spin spinning={loading && !currentSchoolYear} tip="加载中...">
          {currentSchoolYear ? (
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
                    value={schoolYearStatistics?.totalStudents || students.length} 
                    suffix="人"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="班级数量" 
                    value={schoolYearStatistics?.totalClasses || classes.length} 
                    suffix="个"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="学年状态" 
                    value={currentSchoolYear.status === 'active' ? '当前' : '已完成'}
                    valueStyle={{ color: currentSchoolYear.status === 'active' ? '#3f8600' : '#722ed1' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_MANAGE}>
                  <Button 
                    type="primary"
                    icon={<ArrowUpOutlined />}
                    onClick={handlePromoteYear}
                    disabled={!currentSchoolYear || currentSchoolYear.status !== 'active'}
                    loading={loading}
                  >
                    升级学年
                  </Button>
                </PermissionGuard>
                <PermissionGuard permissions={PERMISSIONS.SCHOOL_YEAR_MANAGE}>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={handleCompleteYear}
                    disabled={!currentSchoolYear || currentSchoolYear.status !== 'active'}
                    loading={loading}
                  >
                    结束当前学年
                  </Button>
                </PermissionGuard>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              当前没有设置学年
            </div>
          )}
        </Spin>
      </Card>

      {/* 历史学年列表 */}
      <Card title="历史学年">
        <Table 
          columns={columns} 
          dataSource={historyYears} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          bordered
        />
      </Card>

      {/* 创建/编辑学年弹窗 */}
      <Modal
        title={isEditMode ? "编辑学年" : "创建新学年"}
        open={isModalVisible}
        onOk={handleSaveSchoolYear}
        onCancel={handleCancel}
        okText={isEditMode ? "保存" : "创建"}
        cancelText="取消"
        confirmLoading={loading}
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
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SchoolYearManagement