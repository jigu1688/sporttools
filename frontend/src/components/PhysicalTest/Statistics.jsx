import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import StatisticsFilter from './StatisticsFilter'
import StatisticsCards from './StatisticsCards'
import StatisticsCharts from './StatisticsCharts'
import StatisticsTable from './StatisticsTable'
import StatisticsExport from './StatisticsExport'

const { Title } = Typography

const Statistics = () => {
  return (
    <div>
      <Title level={3}>体测数据统计分析</Title>
      
      {/* 筛选条件区域 */}
      <Card style={{ marginBottom: 20 }}>
        <StatisticsFilter />
      </Card>
      
      {/* 关键指标卡片区域 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <StatisticsCards />
      </Row>
      
      {/* 图表展示区域 */}
      <Card style={{ marginBottom: 20 }}>
        <StatisticsCharts />
      </Card>
      
      {/* 数据表格区域 */}
      <Card style={{ marginBottom: 20 }}>
        <StatisticsTable />
      </Card>
      
      {/* 导出功能区域 */}
      <Card>
        <StatisticsExport />
      </Card>
    </div>
  )
}

export default Statistics