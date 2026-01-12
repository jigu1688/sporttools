import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, message, Card, Popconfirm, Spin } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEvents, createEvent, updateEventById, deleteEventById } from '../../store/sportsMeetSlice'

const { Title } = Typography

const EventManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)
  
  const dispatch = useDispatch()
  const { events, loading, error, sportsMeets } = useSelector(state => state.sportsMeet)
  
  // 从API获取项目列表
  useEffect(() => {
    // 假设默认使用第一个运动会的ID
    if (sportsMeets && sportsMeets.length > 0) {
      dispatch(fetchEvents(sportsMeets[0].id))
    }
  }, [dispatch, sportsMeets])
  
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
        
        if (!sportsMeets || sportsMeets.length === 0) {
          message.error('请先创建运动会')
          return
        }
        
        const sportsMeetId = sportsMeets[0].id
        
        if (editingId) {
          // 更新项目
          dispatch(updateEventById({ sportsMeetId, eventId: editingId, eventData }))
            .unwrap()
            .then(() => {
              message.success('项目更新成功')
              setIsModalVisible(false)
              setEditingId(null)
              form.resetFields()
            })
            .catch(err => {
              message.error(`更新失败: ${err.message}`)
            })
        } else {
          // 创建项目
          dispatch(createEvent({ sportsMeetId, eventData }))
            .unwrap()
            .then(() => {
              message.success('项目创建成功')
              setIsModalVisible(false)
              setEditingId(null)
              form.resetFields()
            })
            .catch(err => {
              message.error(`创建失败: ${err.message}`)
            })
        }
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
        if (sportsMeets && sportsMeets.length > 0) {
          const sportsMeetId = sportsMeets[0].id
          dispatch(deleteEventById({ sportsMeetId, eventId: id }))
            .unwrap()
            .then(() => {
              message.success('项目删除成功')
            })
            .catch(err => {
              message.error(`删除失败: ${err.message}`)
            })
        }
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
        <Select
          placeholder="选择运动会"
          style={{ width: 200 }}
          disabled={!sportsMeets || sportsMeets.length === 0}
          onChange={(value) => {
            dispatch(fetchEvents(value))
          }}
          options={sportsMeets && sportsMeets.length > 0 ? sportsMeets.map(sm => ({
            label: sm.name,
            value: sm.id
          })) : []}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
          loading={loading}
        >
          创建项目
        </Button>
      </Space>
      
      {error && (
        <div style={{ marginBottom: 16, color: 'red' }}>
          加载失败: {error}
        </div>
      )}
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          bordered
          pagination={false}
          locale={{ emptyText: '暂无项目数据' }}
        />
      </Spin>
      
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