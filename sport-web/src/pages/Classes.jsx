import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Card, Space, Typography, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { 
  addClass, 
  updateClass, 
  deleteClass,
  fetchClasses,
  createClassAPI,
  updateClassAPI,
  deleteClassAPI
} from '../store/dataSlice'
import apiClient from '../utils/apiClient'

const { Title } = Typography
const { Option } = Select

const Classes = () => {
  const { classes } = useSelector(state => state.data)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState(null)
  
  // 定义fetchData函数
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      await dispatch(fetchClasses()).unwrap()
    } catch (error) {
      console.error('获取班级列表失败:', error)
      message.error(error?.message || '获取班级列表失败')
    } finally {
      setLoading(false)
    }
  }, [dispatch])
  
  // 获取班级列表（只要有 localStorage token 就加载）
  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token) {
          fetchData();
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e);
      }
    }
  }, [fetchData])
  
  // 显示添加/编辑弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      form.setFieldsValue({
        grade: record.grade,
        className: record.className,
        coach: record.coach,
        physicalTeacher: record.physicalTeacher,
        maxStudentCount: record.maxStudentCount || 60,
        status: record.status || 'active'
      })
    } else {
      setEditingId(null)
      form.resetFields()
      // 设置默认值
      form.setFieldsValue({
        maxStudentCount: 60,
        status: 'active'
      })
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
        
        // 根据年级提取年级级别 (一年级=1, 二年级=2, ...)
        const gradeLevel = parseInt(values.grade.replace(/[^0-9]/g, '')) || 1
        
        if (editingId) {
          // 更新班级 - 发送所有可更新字段（包括空值）
          const updateData = {
            class_name: values.className || null,
            grade: values.grade || null,
            grade_level: gradeLevel || null,
            class_teacher_name: values.coach || null,
            assistant_teacher_name: values.physicalTeacher || null,
            max_student_count: values.maxStudentCount || 60,
            status: values.status || 'active'
          }
          
          dispatch(updateClassAPI({
            id: editingId,
            classData: updateData
          })).unwrap()
          .then(() => {
            message.success('班级更新成功')
            setIsModalVisible(false)
            form.resetFields()
            setEditingId(null)
            fetchData()
          })
          .catch(error => {
            message.error(error || '更新班级失败')
          })
          .finally(() => {
            setLoading(false)
          })
        } else {
          // 创建班级 - 需要所有必填字段
          const createData = {
            class_name: values.className,
            grade: values.grade,
            grade_level: gradeLevel,
            class_teacher_name: values.coach,
            assistant_teacher_name: values.physicalTeacher,
            max_student_count: values.maxStudentCount || 60,
            start_date: new Date().toISOString().split('T')[0],
            school_id: 1,
            school_year_id: 1,
            status: values.status || 'active'
          }
          
          dispatch(createClassAPI(createData)).unwrap()
          .then(() => {
            message.success('班级创建成功')
            setIsModalVisible(false)
            form.resetFields()
            fetchData()
          })
          .catch(error => {
            message.error(error || '创建班级失败')
          })
          .finally(() => {
            setLoading(false)
          })
        }
      })
      .catch(info => {
        // console.log('表单验证失败:', info)
      })
  }

  // 删除班级
  const handleDelete = (id, force = false) => {
    Modal.confirm({
      title: '确认删除',
      content: force ? '班级中有学生，确定要强制删除吗？这将同时删除所有学生的班级关联！' : '您确定要删除这个班级吗？',
      okType: force ? 'danger' : 'primary',
      onOk: async () => {
        setLoading(true)
        try {
          await dispatch(deleteClassAPI({ id, force })).unwrap()
          message.success('班级删除成功')
          fetchData()
        } catch (error) {
          // 如果是因为有学生无法删除，提示用户是否强制删除
          if (error.includes('学生') && !force) {
            Modal.confirm({
              title: '班级中有学生',
              content: error + ' 是否强制删除？',
              okText: '强制删除',
              okType: 'danger',
              cancelText: '取消',
              onOk: () => handleDelete(id, true)
            })
          } else {
            message.error(error || '删除班级失败')
          }
        } finally {
          setLoading(false)
        }
      }
    })
  }



  // 表格列配置
  const columns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'class',
      width: 120
    },
    {
      title: '班主任',
      dataIndex: 'coach',
      key: 'coach',
      width: 80
    },
    {
      title: '体育老师',
      dataIndex: 'physicalTeacher',
      key: 'physicalTeacher',
      width: 80
    },
    {
      title: '当前/最大人数',
      key: 'studentCount',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span>{record.studentCount || 0} / {record.maxStudentCount || 60}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: status => (
        <span>{status === 'active' ? '启用' : '禁用'}</span>
      )
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
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3}>班级管理</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加班级
            </Button>
            <Button danger onClick={async () => {
              Modal.confirm({
                title: '清除数据',
                content: '确认清除所有班级、学生及关联数据？此操作不可恢复。',
                onOk: async () => {
                  try {
                    const res = await apiClient.delete('/debug/clear-data')
                    message.success('清除完成: ' + JSON.stringify(res.deleted))
                    fetchData()
                  } catch (err) {
                    message.error(err?.response?.data?.detail || '清除失败，请检查权限')
                  }
                }
              })
            }}>
              清除数据
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个班级`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200, y: 600 }}
          size="middle"
        />

        {/* 添加/编辑班级弹窗 */}
        <Modal
          title={editingId ? '编辑班级' : '添加班级'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="grade"
              label="年级"
              rules={[{ required: true, message: '请输入年级!' }]}
            >
              <Input placeholder="请输入年级" />
            </Form.Item>

            <Form.Item
              name="className"
              label="班级"
              rules={[{ required: true, message: '请输入班级名称!' }]}
            >
              <Input placeholder="请输入班级名称" />
            </Form.Item>

            <Form.Item
              name="coach"
              label="班主任"
              rules={[{ required: true, message: '请输入班主任姓名!' }]}
            >
              <Input placeholder="请输入班主任姓名" />
            </Form.Item>

            <Form.Item
              name="physicalTeacher"
              label="体育老师"
              rules={[{ required: true, message: '请输入体育老师姓名!' }]}
            >
              <Input placeholder="请输入体育老师姓名" />
            </Form.Item>

            <Form.Item
              name="maxStudentCount"
              label="最大学生数"
              rules={[{ required: true, message: '请输入最大学生数!' }]}
            >
              <InputNumber 
                placeholder="请输入最大学生数" 
                min={1} 
                max={200} 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择班级状态!' }]}
            >
              <Select placeholder="请选择班级状态">
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Classes