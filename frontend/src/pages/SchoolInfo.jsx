import { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Typography, message, Space } from 'antd'
import { SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updateData } from '../store/dataSlice'


const { Title, Text } = Typography
const { Option } = Select

const SchoolInfo = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  const dispatch = useDispatch()
  const { schoolInfo } = useSelector(state => state.data)

  // 初始化表单数据
  useEffect(() => {
    form.setFieldsValue(schoolInfo)
  }, [schoolInfo, form])

  // 提交表单
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        setLoading(true)
        // 模拟API请求
        setTimeout(() => {
          // 保存到Redux store
          dispatch(updateData({ schoolInfo: values }))
          message.success('学校信息保存成功')
          setEditing(false)
          setLoading(false)
        }, 800)
      })
      .catch(() => {
        message.error('表单验证失败')
      })
  }

  // 取消编辑
  const handleCancel = () => {
    form.setFieldsValue(schoolInfo)
    setEditing(false)
  }

  // 开始编辑
  const handleEdit = () => {
    setEditing(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3}>学校信息</Title>
        {!editing && (
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            编辑信息
          </Button>
        )}
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          disabled={!editing}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Form.Item
              name="fullName"
              label="学校全称"
              rules={[{ required: true, message: '请输入学校全称!' }]}
            >
              <Input placeholder="请输入学校全称" />
            </Form.Item>

            <Form.Item
              name="shortName"
              label="学校简称"
              rules={[{ required: true, message: '请输入学校简称!' }]}
            >
              <Input placeholder="请输入学校简称" />
            </Form.Item>

            <Form.Item
              name="area"
              label="所属区域"
              rules={[{ required: true, message: '请输入所属区域!' }]}
            >
              <Input placeholder="请输入所属区域" />
            </Form.Item>

            <Form.Item
              name="schoolLevel"
              label="学段信息"
              rules={[{ required: true, message: '请选择学段信息!' }]}
            >
              <Select placeholder="请选择学段信息">
                <Option value="primary">小学</Option>
                <Option value="middle">中学</Option>
                <Option value="primary-middle">小学+中学</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="teacherCount"
              label="教师人数"
              rules={[{ required: true, message: '请输入教师人数!' }]}
            >
              <InputNumber min={0} placeholder="请输入教师人数" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="registeredStudentCount"
              label="在籍学生人数"
              rules={[{ required: true, message: '请输入在籍学生人数!' }]}
            >
              <InputNumber min={0} placeholder="请输入在籍学生人数" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="currentStudentCount"
              label="在学学生人数"
              rules={[{ required: true, message: '请输入在学学生人数!' }]}
            >
              <InputNumber min={0} placeholder="请输入在学学生人数" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="principal"
              label="校长"
              rules={[{ required: true, message: '请输入校长姓名!' }]}
            >
              <Input placeholder="请输入校长姓名" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="电话"
              rules={[
                { required: true, message: '请输入电话!' },
                { pattern: /^1[3-9]\d{9}$|^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/, message: '请输入有效的电话号码!' }
              ]}
            >
              <Input placeholder="请输入电话" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>

          {editing && (
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} onClick={handleSubmit}>
                  保存修改
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  取消编辑
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>

        {!editing && (
          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <Text strong>说明：</Text>
            <Text>学校信息用于系统显示和统计，管理员可以编辑修改。</Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SchoolInfo