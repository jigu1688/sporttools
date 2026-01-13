import React, { useMemo, useEffect } from 'react'
import { Row, Col, Typography, Tabs, Empty, Spin } from 'antd'
import { Bar, Pie, Column } from '@ant-design/charts'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDetailedStatistics } from '../../store/physicalTestSlice'

const { Title } = Typography

const StatisticsCharts = () => {
  const dispatch = useDispatch()
  const { detailedStatistics, loading } = useSelector(state => state.physicalTest)
  
  useEffect(() => {
    dispatch(fetchDetailedStatistics())
  }, [dispatch])
  
  // 分数分布数据（从API获取）
  const scoreDistributionData = useMemo(() => {
    const distribution = detailedStatistics.scoreDistribution || {}
    return Object.entries(distribution).map(([range, count]) => ({ range, count }))
  }, [detailedStatistics.scoreDistribution])

  // 等级分布数据（从API获取）
  const gradeDistributionData = useMemo(() => {
    const distribution = detailedStatistics.gradeDistribution || {}
    const gradeNameMap = { 'excellent': '优秀', 'good': '良好', 'pass': '及格', 'fail': '不及格' }
    return Object.entries(distribution)
      .filter(([key]) => ['excellent', 'good', 'pass', 'fail'].includes(key))
      .map(([grade, count]) => ({ grade: gradeNameMap[grade] || grade, count }))
  }, [detailedStatistics.gradeDistribution])

  // 年级对比数据（从API获取）
  const gradeComparisonData = useMemo(() => {
    const comparison = detailedStatistics.gradeComparison || {}
    return Object.entries(comparison).map(([grade, data]) => ({
      grade,
      score: data.average || 0
    }))
  }, [detailedStatistics.gradeComparison])

  // 性别对比数据（从API获取）
  const genderComparisonData = useMemo(() => {
    const comparison = detailedStatistics.genderComparison || {}
    return [
      { gender: '男', score: comparison.male?.average || 0 },
      { gender: '女', score: comparison.female?.average || 0 }
    ]
  }, [detailedStatistics.genderComparison])

  // 单项分析数据（从API获取）
  const itemAnalysisData = useMemo(() => {
    const analysis = detailedStatistics.itemAnalysis || {}
    const itemNameMap = {
      'height': '身高',
      'weight': '体重',
      'vital_capacity': '肺活量',
      'run_50m': '50米跑',
      'run_800m': '800米跑',
      'run_1000m': '1000米跑',
      'sit_and_reach': '坐位体前屈',
      'standing_long_jump': '立定跳远',
      'pull_up': '引体向上',
      'skip_rope': '跳绳'
    }
    return Object.entries(analysis).map(([item, data]) => ({
      item: itemNameMap[item] || item,
      score: data.average || 0
    }))
  }, [detailedStatistics.itemAnalysis])
  
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
  }
  
  // 检查是否有数据
  const hasScoreData = scoreDistributionData.length > 0 && scoreDistributionData.some(d => d.count > 0)
  const hasGradeData = gradeDistributionData.length > 0 && gradeDistributionData.some(d => d.count > 0)
  const hasComparisonData = gradeComparisonData.length > 0
  const hasItemData = itemAnalysisData.length > 0

  const tabItems = [
    {
      key: '1',
      label: '总分分布',
      children: hasScoreData || hasGradeData ? (
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ height: 400 }}>
              {hasScoreData ? (
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
              ) : <Empty description="暂无分数分布数据" />}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ height: 400 }}>
              {hasGradeData ? (
                <Pie
                  data={gradeDistributionData}
                  angleField="count"
                  colorField="grade"
                  radius={0.8}
                  meta={{
                    count: { alias: '人数' }
                  }}
                />
              ) : <Empty description="暂无等级分布数据" />}
            </div>
          </Col>
        </Row>
      ) : <Empty description="暂无体测数据，请先录入体测成绩" />
    },
    {
      key: '2',
      label: '对比分析',
      children: hasComparisonData ? (
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>年级成绩对比</Title>
            <div style={{ height: 400 }}>
              {gradeComparisonData.length > 0 ? (
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
              ) : <Empty description="暂无年级对比数据" />}
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
      ) : <Empty description="暂无对比分析数据" />
    },
    {
      key: '3',
      label: '单项分析',
      children: hasItemData ? (
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
      ) : <Empty description="暂无单项分析数据" />
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
