import { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd'
import { LockOutlined, UserOutlined, CalculatorOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../store/authSlice'

const { Title, Text } = Typography

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)
  
  // 监听认证状态变化，成功后跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      message.success('登录成功')
      navigate('/')
    }
  }, [isAuthenticated, navigate])
  
  // 处理错误信息
  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onFinish = (values) => {
    // 发送登录请求
    dispatch(login(values))
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>体育教学辅助系统</Title>
          <p>请登录您的账户</p>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <p>还没有账号？ <a href="/register">立即注册</a></p>
          </div>
          
          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>快捷工具</Text>
          </Divider>
          
          <Link to="/calculator">
            <Button 
              icon={<CalculatorOutlined />} 
              block
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#fff'
              }}
            >
              体测成绩计算器（无需登录）
            </Button>
          </Link>
        </Form>
      </Card>
    </div>
  )
}

export default Login