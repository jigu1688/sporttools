import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Card, Space, Typography, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addClass, updateClass, deleteClass } from '../store/dataSlice'

const { Title } = Typography
const { Option } = Select

const Classes = () => {
  const { classes } = useSelector(state => state.data)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)

  // 显示添加/编辑弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue(record)
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingId(null)
  }

  // 提交表单
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          if (editingId) {
            // 编辑班级
            dispatch(updateClass({
              ...values,
              id: editingId
            }))
            message.success('班级更新成功')
          } else {
            // 添加班级
            const newClass = {
              ...values,
              id: classes.length + 1,
              studentCount: 0,
              status: 'active'
            }
            dispatch(addClass(newClass))
            message.success('班级创建成功')
          }
          setIsModalVisible(false)
          setLoading(false)
          setEditingId(null)
        }, 500)
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }

  // 删除班级
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个班级吗？',
      onOk: () => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          dispatch(deleteClass(id))
          message.success('班级删除成功')
          setLoading(false)
        }, 500)
      }
    })
  }



  // 表格列配置
  const columns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'class',
      width: 120
    },
    {
      title: '班主任',
      dataIndex: 'coach',
      key: 'coach',
      width: 80
    },
    {
      title: '体育老师',
      dataIndex: 'physicalTeacher',
      key: 'physicalTeacher',
      width: 80
    },
    {
      title: '学生人数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 80,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: status => (
        <span>{status === 'active' ? '启用' : '禁用'}</span>
      )
    },
    {
      title: '操作',
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

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3}>班级管理</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加班级
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个班级`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200, y: 600 }}
          size="middle"
        />

        {/* 添加/编辑班级弹窗 */}
        <Modal
          title={editingId ? '编辑班级' : '添加班级'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="grade"
              label="年级"
              rules={[{ required: true, message: '请输入年级!' }]}
            >
              <Input placeholder="请输入年级" />
            </Form.Item>

            <Form.Item
              name="className"
              label="班级"
              rules={[{ required: true, message: '请输入班级名称!' }]}
            >
              <Input placeholder="请输入班级名称" />
            </Form.Item>

            <Form.Item
              name="coach"
              label="班主任"
              rules={[{ required: true, message: '请输入班主任姓名!' }]}
            >
              <Input placeholder="请输入班主任姓名" />
            </Form.Item>

            <Form.Item
              name="physicalTeacher"
              label="体育老师"
              rules={[{ required: true, message: '请输入体育老师姓名!' }]}
            >
              <Input placeholder="请输入体育老师姓名" />
            </Form.Item>

            <Form.Item
              name="studentCount"
              label="学生人数"
              rules={[{ required: false, message: '请输入学生人数!' }]}
            >
              <InputNumber 
                placeholder="请输入学生人数" 
                min={0} 
                max={200} 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择班级状态!' }]}
            >
              <Select placeholder="请选择班级状态">
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Classes