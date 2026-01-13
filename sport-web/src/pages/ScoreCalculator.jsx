/**
 * 体测成绩计算器
 * 独立的国家学生体质健康标准成绩计算工具
 * 支持不同学段、年级、性别的分类计算
 */
import { useState, useMemo, useCallback } from 'react'
import { 
  Card, Form, Select, InputNumber, Button, Row, Col, Typography, 
  Divider, Space, Tag, Progress, Tooltip, Alert, Radio, Statistic,
  FloatButton
} from 'antd'
import { 
  CalculatorOutlined, ClearOutlined, UserOutlined, 
  TrophyOutlined, HeartOutlined, ThunderboltOutlined,
  RiseOutlined, CheckCircleOutlined, InfoCircleOutlined,
  HomeOutlined, LoginOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { calculatePhysicalTestScore } from '../utils/scoreCalculator'

const { Title, Text } = Typography
const { Option } = Select

// 学段和年级配置
const gradeConfig = {
  primary: {
    name: '小学',
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
  },
  middle: {
    name: '初中',
    grades: ['初一', '初二', '初三']
  },
  high: {
    name: '高中',
    grades: ['高一', '高二', '高三']
  },
  university: {
    name: '大学',
    grades: ['大一', '大二', '大三', '大四']
  }
}

// 测试项目配置
const testItemConfig = {
  // 基础项目（所有学段都有）
  base: [
    { code: 'height', name: '身高', unit: '厘米', icon: '📏', placeholder: '如: 165', min: 50, max: 250 },
    { code: 'weight', name: '体重', unit: '千克', icon: '⚖️', placeholder: '如: 50', min: 10, max: 200 },
    { code: 'vitalCapacity', name: '肺活量', unit: '毫升', icon: '🫁', placeholder: '如: 3000', min: 500, max: 8000 },
    { code: 'run50m', name: '50米跑', unit: '秒', icon: '🏃', placeholder: '如: 8.5', min: 5, max: 20, step: 0.1 },
    { code: 'sitAndReach', name: '坐位体前屈', unit: '厘米', icon: '🧘', placeholder: '如: 15.5', min: -30, max: 40, step: 0.1 },
  ],
  // 小学项目
  primary: [
    { code: 'ropeSkipping', name: '一分钟跳绳', unit: '次', icon: '🪢', placeholder: '如: 120', min: 0, max: 300, bonus: true },
  ],
  // 小学三年级及以上
  primaryUpper: [
    { code: 'sitUps', name: '一分钟仰卧起坐', unit: '次', icon: '💪', placeholder: '如: 40', min: 0, max: 100 },
  ],
  // 小学五六年级
  primaryTop: [
    { code: 'run50m8', name: '50米×8往返跑', unit: '分秒', icon: '🔄', placeholder: '如: 1.45 或 1′45″', min: 0, max: 300 },
  ],
  // 初中及以上 - 通用
  secondary: [
    { code: 'standingLongJump', name: '立定跳远', unit: '厘米', icon: '🦘', placeholder: '如: 200', min: 50, max: 400 },
  ],
  // 初中及以上 - 男生
  secondaryMale: [
    { code: 'pullUps', name: '引体向上', unit: '次', icon: '🏋️', placeholder: '如: 10', min: 0, max: 50, bonus: true },
    { code: 'run1000m', name: '1000米跑', unit: '分秒', icon: '🏃‍♂️', placeholder: '如: 3.45 或 3′45″', min: 0, max: 600, bonus: true },
  ],
  // 初中及以上 - 女生
  secondaryFemale: [
    { code: 'sitUps', name: '一分钟仰卧起坐', unit: '次', icon: '💪', placeholder: '如: 45', min: 0, max: 100, bonus: true },
    { code: 'run800m', name: '800米跑', unit: '分秒', icon: '🏃‍♀️', placeholder: '如: 3.30 或 3′30″', min: 0, max: 500, bonus: true },
  ],
}

// 根据学段、年级、性别获取测试项目
const getTestItems = (stage, grade, gender) => {
  let items = [...testItemConfig.base]
  
  if (stage === 'primary') {
    items = [...items, ...testItemConfig.primary]
    // 三年级及以上有仰卧起坐
    if (['三年级', '四年级', '五年级', '六年级'].includes(grade)) {
      items = [...items, ...testItemConfig.primaryUpper]
    }
    // 五六年级有50米×8往返跑
    if (['五年级', '六年级'].includes(grade)) {
      items = [...items, ...testItemConfig.primaryTop]
    }
  } else {
    // 初中及以上
    items = [...items, ...testItemConfig.secondary]
    if (gender === 'male') {
      items = [...items, ...testItemConfig.secondaryMale]
    } else {
      items = [...items, ...testItemConfig.secondaryFemale]
    }
  }
  
  return items
}

// 等级颜色映射
const levelColors = {
  '优秀': { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  '良好': { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
  '及格': { color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
  '不及格': { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7' },
  '无成绩': { color: '#999', bg: '#fafafa', border: '#d9d9d9' }
}

// BMI状态颜色
const bmiColors = {
  '正常': '#52c41a',
  '偏瘦': '#faad14',
  '超重': '#fa8c16',
  '肥胖': '#ff4d4f'
}

const ScoreCalculator = () => {
  const [form] = Form.useForm()
  const [stage, setStage] = useState('primary')
  const [grade, setGrade] = useState('一年级')
  const [gender, setGender] = useState('male')
  const [testValues, setTestValues] = useState({})

  // 获取当前适用的测试项目
  const currentItems = useMemo(() => {
    return getTestItems(stage, grade, gender)
  }, [stage, grade, gender])

  // 计算成绩结果
  const scoreResult = useMemo(() => {
    if (Object.keys(testValues).length === 0) return null
    
    // 构建测试数据对象
    const testItems = { ...testValues }
    
    return calculatePhysicalTestScore(testItems, grade, gender)
  }, [testValues, grade, gender])

  // 处理学段变化
  const handleStageChange = useCallback((newStage) => {
    setStage(newStage)
    const newGrade = gradeConfig[newStage].grades[0]
    setGrade(newGrade)
    setTestValues({})
    form.resetFields()
  }, [form])

  // 处理年级变化
  const handleGradeChange = useCallback((newGrade) => {
    setGrade(newGrade)
    setTestValues({})
    form.resetFields()
  }, [form])

  // 处理性别变化
  const handleGenderChange = useCallback((e) => {
    setGender(e.target.value)
    setTestValues({})
    form.resetFields()
  }, [form])

  // 处理输入值变化
  const handleValueChange = useCallback((code, value) => {
    setTestValues(prev => ({
      ...prev,
      [code]: value
    }))
  }, [])

  // 清空所有数据
  const handleClear = useCallback(() => {
    setTestValues({})
    form.resetFields()
  }, [form])

  // 获取单项等级
  const getItemLevel = (score) => {
    if (!score || score === 0) return '-'
    if (score >= 90) return '优秀'
    if (score >= 80) return '良好'
    if (score >= 60) return '及格'
    return '不及格'
  }

  // 渲染分数进度条
  const renderScoreProgress = (score, maxScore = 100) => {
    const percent = Math.min(100, (score / maxScore) * 100)
    let strokeColor = '#ff4d4f'
    if (score >= 90) strokeColor = '#52c41a'
    else if (score >= 80) strokeColor = '#1890ff'
    else if (score >= 60) strokeColor = '#faad14'
    
    return (
      <Progress 
        percent={percent} 
        strokeColor={strokeColor}
        format={() => `${score}分`}
        size="small"
      />
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
            <CalculatorOutlined style={{ marginRight: 12 }} />
            国家学生体质健康标准成绩计算器
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            根据《国家学生体质健康标准（2014年修订）》计算体测成绩
          </Text>
        </div>

        <Row gutter={24}>
          {/* 左侧：输入区域 */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              bodyStyle={{ padding: 24 }}
            >
              {/* 基本信息选择 */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  基本信息
                </Title>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 8, color: '#666' }}>学段</div>
                    <Select 
                      value={stage} 
                      onChange={handleStageChange}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {Object.entries(gradeConfig).map(([key, config]) => (
                        <Option key={key} value={key}>{config.name}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 8, color: '#666' }}>年级</div>
                    <Select 
                      value={grade} 
                      onChange={handleGradeChange}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {gradeConfig[stage].grades.map(g => (
                        <Option key={g} value={g}>{g}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 8, color: '#666' }}>性别</div>
                    <Radio.Group 
                      value={gender} 
                      onChange={handleGenderChange}
                      buttonStyle="solid"
                      size="large"
                      style={{ width: '100%' }}
                    >
                      <Radio.Button value="male" style={{ width: '50%', textAlign: 'center' }}>
                        👨 男
                      </Radio.Button>
                      <Radio.Button value="female" style={{ width: '50%', textAlign: 'center' }}>
                        👩 女
                      </Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* 测试项目输入 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
                    测试项目
                  </Title>
                  <Button 
                    icon={<ClearOutlined />} 
                    onClick={handleClear}
                    type="text"
                    danger
                  >
                    清空数据
                  </Button>
                </div>

                <Alert
                  message="温馨提示"
                  description="耐力跑时间格式：可输入 3.45（分.秒）或直接输入秒数（如225秒）"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form form={form} layout="vertical">
                  <Row gutter={[16, 8]}>
                    {currentItems.map(item => (
                      <Col span={12} key={item.code}>
                        <Form.Item 
                          label={
                            <Space>
                              <span>{item.icon}</span>
                              <span>{item.name}</span>
                              <Text type="secondary" style={{ fontSize: 12 }}>({item.unit})</Text>
                              {item.bonus && (
                                <Tooltip title="此项目可获得加分">
                                  <Tag color="green" style={{ fontSize: 10 }}>可加分</Tag>
                                </Tooltip>
                              )}
                            </Space>
                          }
                          style={{ marginBottom: 12 }}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            placeholder={item.placeholder}
                            min={item.min}
                            max={item.max}
                            step={item.step || 1}
                            precision={item.step === 0.1 ? 1 : (item.code.includes('run') ? 2 : 0)}
                            value={testValues[item.code]}
                            onChange={(value) => handleValueChange(item.code, value)}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </Form>
              </div>
            </Card>
          </Col>

          {/* 右侧：结果展示区域 */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minHeight: 600 }}
              bodyStyle={{ padding: 24 }}
            >
              <Title level={4} style={{ marginBottom: 20 }}>
                <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
                成绩计算结果
              </Title>

              {scoreResult && scoreResult.totalScore > 0 ? (
                <>
                  {/* 总分展示 */}
                  <div style={{ 
                    background: levelColors[scoreResult.gradeLevel]?.bg || '#fafafa',
                    border: `2px solid ${levelColors[scoreResult.gradeLevel]?.border || '#d9d9d9'}`,
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                    textAlign: 'center'
                  }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Statistic 
                          title="标准分" 
                          value={scoreResult.standardScore || scoreResult.totalScore} 
                          suffix="分"
                          valueStyle={{ color: '#1890ff', fontSize: 32 }}
                        />
                      </Col>
                      <Col span={6}>
                        <Statistic 
                          title="加分" 
                          value={scoreResult.bonusScore || 0} 
                          prefix="+"
                          suffix="分"
                          valueStyle={{ color: '#52c41a', fontSize: 32 }}
                        />
                      </Col>
                      <Col span={6}>
                        <Statistic 
                          title="综合分" 
                          value={scoreResult.compositeScore || scoreResult.totalScore} 
                          suffix="分"
                          valueStyle={{ color: '#722ed1', fontSize: 32 }}
                        />
                      </Col>
                      <Col span={6}>
                        <div style={{ 
                          fontSize: 48, 
                          fontWeight: 'bold',
                          color: levelColors[scoreResult.gradeLevel]?.color || '#999'
                        }}>
                          {scoreResult.gradeLevel}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* BMI展示 */}
                  {scoreResult.bmi > 0 && (
                    <Card 
                      size="small" 
                      style={{ marginBottom: 16, borderRadius: 8 }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Row align="middle">
                        <Col span={6}>
                          <Space>
                            <HeartOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                            <Text strong>体重指数(BMI)</Text>
                          </Space>
                        </Col>
                        <Col span={6}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                            {scoreResult.bmi.toFixed(1)}
                          </Text>
                        </Col>
                        <Col span={6}>
                          <Tag color={bmiColors[scoreResult.itemScores?.bmi?.level] || '#999'} style={{ fontSize: 14 }}>
                            {scoreResult.itemScores?.bmi?.level || '-'}
                          </Tag>
                        </Col>
                        <Col span={6}>
                          <Text type="secondary">得分: {scoreResult.itemScores?.bmi?.score || 0}分</Text>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* 加分项目展示 */}
                  {scoreResult.bonusScore > 0 && scoreResult.bonusItems && (
                    <Card 
                      size="small" 
                      style={{ marginBottom: 16, borderRadius: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Space>
                        <RiseOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        <Text strong style={{ color: '#52c41a' }}>加分项目：</Text>
                        {Object.values(scoreResult.bonusItems).map((item, idx) => (
                          <Tag key={idx} color="green">
                            {item.name}: +{item.bonus}分 (成绩{item.value}, 100分基准{item.base100})
                          </Tag>
                        ))}
                      </Space>
                    </Card>
                  )}

                  <Divider>各项得分明细</Divider>

                  {/* 各项得分详情 */}
                  <Row gutter={[12, 12]}>
                    {currentItems.filter(item => !['height', 'weight'].includes(item.code)).map(item => {
                      const itemScore = scoreResult.itemScores?.[item.code]
                      const score = itemScore?.score || 0
                      const level = getItemLevel(score)
                      const value = testValues[item.code]
                      const bonusItem = scoreResult.bonusItems?.[item.code]

                      if (!value && value !== 0) return null

                      return (
                        <Col span={12} key={item.code}>
                          <Card 
                            size="small" 
                            style={{ 
                              borderRadius: 8,
                              border: bonusItem ? '2px solid #b7eb8f' : '1px solid #f0f0f0'
                            }}
                            bodyStyle={{ padding: '12px 16px' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <Space>
                                <span>{item.icon}</span>
                                <Text strong>{item.name}</Text>
                              </Space>
                              <Tag color={levelColors[level]?.color || '#999'}>
                                {level}
                              </Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <Text type="secondary">成绩: {value} {item.unit}</Text>
                              <Text strong style={{ color: '#1890ff' }}>
                                {score}分
                                {bonusItem && <Text style={{ color: '#52c41a' }}> +{bonusItem.bonus}</Text>}
                              </Text>
                            </div>
                            {renderScoreProgress(score)}
                          </Card>
                        </Col>
                      )
                    })}
                  </Row>

                  {/* 评分说明 */}
                  <Alert
                    style={{ marginTop: 16 }}
                    message="评分标准说明"
                    description={
                      <div>
                        <div>• 优秀: ≥90分 | 良好: 80-89分 | 及格: 60-79分 | 不及格: &lt;60分</div>
                        <div>• 小学跳绳加分：超过100分基准，每超2次加1分，最高+20分</div>
                        <div>• 中学及以上加分项(引体向上/仰卧起坐/耐力跑)：最高+10分</div>
                        <div>• 综合分 = 标准分 + 加分（上限120分）</div>
                      </div>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                  />
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 400,
                  color: '#999'
                }}>
                  <CalculatorOutlined style={{ fontSize: 64, marginBottom: 16, color: '#d9d9d9' }} />
                  <Title level={4} style={{ color: '#999', marginBottom: 8 }}>等待输入数据</Title>
                  <Text type="secondary">请在左侧输入测试成绩，系统将自动计算</Text>
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                    至少输入身高、体重即可开始计算
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 底部说明 */}
        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.7)' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            数据仅供参考，具体评分以学校实际测试为准 | 标准依据：《国家学生体质健康标准（2014年修订）》
          </Text>
        </div>
      </div>
      
      {/* 悬浮按钮 */}
      <FloatButton.Group shape="circle" style={{ right: 24 }}>
        <Tooltip title="返回登录" placement="left">
          <FloatButton 
            icon={<LoginOutlined />} 
            onClick={() => window.location.href = '/login'}
          />
        </Tooltip>
        <Tooltip title="返回首页" placement="left">
          <FloatButton 
            icon={<HomeOutlined />} 
            onClick={() => window.location.href = '/'}
          />
        </Tooltip>
        <FloatButton.BackTop visibilityHeight={100} />
      </FloatButton.Group>
    </div>
  )
}

export default ScoreCalculator
