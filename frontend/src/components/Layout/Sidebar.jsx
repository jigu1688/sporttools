import { Layout as AntLayout, Menu } from 'antd'
import { DashboardOutlined, TeamOutlined, UserOutlined, BookOutlined, LogoutOutlined, BookOutlined as SchoolOutlined, LineChartOutlined, SettingOutlined, FileTextOutlined, DatabaseOutlined, TrophyOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'

const { Sider } = AntLayout

const Sidebar = () => {
  const location = useLocation()
  const dispatch = useDispatch()

  // 获取当前路由对应的菜单key
  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return 'dashboard'
    if (path === '/school-info') return 'schoolInfo'
    if (path === '/classes') return 'classes'
    if (path === '/students') return 'students'
    if (path === '/users') return 'users'
    if (path === '/school-year') return 'schoolYearManagement'
    if (path === '/student-history') return 'studentHistory'
    if (path === '/physical-test') return 'physicalTestDashboard'
    if (path === '/physical-test/test-items') return 'testItems'
    if (path === '/physical-test/score-management') return 'scoreManagement'
    if (path === '/physical-test/statistics') return 'statistics'
    if (path === '/sports-meet') return 'sportsMeetDashboard'
    if (path === '/sports-meet/management') return 'sportsMeetManagement'
    if (path === '/sports-meet/events') return 'eventManagement'
    if (path === '/sports-meet/registration') return 'registrationManagement'
    if (path === '/sports-meet/audit') return 'registrationAudit'
    if (path === '/sports-meet/scheduling') return 'sportsMeetScheduling'
    if (path === '/sports-meet/statistics') return 'registrationStatistics'
    if (path === '/sports-meet/results') return 'resultRecord'
    if (path === '/sports-meet/reports') return 'reportGeneration'
    if (path === '/sports-meet/referees') return 'refereeManagement'
    if (path === '/sports-meet/venues') return 'venueManagement'
    return 'dashboard'
  }

  const handleLogout = () => {
    dispatch(logout())
    // 使用window.location.href进行跳转，因为登出后需要重置状态
    window.location.href = '/login'
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>
    },
    {
      key: 'schoolInfo',
      icon: <SchoolOutlined />,
      label: <Link to="/school-info">学校信息</Link>
    },
    {
      key: 'organization',
      icon: <TeamOutlined />,
      label: '组织架构',
      children: [
        {
          key: 'classes',
          label: <Link to="/classes">班级管理</Link>
        },
        {
          key: 'students',
          label: <Link to="/students">学生管理</Link>
        },
        {
          key: 'users',
          label: <Link to="/users">用户管理</Link>
        }
      ]
    },
    {
      key: 'teaching',
      icon: <BookOutlined />,
      label: '教学管理',
      children: [
        {
          key: 'schoolYearManagement',
          label: <Link to="/school-year">学年管理</Link>
        }
      ]
    },
    {
      key: 'physicalTest',
      icon: <LineChartOutlined />,
      label: '体测系统',
      children: [
        {
          key: 'physicalTestDashboard',
          label: <Link to="/physical-test">体测仪表盘</Link>
        },
        {
          key: 'testItems',
          label: <Link to="/physical-test/test-items">测试项目</Link>
        },
        {
          key: 'scoreManagement',
          label: <Link to="/physical-test/score-management">成绩管理</Link>
        },
        {
          key: 'statistics',
          label: <Link to="/physical-test/statistics">统计分析</Link>
        },
        {
          key: 'studentHistory',
          label: <Link to="/student-history">历史数据查询</Link>
        }
      ]
    },
        {
          key: 'sportsMeet',
          icon: <TrophyOutlined />,
          label: '运动会编排系统',
          children: [
            {
              key: 'sportsMeetDashboard',
              label: <Link to="/sports-meet">运动会仪表盘</Link>
            },
            {
              key: 'sportsMeetManagement',
              label: <Link to="/sports-meet/management">运动会管理</Link>
            },
            {
              key: 'eventManagement',
              label: <Link to="/sports-meet/events">项目管理</Link>
            },
            {
              key: 'registrationManagement',
              label: <Link to="/sports-meet/registration">报名管理</Link>
            },
            {
              key: 'registrationAudit',
              label: <Link to="/sports-meet/audit">报名审核</Link>
            },
            {
              key: 'sportsMeetScheduling',
              label: <Link to="/sports-meet/scheduling">运动会编排</Link>
            },
            {
              key: 'registrationStatistics',
              label: <Link to="/sports-meet/statistics">报名统计</Link>
            },
            {
              key: 'refereeManagement',
              label: <Link to="/sports-meet/referees">裁判员管理</Link>
            },
            {
              key: 'venueManagement',
              label: <Link to="/sports-meet/venues">场地管理</Link>
            },
            {
              key: 'resultRecord',
              label: <Link to="/sports-meet/results">成绩记录</Link>
            },
            {
              key: 'reportGeneration',
              label: <Link to="/sports-meet/reports">报表生成</Link>
            }
          ]
        },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Sider 
      theme="light" 
      width={200}
      breakpoint="lg"
      collapsedWidth="0"
      style={{ 
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s'
      }}
    >
      <div style={{ 
        padding: '16px', 
        textAlign: 'center', 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#1890ff',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '8px'
      }}>
        体育教学辅助系统
      </div>
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default Sidebar