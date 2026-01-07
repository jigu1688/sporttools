import { Card, Row, Col, Statistic, Typography, Table, Tag } from 'antd'
import { UserOutlined, TeamOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { Title } = Typography

const Dashboard = () => {
  const { classes, students, users } = useSelector(state => state.data)

  // 计算统计数据
  const statistics = [
    { title: '总班级数', value: classes.length, icon: <BookOutlined />, color: '#1890ff', suffix: '个' },
    { title: '总学生数', value: students.length, icon: <TeamOutlined />, color: '#52c41a', suffix: '人' },
    { title: '总用户数', value: users.length, icon: <UserOutlined />, color: '#faad14', suffix: '人' },
    { title: '今日课程', value: 8, icon: <CalendarOutlined />, color: '#f5222d', suffix: '节' } // 模拟数据，实际应从课程表获取
  ]

  // 生成近期活动（模拟）
  const recentActivities = [
    { id: 1, title: `${classes[0]?.grade || '一年级'} ${classes[0]?.className || '主校区1班'} 新增3名学生`, time: '2小时前', status: 'success' },
    { id: 2, title: `${classes[1]?.grade || '二年级'} ${classes[1]?.className || '主校区2班'} 课程调整`, time: '4小时前', status: 'info' },
    { id: 3, title: '游泳三班考试成绩发布', time: '1天前', status: 'warning' },
    { id: 4, title: '新用户管理员创建', time: '2天前', status: 'success' },
    { id: 5, title: '羽毛球四班状态变更', time: '3天前', status: 'error' }
  ]

  // 生成班级排名（使用固定值模拟）
  const classRanking = classes.map(cls => ({
    id: cls.id,
    name: `${cls.grade} ${cls.className}`,
    students: cls.studentCount,
    rate: 85 // 固定值模拟活跃度，实际应根据学生出勤等数据计算
  })).sort((a, b) => b.students - a.students).slice(0, 5)

  return (
    <div>
      <Title level={3}>仪表盘</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
                styles={{ content: { color: stat.color } }}
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
          </Card>
        </Col>

        {/* 右侧：班级排名 */}
        <Col xs={24} lg={16}>
          <Card title="班级活跃度排名">
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
                  title: '活跃度',
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
                            background: '#52c41a',
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
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard