import { Card, Row, Col, Statistic, Typography } from 'antd'
import { TrophyOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, LineChartOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { Title } = Typography

const SportsMeetDashboard = () => {
  // 模拟数据，后续将从Redux获取
  const mockDashboardData = {
    totalSportsMeets: 5,
    upcomingSportsMeets: 1,
    totalAthletes: 1200,
    totalEvents: 30,
    totalRegistrations: 850
  }
  
  return (
    <div>
      <Title level={3}>运动会编排系统</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="总运动会数"
              value={mockDashboardData.totalSportsMeets}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="即将举行"
              value={mockDashboardData.upcomingSportsMeets}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="总运动员数"
              value={mockDashboardData.totalAthletes}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="总项目数"
              value={mockDashboardData.totalEvents}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="最近运动会" hoverable>
            {/* 最近运动会列表 */}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              暂无最近运动会数据
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="报名统计" hoverable>
            {/* 报名统计图表 */}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              暂无报名统计数据
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SportsMeetDashboard