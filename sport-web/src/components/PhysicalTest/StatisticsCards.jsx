import React from 'react'
import { Card, Col, Statistic } from 'antd'
import { UserOutlined, TeamOutlined, CheckCircleOutlined, LineChartOutlined, TrophyOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const StatisticsCards = () => {
  const { statistics } = useSelector(state => state.physicalTest)
  
  // 使用API返回的统计数据（驼峰命名）
  const {
    totalStudents = 0,
    testedStudents = 0,
    excellentRate = 0,
    goodRate = 0,
    passRate = 0,
    failRate = 0,
    averageScore = 0
  } = statistics

  // 免测人数暂时设为0（后续可从API获取）
  const exemptStudents = 0

  return (
    <>
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="总人数"
            value={totalStudents}
            prefix={<UserOutlined />}
            styles={{ content: { color: '#3f8600' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="参加测试人数"
            value={testedStudents}
            prefix={<TeamOutlined />}
            styles={{ content: { color: '#1890ff' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="免测人数"
            value={exemptStudents}
            prefix={<CheckCircleOutlined />}
            styles={{ content: { color: '#722ed1' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="平均分"
            value={averageScore}
            prefix={<LineChartOutlined />}
            precision={1}
            styles={{ content: { color: '#faad14' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="优秀率"
            value={excellentRate}
            prefix={<TrophyOutlined />}
            suffix="%"
            precision={1}
            styles={{ content: { color: '#f5222d' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="良好率"
            value={goodRate}
            prefix={<SmileOutlined />}
            suffix="%"
            precision={1}
            styles={{ content: { color: '#52c41a' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="及格率"
            value={passRate}
            prefix={<MehOutlined />}
            suffix="%"
            precision={1}
            styles={{ content: { color: '#fa8c16' } }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card hoverable>
          <Statistic
            title="不及格率"
            value={failRate}
            prefix={<FrownOutlined />}
            suffix="%"
            precision={1}
            styles={{ content: { color: '#13c2c2' } }}
          />
        </Card>
      </Col>
    </>
  )
}

export default StatisticsCards
