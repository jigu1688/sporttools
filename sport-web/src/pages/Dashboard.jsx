import { Card, Row, Col, Statistic, Typography, Table, Tag, Spin, Empty } from 'antd'
import { UserOutlined, TeamOutlined, BookOutlined, CheckCircleOutlined, PercentageOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import apiClient from '../utils/apiClient'

const { Title } = Typography

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalUsers: 0,
    testedStudents: 0,
    todayNewStudents: 0,
    testCompletionRate: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [classRanking, setClassRanking] = useState([])

  // 获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // 并行获取所有数据
        const [overviewRes, activitiesRes, rankingRes] = await Promise.all([
          apiClient.get('/dashboard/overview'),
          apiClient.get('/dashboard/recent-activities?limit=5'),
          apiClient.get('/dashboard/class-ranking?limit=5')
        ])
        
        setOverview(overviewRes)
        setRecentActivities(activitiesRes)
        setClassRanking(rankingRes)
      } catch (error) {
        console.error('获取仪表盘数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  // 统计数据卡片配置
  const statistics = [
    { title: '总班级数', value: overview.totalClasses, icon: <BookOutlined />, color: '#1890ff', suffix: '个' },
    { title: '总学生数', value: overview.totalStudents, icon: <TeamOutlined />, color: '#52c41a', suffix: '人' },
    { title: '总用户数', value: overview.totalUsers, icon: <UserOutlined />, color: '#faad14', suffix: '人' },
    { title: '已体测学生', value: overview.testedStudents, icon: <CheckCircleOutlined />, color: '#722ed1', suffix: '人' },
    { title: '体测完成率', value: overview.testCompletionRate, icon: <PercentageOutlined />, color: '#13c2c2', suffix: '%' },
    { title: '今日新增', value: overview.todayNewStudents, icon: <PlusCircleOutlined />, color: '#f5222d', suffix: '人' }
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div>
      <Title level={3}>仪表盘</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={4} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
                style={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 数据展示区域 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：近期活动 */}
        <Col xs={24} lg={8}>
          <Card title="近期活动">
            {recentActivities.length > 0 ? (
              <Table
                dataSource={recentActivities}
                columns={[
                  {
                    title: '活动内容',
                    dataIndex: 'title',
                    key: 'title',
                    render: (title, item) => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{title}</span>
                        <Tag color={item.status}>{item.status}</Tag>
                      </div>
                    )
                  },
                  {
                    title: '时间',
                    dataIndex: 'time',
                    key: 'time'
                  }
                ]}
                rowKey="id"
                pagination={false}
                bordered={false}
                size="small"
              />
            ) : (
              <Empty description="暂无活动记录" />
            )}
          </Card>
        </Col>

        {/* 右侧：班级排名 */}
        <Col xs={24} lg={16}>
          <Card title="班级体测完成度排名">
            {classRanking.length > 0 ? (
              <Table
                dataSource={classRanking}
                columns={[
                  {
                    title: '班级',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  {
                    title: '学生数',
                    dataIndex: 'students',
                    key: 'students'
                  },
                  {
                    title: '已测试',
                    dataIndex: 'testedStudents',
                    key: 'testedStudents'
                  },
                  {
                    title: '完成率',
                    dataIndex: 'rate',
                    key: 'rate',
                    render: (rate) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{rate}%</span>
                        <div style={{ width: 100, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div 
                            style={{
                              width: `${rate}%`, 
                              height: '100%', 
                              background: rate >= 80 ? '#52c41a' : rate >= 50 ? '#faad14' : '#f5222d',
                              borderRadius: 4
                            }}
                          />
                        </div>
                      </div>
                    )
                  }
                ]}
                rowKey="id"
                pagination={false}
                bordered={false}
                size="small"
              />
            ) : (
              <Empty description="暂无班级数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard