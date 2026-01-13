import { useState, useMemo } from 'react'
import { Button, Upload, Modal, Card, Typography, message, Progress, Form, Select, Table, Space, Radio, Alert, Tooltip } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import { parseGradeCode, parseClassCode } from '../../utils/codeMapping'
import { calculatePhysicalTestScore } from '../../utils/scoreCalculator'

const { Title, Text } = Typography
const { Option } = Select

const PhysicalTestImportExport = ({ onImportComplete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [excelHeaders, setExcelHeaders] = useState([])
  const [mappingConfig, setMappingConfig] = useState({})
  const [mappingStep, setMappingStep] = useState(0) // 0: 选择文件, 1: 配置映射, 2: 导入完成
  const [previewData, setPreviewData] = useState([])
  const [indexField, setIndexField] = useState('education_id') // 索引字段
  const [importMode, setImportMode] = useState('merge') // merge: 智能合并, overwrite: 全量覆盖, fillEmpty: 仅填充空值
  const [importStats, setImportStats] = useState({ matched: 0, unmatched: 0 })

  // 从Redux获取学生数据
  const { students } = useSelector(state => state.data)

  // 创建学生索引Map，支持多种字段匹配
  const studentIndexMap = useMemo(() => {
    const map = {
      byEducationId: new Map(),
      byStudentNo: new Map(),
      byName: new Map(),
      byNameAndClass: new Map()
    }
    
    students.forEach(student => {
      // 教育ID索引 - 同时支持 education_id 和 educationId
      const educationId = student.education_id || student.educationId
      if (educationId) {
        map.byEducationId.set(String(educationId), student)
      }
      
      // 学籍号索引
      const studentNo = student.student_no || student.studentNo
      if (studentNo) {
        map.byStudentNo.set(String(studentNo), student)
      }
      
      // 姓名索引（可能有重名）
      const name = student.real_name || student.name || student.studentName
      if (name) {
        if (!map.byName.has(name)) {
          map.byName.set(name, [])
        }
        map.byName.get(name).push(student)
      }
      
      // 姓名+班级联合索引
      const className = student.current_class_name || student.className
      if (name && className) {
        const key = `${name}_${className}`
        map.byNameAndClass.set(key, student)
      }
    })
    
    return map
  }, [students])

  // 国家标准体测字段映射（严格按照国家体质健康测试网要求）
  const systemFields = [
    { key: 'education_id', title: '教育ID', aliases: ['教育ID', '教育id', 'educationId', 'education_id'] },
    { key: 'student_no', title: '学籍号', aliases: ['学籍号', '全国学籍号', 'studentNo', 'student_no'] },
    { key: 'studentName', title: '姓名', aliases: ['姓名', '学生姓名', 'name', 'studentName', '名字'] },
    { key: 'gender', title: '性别', aliases: ['性别', 'gender'] },
    { key: 'grade', title: '年级', aliases: ['年级', 'grade'] },
    { key: 'className', title: '班级', aliases: ['班级', 'class', 'className', '班级名称'] },
    { key: 'testDate', title: '测试日期', aliases: ['测试日期', '测试时间', 'testDate', 'test_date'], excludes: ['出生日期', '生日', '出生', 'birthday', 'birth'] },
    { key: 'height', title: '身高', aliases: ['身高', '身高(cm)', '身高（cm）', 'height'] },
    { key: 'weight', title: '体重', aliases: ['体重', '体重(kg)', '体重（kg）', 'weight'] },
    { key: 'vitalCapacity', title: '肺活量', aliases: ['肺活量', '肺活量(ml)', 'vitalCapacity'] },
    { key: 'run50m', title: '50米跑', aliases: ['50米跑', '50米', '50米跑(s)', 'run50m'] },
    { key: 'sitAndReach', title: '坐位体前屈', aliases: ['坐位体前屈', '坐位体前屈(cm)', 'sitAndReach'] },
    { key: 'ropeSkipping', title: '一分钟跳绳', aliases: ['一分钟跳绳', '跳绳', '跳绳(次)', 'ropeSkipping'] },
    { key: 'sitUps', title: '一分钟仰卧起坐', aliases: ['一分钟仰卧起坐', '仰卧起坐', '仰卧起坐(次)', 'sitUps'] },
    { key: 'standingLongJump', title: '立定跳远', aliases: ['立定跳远', '立定跳远(cm)', 'standingLongJump'] },
    { key: 'pullUps', title: '引体向上', aliases: ['引体向上', '引体向上(次)', 'pullUps'] },
    { key: 'run1000m', title: '1000米跑', aliases: ['1000米跑', '1000米', 'run1000m'] },
    { key: 'run800m', title: '800米跑', aliases: ['800米跑', '800米', 'run800m'] },
    { key: 'run50m8x', title: '50米×8往返跑', aliases: ['50米×8往返跑', '50米8往返跑', '往返跑', 'run50m8x'] },
    { key: 'totalScore', title: '总分', aliases: ['总分', '分数', 'totalScore'] },
    { key: 'gradeLevel', title: '等级', aliases: ['等级', '评价等级', 'gradeLevel'] }
  ]

  // 测试项目字段（用于导入到testItems）
  const testItemFields = ['height', 'weight', 'vitalCapacity', 'run50m', 'sitAndReach', 
    'ropeSkipping', 'sitUps', 'standingLongJump', 'pullUps', 'run1000m', 'run800m', 'run50m8x']

  // 解析时间格式的成绩
  // 支持格式：
  // - 1′25 或 1'25 (国家体测系统导出格式，1分25秒)
  // - 1.25 (用户输入格式，1分25秒，注意：不是1.25秒！)
  // - 1:25 或 1:25.5 (标准时间格式)
  // - 1分25秒
  // 对于耐力跑项目（800米、1000米、往返跑），分.秒格式表示分钟和秒数
  const parseTimeValue = (value, isEnduranceRun = false) => {
    if (typeof value === 'number') {
      // 如果是耐力跑项目且数值较小（如1.25），可能是分.秒格式
      if (isEnduranceRun && value < 20) {
        // 1.25 表示 1分25秒
        const minutes = Math.floor(value)
        const seconds = Math.round((value - minutes) * 100)  // 0.25 -> 25秒
        if (seconds < 60) {
          return minutes * 60 + seconds
        }
      }
      return value
    }
    if (typeof value !== 'string') return null
    
    // 移除空格
    const str = value.trim()
    
    // 匹配各种时间格式
    const timePatterns = [
      /^(\d+)[′''](\d+\.?\d*)[""]?$/,   // 1′25 或 1'25 或 1'25" (国家体测系统格式)
      /^(\d+):(\d+\.?\d*)$/,             // 1:25 或 1:25.5
      /^(\d+)分(\d+\.?\d*)秒?$/,         // 1分25秒
    ]
    
    for (const pattern of timePatterns) {
      const match = str.match(pattern)
      if (match) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseFloat(match[2])
        return minutes * 60 + seconds  // 转换为总秒数
      }
    }
    
    // 尝试解析为数字
    const num = parseFloat(str)
    if (isNaN(num)) return null
    
    // 如果是耐力跑项目且数值较小，判断是否为分.秒格式
    // 比如 1.25 表示 1分25秒，而不是 1.25秒
    if (isEnduranceRun && num < 20) {
      const minutes = Math.floor(num)
      const decimalPart = str.split('.')[1]
      if (decimalPart && decimalPart.length <= 2) {
        // 小数部分作为秒数（如 .25 表示 25秒，.05 表示 5秒）
        const seconds = parseInt(decimalPart.padEnd(2, '0'), 10)
        if (seconds < 60) {
          return minutes * 60 + seconds
        }
      }
    }
    
    return num
  }

  // 智能匹配Excel列名
  const smartMatchHeader = (header, field) => {
    const normalizedHeader = header.toLowerCase().replace(/[\s\(\)（）]/g, '')
    
    // 检查是否在排除列表中
    if (field.excludes) {
      const isExcluded = field.excludes.some(exclude => {
        const normalizedExclude = exclude.toLowerCase().replace(/[\s\(\)（）]/g, '')
        return normalizedHeader.includes(normalizedExclude) || normalizedExclude.includes(normalizedHeader)
      })
      if (isExcluded) return false
    }
    
    return field.aliases.some(alias => {
      const normalizedAlias = alias.toLowerCase().replace(/[\s\(\)（）]/g, '')
      return normalizedHeader === normalizedAlias || 
             normalizedHeader.includes(normalizedAlias) || 
             normalizedAlias.includes(normalizedHeader)
    })
  }

  // 根据多种字段智能查找学生
  const findStudent = (mappedData) => {
    // 1. 优先通过教育ID匹配
    const educationId = mappedData.education_id || mappedData.educationId
    if (educationId) {
      const student = studentIndexMap.byEducationId.get(String(educationId))
      if (student) return { student, matchType: '教育ID' }
    }
    
    // 2. 通过学籍号匹配
    const studentNo = mappedData.student_no
    if (studentNo) {
      const student = studentIndexMap.byStudentNo.get(String(studentNo))
      if (student) return { student, matchType: '学籍号' }
    }
    
    // 3. 通过姓名+班级匹配
    const name = mappedData.studentName
    const className = mappedData.className
    if (name && className) {
      const key = `${name}_${className}`
      const student = studentIndexMap.byNameAndClass.get(key)
      if (student) return { student, matchType: '姓名+班级' }
    }
    
    // 4. 通过姓名匹配（可能有重名，只取唯一匹配）
    if (name) {
      const students = studentIndexMap.byName.get(name)
      if (students && students.length === 1) {
        return { student: students[0], matchType: '姓名' }
      }
    }
    
    return { student: null, matchType: null }
  }

  // 处理文件上传
  const handleFileUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel' ||
                   file.name.endsWith('.xlsx') ||
                   file.name.endsWith('.xls')
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
        
        // 获取工作表的范围，确保读取所有列
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        
        // 直接从第一行读取所有表头（包括空单元格之后的列）
        const headers = []
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
          const cell = worksheet[cellAddress]
          const headerName = cell ? String(cell.v) : `列${col + 1}`
          headers.push(headerName)
        }
        
        // 使用 header 选项确保所有列都被解析
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: headers,
          range: 1, // 从第二行开始读取数据
          defval: '' // 空单元格默认值
        })

        if (jsonData.length === 0) {
          message.error('Excel文件中没有数据')
          return
        }

        console.log('[Import] Excel headers:', headers, 'count:', headers.length)
        
        setExcelHeaders(headers)
        setFileData(jsonData)
        setPreviewData(jsonData.slice(0, 5)) // 显示前5行预览

        // 智能匹配字段
        const initialMapping = {}
        systemFields.forEach(field => {
          const matchedHeader = headers.find(header => smartMatchHeader(header, field))
          initialMapping[field.key] = matchedHeader || ''
        })
        setMappingConfig(initialMapping)

        // 自动检测索引字段
        if (initialMapping.education_id) {
          setIndexField('education_id')
        } else if (initialMapping.student_no) {
          setIndexField('student_no')
        } else if (initialMapping.studentName) {
          setIndexField('studentName')
        }

        // 进入映射配置步骤
        setMappingStep(1)
        message.success(`文件解析成功，共${jsonData.length}条数据，${headers.length}列`)
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
      setProgress(prev => Math.min(prev + 5, 90))
    }, 50)

    setTimeout(() => {
      clearInterval(interval)
      
      const stats = { matched: 0, unmatched: 0 }
      const mappedResults = []
      const unmatchedItems = []

      fileData.forEach((item, index) => {
        // 先映射Excel数据到标准字段
        const mappedData = {}
        systemFields.forEach(field => {
          const excelHeader = mappingConfig[field.key]
          if (excelHeader && item[excelHeader] !== undefined && item[excelHeader] !== null) {
            mappedData[field.key] = item[excelHeader]
          }
        })

        // 处理性别转换
        if (mappedData.gender) {
          mappedData.gender = String(mappedData.gender).includes('男') ? 'male' : 'female'
        }

        // 智能查找匹配的学生
        const { student, matchType } = findStudent(mappedData)
        
        if (student) {
          stats.matched++
          
          // 短跑项目（秒为单位，直接解析）
          const shortRunFields = ['run50m']
          // 耐力跑项目（分.秒格式，如1.25表示1分25秒）
          const enduranceRunFields = ['run800m', 'run1000m', 'run50m8x']
          // 整数类项目
          const intFields = ['vitalCapacity', 'ropeSkipping', 'sitUps', 'standingLongJump', 'pullUps']
          
          // 构建测试项目数据
          const testItems = {}
          testItemFields.forEach(field => {
            const excelHeader = mappingConfig[field]
            if (excelHeader && item[excelHeader] !== undefined && item[excelHeader] !== null && item[excelHeader] !== '') {
              const rawValue = item[excelHeader]
              
              if (enduranceRunFields.includes(field)) {
                // 耐力跑项目：解析分′秒或分.秒格式
                testItems[field] = parseTimeValue(rawValue, true)
              } else if (shortRunFields.includes(field)) {
                // 短跑项目：直接解析秒数
                testItems[field] = parseTimeValue(rawValue, false)
              } else if (intFields.includes(field)) {
                // 整数类项目：取整
                const num = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
                testItems[field] = num ? Math.round(num) : null
              } else {
                // 其他项目（身高、体重、坐位体前屈）：保留小数
                testItems[field] = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
              }
            }
          })

          // 获取学生的年级和性别用于计算分数
          const grade = parseGradeCode(student.current_grade || student.grade || mappedData.grade)
          const gender = student.gender || mappedData.gender || 'male'

          // 计算总分和等级
          let totalScore = mappedData.totalScore
          let gradeLevel = mappedData.gradeLevel
          
          if (Object.keys(testItems).length > 0 && (!totalScore || !gradeLevel)) {
            const result = calculatePhysicalTestScore(testItems, grade, gender)
            totalScore = result.totalScore
            gradeLevel = result.gradeLevel
          }

          mappedResults.push({
            // 学生基本信息（从学生库获取）
            student_id: student.id, // 数据库ID，后端API需要
            education_id: student.education_id || student.educationId,
            educationId: student.education_id || student.educationId,
            student_no: student.student_no || student.studentNo,
            studentName: student.real_name || student.name || student.studentName,
            gender: student.gender,
            grade,
            className: parseClassCode(student.current_class_name || student.className),
            class_id: student.current_class_id || student.class_id, // 班级数据库ID
            // 测试数据
            testDate: mappedData.testDate || new Date().toISOString().split('T')[0],
            testItems,
            totalScore: totalScore || 0,
            gradeLevel: gradeLevel || '',
            studentStatus: '正常',
            // 元数据
            _matchType: matchType,
            _originalIndex: index
          })
        } else {
          stats.unmatched++
          unmatchedItems.push({
            ...mappedData,
            _originalIndex: index,
            _reason: '未找到匹配的学生'
          })
        }
      })

      setProgress(100)
      setImporting(false)
      setImportStats(stats)
      setMappingStep(2)

      // 调用回调，传递处理后的数据和导入模式
      if (onImportComplete && mappedResults.length > 0) {
        onImportComplete(mappedResults, importMode)
      }

      if (stats.unmatched > 0) {
        message.warning(`导入完成：匹配${stats.matched}条，未匹配${stats.unmatched}条`)
        console.log('未匹配的数据:', unmatchedItems)
      } else {
        message.success(`导入成功：共${stats.matched}条数据`)
      }
    }, 1000)
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
    // 优化后的模板，添加示例说明
    const templateData = [
      {
        '教育ID': '示例: 20240701001',
        '学籍号': '',
        '姓名': '',
        '班级': '',
        '测试日期': '2026-01-04',
        '身高': '120',
        '体重': '25',
        '肺活量': '1500',
        '50米跑': '8.5',
        '坐位体前屈': '15',
        '一分钟跳绳': '100',
        '一分钟仰卧起坐': '30',
        '立定跳远': '150'
      }
    ]

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '体测数据模板')

    // 下载文件
    XLSX.writeFile(wb, '体测成绩导入模板.xlsx')
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
        title="体测成绩智能导入"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Card bordered={false}>
          {mappingStep === 0 && (
            <>
              <Alert
                message="智能导入说明"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>系统会根据<strong>教育ID</strong>、<strong>学籍号</strong>或<strong>姓名+班级</strong>自动匹配学生</li>
                    <li>支持自动识别Excel列名并映射到系统字段</li>
                    <li>导入后会自动按<strong>国家学生体质健康标准</strong>计算总分和等级</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 20 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={5} style={{ margin: 0 }}>体测数据导入</Title>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadTemplate}
                >
                  下载导入模板
                </Button>
              </div>
              <Text>当前学生库共 <strong>{students.length}</strong> 人</Text>
              <div style={{ marginTop: 20 }}>
                <Upload
                  name="file"
                  accept=".xlsx, .xls"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} size="large" type="primary">
                    选择Excel文件
                  </Button>
                </Upload>
              </div>
            </>
          )}

          {mappingStep === 1 && (
            <>
              {/* 数据预览 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={6}>数据预览（前5行，共{excelHeaders.length}列）</Title>
                <Table
                  columns={excelHeaders.map(header => ({ 
                    title: header, 
                    dataIndex: header, 
                    key: header,
                    ellipsis: true,
                    width: 120
                  }))}
                  dataSource={previewData.map((item, index) => ({ ...item, key: index }))}
                  pagination={false}
                  scroll={{ x: Math.max(excelHeaders.length * 120, 800) }}
                  size="small"
                />
              </div>

              {/* 导入模式选择 */}
              <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Title level={6} style={{ marginBottom: 12 }}>
                  导入模式
                  <Tooltip title="选择如何处理已有成绩数据">
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                  </Tooltip>
                </Title>
                <Radio.Group value={importMode} onChange={e => setImportMode(e.target.value)}>
                  <Space direction="vertical">
                    <Radio value="merge">
                      <strong>智能合并</strong>
                      <Text type="secondary" style={{ marginLeft: 8 }}>新数据覆盖旧数据，保留Excel中没有的项目</Text>
                    </Radio>
                    <Radio value="overwrite">
                      <strong>全量覆盖</strong>
                      <Text type="secondary" style={{ marginLeft: 8 }}>完全用Excel数据替换现有数据</Text>
                    </Radio>
                    <Radio value="fillEmpty">
                      <strong>仅填充空值</strong>
                      <Text type="secondary" style={{ marginLeft: 8 }}>只填充系统中没有成绩的项目</Text>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>

              {/* 索引字段选择 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={6}>学生匹配字段</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  系统会自动尝试多种匹配方式，优先级：教育ID &gt; 学籍号 &gt; 姓名+班级 &gt; 姓名
                </Text>
                <Select
                  placeholder="请选择索引字段"
                  value={indexField}
                  onChange={(value) => setIndexField(value)}
                  style={{ width: 300 }}
                >
                  <Option value="education_id">教育ID</Option>
                  <Option value="student_no">学籍号</Option>
                  <Option value="studentName">姓名（需配合班级）</Option>
                </Select>
              </div>

              {/* 字段映射配置 */}
              <div style={{ marginTop: 20 }}>
                <Title level={6}>字段映射配置（Excel共{excelHeaders.length}列）</Title>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {systemFields.map(field => (
                    <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Text strong style={{ minWidth: 100 }}>{field.title}:</Text>
                      <Select
                        placeholder="选择Excel列"
                        value={mappingConfig[field.key] || undefined}
                        onChange={(value) => handleMappingChange(field.key, value)}
                        style={{ flex: 1 }}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        virtual={false}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      >
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
                </div>
              )}
            </>
          )}

          {mappingStep === 2 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
              <Title level={4}>导入完成！</Title>
              <div style={{ marginBottom: 20 }}>
                <Text>成功匹配: <strong style={{ color: '#52c41a' }}>{importStats.matched}</strong> 条</Text>
                {importStats.unmatched > 0 && (
                  <Text style={{ marginLeft: 20 }}>
                    未匹配: <strong style={{ color: '#faad14' }}>{importStats.unmatched}</strong> 条
                  </Text>
                )}
              </div>
              {importStats.unmatched > 0 && (
                <Alert
                  message="未匹配数据说明"
                  description="部分数据未能匹配到学生库中的学生，请检查教育ID、学籍号或姓名是否正确。未匹配数据已记录到控制台（F12查看）。"
                  type="warning"
                  showIcon
                  style={{ textAlign: 'left', marginBottom: 20 }}
                />
              )}
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