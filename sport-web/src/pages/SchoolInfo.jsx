import { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Typography, message, Space, Row, Col, Statistic, Upload } from 'antd'
import { SaveOutlined, CloseOutlined, EditOutlined, UploadOutlined, UserOutlined, TeamOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { 
  fetchSchool, 
  updateSchool, 
  fetchSchoolStatistics,
  uploadSchoolLogo,
  selectCurrentSchool,
  selectSchoolStatistics,
  selectSchoolLoading,
  clearSchoolError 
} from '../store/schoolSlice'
import { PermissionGuard } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'


const { Title, Text } = Typography
const { Option } = Select

const SchoolInfo = () => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [editing, setEditing] = useState(false)

  const dispatch = useDispatch()
  const currentSchool = useSelector(selectCurrentSchool)
  const schoolStatistics = useSelector(selectSchoolStatistics)
  const loading = useSelector(selectSchoolLoading)

  // 加载学校信息
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        // 假设获取第一个学校，实际应用中可能需要从URL或其他地方获取学校ID
        await dispatch(fetchSchool(1)).unwrap()
        await dispatch(fetchSchoolStatistics(1)).unwrap()
      } catch (error) {
        console.error('加载学校信息失败:', error)
      }
    }
    
    loadSchoolData()
  }, [dispatch])

  // 初始化表单数据
  useEffect(() => {
    if (currentSchool) {
      form.setFieldsValue({
        fullName: currentSchool.school_name,
        shortName: currentSchool.short_name,
        area: currentSchool.area,
        schoolLevel: currentSchool.school_level,
        teacherCount: currentSchool.teacher_count,
        registeredStudentCount: currentSchool.registered_student_count,
        currentStudentCount: currentSchool.current_student_count,
        principal: currentSchool.principal,
        phone: currentSchool.phone,
        email: currentSchool.email,
        address: currentSchool.address,
        description: currentSchool.description,
        website: currentSchool.website
      })
    }
  }, [currentSchool, form])

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 将前端字段名转换为后端字段名
      const schoolData = {
        school_name: values.fullName,
        short_name: values.shortName,
        area: values.area,
        school_level: values.schoolLevel,
        teacher_count: values.teacherCount,
        registered_student_count: values.registeredStudentCount,
        current_student_count: values.currentStudentCount,
        principal: values.principal,
        phone: values.phone,
        email: values.email,
        address: values.address,
        description: values.description,
        website: values.website
      }
      
      const updatedSchool = await dispatch(updateSchool({ 
        id: currentSchool?.id || 1, 
        schoolData: schoolData 
      })).unwrap()
      
      message.success('学校信息保存成功')
      setEditing(false)
    } catch (error) {
      console.error('保存学校信息失败:', error)
      message.error(error?.message || '保存学校信息失败')
    }
  }

  // 取消编辑
  const handleCancel = () => {
    form.resetFields()
    setEditing(false)
    if (currentSchool) {
      form.setFieldsValue(currentSchool)
    }
  }

  // 开始编辑
  const handleEdit = () => {
    setEditing(true)
  }

  // 处理头像上传
  const handleUploadChange = (info) => {
    setFileList(info.fileList)
  }

  const uploadLogo = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的logo文件')
      return
    }

    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)

    try {
      await dispatch(uploadSchoolLogo({ 
        id: currentSchool?.id || 1, 
        formData 
      })).unwrap()
      
      message.success('Logo上传成功')
      setFileList([])
      // 重新加载学校信息
      dispatch(fetchSchool(1))
    } catch (error) {
      console.error('Logo上传失败:', error)
      message.error(error?.message || 'Logo上传失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3}>学校信息</Title>
        <PermissionGuard permissions={PERMISSIONS.SCHOOL_WRITE}>
          {!editing && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑信息
            </Button>
          )}
        </PermissionGuard>
      </div>

      {/* 学校统计信息 */}
      {schoolStatistics && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="班级总数"
                value={schoolStatistics.totalClasses || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="教师总数"
                value={schoolStatistics.totalTeachers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="学生总数"
                value={schoolStatistics.totalStudents || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="体测完成率"
                value={schoolStatistics.physicalTestCompletionRate || 0}
                suffix="%"
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col span={16}>
          <Card title="基本信息" loading={loading}>
            <Form
              form={form}
              layout="vertical"
              disabled={!editing}
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
                      <Option value="primary-middle">小学+中学</Option>
                      <Option value="high">高中</Option>
                      <Option value="middle-high">中学+高中</Option>
                      <Option value="all">小学+中学+高中</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="teacherCount"
                    label="教师人数"
                  >
                    <InputNumber min={0} placeholder="请输入教师人数" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="registeredStudentCount"
                    label="在籍学生人数"
                  >
                    <InputNumber min={0} placeholder="请输入在籍学生人数" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="currentStudentCount"
                    label="在学学生人数"
                  >
                    <InputNumber min={0} placeholder="请输入在学学生人数" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="principal"
                    label="校长"
                  >
                    <Input placeholder="请输入校长姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="联系电话"
                    rules={[
                      { pattern: /^1[3-9]\d{9}$|^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/, message: '请输入有效的电话号码!' }
                    ]}
                  >
                    <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { type: 'email', message: '请输入有效的邮箱地址!' }
                    ]}
                  >
                    <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
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
              >
                <Input.TextArea placeholder="请输入学校地址" rows={2} />
              </Form.Item>

              <Form.Item
                name="description"
                label="学校简介"
              >
                <Input.TextArea placeholder="请输入学校简介" rows={4} />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSubmit}>
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
        </Col>

        <Col span={8}>
          <Card title="学校Logo" style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              {currentSchool?.logo ? (
                <img 
                  src={currentSchool.logo} 
                  alt="学校Logo" 
                  style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                />
              ) : (
                <div style={{ 
                  width: 200, 
                  height: 200, 
                  border: '2px dashed #d9d9d9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  borderRadius: 4
                }}>
                  <span style={{ color: '#999' }}>暂无Logo</span>
                </div>
              )}
              
              <PermissionGuard permissions={PERMISSIONS.SCHOOL_WRITE}>
                <Upload
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} disabled={loading}>
                    选择Logo文件
                  </Button>
                </Upload>
                {fileList.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={uploadLogo} loading={loading}>
                      上传Logo
                    </Button>
                  </div>
                )}
              </PermissionGuard>
            </div>
          </Card>

          <Card title="系统信息">
            <div style={{ marginBottom: 16 }}>
              <Text strong>创建时间：</Text>
              <Text>{currentSchool?.createdAt ? new Date(currentSchool.createdAt).toLocaleString() : '-'}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>最后更新：</Text>
              <Text>{currentSchool?.updatedAt ? new Date(currentSchool.updatedAt).toLocaleString() : '-'}</Text>
            </div>
            <div>
              <Text strong>系统版本：</Text>
              <Text>v1.0.0</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SchoolInfo