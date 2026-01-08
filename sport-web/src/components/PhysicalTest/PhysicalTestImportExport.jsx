import { useState } from 'react'
import { Button, Upload, Modal, Card, Typography, message, Progress, Form, Select, Table, Space } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import { parseGradeCode, parseClassCode } from '../../utils/codeMapping'

const { Title, Text } = Typography

const PhysicalTestImportExport = ({ onImportComplete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [excelHeaders, setExcelHeaders] = useState([])
  const [mappingConfig, setMappingConfig] = useState({})
  const [mappingStep, setMappingStep] = useState(0) // 0: 选择文件, 1: 配置映射, 2: 导入完成
  const [previewData, setPreviewData] = useState([])
  const [indexField, setIndexField] = useState('educationId') // 索引字段，默认为教育ID

  // 从Redux获取学生数据
  const { students } = useSelector(state => state.data)

  // 国家标准体测字段映射（严格按照国家体质健康测试网要求）
  const systemFields = [
    { key: 'educationId', title: '教育ID' },
    { key: 'studentName', title: '姓名' },
    { key: 'gender', title: '性别' },
    { key: 'grade', title: '年级' },
    { key: 'className', title: '班级' },
    { key: 'testDate', title: '测试日期' },
    { key: 'height', title: '身高' },
    { key: 'weight', title: '体重' },
    { key: 'bmi', title: '体重指数(BMI)' },
    { key: 'vitalCapacity', title: '肺活量' },
    { key: 'run50m', title: '50米跑' },
    { key: 'run1000m', title: '1000米跑' },
    { key: 'run800m', title: '800米跑' },
    { key: 'sitAndReach', title: '坐位体前屈' },
    { key: 'standingLongJump', title: '立定跳远' },
    { key: 'pullUps', title: '引体向上' },
    { key: 'sitUps', title: '一分钟仰卧起坐' },
    { key: 'ropeSkipping', title: '一分钟跳绳' },
    { key: 'run50m8x', title: '50米×8往返跑' },
    { key: 'totalScore', title: '总分' },
    { key: 'gradeLevel', title: '等级' }
  ]

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

        // 初始化映射配置 - 智能匹配
        const initialMapping = {}
        systemFields.forEach(field => {
          // 尝试自动匹配字段：完全匹配或包含关系
          const matchedHeader = headers.find(header => 
            header === field.title || 
            header.includes(field.title) || 
            field.title.includes(header) ||
            header.replace(/\s*/g, '') === field.title.replace(/\s*/g, '')
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
        const mappedItem = {
          testItems: {},
          indexField: indexField // 记录索引字段类型
        }
        
        // 先映射所有字段
        systemFields.forEach(field => {
          const excelHeader = mappingConfig[field.key]
          if (excelHeader && item[excelHeader] !== undefined && item[excelHeader] !== null) {
            const value = item[excelHeader]
            
            // 处理不同字段类型
            switch (field.key) {
              case 'educationId':
              case 'studentName':
              case 'gender':
              case 'grade':
              case 'className':
              case 'testDate':
              case 'gradeLevel':
              case 'studentId': // 添加全国学籍号字段
                mappedItem[field.key] = value
                break
              case 'bmi':
              case 'height':
              case 'weight':
              case 'vitalCapacity':
              case 'run50m':
              case 'run1000m':
              case 'run800m':
              case 'sitAndReach':
              case 'standingLongJump':
              case 'pullUps':
              case 'sitUps':
              case 'ropeSkipping':
              case 'run50m8x':
                mappedItem.testItems[field.key] = parseFloat(value) || 0
                break
              case 'totalScore':
                mappedItem[field.key] = parseInt(value) || 0
                break
              default:
                break
            }
          }
        })
        
        // 处理性别转换
        if (mappedItem.gender && typeof mappedItem.gender === 'string') {
          mappedItem.gender = mappedItem.gender.includes('男') ? 'male' : 'female'
        }
        
        // 根据索引字段匹配学生信息
        const indexValue = mappedItem[indexField]
        if (indexValue) {
          // 从学生列表中找到对应的学生
          const student = students.find(s => {
            if (indexField === 'educationId') {
              return s.educationId === indexValue
            } else if (indexField === 'studentId') {
              return s.studentId === indexValue
            }
            return false
          })
          
          // 如果找到学生，自动填充学生基本信息
          if (student) {
            mappedItem.studentName = student.name
            mappedItem.gender = student.gender
            mappedItem.grade = student.grade
            mappedItem.className = student.className
            mappedItem.educationId = student.educationId
            mappedItem.studentId = student.studentId
          }
        }
        
        // 转换年级编码为中文名称
        if (mappedItem.grade) {
          mappedItem.grade = parseGradeCode(mappedItem.grade)
        }
        
        // 转换班级编码为中文名称
        if (mappedItem.className) {
          mappedItem.className = parseClassCode(mappedItem.className)
        }
        
        return mappedItem
      })

      // 调用回调函数，传递导入的数据
      if (onImportComplete) {
        onImportComplete(mappedData)
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

  // 下载国家标准模板
  const handleDownloadTemplate = () => {
    // 优化后的模板，移除冗余学生信息字段，只保留必要的成绩列和索引字段
    // 其他学生信息将通过索引字段自动同步
    const templateData = [
      {
        '教育ID': '20240701001',
        '全国学籍号': '',
        '测试日期': '2026-01-04',
        '身高': '120',
        '体重': '25',
        '肺活量': '1500',
        '50米跑': '8.5',
        '坐位体前屈': '15',
        '一分钟跳绳': '100'
      },
      {
        '教育ID': '20240701002',
        '全国学籍号': '',
        '测试日期': '2026-01-04',
        '身高': '115',
        '体重': '22',
        '肺活量': '1400',
        '50米跑': '9.0',
        '坐位体前屈': '18',
        '一分钟跳绳': '110'
      }
    ]

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '体测数据模板')

    // 下载文件
    XLSX.writeFile(wb, '国家标准导入导出体测成绩模板.xlsx')
    message.success('模板下载成功')
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
    resetImport()
  }

  return (
    <>
      <Button 
        type="primary" 
        icon={<UploadOutlined />} 
        onClick={showModal}
      >
        导入成绩
      </Button>

      <Modal
        title="体测数据导入导出"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={5}>体测数据导入</Title>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              下载国家标准模板
            </Button>
          </div>

          {mappingStep === 0 && (
            <>
              <Text>请上传Excel文件，系统将自动解析并智能匹配字段</Text>
              <div style={{ marginTop: 20 }}>
                <Upload
                  name="file"
                  accept=".xlsx, .xls"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} size="large">
                    选择文件
                  </Button>
                </Upload>
              </div>
            </>
          )}

          {mappingStep === 1 && (
            <>
              <Text>请将Excel列与系统字段进行映射配置，系统已尝试智能匹配</Text>
              
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

              {/* 索引字段选择 */}
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <Title level={6}>索引字段选择</Title>
                <Text type="secondary">请选择用于匹配学生的唯一标识字段，系统将根据该字段自动匹配学生信息</Text>
                <div style={{ marginTop: 10 }}>
                  <Select
                    placeholder="请选择索引字段"
                    value={indexField}
                    onChange={(value) => setIndexField(value)}
                    style={{ width: 300 }}
                  >
                    <Option value="educationId">教育ID</Option>
                    <Option value="studentId">全国学籍号</Option>
                  </Select>
                </div>
              </div>

              {/* 字段映射配置 */}
              <div style={{ marginTop: 20 }}>
                <Title level={6}>字段映射配置</Title>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {systemFields.map(field => (
                    <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Text strong style={{ minWidth: 120 }}>{field.title}:</Text>
                      <Select
                        placeholder="请选择Excel列"
                        value={mappingConfig[field.key] || ''}
                        onChange={(value) => handleMappingChange(field.key, value)}
                        style={{ width: '100%' }}
                      >
                        <option value="">不映射</option>
                        {excelHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
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
                <Space>
                  <Button type="primary" onClick={() => {
                    resetImport()
                    setIsModalVisible(false)
                  }}>
                    关闭
                  </Button>
                  <Button onClick={resetImport}>
                    继续导入
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Card>
      </Modal>
    </>
  )
}

export default PhysicalTestImportExport