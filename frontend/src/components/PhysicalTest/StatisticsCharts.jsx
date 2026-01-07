import React from 'react'
import { Row, Col, Typography, Tabs } from 'antd'
import { Bar, Pie, Radar, Column } from '@ant-design/charts'

const { Title } = Typography
const { TabPane } = Tabs

const StatisticsCharts = () => {
  // 模拟数据，后续将从Redux状态获取
  
  // 总分分布数据
  const scoreDistributionData = [
    { range: '0-59', count: 180 },
    { range: '60-69', count: 300 },
    { range: '70-79', count: 360 },
    { range: '80-89', count: 240 },
    { range: '90-100', count: 120 }
  ]
  
  // 等级分布数据
  const gradeDistributionData = [
    { grade: '优秀', count: 300 },
    { grade: '良好', count: 420 },
    { grade: '及格', count: 300 },
    { grade: '不及格', count: 180 }
  ]
  
  // 年级成绩对比数据
  const gradeComparisonData = [
    { grade: '一年级', score: 75.2 },
    { grade: '二年级', score: 76.8 },
    { grade: '三年级', score: 77.5 },
    { grade: '四年级', score: 78.2 },
    { grade: '五年级', score: 79.1 },
    { grade: '六年级', score: 80.5 }
  ]
  
  // 性别成绩对比数据
  const genderComparisonData = [
    { gender: '男', score: 77.8 },
    { gender: '女', score: 79.2 }
  ]
  
  // 单项成绩分析数据
  const itemAnalysisData = [
    { item: '身高', score: 85.5 },
    { item: '体重', score: 82.3 },
    { item: '肺活量', score: 76.8 },
    { item: '50米跑', score: 74.2 },
    { item: '坐位体前屈', score: 79.5 },
    { item: '一分钟跳绳', score: 78.3 },
    { item: '一分钟仰卧起坐', score: 75.6 }
  ]
  
  // 图表配置
  const barConfig = {
    data: scoreDistributionData,
    xField: 'range',
    yField: 'count',
    seriesField: 'range',
    color: ['#1890ff'],
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6
      }
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false
      }
    },
    meta: {
      range: {
        alias: '分数区间'
      },
      count: {
        alias: '人数'
      }
    }
  }
  
  const pieConfig = {
    data: gradeDistributionData,
    angleField: 'count',
    colorField: 'grade',
    radius: 0.8,
    label: {
      type: 'outer'
    },
    interactions: [
      { type: 'element-active' }
    ],
    meta: {
      count: {
        alias: '人数'
      }
    }
  }
  
  const columnConfig = {
    data: gradeComparisonData,
    xField: 'grade',
    yField: 'score',
    color: ['#1890ff'],
    meta: {
      grade: {
        alias: '年级'
      },
      score: {
        alias: '平均分'
      }
    }
  }
  
  const genderColumnConfig = {
    data: genderComparisonData,
    xField: 'gender',
    yField: 'score',
    color: ['#1890ff'],
    meta: {
      gender: {
        alias: '性别'
      },
      score: {
        alias: '平均分'
      }
    }
  }
  
  const radarConfig = {
    data: [
      {
        subject: '身高',
        '平均成绩': 85.5
      },
      {
        subject: '体重',
        '平均成绩': 82.3
      },
      {
        subject: '肺活量',
        '平均成绩': 76.8
      },
      {
        subject: '50米跑',
        '平均成绩': 74.2
      },
      {
        subject: '坐位体前屈',
        '平均成绩': 79.5
      },
      {
        subject: '一分钟跳绳',
        '平均成绩': 78.3
      },
      {
        subject: '一分钟仰卧起坐',
        '平均成绩': 75.6
      }
    ],
    xField: 'subject',
    yField: '平均成绩',
    seriesField: 'subject',
    meta: {
      '平均成绩': {
        min: 60,
        max: 100
      }
    }
  }
  
  return (
    <div>
      <Title level={4}>数据图表分析</Title>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="总分分布" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ height: 400 }}>
                <Bar {...barConfig} />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ height: 400 }}>
                <Pie {...pieConfig} />
              </div>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="对比分析" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>年级成绩对比</Title>
              <div style={{ height: 400 }}>
                <Column {...columnConfig} />
              </div>
            </Col>
            <Col span={12}>
              <Title level={5}>性别成绩对比</Title>
              <div style={{ height: 400 }}>
                <Column {...genderColumnConfig} />
              </div>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="单项分析" key="3">
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>单项成绩雷达图</Title>
              <div style={{ height: 400 }}>
                <Radar {...radarConfig} />
              </div>
            </Col>
            <Col span={12}>
              <Title level={5}>单项成绩柱状图</Title>
              <div style={{ height: 400 }}>
                <Column
                  data={itemAnalysisData}
                  xField="item"
                  yField="score"
                  color={['#1890ff']}
                  meta={{
                    item: {
                      alias: '测试项目'
                    },
                    score: {
                      alias: '平均分'
                    }
                  }}
                />
              </div>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default StatisticsCharts