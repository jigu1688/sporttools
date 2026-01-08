import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Card, Space, Typography, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'

const { Title } = Typography
const { Option } = Select

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'}/api/v1`

const Users = () => {
  // const { users } = useSelector(state => state.data)
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  
  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users?skip=0&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // 检查返回数据格式，如果是分页格式则使用items字段
        if (data.items && Array.isArray(data.items)) {
          setUsers(data.items || [])
          setTotal(data.total || 0)
        } else {
          // 兼容旧格式
          setUsers(data || [])
          setTotal(data.length || 0)
        }
      } else {
        if (response.status === 401) {
          message.error('登录已过期，请重新登录')
          // 跳转到登录页面
          window.location.href = '/login'
        } else {
          const errorData = await response.json().catch(() => ({}))
          message.error(errorData.detail || '获取用户列表失败')
        }
      }
    } catch (error) {
      console.error('获取用户列表错误:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 组件加载时获取用户列表
  useEffect(() => {
    fetchUsers()
  }, [token])

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
  const handleOk = async () => {
    form.validateFields()
      .then(async values => {
        setLoading(true)
        try {
          if (editingId) {
            // 编辑用户 - 调用后端API
            const response = await fetch(`${API_BASE_URL}/users/${editingId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            })
            
            if (response.ok) {
              message.success('用户信息更新成功')
              fetchUsers() // 重新获取用户列表
            } else {
              const errorData = await response.json()
              message.error(errorData.detail || '用户信息更新失败')
            }
          } else {
            // 添加用户 - 调用后端API
            const response = await fetch(`${API_BASE_URL}/users`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            })
            
            if (response.ok) {
              message.success('用户创建成功')
              fetchUsers() // 重新获取用户列表
            } else {
              const errorData = await response.json()
              message.error(errorData.detail || '用户创建失败')
            }
          }
          setIsModalVisible(false)
          setEditingId(null)
        } catch (error) {
          message.error('操作失败，请稍后重试')
        } finally {
          setLoading(false)
        }
      })
      .catch(info => {
        // 表单验证失败，不处理
      })
  }

  // 删除用户
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个用户吗？',
      onOk: async () => {
        setLoading(true)
        try {
          // 调用后端API删除用户
          const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            message.success('用户删除成功')
            fetchUsers() // 重新获取用户列表
          } else {
            const errorData = await response.json()
            message.error(errorData.detail || '用户删除失败')
          }
        } catch (error) {
          console.error('删除用户错误:', error)
          message.error('用户删除失败')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // 切换用户状态
  const handleStatusChange = async (id, checked) => {
    setLoading(true)
    try {
      // 调用后端API更新用户状态
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: checked ? 'active' : 'inactive' })
      })
      
      if (response.ok) {
        message.success(`用户已${checked ? '启用' : '禁用'}`)
        fetchUsers() // 重新获取用户列表
      } else {
        const errorData = await response.json()
        message.error(errorData.detail || '更新用户状态失败')
      }
    } catch (error) {
      console.error('更新用户状态错误:', error)
      message.error('更新用户状态失败')
    } finally {
      setLoading(false)
    }
  }

  // 过滤用户列表
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    (user.real_name && user.real_name.toLowerCase().includes(searchText.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchText.toLowerCase())) ||
    (user.phone && user.phone.includes(searchText))
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
      dataIndex: 'real_name',
      key: 'real_name',
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
          teacher: '教师',
          student: '学生',
          parent: '家长'
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
              name="real_name"
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
                <Option value="teacher">教师</Option>
                <Option value="student">学生</Option>
                <Option value="parent">家长</Option>
              </Select>
            </Form.Item>

            {!editingId && (
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 8, message: '密码长度至少为8个字符!' },
                  { pattern: /[A-Z]/, message: '密码必须包含至少一个大写字母!' },
                  { pattern: /[a-z]/, message: '密码必须包含至少一个小写字母!' },
                  { pattern: /[0-9]/, message: '密码必须包含至少一个数字!' },
                  { pattern: /[!@#$%^&*()_+=\[\]{}|;:,.<>?-]/, message: '密码必须包含至少一个特殊字符!' },
                  { pattern: /^[^\s]*$/, message: '密码不能包含空格!' }
                ]}
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