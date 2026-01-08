import React, { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { setReferees, addReferee, updateReferee, deleteReferee } from '../../store/sportsMeetSlice'

const { Title } = Typography

const RefereeManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)
  
  const dispatch = useDispatch()
  const { referees } = useSelector(state => state.sportsMeet)
  
  // 初始化数据
  React.useEffect(() => {
    const mockData = [
      { id: '1', name: '张三', gender: '男', specialty: '径赛', phone: '13800138001', status: '可用' },
      { id: '2', name: '李四', gender: '女', specialty: '田赛', phone: '13800138002', status: '可用' },
      { id: '3', name: '王五', gender: '男', specialty: '径赛', phone: '13800138003', status: '可用' },
      { id: '4', name: '赵六', gender: '男', specialty: '田赛', phone: '13800138004', status: '可用' },
      { id: '5', name: '孙七', gender: '女', specialty: '径赛', phone: '13800138005', status: '可用' }
    ]
    if (referees.length === 0) {
      dispatch(setReferees(mockData))
    }
  }, [referees, dispatch])
  
  // 显示创建/编辑模态框
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue({
        name: record.name,
        gender: record.gender,
        specialty: record.specialty,
        phone: record.phone,
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
  
  // 保存裁判员
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const refereeData = {
          name: values.name,
          gender: values.gender,
          specialty: values.specialty,
          phone: values.phone,
          status: values.status
        }
        
        if (editingId) {
          // 更新裁判员
          const updatedReferee = { ...refereeData, id: editingId }
          dispatch(updateReferee(updatedReferee))
          message.success('裁判员更新成功')
        } else {
          // 创建裁判员
          const newReferee = { ...refereeData, id: Date.now().toString() }
          dispatch(addReferee(newReferee))
          message.success('裁判员创建成功')
        }
        
        setIsModalVisible(false)
        setEditingId(null)
        form.resetFields()
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 删除裁判员
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个裁判员吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteReferee(id))
        message.success('裁判员删除成功')
      }
    })
  }
  
  // 查看裁判员详情
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
      title: '裁判员姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80
    },
    {
      title: '专业特长',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 120
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150
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
        <Title level={4} style={{ marginBottom: 0 }}>裁判员管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建裁判员
        </Button>
      </Space>
      
      <Table
        columns={columns}
        dataSource={referees}
        rowKey="id"
        bordered
        pagination={false}
      />
      
      {/* 创建/编辑模态框 */}
      <Modal
        title={editingId ? "编辑裁判员" : "创建裁判员"}
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
            label="裁判员姓名"
            rules={[{ required: true, message: '请输入裁判员姓名!' }]}
          >
            <Input placeholder="请输入裁判员姓名" />
          </Form.Item>
          
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别!' }]}
          >
            <Select placeholder="请选择性别">
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="specialty"
            label="专业特长"
            rules={[{ required: true, message: '请选择专业特长!' }]}
          >
            <Select placeholder="请选择专业特长">
              <Select.Option value="径赛">径赛</Select.Option>
              <Select.Option value="田赛">田赛</Select.Option>
              <Select.Option value="团体">团体</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话!' }, { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码!' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="可用">可用</Select.Option>
              <Select.Option value="不可用">不可用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看详情模态框 */}
      <Modal
        title="裁判员详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={null}
        width={600}
      >
        {viewData && (
          <div>
            <p><strong>裁判员姓名：</strong>{viewData.name}</p>
            <p><strong>性别：</strong>{viewData.gender}</p>
            <p><strong>专业特长：</strong>{viewData.specialty}</p>
            <p><strong>联系电话：</strong>{viewData.phone}</p>
            <p><strong>状态：</strong>{viewData.status}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RefereeManagement