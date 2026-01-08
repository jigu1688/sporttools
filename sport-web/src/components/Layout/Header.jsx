import { Layout as AntLayout, Avatar, Dropdown, Menu, Badge, Space, Breadcrumb } from 'antd'
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'

const { Header: AntHeader } = AntLayout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // 使用Redux中的真实用户信息
  const user = useSelector(state => state.auth.user || {
    name: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  })

  // 生成面包屑导航项
  const getBreadcrumbItems = () => {
    const path = location.pathname
    const items = [{ title: '首页', href: '/' }]

    // 体测系统
    if (path.startsWith('/physical-test')) {
      items.push({ title: '体测系统', href: '/physical-test' })
      if (path === '/physical-test/test-items') {
        items.push({ title: '测试项目' })
      } else if (path === '/physical-test/score-management') {
        items.push({ title: '成绩管理' })
      } else if (path === '/physical-test/statistics') {
        items.push({ title: '统计分析' })
      }
    }
    // 运动会编排系统
    else if (path.startsWith('/sports-meet')) {
      items.push({ title: '运动会编排系统', href: '/sports-meet' })
      if (path === '/sports-meet/management') {
        items.push({ title: '核心管理' })
        items.push({ title: '运动会管理' })
      } else if (path === '/sports-meet/events') {
        items.push({ title: '核心管理' })
        items.push({ title: '项目管理' })
      } else if (path === '/sports-meet/registration') {
        items.push({ title: '报名流程' })
        items.push({ title: '报名管理' })
      } else if (path === '/sports-meet/audit') {
        items.push({ title: '报名流程' })
        items.push({ title: '报名审核' })
      } else if (path === '/sports-meet/statistics') {
        items.push({ title: '报名流程' })
        items.push({ title: '报名统计' })
      } else if (path === '/sports-meet/scheduling') {
        items.push({ title: '赛事执行' })
        items.push({ title: '运动会编排' })
      } else if (path === '/sports-meet/referees') {
        items.push({ title: '赛事执行' })
        items.push({ title: '裁判员管理' })
      } else if (path === '/sports-meet/venues') {
        items.push({ title: '赛事执行' })
        items.push({ title: '场地管理' })
      } else if (path === '/sports-meet/results') {
        items.push({ title: '结果管理' })
        items.push({ title: '成绩记录' })
      } else if (path === '/sports-meet/reports') {
        items.push({ title: '结果管理' })
        items.push({ title: '报表生成' })
      }
    }
    // 其他页面
    else if (path === '/school-info') {
      items.push({ title: '学校信息' })
    } else if (path === '/classes') {
      items.push({ title: '组织架构' })
      items.push({ title: '班级管理' })
    } else if (path === '/students') {
      items.push({ title: '组织架构' })
      items.push({ title: '学生管理' })
    } else if (path === '/users') {
      items.push({ title: '组织架构' })
      items.push({ title: '用户管理' })
    } else if (path === '/school-year') {
      items.push({ title: '教学管理' })
      items.push({ title: '学年管理' })
    } else if (path === '/student-history') {
      items.push({ title: '体测系统' })
      items.push({ title: '历史数据查询' })
    }

    return items
  }

  const handleLogout = () => {
    // 只调用dispatch，让redux状态更新触发ProtectedRoute重定向
    // logout action中已经处理了localStorage清除
    dispatch(logout())
  }

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 24px', 
      height: 64, 
      lineHeight: '64px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff', marginRight: '32px' }}>
          体育教学辅助系统
        </div>
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>
      <Space size="middle">
        <Badge count={3} color="#f5222d">
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#666' }} />
        </Badge>
        <Dropdown
          menu={{
            items: [{
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录',
              onClick: handleLogout
            }]
          }}
          trigger={['click']}
        >
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Avatar 
              src={user.avatar} 
              size="large" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <span style={{ marginLeft: '8px', color: '#333' }}>{user.name}</span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header