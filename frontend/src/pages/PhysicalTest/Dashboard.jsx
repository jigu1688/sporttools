
import { Card, Row, Col, Statistic, Typography, Progress, Table, Tag, Space } from 'antd'
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, UserOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { Title } = Typography

const Dashboard = () => {
  // 从Redux获取真实数据
  const { testRecords } = useSelector(state => state.physicalTest)
  const { students } = useSelector(state => state.data)

  // 计算总学生数
  const totalStudents = students.length

  // 计算已测试学生数（有体测记录的学生）
  const testedStudents = testRecords.length

  // 计算各等级人数
  const gradeCounts = {
    excellent: 0,
    good: 0,
    pass: 0,
    fail: 0
  }

  // 计算总分和平均分
  let totalScore = 0
  testRecords.forEach(record => {
    totalScore += record.totalScore
    
    // 统计各等级人数
    if (record.gradeLevel === '优秀' || record.totalScore >= 90) {
      gradeCounts.excellent++
    } else if (record.gradeLevel === '良好' || (record.totalScore >= 80 && record.totalScore < 90)) {
      gradeCounts.good++
    } else if (record.gradeLevel === '及格' || (record.totalScore >= 60 && record.totalScore < 80)) {
      gradeCounts.pass++
    } else {
      gradeCounts.fail++
    }
  })

  // 计算各等级比例
  const excellentRate = testedStudents > 0 ? Math.round((gradeCounts.excellent / testedStudents) * 100) : 0
  const goodRate = testedStudents > 0 ? Math.round((gradeCounts.good / testedStudents) * 100) : 0
  const passRate = testedStudents > 0 ? Math.round((gradeCounts.pass / testedStudents) * 100) : 0
  const failRate = testedStudents > 0 ? Math.round((gradeCounts.fail / testedStudents) * 100) : 0

  // 计算平均分
  const averageScore = testedStudents > 0 ? Math.round(totalScore / testedStudents) : 0

  // 准备统计数据
  const statistics = {
    totalStudents,
    testedStudents,
    excellentRate,
    goodRate,
    passRate,
    failRate,
    averageScore
  }

  // 获取最近测试记录（按测试日期降序排列，取前5条）
  const recentRecords = [...testRecords]
    .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
    .slice(0, 5)
    .map(record => ({
      id: record.id,
      studentName: record.studentName,
      studentNo: record.educationId, // 使用教育ID作为学号
      className: record.className,
      testDate: record.testDate,
      totalScore: record.totalScore,
      gradeLevel: record.gradeLevel || 
        (record.totalScore >= 90 ? '优秀' : 
         record.totalScore >= 80 ? '良好' : 
         record.totalScore >= 60 ? '及格' : '不及格')
    }))

  // 等级标签配置
  const getGradeTag = (level) => {
    switch (level) {
      case '优秀':
        return <Tag color="success">优秀</Tag>
      case '良好':
        return <Tag color="blue">良好</Tag>
      case '及格':
        return <Tag color="orange">及格</Tag>
      case '不及格':
        return <Tag color="red">不及格</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 表格列配置
  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100
    },
    {
      title: '学号',
      dataIndex: 'studentNo',
      key: 'studentNo',
      width: 120
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 120
    },
    {
      title: '测试日期',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80
    },
    {
      title: '等级',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
      width: 80,
      render: (level) => getGradeTag(level)
    }
  ]

  return (
    <div>
      <Title level={3}>体测数据看板</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="总学生数"
              value={statistics.totalStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="已测试学生"
              value={statistics.testedStudents}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="测试完成率"
              value={(statistics.testedStudents / statistics.totalStudents * 100).toFixed(1)}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="平均分数"
              value={statistics.averageScore}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 等级分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="等级分布" hoverable>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>优秀</span>
                </Space>
                <Progress
                  percent={statistics.excellentRate}
                  strokeColor="#52c41a"
                  showInfo={false}
                  size="small"
                  style={{ width: '70%' }}
                />
                <span>{statistics.excellentRate}%</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#1890ff' }} />
                  <span>良好</span>
                </Space>
                <Progress
                  percent={statistics.goodRate}
                  strokeColor="#1890ff"
                  showInfo={false}
                  size="small"
                  style={{ width: '70%' }}
                />
                <span>{statistics.goodRate}%</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>及格</span>
                </Space>
                <Progress
                  percent={statistics.passRate}
                  strokeColor="#faad14"
                  showInfo={false}
                  size="small"
                  style={{ width: '70%' }}
                />
                <span>{statistics.passRate}%</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <CloseCircleOutlined style={{ color: '#f5222d' }} />
                  <span>不及格</span>
                </Space>
                <Progress
                  percent={statistics.failRate}
                  strokeColor="#f5222d"
                  showInfo={false}
                  size="small"
                  style={{ width: '70%' }}
                />
                <span>{statistics.failRate}%</span>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近测试记录" hoverable>
            <Table
              columns={columns}
              dataSource={recentRecords}
              rowKey="id"
              pagination={false}
              scroll={{ y: 250 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 更多统计信息 */}
      <Card title="测试进度统计" hoverable>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>
                {statistics.testedStudents} / {statistics.totalStudents}
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: 16 }}>
                已测试学生数 / 总学生数
              </div>
              <Progress
                type="circle"
                percent={(statistics.testedStudents / statistics.totalStudents * 100).toFixed(0)}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={120}
              />
            </div>
          </Col>
          <Col span={16}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                  {statistics.excellentRate}%
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  优秀率
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                  {statistics.goodRate}%
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  良好率
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14', marginBottom: 8 }}>
                  {statistics.passRate}%
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  及格率
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f5222d', marginBottom: 8 }}>
                  {statistics.failRate}%
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  不及格率
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
