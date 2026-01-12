import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, Typography, message, Spin } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSportsMeets, createSportsMeet, updateSportsMeetById, deleteSportsMeetById } from '../../store/sportsMeetSlice'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

const SportsMeetList = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)
  
  const dispatch = useDispatch()
  const { sportsMeets, loading, error } = useSelector(state => state.sportsMeet)
  
  // 从API获取运动会列表
  useEffect(() => {
    dispatch(fetchSportsMeets())
  }, [dispatch])
  
  // 显示创建/编辑模态框
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue({
        name: record.name,
        dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
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
  
  // 保存运动会
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        // 将前端驼峰式字段转换为后端下划线式字段
        const sportsMeetData = {
          name: values.name,
          start_date: values.dateRange[0].format('YYYY-MM-DD'),
          end_date: values.dateRange[1].format('YYYY-MM-DD'),
          status: values.status || '筹备中'
        }
        
        if (editingId) {
          // 更新运动会
          dispatch(updateSportsMeetById({ sportsMeetId: editingId, sportsMeetData }))
            .unwrap()
            .then(() => {
              message.success('运动会更新成功')
              setIsModalVisible(false)
              setEditingId(null)
              form.resetFields()
            })
            .catch(error => {
              message.error(error || '运动会更新失败')
            })
        } else {
          // 创建运动会
          dispatch(createSportsMeet(sportsMeetData))
            .unwrap()
            .then(() => {
              message.success('运动会创建成功')
              setIsModalVisible(false)
              setEditingId(null)
              form.resetFields()
            })
            .catch(error => {
              message.error(error || '运动会创建失败')
            })
        }
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }
  
  // 删除运动会
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个运动会吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteSportsMeetById(id))
          .unwrap()
          .then(() => {
            message.success('运动会删除成功')
          })
          .catch(error => {
            message.error(error || '运动会删除失败')
          })
      }
    })
  }
  
  // 查看运动会详情
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
      title: '运动会名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120
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
        <Title level={4} style={{ marginBottom: 0 }}>运动会列表</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建运动会
        </Button>
      </Space>
      
      {error && (
        <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
          错误：{error}
        </div>
      )}
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={sportsMeets}
          rowKey="id"
          bordered
          pagination={false}
        />
      </Spin>
      
      {/* 创建/编辑模态框 */}
      <Modal
        title={editingId ? "编辑运动会" : "创建运动会"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '筹备中'
          }}
        >
          <Form.Item
            name="name"
            label="运动会名称"
            rules={[{ required: true, message: '请输入运动会名称!' }]}
          >
            <Input placeholder="请输入运动会名称" />
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="日期范围"
            rules={[{ required: true, message: '请选择日期范围!' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="筹备中">筹备中</Select.Option>
              <Select.Option value="报名中">报名中</Select.Option>
              <Select.Option value="编排中">编排中</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已结束">已结束</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看详情模态框 */}
      <Modal
        title="运动会详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={null}
        width={600}
      >
        {viewData && (
          <div>
            <p><strong>运动会名称：</strong>{viewData.name}</p>
            <p><strong>开始日期：</strong>{viewData.startDate}</p>
            <p><strong>结束日期：</strong>{viewData.endDate}</p>
            <p><strong>状态：</strong>{viewData.status}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SportsMeetList