import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button, Table, Form, DatePicker, Modal, message, Statistic, Row, Col, Tag, Space } from 'antd'
import { PlusOutlined, CheckOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { addSchoolYear, completeSchoolYear, setCurrentSchoolYear } from '../store/dataSlice'
import dayjs from 'dayjs'

const { confirm } = Modal
const { RangePicker } = DatePicker

const SchoolYearManagement = () => {
  const dispatch = useDispatch()
  const { schoolYears, currentSchoolYear, students, classes } = useSelector(state => state.data)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)

  // 显示创建新学年弹窗
  const showModal = () => {
    setIsModalVisible(true)
  }

  // 关闭创建新学年弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  // 创建新学年
  const handleCreateSchoolYear = () => {
    form.validateFields()
      .then(values => {
        const startDate = values.dateRange[0].format('YYYY-MM-DD')
        const endDate = values.dateRange[1].format('YYYY-MM-DD')
        const yearName = `${startDate.slice(0, 4)}-${endDate.slice(0, 4)}学年`
        
        const newSchoolYear = {
          id: schoolYears.length + 1,
          yearName,
          startDate,
          endDate,
          status: 'inactive',
          importedAt: '',
          importedBy: '',
          completedAt: '',
          completedBy: ''
        }
        
        dispatch(addSchoolYear(newSchoolYear))
        message.success('新学年创建成功')
        setIsModalVisible(false)
        form.resetFields()
      })
      .catch(info => {
        message.error('表单验证失败：' + info)
      })
  }

  // 设置当前学年
  const handleSetCurrentYear = (year) => {
    confirm({
      title: '设置当前学年',
      icon: <ExclamationCircleOutlined />,
      content: `确定要将 ${year.yearName} 设置为当前学年吗？`,
      onOk() {
        dispatch(setCurrentSchoolYear(year))
        message.success('当前学年设置成功')
      },
      onCancel() {
        // 取消操作
      }
    })
  }

  // 结束当前学年
  const handleCompleteYear = () => {
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
        dispatch(completeSchoolYear({
          yearId: currentSchoolYear.id,
          completedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          completedBy: '管理员' // 实际应用中应该从登录用户获取
        }))
        message.success('学年结束操作成功')
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
      dataIndex: 'yearName',
      key: 'yearName',
      width: 180
    },
    {
      title: '起始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'blue'}>
          {status === 'active' ? '当前' : status === 'completed' ? '已完成' : '未激活'}
        </Tag>
      )
    },
    {
      title: '导入时间',
      dataIndex: 'importedAt',
      key: 'importedAt',
      width: 160
    },
    {
      title: '导入人',
      dataIndex: 'importedBy',
      key: 'importedBy',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
        </Space>
      )
    }
  ]

  // 筛选出非当前学年的数据
  const historyYears = schoolYears.filter(year => year.id !== currentSchoolYear.id)

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>学年管理</h1>
      
      {/* 当前学年信息卡片 */}
      <Card title="当前学年信息" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="学年名称" value={currentSchoolYear.yearName} />
          </Col>
          <Col span={8}>
            <Statistic title="起始日期" value={currentSchoolYear.startDate} />
          </Col>
          <Col span={8}>
            <Statistic title="结束日期" value={currentSchoolYear.endDate} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="学生数量" 
              value={students.length} 
              suffix="人"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="班级数量" 
              value={classes.length} 
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="学年状态" 
              value={currentSchoolYear.status === 'active' ? '当前' : '已完成'}
              valueStyle={{ color: '#722ed1' }}
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
        title="创建新学年"
        open={isModalVisible}
        onOk={handleCreateSchoolYear}
        onCancel={handleCancel}
        okText="创建"
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