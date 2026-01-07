import React from 'react'
import { Table, Typography } from 'antd'
import { useSelector } from 'react-redux'

const { Title } = Typography

const StatisticsTable = () => {
  // 模拟数据，后续将从Redux状态获取
  const mockTableData = [
    {
      key: '1',
      grade: '一年级',
      totalStudents: 200,
      testedStudents: 190,
      exemptStudents: 10,
      averageScore: 75.2,
      excellentRate: '20%',
      goodRate: '30%',
      passRate: '30%',
      failRate: '20%'
    },
    {
      key: '2',
      grade: '二年级',
      totalStudents: 200,
      testedStudents: 185,
      exemptStudents: 15,
      averageScore: 76.8,
      excellentRate: '22%',
      goodRate: '32%',
      passRate: '30%',
      failRate: '16%'
    },
    {
      key: '3',
      grade: '三年级',
      totalStudents: 200,
      testedStudents: 195,
      exemptStudents: 5,
      averageScore: 77.5,
      excellentRate: '24%',
      goodRate: '34%',
      passRate: '30%',
      failRate: '12%'
    },
    {
      key: '4',
      grade: '四年级',
      totalStudents: 200,
      testedStudents: 192,
      exemptStudents: 8,
      averageScore: 78.2,
      excellentRate: '26%',
      goodRate: '36%',
      passRate: '28%',
      failRate: '10%'
    },
    {
      key: '5',
      grade: '五年级',
      totalStudents: 200,
      testedStudents: 198,
      exemptStudents: 2,
      averageScore: 79.1,
      excellentRate: '28%',
      goodRate: '38%',
      passRate: '26%',
      failRate: '8%'
    },
    {
      key: '6',
      grade: '六年级',
      totalStudents: 200,
      testedStudents: 188,
      exemptStudents: 12,
      averageScore: 80.5,
      excellentRate: '30%',
      goodRate: '40%',
      passRate: '22%',
      failRate: '8%'
    }
  ]
  
  // 表格列配置
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
  
  // 分页配置
  const paginationConfig = {
    current: 1,
    pageSize: 10,
    total: mockTableData.length,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
  }
  
  return (
    <div>
      <Title level={4}>详细统计数据</Title>
      <Table
        columns={columns}
        dataSource={mockTableData}
        pagination={paginationConfig}
        bordered
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default StatisticsTable