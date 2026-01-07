import React from 'react'
import { Card, Col, Statistic } from 'antd'
import { UserOutlined, TeamOutlined, CheckCircleOutlined, LineChartOutlined, TrophyOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons'

const StatisticsCards = () => {
  // 模拟数据，后续将从Redux状态获取
  const mockSummary = {
    totalStudents: 1200,
    testedStudents: 1150,
    exemptStudents: 50,
    averageScore: 78.5,
    excellentRate: 0.25,
    goodRate: 0.35,
    passRate: 0.25,
    failRate: 0.15
  }
  
  return (
    <>
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="总人数"
            value={mockSummary.totalStudents}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="参加测试人数"
            value={mockSummary.testedStudents}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="免测人数"
            value={mockSummary.exemptStudents}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="平均分"
            value={mockSummary.averageScore}
            prefix={<LineChartOutlined />}
            precision={1}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="优秀率"
            value={mockSummary.excellentRate * 100}
            prefix={<TrophyOutlined />}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="良好率"
            value={mockSummary.goodRate * 100}
            prefix={<SmileOutlined />}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="及格率"
            value={mockSummary.passRate * 100}
            prefix={<MehOutlined />}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="不及格率"
            value={mockSummary.failRate * 100}
            prefix={<FrownOutlined />}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </>
  )
}

export default StatisticsCards