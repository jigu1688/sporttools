import React, { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setVenues, addVenue, updateVenue, deleteVenue } from '../../store/sportsMeetSlice'

const { Title } = Typography

const VenueManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)
  
  const dispatch = useDispatch()
  const { venues } = useSelector(state => state.sportsMeet)
  
  // 初始化数据
  React.useEffect(() => {
    const mockData = [
      { id: '1', name: '田径场1号跑道', type: 'track', capacity: 8, status: '可用' },
      { id: '2', name: '田径场2号跑道', type: 'track', capacity: 8, status: '可用' },
      { id: '3', name: '跳远沙坑', type: 'field', capacity: 1, status: '可用' },
      { id: '4', name: '铅球场地', type: 'field', capacity: 1, status: '可用' },
      { id: '5', name: '篮球场1', type: 'court', capacity: 2, status: '可用' },
      { id: '6', name: '篮球场2', type: 'court', capacity: 2, status: '可用' }
    ]
    if (venues.length === 0) {
      dispatch(setVenues(mockData))
    }
  }, [venues, dispatch])
  
  // 显示创建/编辑模态框
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue({
        name: record.name,
        type: record.type,
        capacity: record.capacity,
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
  
  // 保存场地
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const venueData = {
          name: values.name,
          type: values.type,
          capacity: values.capacity,
          status: values.status
        }
        
        if (editingId) {
          // 更新场地
          const updatedVenue = { ...venueData, id: editingId }
          dispatch(updateVenue(updatedVenue))
          message.success('场地更新成功')
        } else {
          // 创建场地
          const newVenue = { ...venueData, id: Date.now().toString() }
          dispatch(addVenue(newVenue))
          message.success('场地创建成功')
        }
        
        setIsModalVisible(false)
        setEditingId(null)
        form.resetFields()
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 删除场地
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个场地吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteVenue(id))
        message.success('场地删除成功')
      }
    })
  }
  
  // 查看场地详情
  const handleView = (record) => {
    setViewData(record)
    setIsViewModalVisible(true)
  }
  
  // 关闭详情模态框
  const handleViewCancel = () => {
    setIsViewModalVisible(false)
    setViewData(null)
  }
  
  // 表格列配置
  const columns = [
    {
      title: '场地名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '场地类型',
      dataIndex: 'type',
      key: 'type',
      width: 120
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 80,
      render: (capacity, record) => {
        if (record.type === 'track') {
          return `${capacity}人/组`
        } else if (record.type === 'court') {
          return `${capacity}队`
        } else {
          return `${capacity}组`
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80
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
        <Title level={4} style={{ marginBottom: 0 }}>场地管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建场地
        </Button>
      </Space>
      
      <Table
        columns={columns}
        dataSource={venues}
        rowKey="id"
        bordered
        pagination={false}
      />
      
      {/* 创建/编辑模态框 */}
      <Modal
        title={editingId ? "编辑场地" : "创建场地"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '可用'
          }}
        >
          <Form.Item
            name="name"
            label="场地名称"
            rules={[{ required: true, message: '请输入场地名称!' }]}
          >
            <Input placeholder="请输入场地名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="场地类型"
            rules={[{ required: true, message: '请选择场地类型!' }]}
          >
            <Select placeholder="请选择场地类型">
              <Select.Option value="track">田径场</Select.Option>
              <Select.Option value="field">田赛场</Select.Option>
              <Select.Option value="court">球场</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="capacity"
            label="容量"
            rules={[{ required: true, message: '请输入容量!' }, { type: 'number', min: 1 }]}
          >
            <Input type="number" placeholder="请输入容量" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="可用">可用</Select.Option>
              <Select.Option value="不可用">不可用</Select.Option>
              <Select.Option value="维修中">维修中</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看详情模态框 */}
      <Modal
        title="场地详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={null}
        width={600}
      >
        {viewData && (
          <div>
            <p><strong>场地名称：</strong>{viewData.name}</p>
            <p><strong>场地类型：</strong>{viewData.type}</p>
            <p><strong>容量：</strong>{viewData.capacity}</p>
            <p><strong>状态：</strong>{viewData.status}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VenueManagement