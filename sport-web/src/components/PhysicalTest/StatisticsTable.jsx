import React, { useMemo } from 'react'
import { Table, Typography } from 'antd'
import { useSelector } from 'react-redux'

const { Title } = Typography

const StatisticsTable = () => {
  const { testRecords } = useSelector(state => state.physicalTest)
  const { students } = useSelector(state => state.data)
  
  const tableData = useMemo(() => {
    const gradeStats = {}
    
    students.forEach(student => {
      const grade = student.grade
      if (!gradeStats[grade]) {
        gradeStats[grade] = {
          totalStudents: 0,
          testedStudents: 0,
          exemptStudents: 0,
          totalScore: 0,
          excellentCount: 0,
          goodCount: 0,
          passCount: 0,
          failCount: 0
        }
      }
      gradeStats[grade].totalStudents++
    })
    
    testRecords.forEach(record => {
      const grade = record.grade
      if (gradeStats[grade]) {
        gradeStats[grade].testedStudents++
        const score = record.totalScore || 0
        gradeStats[grade].totalScore += score
        
        const gradeLevel = record.gradeLevel || '及格'
        if (gradeLevel === '优秀') gradeStats[grade].excellentCount++
        else if (gradeLevel === '良好') gradeStats[grade].goodCount++
        else if (gradeLevel === '及格') gradeStats[grade].passCount++
        else gradeStats[grade].failCount++
        
        if (record.studentStatus !== '正常') {
          gradeStats[grade].exemptStudents++
        }
      }
    })
    
    return Object.entries(gradeStats).map(([grade, stats], index) => {
      const total = stats.testedStudents || 1
      return {
        key: index,
        grade,
        totalStudents: stats.totalStudents,
        testedStudents: stats.testedStudents,
        exemptStudents: stats.exemptStudents,
        averageScore: stats.totalScore > 0 ? Math.round(stats.totalScore / total) : 0,
        excellentRate: stats.totalStudents > 0 
          ? `${Math.round((stats.excellentCount / stats.totalStudents) * 100)}%` 
          : '0%',
        goodRate: stats.totalStudents > 0 
          ? `${Math.round((stats.goodCount / stats.totalStudents) * 100)}%` 
          : '0%',
        passRate: stats.totalStudents > 0 
          ? `${Math.round((stats.passCount / stats.totalStudents) * 100)}%` 
          : '0%',
        failRate: stats.totalStudents > 0 
          ? `${Math.round((stats.failCount / stats.totalStudents) * 100)}%` 
          : '0%'
      }
    })
  }, [testRecords, students])
  
  const columns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      sorter: (a, b) => a.grade.localeCompare(b.grade),
    },
    {
      title: '总人数',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 100,
      sorter: (a, b) => a.totalStudents - b.totalStudents,
    },
    {
      title: '参加测试人数',
      dataIndex: 'testedStudents',
      key: 'testedStudents',
      width: 120,
      sorter: (a, b) => a.testedStudents - b.testedStudents,
    },
    {
      title: '免测人数',
      dataIndex: 'exemptStudents',
      key: 'exemptStudents',
      width: 100,
      sorter: (a, b) => a.exemptStudents - b.exemptStudents,
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      width: 100,
      sorter: (a, b) => a.averageScore - b.averageScore,
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
  
  return (
    <div>
      <Title level={4}>详细统计数据</Title>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={paginationConfig}
        bordered
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default StatisticsTable
