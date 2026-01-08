import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addTestItem, updateTestItem, deleteTestItem } from '../../store/physicalTestSlice'

const { Title } = Typography
const { Option } = Select

// 所有年级选项
const gradeOptions = [
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '初一', '初二', '初三', '高一', '高二', '高三',
  '大学一二年级', '大学三四年级'
]

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
]

const TestItemConfig = () => {
  const dispatch = useDispatch()
  const { testItems } = useSelector(state => state.physicalTest)
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedGender, setSelectedGender] = useState('')

  // 过滤测试项目列表
  const filteredItems = testItems.filter(item => {
    // 搜索过滤
    const matchesSearch = item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.itemCode.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.unit.toLowerCase().includes(searchText.toLowerCase())
    
    // 年级过滤
    const matchesGrade = !selectedGrade || item.applicableGrades.includes(selectedGrade)
    
    // 性别过滤
    const matchesGender = !selectedGender || item.applicableGenders.includes(selectedGender)
    
    return matchesSearch && matchesGrade && matchesGender
  })

  // 显示添加/编辑弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue(record)
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingId(null)
  }

  // 提交表单
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          if (editingId) {
            // 编辑测试项目
            dispatch(updateTestItem({ ...values, id: editingId }))
            message.success('测试项目更新成功')
          } else {
            // 添加测试项目
            const newItem = {
              ...values,
              id: testItems.length + 1,
              isPreset: false
            }
            dispatch(addTestItem(newItem))
            message.success('测试项目创建成功')
          }
          setIsModalVisible(false)
          setLoading(false)
          setEditingId(null)
        }, 500)
      })
      .catch(() => {
        message.error('表单验证失败')
      })
  }

  // 删除测试项目
  const handleDelete = (id) => {
    const itemToDelete = testItems.find(item => item.id === id)
    const content = itemToDelete?.isPreset ? 
      '这是预制测试项目，删除后可能影响系统功能，您确定要删除吗？' : 
      '您确定要删除这个测试项目吗？'
    
    Modal.confirm({
      title: '确认删除',
      content: content,
      onOk: () => {
        dispatch(deleteTestItem(id))
        message.success('测试项目删除成功')
      }
    })
  }

  // 表格列配置
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 150,
      render: (text, record) => (
        <Space>
          {text}
          {record.isPreset && <Tag color="blue">预制</Tag>}
        </Space>
      )
    },
    {
      title: '项目编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 150
    },
    {
      title: '项目类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 120,
      render: (type) => {
        const typeMap = {
          required: '必测',
          optional: '选测',
          bonus: '加分'
        }
        return <span>{typeMap[type] || type}</span>
      }
    },
    {
      title: '适用年级',
      dataIndex: 'applicableGrades',
      key: 'applicableGrades',
      width: 200,
      render: (grades) => (
        <Space wrap>
          {grades.map((grade, index) => (
            <Tag key={index} color="green">{grade}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '适用性别',
      dataIndex: 'applicableGenders',
      key: 'applicableGenders',
      width: 120,
      render: (genders) => (
        <Space>
          {genders.map((gender, index) => (
            <Tag key={index} color={gender === 'male' ? 'blue' : 'pink'}>
              {genderOptions.find(g => g.value === gender)?.label}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 100
    },
    {
      title: '最小值',
      dataIndex: 'minValue',
      key: 'minValue',
      width: 100
    },
    {
      title: '最大值',
      dataIndex: 'maxValue',
      key: 'maxValue',
      width: 100
    },
    {
      title: '权重(%)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <Title level={3}>测试项目配置</Title>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="筛选年级"
            value={selectedGrade}
            onChange={setSelectedGrade}
            style={{ width: 150 }}
            allowClear
          >
            {gradeOptions.map(grade => (
              <Option key={grade} value={grade}>{grade}</Option>
            ))}
          </Select>
          <Select
            placeholder="筛选性别"
            value={selectedGender}
            onChange={setSelectedGender}
            style={{ width: 100 }}
            allowClear
          >
            {genderOptions.map(gender => (
              <Option key={gender.value} value={gender.value}>{gender.label}</Option>
            ))}
          </Select>
          <Input
            placeholder="搜索测试项目..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            添加测试项目
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* 添加/编辑测试项目弹窗 */}
      <Modal
        title={editingId ? '编辑测试项目' : '添加测试项目'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Form.Item
              name="itemName"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称!' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>

            <Form.Item
              name="itemCode"
              label="项目编码"
              rules={[{ required: true, message: '请输入项目编码!' }]}
            >
              <Input placeholder="请输入项目编码" />
            </Form.Item>

            <Form.Item
              name="itemType"
              label="项目类型"
              rules={[{ required: true, message: '请选择项目类型!' }]}
            >
              <Select placeholder="请选择项目类型">
                <Option value="required">必测</Option>
                <Option value="optional">选测</Option>
                <Option value="bonus">加分</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label="权重(%)"
              rules={[{ required: true, message: '请输入权重!' }, { type: 'number', message: '请输入数字!' }]}
            >
              <Input type="number" placeholder="请输入权重" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="单位"
              rules={[{ required: true, message: '请输入单位!' }]}
            >
              <Input placeholder="请输入单位" />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                name="minValue"
                label="最小值"
                rules={[{ required: true, message: '请输入最小值!' }, { type: 'number', message: '请输入数字!' }]}
              >
                <Input type="number" placeholder="请输入最小值" />
              </Form.Item>

              <Form.Item
                name="maxValue"
                label="最大值"
                rules={[{ required: true, message: '请输入最大值!' }, { type: 'number', message: '请输入数字!' }]}
              >
                <Input type="number" placeholder="请输入最大值" />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="applicableGrades"
            label="适用年级"
            rules={[{ required: true, message: '请选择适用年级!' }]}
          >
            <Select placeholder="请选择适用年级" mode="multiple" style={{ width: '100%' }}>
              {gradeOptions.map(grade => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="applicableGenders"
            label="适用性别"
            rules={[{ required: true, message: '请选择适用性别!' }]}
          >
            <Select placeholder="请选择适用性别" mode="multiple" style={{ width: '100%' }}>
              {genderOptions.map(gender => (
                <Option key={gender.value} value={gender.value}>{gender.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TestItemConfig
