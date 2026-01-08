import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { register } from '../store/authSlice'

const { Title } = Typography

const Register = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 调用真实的注册API
      const resultAction = await dispatch(register({
        username: values.username,
        email: values.email,
        phone: values.phone,
        real_name: values.username, // 暂时用用户名作为真实姓名
        password: values.password
      }))
      
      if (register.fulfilled.match(resultAction)) {
        message.success('注册成功')
        // 注册成功后跳转到登录页
        navigate('/login')
      } else {
        message.error(resultAction.payload || '注册失败，请稍后重试')
      }
    } catch (error) {
      message.error('注册失败，请稍后重试')
      console.error('Register error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>体育教学辅助系统</Title>
          <p>创建新账户</p>
        </div>
        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 6, message: '用户名至少6个字符!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号!' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号" />
          </Form.Item>

          <Form.Item
            name="password"
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
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <p>已有账号？ <a href="/login">立即登录</a></p>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register