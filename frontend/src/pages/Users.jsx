import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Card, Space, Typography, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addUser, updateUser, deleteUser } from '../store/dataSlice'

const { Title } = Typography
const { Option } = Select

const Users = () => {
  const { users } = useSelector(state => state.data)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')

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
            // 编辑用户
            dispatch(updateUser({
              ...values,
              id: editingId
            }))
            message.success('用户信息更新成功')
          } else {
            // 添加用户
            const newUser = {
              ...values,
              id: users.length + 1,
              password: '123456' // 默认密码
            }
            dispatch(addUser(newUser))
            message.success('用户创建成功，默认密码：123456')
          }
          setIsModalVisible(false)
          setLoading(false)
          setEditingId(null)
        }, 500)
      })
      .catch(info => {
        console.log('表单验证失败:', info)
      })
  }

  // 删除用户
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个用户吗？',
      onOk: () => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          dispatch(deleteUser(id))
          message.success('用户删除成功')
          setLoading(false)
        }, 500)
      }
    })
  }

  // 切换用户状态
  const handleStatusChange = (id, checked) => {
    setLoading(true)
    // 模拟API请求
    setTimeout(() => {
      const user = users.find(user => user.id === id)
      if (user) {
        dispatch(updateUser({
          ...user,
          status: checked ? 'active' : 'inactive'
        }))
        message.success(`用户已${checked ? '启用' : '禁用'}`)
      }
      setLoading(false)
    }, 500)
  }

  // 过滤用户列表
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone.includes(searchText)
  )

  // 表格列配置
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: role => {
        const roleMap = {
          admin: '管理员',
          classTeacher: '班主任',
          peTeacher: '体育教师',
          coach: '教练',
          other: '其他'
        }
        return <span>{roleMap[role] || role}</span>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
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
          <Title level={3}>用户管理</Title>
          <div style={{ display: 'flex', gap: 10 }}>
            <Input
              placeholder="搜索用户..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加用户
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />

        {/* 添加/编辑用户弹窗 */}
        <Modal
          title={editingId ? '编辑用户' : '添加用户'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名!' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="电话"
              rules={[
                { required: true, message: '请输入电话号码!' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
              ]}
            >
              <Input placeholder="请输入电话号码" />
            </Form.Item>

            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色!' }]}
            >
              <Select placeholder="请选择角色">
                <Option value="admin">管理员</Option>
                <Option value="classTeacher">班主任</Option>
                <Option value="peTeacher">体育教师</Option>
                <Option value="coach">教练</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>

            {!editingId && (
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码!' }, { min: 6, message: '密码长度不能少于6位!' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Users