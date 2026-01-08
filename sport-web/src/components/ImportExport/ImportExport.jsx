import { useState } from 'react'
import { Button, Upload, Modal, Card, Tabs, Typography, message, Progress, Form, Select, Table } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { TabPane } = Tabs

const ImportExport = ({ onImportComplete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('import-students')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [excelHeaders, setExcelHeaders] = useState([])
  const [mappingConfig, setMappingConfig] = useState({})
  const [mappingStep, setMappingStep] = useState(0) // 0: 选择文件, 1: 配置映射, 2: 导入完成
  const [previewData, setPreviewData] = useState([])
  const [extractClasses, setExtractClasses] = useState(false) // 是否从学生数据中提取班级信息

  // 系统支持的字段映射
  const systemFields = {
    students: [
      { key: 'name', title: '姓名' },
      { key: 'gender', title: '性别' },
      { key: 'age', title: '年龄' },
      { key: 'grade', title: '年级' },
      { key: 'className', title: '班级' },
      { key: 'birthDate', title: '出生日期' },
      { key: 'idCard', title: '身份证号' },
      { key: 'studentId', title: '全国学籍号' },
      { key: 'educationId', title: '教育ID' },
      { key: 'phone', title: '电话' },
      { key: 'address', title: '家庭地址' },
      { key: 'status', title: '状态' }
    ],
    classes: [
      { key: 'grade', title: '年级' },
      { key: 'className', title: '班级' },
      { key: 'coach', title: '班主任' },
      { key: 'physicalTeacher', title: '体育老师' },
      { key: 'status', title: '状态' }
    ]
  }

  // 处理文件上传
  const handleFileUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel'
    if (!isExcel) {
      message.error('请上传Excel文件')
      return false
    }

    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          message.error('Excel文件中没有数据')
          return
        }

        // 获取Excel表头
        const headers = Object.keys(jsonData[0])
        setExcelHeaders(headers)
        setFileData(jsonData)
        setPreviewData(jsonData.slice(0, 5)) // 显示前5行预览

        // 初始化映射配置
        const initialMapping = {}
        const fields = activeTab.includes('students') ? systemFields.students : systemFields.classes
        fields.forEach(field => {
          // 尝试自动匹配字段
          const matchedHeader = headers.find(header => 
            header.includes(field.title) || field.title.includes(header)
          )
          initialMapping[field.key] = matchedHeader || ''
        })
        setMappingConfig(initialMapping)

        // 进入映射配置步骤
        setMappingStep(1)
        message.success('文件解析成功，请配置字段映射')
      } catch (error) {
        message.error('文件解析失败：' + error.message)
      }
    }
    reader.onerror = (error) => {
      message.error('文件读取失败：' + error.message)
    }
    reader.readAsArrayBuffer(file)

    return false // 阻止自动上传
  }

  // 处理映射配置变化
  const handleMappingChange = (field, value) => {
    setMappingConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 执行数据导入
  const handleImportData = () => {
    if (!fileData || mappingStep !== 1) {
      message.error('请先选择文件并配置映射')
      return
    }

    setImporting(true)
    setProgress(0)

    // 模拟进度更新
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // 确保只调用一次onImportComplete
    setTimeout(() => {
      clearInterval(interval)
      setImporting(false)
      setMappingStep(2)
      
      // 转换数据格式
      const mappedData = fileData.map(item => {
        const mappedItem = {}
        const fields = activeTab.includes('students') ? systemFields.students : systemFields.classes
        fields.forEach(field => {
          const excelHeader = mappingConfig[field.key]
          if (excelHeader) {
            mappedItem[field.title] = item[excelHeader]
          }
        })
        return mappedItem
      })

      // 调用回调函数，传递导入的数据和提取班级信息选项
      if (onImportComplete) {
        onImportComplete(mappedData, activeTab, extractClasses)
      }
      message.success('数据导入成功')
    }, 1100) // 1100ms确保进度条完成
  }

  // 重置导入流程
  const resetImport = () => {
    setMappingStep(0)
    setFileData(null)
    setExcelHeaders([])
    setMappingConfig({})
    setPreviewData([])
  }

  // 返回上一步
  const goBack = () => {
    if (mappingStep === 1) {
      setMappingStep(0)
      setFileData(null)
      setExcelHeaders([])
      setMappingConfig({})
      setPreviewData([])
    }
  }

  // 导出数据
  const handleExport = (data, filename, headers) => {
    try {
      // 转换数据格式，确保所有字段都存在
      const exportData = data.map(item => {
        const row = {}
        headers.forEach(header => {
          row[header.title] = item[header.key]
        })
        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      XLSX.writeFile(workbook, `${filename}.xlsx`)
      message.success('数据导出成功')
    } catch (error) {
      message.error('数据导出失败：' + error.message)
    }
  }

  // 显示导入导出弹窗
  const showModal = () => {
    setIsModalVisible(true)
  }

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false)
    setImporting(false)
    setProgress(0)
  }

  // 下载模板
  const handleDownloadTemplate = (type) => {
    let headers = []
    let sampleData = []
    let filename = ''

    if (type === 'students') {
      headers = [
        { title: '年级', key: 'grade' },
        { title: '班级', key: 'className' },
        { title: '姓名', key: 'name' },
        { title: '性别', key: 'gender' },
        { title: '年龄', key: 'age' },
        { title: '出生日期', key: 'birthDate' },
        { title: '身份证号', key: 'idCard' },
        { title: '全国学籍号', key: 'studentId' },
        { title: '教育ID', key: 'educationId' },
        { title: '电话', key: 'phone' },
        { title: '家庭地址', key: 'address' },
        { title: '状态', key: 'status' }
      ]
      sampleData = [
        {
          grade: '一年级',
          className: '主校区1班',
          name: '张三',
          gender: '男',
          age: 6,
          birthDate: '2020-01-01',
          idCard: '',
          studentId: 'G110106202001010001',
          educationId: 'E20200001',
          phone: '13800138000',
          address: '北京市朝阳区',
          status: '在学'
        }
      ]
      filename = '学生数据模板'
    } else {
      headers = [
        { title: '年级', key: 'grade' },
        { title: '班级', key: 'className' },
        { title: '班主任', key: 'coach' },
        { title: '体育老师', key: 'physicalTeacher' },
        { title: '状态', key: 'status' }
      ]
      sampleData = [
        {
          grade: '一年级',
          className: '主校区1班',
          coach: '王老师',
          physicalTeacher: '李老师',
          status: 'active'
        }
      ]
      filename = '班级数据模板'
    }

    handleExport(sampleData, filename, headers)
  }

  return (
    <>
      <Button 
        type="primary" 
        icon={<UploadOutlined />} 
        onClick={showModal}
      >
        导入导出
      </Button>

      <Modal
        title="数据导入导出"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <>              
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownloadTemplate('students')}
                style={{ marginRight: 8 }}
              >
                学生模板
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownloadTemplate('classes')}
              >
                班级模板
              </Button>
            </>
          }
        >
          <TabPane tab="导入学生数据" key="import-students">
            <Card bordered={false}>
              {mappingStep === 0 && (
                <>
                  <Title level={5}>学生数据导入</Title>
                  <Text>请上传Excel文件，系统将自动解析并允许您配置字段映射</Text>
                  <div style={{ marginTop: 20 }}>
                    <Upload
                      name="file"
                      accept=".xlsx, .xls"
                      beforeUpload={handleFileUpload}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>
                        选择文件
                      </Button>
                    </Upload>
                  </div>
                </>
              )}

              {mappingStep === 1 && activeTab === 'import-students' && (
                <>
                  <Title level={5}>学生字段映射配置</Title>
                  <Text>请将Excel列与系统字段进行映射配置</Text>
                  
                  {/* 预览数据 */}
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Title level={6}>数据预览（前5行）</Title>
                    <Table
                      columns={excelHeaders.map(header => ({ title: header, dataIndex: header, key: header }))}
                      dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
                      pagination={false}
                      scroll={{ x: 800 }}
                    />
                  </div>

                  {/* 字段映射配置 */}
                  <div style={{ marginTop: 20 }}>
                    <Title level={6}>字段映射配置</Title>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {systemFields.students.map(field => (
                        <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Text strong style={{ minWidth: 80 }}>{field.title}:</Text>
                          <Select
                            placeholder="请选择Excel列"
                            value={mappingConfig[field.key] || ''}
                            onChange={(value) => handleMappingChange(field.key, value)}
                            style={{ width: '100%' }}
                          >
                            <Option value="">不映射</Option>
                            {excelHeaders.map(header => (
                              <Option key={header} value={header}>{header}</Option>
                            ))}
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 导入选项 */}
                  <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <Title level={6}>导入选项</Title>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input 
                        type="checkbox" 
                        checked={extractClasses} 
                        onChange={(e) => setExtractClasses(e.target.checked)}
                      />
                      <span>从学生数据中提取班级信息</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ marginTop: 30, display: 'flex', gap: 10 }}>
                    <Button onClick={goBack}>上一步</Button>
                    <Button type="primary" onClick={handleImportData} loading={importing}>
                      {importing ? '导入中...' : '开始导入'}
                    </Button>
                  </div>
                  
                  {importing && (
                    <div style={{ marginTop: 20 }}>
                      <Progress percent={progress} status="active" />
                      <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>
                        正在导入数据，请稍候...
                      </Text>
                    </div>
                  )}
                </>
              )}

              {mappingStep === 2 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
                  <Title level={4}>数据导入成功！</Title>
                  <Text>导入完成，您可以关闭弹窗或继续导入其他数据</Text>
                  <div style={{ marginTop: 30 }}>
                    <Button type="primary" onClick={() => {
                      resetImport()
                      setIsModalVisible(false)
                    }}>
                      关闭
                    </Button>
                    <Button onClick={resetImport} style={{ marginLeft: 10 }}>
                      继续导入
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabPane>

          <TabPane tab="导入班级数据" key="import-classes">
            <Card bordered={false}>
              {mappingStep === 0 && (
                <>
                  <Title level={5}>班级数据导入</Title>
                  <Text>请上传Excel文件，系统将自动解析并允许您配置字段映射</Text>
                  <div style={{ marginTop: 20 }}>
                    <Upload
                      name="file"
                      accept=".xlsx, .xls"
                      beforeUpload={handleFileUpload}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>
                        选择文件
                      </Button>
                    </Upload>
                  </div>
                </>
              )}

              {mappingStep === 1 && activeTab === 'import-classes' && (
                <>
                  <Title level={5}>班级字段映射配置</Title>
                  <Text>请将Excel列与系统字段进行映射配置</Text>
                  
                  {/* 预览数据 */}
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Title level={6}>数据预览（前5行）</Title>
                    <Table
                      columns={excelHeaders.map(header => ({ title: header, dataIndex: header, key: header }))}
                      dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
                      pagination={false}
                      scroll={{ x: 800 }}
                    />
                  </div>

                  {/* 字段映射配置 */}
                  <div style={{ marginTop: 20 }}>
                    <Title level={6}>字段映射配置</Title>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {systemFields.classes.map(field => (
                        <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Text strong style={{ minWidth: 80 }}>{field.title}:</Text>
                          <Select
                            placeholder="请选择Excel列"
                            value={mappingConfig[field.key] || ''}
                            onChange={(value) => handleMappingChange(field.key, value)}
                            style={{ width: '100%' }}
                          >
                            <Option value="">不映射</Option>
                            {excelHeaders.map(header => (
                              <Option key={header} value={header}>{header}</Option>
                            ))}
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ marginTop: 30, display: 'flex', gap: 10 }}>
                    <Button onClick={goBack}>上一步</Button>
                    <Button type="primary" onClick={handleImportData} loading={importing}>
                      {importing ? '导入中...' : '开始导入'}
                    </Button>
                  </div>
                  
                  {importing && (
                    <div style={{ marginTop: 20 }}>
                      <Progress percent={progress} status="active" />
                      <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>
                        正在导入数据，请稍候...
                      </Text>
                    </div>
                  )}
                </>
              )}

              {mappingStep === 2 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
                  <Title level={4}>数据导入成功！</Title>
                  <Text>导入完成，您可以关闭弹窗或继续导入其他数据</Text>
                  <div style={{ marginTop: 30 }}>
                    <Button type="primary" onClick={() => {
                      resetImport()
                      setIsModalVisible(false)
                    }}>
                      关闭
                    </Button>
                    <Button onClick={resetImport} style={{ marginLeft: 10 }}>
                      继续导入
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabPane>

          <TabPane tab="导出数据" key="export">
            <Card bordered={false}>
              <Title level={5}>数据导出</Title>
              <Text>请选择要导出的数据类型</Text>
              <div style={{ marginTop: 20 }}>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => onImportComplete && onImportComplete(null, 'export-students')}
                >
                  导出学生数据
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => onImportComplete && onImportComplete(null, 'export-classes')}
                  style={{ marginLeft: 10 }}
                >
                  导出班级数据
                </Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  )
}

export default ImportExport
