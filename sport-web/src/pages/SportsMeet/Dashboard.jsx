import { Card, Row, Col, Statistic, Typography, Spin } from 'antd'
import { TrophyOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, LineChartOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchDashboardData, fetchSportsMeets } from '../../store/sportsMeetSlice'

const { Title } = Typography

const SportsMeetDashboard = () => {
  const dispatch = useDispatch()
  const { dashboardData, sportsMeets, loading } = useSelector(state => state.sportsMeet)
  
  // 组件挂载时获取数据
  useEffect(() => {
    dispatch(fetchDashboardData())
    dispatch(fetchSportsMeets())
  }, [dispatch])
  
  return (
    <div>
      <Title level={3}>运动会编排系统</Title>
      
      {/* 统计卡片 */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="总运动会数"
                value={dashboardData?.totalSportsMeets || 0}
                prefix={<TrophyOutlined />}
                styles={{ content: { color: '#3f8600' } }}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="即将举行"
                value={dashboardData?.upcomingSportsMeets || 0}
                prefix={<CalendarOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="总运动员数"
                value={dashboardData?.totalAthletes || 0}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="总项目数"
                value={dashboardData?.totalEvents || 0}
                prefix={<FileTextOutlined />}
                styles={{ content: { color: '#faad14' } }}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="总报名数"
                value={dashboardData?.totalRegistrations || 0}
                prefix={<LineChartOutlined />}
                styles={{ content: { color: '#eb2f96' } }}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="最近运动会" hoverable>
              {/* 最近运动会列表 */}
              {sportsMeets && sportsMeets.length > 0 ? (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {sportsMeets.slice(0, 5).map(meet => (
                    <div key={meet.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 'bold' }}>{meet.name}</div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                        {meet.startDate} 至 {meet.endDate}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '5px' }}>
                        {meet.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  暂无最近运动会数据
                </div>
              )}
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
      </Spin>
    </div>
  )
}

export default SportsMeetDashboard