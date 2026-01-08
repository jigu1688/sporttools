import React, { useEffect } from 'react'
import { Card, Row, Col, Typography } from 'antd'
import { useDispatch } from 'react-redux'
import StatisticsFilter from './StatisticsFilter'
import StatisticsCards from './StatisticsCards'
import StatisticsCharts from './StatisticsCharts'
import StatisticsTable from './StatisticsTable'
import StatisticsExport from './StatisticsExport'
import { fetchPhysicalTests, fetchPhysicalTestStatistics } from '../../store/physicalTestSlice'

const { Title } = Typography

const Statistics = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(fetchPhysicalTests())
    dispatch(fetchPhysicalTestStatistics())
  }, [dispatch])
  
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
