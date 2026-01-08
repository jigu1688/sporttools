import React, { useMemo } from 'react'
import { Row, Col, Typography, Tabs } from 'antd'
import { Bar, Pie, Column } from '@ant-design/charts'
import { useSelector } from 'react-redux'

const { Title } = Typography

const StatisticsCharts = () => {
  const { testRecords } = useSelector(state => state.physicalTest)
  
  const scoreDistributionData = useMemo(() => {
    const distribution = { '0-59': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 }
    testRecords.forEach(record => {
      const score = record.totalScore || 0
      if (score < 60) distribution['0-59']++
      else if (score < 70) distribution['60-69']++
      else if (score < 80) distribution['70-79']++
      else if (score < 90) distribution['80-89']++
      else distribution['90-100']++
    })
    return Object.entries(distribution).map(([range, count]) => ({ range, count }))
  }, [testRecords])

  const gradeDistributionData = useMemo(() => {
    const grades = { '优秀': 0, '良好': 0, '及格': 0, '不及格': 0 }
    testRecords.forEach(record => {
      const grade = record.gradeLevel || '及格'
      if (grades[grade] !== undefined) grades[grade]++
    })
    return Object.entries(grades).map(([grade, count]) => ({ grade, count }))
  }, [testRecords])

  const gradeComparisonData = useMemo(() => {
    const gradeScores = {}
    testRecords.forEach(record => {
      const grade = record.grade || '未知'
      if (!gradeScores[grade]) gradeScores[grade] = { total: 0, count: 0 }
      gradeScores[grade].total += record.totalScore || 0
      gradeScores[grade].count++
    })
    return Object.entries(gradeScores).map(([grade, { total, count }]) => ({
      grade,
      score: count > 0 ? Math.round(total / count) : 0
    }))
  }, [testRecords])

  const genderComparisonData = useMemo(() => {
    const genderScores = {}
    testRecords.forEach(record => {
      const gender = record.gender === 'male' ? '男' : '女'
      if (!genderScores[gender]) genderScores[gender] = { total: 0, count: 0 }
      genderScores[gender].total += record.totalScore || 0
      genderScores[gender].count++
    })
    return Object.entries(genderScores).map(([gender, { total, count }]) => ({
      gender,
      score: count > 0 ? Math.round(total / count) : 0
    }))
  }, [testRecords])

  const itemAnalysisData = useMemo(() => {
    const itemScores = {}
    testRecords.forEach(record => {
      Object.entries(record.testItems || {}).forEach(([item, score]) => {
        if (!itemScores[item]) itemScores[item] = { total: 0, count: 0 }
        itemScores[item].total += score || 0
        itemScores[item].count++
      })
    })
    return Object.entries(itemScores).map(([item, { total, count }]) => ({
      item,
      score: count > 0 ? Math.round(total / count) : 0
    }))
  }, [testRecords])

  const tabItems = [
    {
      key: '1',
      label: '总分分布',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ height: 400 }}>
              <Bar
                data={scoreDistributionData}
                xField="range"
                yField="count"
                color="#1890ff"
                label={{
                  position: 'top',
                  style: { fill: '#FFFFFF', opacity: 0.6 }
                }}
                meta={{
                  range: { alias: '分数区间' },
                  count: { alias: '人数' }
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ height: 400 }}>
              <Pie
                data={gradeDistributionData}
                angleField="count"
                colorField="grade"
                radius={0.8}
                meta={{
                  count: { alias: '人数' }
                }}
              />
            </div>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: '对比分析',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>年级成绩对比</Title>
            <div style={{ height: 400 }}>
              <Column
                data={gradeComparisonData}
                xField="grade"
                yField="score"
                color="#1890ff"
                meta={{
                  grade: { alias: '年级' },
                  score: { alias: '平均分' }
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <Title level={5}>性别成绩对比</Title>
            <div style={{ height: 400 }}>
              <Column
                data={genderComparisonData}
                xField="gender"
                yField="score"
                color="#52c41a"
                meta={{
                  gender: { alias: '性别' },
                  score: { alias: '平均分' }
                }}
              />
            </div>
          </Col>
        </Row>
      )
    },
    {
      key: '3',
      label: '单项分析',
      children: (
        <Row gutter={16}>
          <Col span={24}>
            <Title level={5}>单项成绩柱状图</Title>
            <div style={{ height: 400 }}>
              <Column
                data={itemAnalysisData}
                xField="item"
                yField="score"
                color="#722ed1"
                label={{
                  position: 'top'
                }}
                meta={{
                  item: { alias: '测试项目' },
                  score: { alias: '平均分' }
                }}
              />
            </div>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <div>
      <Title level={4}>数据图表分析</Title>
      <Tabs items={tabItems} />
    </div>
  )
}

export default StatisticsCharts
