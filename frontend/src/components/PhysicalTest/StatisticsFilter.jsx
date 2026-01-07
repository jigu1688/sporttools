import React, { useState, useMemo } from 'react'
import { Form, Select, DatePicker, Button, Row, Col } from 'antd'
import { useSelector } from 'react-redux'

const { Option } = Select
const { RangePicker } = DatePicker

const StatisticsFilter = () => {
  const [form] = Form.useForm()
  const { students } = useSelector(state => state.data)
  
  // 获取所有年级选项
  const gradeOptions = useMemo(() => {
    const grades = [...new Set(students.map(student => student.grade))]
    return grades.map(grade => (
      <Option key={grade} value={grade}>{grade}</Option>
    ))
  }, [students])
  
  // 获取班级选项，支持根据年级过滤
  const getClassOptions = () => {
    const values = form.getFieldsValue()
    let result = [...students]
    if (values.grade) {
      result = result.filter(student => student.grade === values.grade)
    }
    const classNames = [...new Set(result.map(student => student.className))]
    return classNames.map(className => (
      <Option key={className} value={className}>{className}</Option>
    ))
  }
  
  // 处理搜索
  const handleSearch = () => {
    const values = form.getFieldsValue()
    console.log('搜索条件:', values)
    // 后续将调用Redux action来获取统计数据
  }
  
  // 处理重置
  const handleReset = () => {
    form.resetFields()
  }
  
  return (
    <Form
      form={form}
      layout="horizontal"
      initialValues={{
        grade: '',
        classes: [],
        gender: 'all',
        studentStatus: 'all',
        dimension: 'grade'
      }}
    >
      <Row gutter={16} align="middle">
        <Col span={4}>
          <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级">
              <Option value="">全部</Option>
              {gradeOptions}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={4}>
          <Form.Item name="classes" label="班级">
            <Select placeholder="请选择班级" mode="multiple">
              {getClassOptions()}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={4}>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别">
              <Option value="all">全部</Option>
              <Option value="male">男</Option>
              <Option value="female">女</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={6}>
          <Form.Item name="dateRange" label="测试日期">
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        
        <Col span={4}>
          <Form.Item name="studentStatus" label="考生状态">
            <Select placeholder="请选择考生状态">
              <Option value="all">全部</Option>
              <Option value="正常">正常</Option>
              <Option value="因病免体">因病免体</Option>
              <Option value="因伤免体">因伤免体</Option>
              <Option value="重疾免测">重疾免测</Option>
              <Option value="残疾免测">残疾免测</Option>
              <Option value="其他免测">其他免测</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={4}>
          <Form.Item name="dimension" label="统计维度">
            <Select placeholder="请选择统计维度">
              <Option value="grade">按年级</Option>
              <Option value="class">按班级</Option>
              <Option value="gender">按性别</Option>
              <Option value="testItem">按测试项目</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={4}>
          <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default StatisticsFilter