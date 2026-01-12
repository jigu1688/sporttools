import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Select, Space, Typography, message, Tag, Checkbox, Spin } from 'antd'
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPendingRegistrations, approveRegistration, rejectRegistration } from '../../store/sportsMeetSlice'

const { Title, Text } = Typography
const { Option } = Select

const RegistrationAudit = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [selectedRegistrations, setSelectedRegistrations] = useState([])
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false)
  const [batchAction, setBatchAction] = useState('approve')
  
  const dispatch = useDispatch()
  const { events, registrations, sportsMeets, loading, error } = useSelector(state => state.sportsMeet)
  const [selectedSportsMeetId, setSelectedSportsMeetId] = useState(null)
  
  // 获取待审核报名数据
  useEffect(() => {
    if (sportsMeets && sportsMeets.length > 0) {
      // 默认使用第一个运动会的ID
      const defaultSportsMeetId = sportsMeets[0].id
      setSelectedSportsMeetId(defaultSportsMeetId)
      dispatch(fetchPendingRegistrations(defaultSportsMeetId))
    }
  }, [dispatch, sportsMeets])
  
  // 当选择不同的运动会时，重新获取待审核报名数据
  const handleSportsMeetChange = (value) => {
    setSelectedSportsMeetId(value)
    dispatch(fetchPendingRegistrations(value))
  }
  
  // 查看报名详情
  const handleView = (record) => {
    setSelectedRegistration(record)
    setIsModalVisible(true)
  }
  
  // 关闭详情模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedRegistration(null)
  }
  
  // 审核通过
  const handleApprove = (registrationId) => {
    Modal.confirm({
      title: '确认通过',
      content: (
        <div>
          <p>您确定要通过该学生的报名吗？</p>
        </div>
      ),
      okText: '确认',
      okType: 'success',
      cancelText: '取消',
      onOk: () => {
        dispatch(approveRegistration({ sportsMeetId: selectedSportsMeetId, registrationId }))
          .unwrap()
          .then(() => {
            message.success('报名已通过')
          })
          .catch(err => {
            message.error(`审核通过失败: ${err.message}`)
          })
      }
    })
  }
  
  // 拒绝报名
  const handleReject = (registrationId) => {
    Modal.confirm({
      title: '确认拒绝',
      content: (
        <div>
          <p>您确定要拒绝该学生的报名吗？</p>
        </div>
      ),
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        dispatch(rejectRegistration({ 
          sportsMeetId: selectedSportsMeetId, 
          registrationId, 
          reason: '不符合报名条件' 
        }))
          .unwrap()
          .then(() => {
            message.success('报名已拒绝')
          })
          .catch(err => {
            message.error(`审核拒绝失败: ${err.message}`)
          })
      }
    })
  }
  
  // 显示批量操作模态框
  const showBatchModal = () => {
    if (selectedRegistrations.length === 0) {
      message.warning('请选择要操作的报名记录')
      return
    }
    setIsBatchModalVisible(true)
  }
  
  // 关闭批量操作模态框
  const handleBatchCancel = () => {
    setIsBatchModalVisible(false)
    setBatchAction('approve')
  }
  
  // 执行批量操作
  const handleBatchAction = () => {
    Modal.confirm({
      title: `确认${batchAction === 'approve' ? '通过' : '拒绝'}`,
      content: `您确定要${batchAction === 'approve' ? '通过' : '拒绝'}选中的${selectedRegistrations.length}条报名记录吗？`,
      okText: '确认',
      okType: batchAction === 'approve' ? 'success' : 'danger',
      cancelText: '取消',
      onOk: () => {
        let successCount = 0
        let errorCount = 0
        
        // 使用Promise.all处理批量操作
        Promise.all(
          selectedRegistrations.map(registrationId => {
            if (batchAction === 'approve') {
              return dispatch(approveRegistration({ 
                sportsMeetId: selectedSportsMeetId, 
                registrationId 
              })).unwrap()
            } else {
              return dispatch(rejectRegistration({ 
                sportsMeetId: selectedSportsMeetId, 
                registrationId, 
                reason: '批量拒绝' 
              })).unwrap()
            }
          })
        )
        .then(() => {
          message.success(`${batchAction === 'approve' ? '通过' : '拒绝'}成功 ${selectedRegistrations.length} 条记录`)
        })
        .catch(err => {
          message.error(`操作失败: ${err.message}`)
        })
        .finally(() => {
          setIsBatchModalVisible(false)
          setSelectedRegistrations([])
          setBatchAction('approve')
        })
      }
    })
  }
  

  
  // 表格列配置
  const columns = [
    {
      title: (
        <Checkbox
          indeterminate={selectedRegistrations.length > 0 && selectedRegistrations.length < (registrations?.length || 0)}
          checked={selectedRegistrations.length === (registrations?.length || 0)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRegistrations(registrations && registrations.length > 0 ? registrations.map(reg => reg.id) : [])
            } else {
              setSelectedRegistrations([])
            }
          }}
        >
          选择
        </Checkbox>
      ),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => (
        <Checkbox
          checked={selectedRegistrations.includes(id)}
          onChange={() => {
            if (selectedRegistrations.includes(id)) {
              setSelectedRegistrations(selectedRegistrations.filter(regId => regId !== id))
            } else {
              setSelectedRegistrations([...selectedRegistrations, id])
            }
          }}
        />
      )
    },
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '比赛编号',
      dataIndex: 'competitionNumber',
      key: 'competitionNumber',
      width: 100,
      render: (competitionNumber) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {competitionNumber || '-'}
        </span>
      )
    },
    {
      title: '项目名称',
      dataIndex: ['event', 'name'],
      key: 'eventName',
      width: 150,
      render: (text, record) => {
        const event = events.find(e => e.id === record.eventId)
        return event?.name || ''
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 120
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => {
        // 英文性别转中文显示
        return gender === 'male' || gender === '男' ? '男' : '女'
      }
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = ''
        switch (status) {
          case '待审核':
            color = 'blue'
            break
          case '已通过':
            color = 'green'
            break
          case '已拒绝':
            color = 'red'
            break
          default:
            color = 'default'
        }
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === '待审核' && (
            <>
              <Button 
                type="link" 
                icon={<CheckOutlined />} 
                onClick={() => handleApprove(record.id)}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button 
                type="link" 
                icon={<CloseOutlined />} 
                onClick={() => handleReject(record.id)}
                style={{ color: '#ff4d4f' }}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]
  
  return (
    <div>
      <Space orientation="horizontal" size="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 0 }}>报名审核</Title>
        <Select
          placeholder="选择运动会"
          style={{ width: 200 }}
          value={selectedSportsMeetId}
          onChange={handleSportsMeetChange}
          loading={loading}
          options={sportsMeets && sportsMeets.length > 0 ? sportsMeets.map(sm => ({
            label: sm.name,
            value: sm.id
          })) : []}
        />
        <Button 
          type="primary" 
          onClick={showBatchModal}
          disabled={selectedRegistrations.length === 0}
          loading={loading}
        >
          批量操作
        </Button>
      </Space>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>审核说明：</Text>
        <Text style={{ marginLeft: 16 }}>请审核学生的报名信息，确保符合项目要求</Text>
      </div>
      
      {error && (
        <div style={{ marginBottom: 16, color: 'red' }}>
          加载失败: {error}
        </div>
      )}
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={registrations}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 10
          }}
          locale={{ emptyText: '暂无待审核的报名数据' }}
        />
      </Spin>
      
      {/* 报名详情模态框 */}
      <Modal
        title="报名详情"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {selectedRegistration && (
          <div>
            <p><strong>比赛编号：</strong>{selectedRegistration.competitionNumber || '-'}</p>
            <p><strong>项目名称：</strong>{events.find(e => e.id === selectedRegistration.eventId)?.name || ''}</p>
            <p><strong>学生姓名：</strong>{selectedRegistration.studentName}</p>
            <p><strong>班级：</strong>{selectedRegistration.className}</p>
            <p><strong>性别：</strong>{selectedRegistration.gender}</p>
            <p><strong>年级：</strong>{selectedRegistration.grade}</p>
            <p><strong>报名状态：</strong>
              <Tag 
                color={
                  selectedRegistration.status === '待审核' ? 'blue' : 
                  selectedRegistration.status === '已通过' ? 'green' : 'red'
                }
              >
                {selectedRegistration.status}
              </Tag>
            </p>
            <p><strong>报名时间：</strong>{selectedRegistration.createdAt}</p>
          </div>
        )}
      </Modal>
      
      {/* 批量操作模态框 */}
      <Modal
        title="批量操作"
        open={isBatchModalVisible}
        onOk={handleBatchAction}
        onCancel={handleBatchCancel}
        width={400}
        okText="确认"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="操作类型" required>
            <Select
              value={batchAction}
              onChange={(value) => setBatchAction(value)}
              style={{ width: '100%' }}
            >
              <Option value="approve">批量通过</Option>
              <Option value="reject">批量拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item label="操作说明">
            <Text>{batchAction === 'approve' ? '将选中的报名记录全部设置为通过状态' : '将选中的报名记录全部设置为拒绝状态'}</Text>
          </Form.Item>
          <Form.Item label="选中数量">
            <Text strong>{selectedRegistrations.length} 条记录</Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RegistrationAudit