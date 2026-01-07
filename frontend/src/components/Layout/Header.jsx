import { Layout as AntLayout, Avatar, Dropdown, Menu, Badge, Space } from 'antd'
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Header: AntHeader } = AntLayout

const Header = () => {
  const navigate = useNavigate()

  // 模拟用户信息
  const user = {
    name: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  }

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        // 后续会添加实际的登出逻辑
        navigate('/login')
      }
    }
  ]

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64, lineHeight: '64px' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        体育教学辅助系统
      </div>
      <Space>
        <Badge count={3}>
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </Badge>
        <Dropdown overlay={<Menu items={userMenu} />} trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Avatar src={user.avatar} size="large" icon={<UserOutlined />} />
            <span style={{ marginLeft: '8px' }}>{user.name}</span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header