import React, { useMemo, useEffect } from 'react'
import { Table, Typography, Spin, Empty } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDetailedStatistics } from '../../store/physicalTestSlice'

const { Title } = Typography

const StatisticsTable = () => {
  const dispatch = useDispatch()
  const { detailedStatistics, loading } = useSelector(state => state.physicalTest)
  
  useEffect(() => {
    dispatch(fetchDetailedStatistics())
  }, [dispatch])
  
  // 从API返回的年级对比数据生成表格数据
  const tableData = useMemo(() => {
    const gradeComparison = detailedStatistics.gradeComparison || {}
    
    // 如果没有数据，返回空数组
    if (Object.keys(gradeComparison).length === 0) {
      return []
    }
    
    return Object.entries(gradeComparison).map(([grade, stats], index) => {
      return {
        key: index,
        grade,
        testedStudents: stats.count || 0,
        averageScore: Math.round(stats.average || 0),
        maxScore: stats.max || 0,
        minScore: stats.min || 0,
        // 使用后端返回的精确等级统计
        excellentCount: stats.excellent || 0,
        goodCount: stats.good || 0,
        passCount: stats.pass || 0,
        failCount: stats.fail || 0,
        excellentRate: stats.excellent_rate ? `${stats.excellent_rate}%` : '0%',
        goodRate: stats.good_rate ? `${stats.good_rate}%` : '0%',
        passRate: stats.pass_rate ? `${stats.pass_rate}%` : '0%',
        failRate: stats.fail_rate ? `${stats.fail_rate}%` : '0%'
      }
    }).sort((a, b) => a.grade.localeCompare(b.grade, 'zh-CN'))
  }, [detailedStatistics])
  
  const columns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      sorter: (a, b) => a.grade.localeCompare(b.grade, 'zh-CN'),
    },
    {
      title: '测试人数',
      dataIndex: 'testedStudents',
      key: 'testedStudents',
      width: 100,
      sorter: (a, b) => a.testedStudents - b.testedStudents,
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      width: 100,
      sorter: (a, b) => a.averageScore - b.averageScore,
    },
    {
      title: '最高分',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 100,
      sorter: (a, b) => a.maxScore - b.maxScore,
    },
    {
      title: '最低分',
      dataIndex: 'minScore',
      key: 'minScore',
      width: 100,
      sorter: (a, b) => a.minScore - b.minScore,
    },
    {
      title: '优秀率',
      dataIndex: 'excellentRate',
      key: 'excellentRate',
      width: 100,
      sorter: (a, b) => parseFloat(a.excellentRate) - parseFloat(b.excellentRate),
    },
    {
      title: '良好率',
      dataIndex: 'goodRate',
      key: 'goodRate',
      width: 100,
      sorter: (a, b) => parseFloat(a.goodRate) - parseFloat(b.goodRate),
    },
    {
      title: '及格率',
      dataIndex: 'passRate',
      key: 'passRate',
      width: 100,
      sorter: (a, b) => parseFloat(a.passRate) - parseFloat(b.passRate),
    },
    {
      title: '不及格率',
      dataIndex: 'failRate',
      key: 'failRate',
      width: 100,
      sorter: (a, b) => parseFloat(a.failRate) - parseFloat(b.failRate),
    }
  ]
  
  const paginationConfig = {
    current: 1,
    pageSize: 10,
    total: tableData.length,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
  }
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }
  
  return (
    <div>
      <Title level={4}>详细统计数据</Title>
      {tableData.length > 0 ? (
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={paginationConfig}
          bordered
          scroll={{ x: 1000 }}
        />
      ) : (
        <Empty description="暂无统计数据，请先录入体测成绩" />
      )}
    </div>
  )
}

export default StatisticsTable
