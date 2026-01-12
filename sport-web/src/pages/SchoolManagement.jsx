import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  message, 
  Modal, 
  Form, 
  Row, 
  Col,
  Tag,
  Popconfirm,
  Typography
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  selectSchools,
  selectSchoolLoading,
  selectSchoolPagination,
  selectSchoolFilters,
  setSchoolFilters,
  setSchoolPagination,
  clearSchoolError
} from '../store/schoolSlice'
import { PermissionGuard } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'

const { Search } = Input
const { Option } = Select
const { Title } = Typography

const SchoolManagement = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSchool, setEditingSchool] = useState(null)
  const [form] = Form.useForm()

  const dispatch = useDispatch()
  const schools = useSelector(selectSchools)
  const loading = useSelector(selectSchoolLoading)
  const pagination = useSelector(selectSchoolPagination)
  const filters = useSelector(selectSchoolFilters)

  // 加载学校列表
  useEffect(() => {
    loadSchools()
  }, [dispatch, filters, pagination.page, pagination.pageSize])

  const loadSchools = async () => {
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      }
      await dispatch(fetchSchools(params)).unwrap()
    } catch (error) {
      console.error('加载学校列表失败:', error)
      message.error('加载学校列表失败')
    }
  }

  // 搜索处理
  const handleSearch = (value) => {
    dispatch(setSchoolFilters({ search: value }))
    dispatch(setSchoolPagination({ page: 1 }))
  }

  // 筛选处理
  const handleFilterChange = (key, value) => {
    dispatch(setSchoolFilters({ [key]: value }))
    dispatch(setSchoolPagination({ page: 1 }))
  }

  // 表格分页处理
  const handleTableChange = (newPagination) => {
    dispatch(setSchoolPagination({
      page: newPagination.current,
      pageSize: newPagination.pageSize
    }))
  }

  // 新增学校
  const handleAdd = () => {
    setEditingSchool(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 编辑学校
  const handleEdit = (school) => {
    setEditingSchool(school)
    form.setFieldsValue(school)
    setModalVisible(true)
  }

  // 删除学校
  const handleDelete = async (schoolId) => {
    try {
      await dispatch(deleteSchool(schoolId)).unwrap()
      message.success('删除学校成功')
    } catch (error) {
      console.error('删除学校失败:', error)
      message.error(error?.message || '删除学校失败')
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingSchool) {
        await dispatch(updateSchool({ 
          id: editingSchool.id, 
          schoolData: values 
        })).unwrap()
        message.success('更新学校成功')
      } else {
        await dispatch(createSchool(values)).unwrap()
        message.success('创建学校成功')
      }
      
      setModalVisible(false)
      form.resetFields()
      loadSchools()
    } catch (error) {
      console.error('保存学校失败:', error)
      message.error(error?.message || '保存学校失败')
    }
  }

  // 取消弹窗
  const handleCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setEditingSchool(null)
  }

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  const columns = [
    {
      title: '学校全称',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      ellipsis: true
    },
    {
      title: '学校简称',
      dataIndex: 'shortName',
      key: 'shortName',
      width: 120
    },
    {
      title: '所属区域',
      dataIndex: 'area',
      key: 'area',
      width: 120
    },
    {
      title: '学段信息',
      dataIndex: 'schoolLevel',
      key: 'schoolLevel',
      width: 120,
      render: (level) => {
        const levelMap = {
          primary: { text: '小学', color: 'green' },
          middle: { text: '中学', color: 'blue' },
          high: { text: '高中', color: 'purple' },
          'primary-middle': { text: '小学+中学', color: 'orange' },
          'middle-high': { text: '中学+高中', color: 'cyan' },
          'all': { text: '全学段', color: 'red' }
        }
        const config = levelMap[level] || { text: level, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '学生人数',
      key: 'students',
      width: 120,
      render: (_, record) => record.currentStudentCount || 0
    },
    {
      title: '教师人数',
      key: 'teachers',
      width: 120,
      render: (_, record) => record.teacherCount || 0
    },
    {
      title: '校长',
      dataIndex: 'principal',
      key: 'principal',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_READ}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              查看
            </Button>
          </PermissionGuard>
          
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_WRITE}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_DELETE}>
            <Popconfirm
              title="确定要删除这个学校吗？"
              description="删除后无法恢复，请谨慎操作。"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3}>学校管理</Title>
        <Space>
          <PermissionGuard permissions={PERMISSIONS.SCHOOL_WRITE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增学校
            </Button>
          </PermissionGuard>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出数据
          </Button>
        </Space>
      </div>

      <Card>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索学校名称或简称"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              value={filters.search}
              onChange={(e) => dispatch(setSchoolFilters({ search: e.target.value }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择学段"
              allowClear
              style={{ width: '100%' }}
              value={filters.schoolLevel}
              onChange={(value) => handleFilterChange('schoolLevel', value)}
            >
              <Option value="primary">小学</Option>
              <Option value="middle">中学</Option>
              <Option value="high">高中</Option>
              <Option value="primary-middle">小学+中学</Option>
              <Option value="middle-high">中学+高中</Option>
              <Option value="all">全学段</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={schools}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingSchool ? '编辑学校' : '新增学校'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="学校全称"
                rules={[{ required: true, message: '请输入学校全称!' }]}
              >
                <Input placeholder="请输入学校全称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shortName"
                label="学校简称"
                rules={[{ required: true, message: '请输入学校简称!' }]}
              >
                <Input placeholder="请输入学校简称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area"
                label="所属区域"
                rules={[{ required: true, message: '请输入所属区域!' }]}
              >
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="schoolLevel"
                label="学段信息"
                rules={[{ required: true, message: '请选择学段信息!' }]}
              >
                <Select placeholder="请选择学段信息">
                  <Option value="primary">小学</Option>
                  <Option value="middle">中学</Option>
                  <Option value="high">高中</Option>
                  <Option value="primary-middle">小学+中学</Option>
                  <Option value="middle-high">中学+高中</Option>
                  <Option value="all">全学段</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="teacherCount"
                label="教师人数"
                rules={[{ required: true, message: '请输入教师人数!' }]}
              >
                <Input type="number" min={0} placeholder="请输入教师人数" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="registeredStudentCount"
                label="在籍学生人数"
                rules={[{ required: true, message: '请输入在籍学生人数!' }]}
              >
                <Input type="number" min={0} placeholder="请输入在籍学生人数" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currentStudentCount"
                label="在学学生人数"
                rules={[{ required: true, message: '请输入在学学生人数!' }]}
              >
                <Input type="number" min={0} placeholder="请输入在学学生人数" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="principal"
                label="校长"
                rules={[{ required: true, message: '请输入校长姓名!' }]}
              >
                <Input placeholder="请输入校长姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话!' },
                  { pattern: /^1[3-9]\d{9}$|^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/, message: '请输入有效的电话号码!' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址!' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="website"
                label="官方网站"
              >
                <Input placeholder="请输入官方网站" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="学校地址"
            rules={[{ required: true, message: '请输入学校地址!' }]}
          >
            <Input.TextArea placeholder="请输入学校地址" rows={2} />
          </Form.Item>

          <Form.Item
            name="description"
            label="学校简介"
          >
            <Input.TextArea placeholder="请输入学校简介" rows={4} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingSchool ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SchoolManagement