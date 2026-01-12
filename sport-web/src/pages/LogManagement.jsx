import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Modal, 
  Row, 
  Col,
  Tag,
  Popconfirm,
  Typography,
  Tooltip,
  Tabs,
  Statistic
} from 'antd'
import { 
  SearchOutlined, 
  ExportOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import {
  fetchLogs,
  fetchSystemLogs,
  fetchUserActionLogs,
  fetchSecurityLogs,
  fetchErrorLogs,
  fetchLogsByDateRange,
  fetchLogsByUser,
  fetchLogsByAction,
  searchLogs,
  exportLogs,
  cleanupLogs,
  fetchLogStatistics,
  fetchLogLevelDistribution,
  fetchActionTypeDistribution,
  selectLogs,
  selectLogStatistics,
  selectLogLevelDistribution,
  selectActionTypeDistribution,
  selectLogLoading,
  selectLogExportLoading,
  selectLogPagination,
  selectLogFilters,
  setLogFilters,
  setLogPagination,
  clearLogError
} from '../store/logSlice'
import { PermissionGuard } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Title, Text } = Typography
const { TabPane } = Tabs

const LogManagement = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedLog, setSelectedLog] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false)
  const [cleanupDays, setCleanupDays] = useState(30)

  const dispatch = useDispatch()
  const logs = useSelector(selectLogs)
  const statistics = useSelector(selectLogStatistics)
  const levelDistribution = useSelector(selectLogLevelDistribution)
  const actionTypeDistribution = useSelector(selectActionTypeDistribution)
  const loading = useSelector(selectLogLoading)
  const exportLoading = useSelector(selectLogExportLoading)
  const pagination = useSelector(selectLogPagination)
  const filters = useSelector(selectLogFilters)

  // 加载日志数据
  useEffect(() => {
    loadLogs()
  }, [dispatch, activeTab, filters, pagination.page, pagination.pageSize])

  // 加载统计数据
  useEffect(() => {
    loadStatistics()
  }, [dispatch])

  const loadLogs = async () => {
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      }

      let action
      switch (activeTab) {
        case 'system':
          action = fetchSystemLogs
          break
        case 'user':
          action = fetchUserActionLogs
          break
        case 'security':
          action = fetchSecurityLogs
          break
        case 'error':
          action = fetchErrorLogs
          break
        default:
          action = fetchLogs
      }

      await dispatch(action(params)).unwrap()
    } catch (error) {
      console.error('加载日志失败:', error)
      message.error('加载日志失败')
    }
  }

  const loadStatistics = async () => {
    try {
      await Promise.all([
        dispatch(fetchLogStatistics()).unwrap(),
        dispatch(fetchLogLevelDistribution()).unwrap(),
        dispatch(fetchActionTypeDistribution()).unwrap()
      ])
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 搜索处理
  const handleSearch = (value) => {
    dispatch(setLogFilters({ search: value }))
    dispatch(setLogPagination({ page: 1 }))
  }

  // 筛选处理
  const handleFilterChange = (key, value) => {
    dispatch(setLogFilters({ [key]: value }))
    dispatch(setLogPagination({ page: 1 }))
  }

  // 日期范围筛选
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates
      dispatch(setLogFilters({ 
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }))
    } else {
      dispatch(setLogFilters({ startDate: null, endDate: null }))
    }
    dispatch(setLogPagination({ page: 1 }))
  }

  // 表格分页处理
  const handleTableChange = (newPagination) => {
    dispatch(setLogPagination({
      page: newPagination.current,
      pageSize: newPagination.pageSize
    }))
  }

  // 查看详情
  const handleViewDetail = (log) => {
    setSelectedLog(log)
    setDetailModalVisible(true)
  }

  // 导出日志
  const handleExport = async () => {
    try {
      const params = { ...filters }
      await dispatch(exportLogs(params)).unwrap()
      
      // 创建下载链接
      const blob = new Blob(['日志数据导出成功'], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`
      link.click()
      
      message.success('日志导出成功')
    } catch (error) {
      console.error('导出日志失败:', error)
      message.error('导出日志失败')
    }
  }

  // 清理日志
  const handleCleanup = async () => {
    try {
      await dispatch(cleanupLogs(cleanupDays)).unwrap()
      message.success(`成功清理${cleanupDays}天前的日志`)
      setCleanupModalVisible(false)
      loadLogs()
      loadStatistics()
    } catch (error) {
      console.error('清理日志失败:', error)
      message.error('清理日志失败')
    }
  }

  // 刷新数据
  const handleRefresh = () => {
    loadLogs()
    loadStatistics()
  }

  // 日志级别颜色映射
  const getLevelColor = (level) => {
    const colorMap = {
      DEBUG: 'default',
      INFO: 'blue',
      WARNING: 'orange',
      ERROR: 'red',
      CRITICAL: 'magenta'
    }
    return colorMap[level] || 'default'
  }

  // 表格列配置
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user) => user?.username || user?.name || '系统'
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      ellipsis: true
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 100
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => (
        <Tag color={getLevelColor(level)}>
          {level}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <span>{description}</span>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3}>系统日志</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <PermissionGuard permissions={PERMISSIONS.LOG_EXPORT}>
            <Button icon={<ExportOutlined />} onClick={handleExport} loading={exportLoading}>
              导出日志
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={PERMISSIONS.LOG_DELETE}>
            <Button danger icon={<DeleteOutlined />} onClick={() => setCleanupModalVisible(true)}>
              清理日志
            </Button>
          </PermissionGuard>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总日志数"
              value={statistics?.totalLogs || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日日志"
              value={statistics?.todayLogs || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误日志"
              value={statistics?.errorLogs || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="安全事件"
              value={statistics?.securityEvents || 0}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索日志内容"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              value={filters.search}
              onChange={(e) => dispatch(setLogFilters({ search: e.target.value }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="日志级别"
              allowClear
              style={{ width: '100%' }}
              value={filters.level}
              onChange={(value) => handleFilterChange('level', value)}
            >
              <Option value="DEBUG">调试</Option>
              <Option value="INFO">信息</Option>
              <Option value="WARNING">警告</Option>
              <Option value="ERROR">错误</Option>
              <Option value="CRITICAL">严重</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="操作类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.action}
              onChange={(value) => handleFilterChange('action', value)}
            >
              <Option value="CREATE">创建</Option>
              <Option value="UPDATE">更新</Option>
              <Option value="DELETE">删除</Option>
              <Option value="LOGIN">登录</Option>
              <Option value="LOGOUT">登出</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="success">成功</Option>
              <Option value="failure">失败</Option>
            </Select>
          </Col>
        </Row>

        {/* 标签页 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
          <TabPane tab="全部日志" key="all" />
          <TabPane tab="系统日志" key="system" />
          <TabPane tab="用户操作" key="user" />
          <TabPane tab="安全事件" key="security" />
          <TabPane tab="错误日志" key="error" />
        </Tabs>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={logs}
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

      {/* 日志详情弹窗 */}
      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>时间：</Text>
                <Text>{selectedLog.timestamp ? dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>用户：</Text>
                <Text>{selectedLog.user?.username || selectedLog.user?.name || '系统'}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>操作：</Text>
                <Text>{selectedLog.action}</Text>
              </Col>
              <Col span={12}>
                <Text strong>资源：</Text>
                <Text>{selectedLog.resource}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>IP地址：</Text>
                <Text>{selectedLog.ip_address}</Text>
              </Col>
              <Col span={12}>
                <Text strong>级别：</Text>
                <Tag color={getLevelColor(selectedLog.level)}>
                  {selectedLog.level}
                </Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>状态：</Text>
                <Tag color={selectedLog.status === 'success' ? 'green' : 'red'}>
                  {selectedLog.status}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>模块：</Text>
                <Text>{selectedLog.module}</Text>
              </Col>
            </Row>
            <div style={{ marginBottom: 16 }}>
              <Text strong>描述：</Text>
              <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Text>{selectedLog.description}</Text>
              </div>
            </div>
            {selectedLog.details && (
              <div>
                <Text strong>详细信息：</Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 清理日志弹窗 */}
      <Modal
        title="清理日志"
        open={cleanupModalVisible}
        onOk={handleCleanup}
        onCancel={() => setCleanupModalVisible(false)}
        okText="确认清理"
        cancelText="取消"
      >
        <div>
          <p>清理指定天数前的日志数据，此操作不可逆！</p>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <label>清理天数：</label>
              <Input
                type="number"
                min={1}
                max={365}
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                addonAfter="天"
                style={{ marginTop: 8 }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fffbe6', borderRadius: 4 }}>
            <Text type="danger">
              警告：此操作将永久删除{cleanupDays}天前的所有日志记录，请谨慎操作！
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LogManagement