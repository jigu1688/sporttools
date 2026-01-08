import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, message, Card, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setEvents, addEvent, updateEvent, deleteEvent } from '../../store/sportsMeetSlice'

const { Title } = Typography

const EventManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)
  
  const dispatch = useDispatch()
  const { events } = useSelector(state => state.sportsMeet)
  

  // 初始化数据
  useEffect(() => {
    const mockData = [
      {
        id: '1',
        name: '50米',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['一年级', '二年级'],
        maxParticipants: 8,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '2',
        name: '60米',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['三年级', '四年级'],
        maxParticipants: 8,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '3',
        name: '200米',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['五年级', '六年级'],
        maxParticipants: 8,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '4',
        name: '400米',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['五年级', '六年级'],
        maxParticipants: 6,
        totalQuota: 80,
        status: '报名中'
      },
      {
        id: '5',
        name: '4x50米接力',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['一年级', '二年级', '三年级'],
        maxParticipants: 4,
        totalQuota: 60,
        status: '报名中'
      },
      {
        id: '6',
        name: '4×100米接力',
        type: '径赛',
        gender: '男女混合',
        gradeGroups: ['四年级', '五年级', '六年级'],
        maxParticipants: 4,
        totalQuota: 60,
        status: '报名中'
      },
      {
        id: '7',
        name: '立定跳远',
        type: '田赛',
        gender: '男女混合',
        gradeGroups: ['一年级', '二年级'],
        maxParticipants: 6,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '8',
        name: '跳远',
        type: '田赛',
        gender: '男女混合',
        gradeGroups: ['三年级', '四年级', '五年级', '六年级'],
        maxParticipants: 6,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '9',
        name: '跳高',
        type: '田赛',
        gender: '男女混合',
        gradeGroups: ['五年级', '六年级'],
        maxParticipants: 6,
        totalQuota: 80,
        status: '报名中'
      },
      {
        id: '10',
        name: '前抛实心球',
        type: '田赛',
        gender: '男女混合',
        gradeGroups: ['三年级', '四年级', '五年级', '六年级'],
        maxParticipants: 6,
        totalQuota: 100,
        status: '报名中'
      },
      {
        id: '11',
        name: '沙包掷远',
        type: '田赛',
        gender: '男女混合',
        gradeGroups: ['一年级', '二年级'],
        maxParticipants: 6,
        totalQuota: 100,
        status: '报名中'
      }
    ]
    if (events.length === 0) {
      dispatch(setEvents(mockData))
    }
  }, [events, dispatch])
  
  // 显示创建/编辑模态框
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue({
        name: record.name,
        type: record.type,
        gender: record.gender,
        gradeGroups: record.gradeGroups,
        maxParticipants: record.maxParticipants,
        totalQuota: record.totalQuota,
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
  
  // 保存项目
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const eventData = {
          name: values.name,
          type: values.type,
          gender: values.gender,
          gradeGroups: values.gradeGroups,
          maxParticipants: values.maxParticipants,
          totalQuota: values.totalQuota,
          status: values.status
        }
        
        if (editingId) {
          // 更新项目
          const updatedEvent = { ...eventData, id: editingId }
          dispatch(updateEvent(updatedEvent))
          message.success('项目更新成功')
        } else {
          // 创建项目
          const newEvent = { ...eventData, id: Date.now().toString() }
          dispatch(addEvent(newEvent))
          message.success('项目创建成功')
        }
        
        setIsModalVisible(false)
        setEditingId(null)
        form.resetFields()
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 删除项目
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个项目吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteEvent(id))
        message.success('项目删除成功')
      }
    })
  }
  
  // 查看项目详情
  const handleView = (record) => {
    setViewData(record)
    setIsViewModalVisible(true)
  }
  
  // 关闭详情模态框
  const handleViewCancel = () => {
    setIsViewModalVisible(false)
    setViewData(null)
  }
  
  // 年级选项
  const gradeOptions = [
    { label: '一年级', value: '一年级' },
    { label: '二年级', value: '二年级' },
    { label: '三年级', value: '三年级' },
    { label: '四年级', value: '四年级' },
    { label: '五年级', value: '五年级' },
    { label: '六年级', value: '六年级' }
  ]
  
  // 表格列配置
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '性别分组',
      dataIndex: 'gender',
      key: 'gender',
      width: 120
    },
    {
      title: '参赛年级',
      dataIndex: 'gradeGroups',
      key: 'gradeGroups',
      width: 150,
      render: (gradeGroups) => gradeGroups.join('、')
    },
    {
      title: '每组人数',
      dataIndex: 'maxParticipants',
      key: 'maxParticipants',
      width: 100
    },
    {
      title: '总名额',
      dataIndex: 'totalQuota',
      key: 'totalQuota',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
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
  
  return (
    <div>
      <Space orientation="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>项目管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建项目
        </Button>
      </Space>
      
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        bordered
        pagination={false}
      />
      
      {/* 创建/编辑模态框 */}
      <Modal
        title={editingId ? "编辑项目" : "创建项目"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '报名中',
            gradeGroups: []
          }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称!' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型!' }]}
          >
            <Select placeholder="请选择项目类型">
              <Select.Option value="径赛">径赛</Select.Option>
              <Select.Option value="田赛">田赛</Select.Option>
              <Select.Option value="团体">团体</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="gender"
            label="性别分组"
            rules={[{ required: true, message: '请选择性别分组!' }]}
          >
            <Select placeholder="请选择性别分组">
              <Select.Option value="男子">男子</Select.Option>
              <Select.Option value="女子">女子</Select.Option>
              <Select.Option value="男女混合">男女混合</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="gradeGroups"
            label="参赛年级"
            rules={[{ required: true, message: '请选择参赛年级!' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择参赛年级"
              options={gradeOptions}
            />
          </Form.Item>
          
          <Form.Item
            name="maxParticipants"
            label="每组最大人数"
            rules={[{ required: true, message: '请输入每组最大人数!' }, { type: 'number', min: 1 }]}
          >
            <InputNumber min={1} placeholder="请输入每组最大人数" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="totalQuota"
            label="项目总名额"
            rules={[{ required: true, message: '请输入项目总名额!' }, { type: 'number', min: 1 }]}
          >
            <InputNumber min={1} placeholder="请输入项目总名额" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="报名中">报名中</Select.Option>
              <Select.Option value="报名结束">报名结束</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已结束">已结束</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看详情模态框 */}
      <Modal
        title="项目详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={null}
        width={600}
      >
        {viewData && (
          <div>
            <p><strong>项目名称：</strong>{viewData.name}</p>
            <p><strong>项目类型：</strong>{viewData.type}</p>
            <p><strong>性别分组：</strong>{viewData.gender}</p>
            <p><strong>参赛年级：</strong>{viewData.gradeGroups.join('、')}</p>
            <p><strong>每组最大人数：</strong>{viewData.maxParticipants}</p>
            <p><strong>项目总名额：</strong>{viewData.totalQuota}</p>
            <p><strong>状态：</strong>{viewData.status}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EventManagement