import { useState, useMemo } from 'react'
import { Card, Table, Select, Typography, Row, Col, Tabs, Divider } from 'antd'
import { scoreStandards } from '../../utils/scoreStandards'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

const ScoreStandardsPage = () => {
  // 状态管理
  const [schoolStage, setSchoolStage] = useState('小学')
  const [gender, setGender] = useState('男生')
  const [grade, setGrade] = useState('一年级')
  const [testItem, setTestItem] = useState('身高体重（BMI）')

  // 年级选项
  const gradeOptions = useMemo(() => {
    if (schoolStage === '小学') {
      return ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
    } else if (schoolStage === '初中') {
      return ['初一', '初二', '初三']
    } else {
      return ['高一', '高二', '高三']
    }
  }, [schoolStage])

  // 测试项目选项
  const testItemOptions = useMemo(() => {
    const items = [
      '身高体重（BMI）',
      '肺活量',
      '50米跑',
      '一分钟跳绳',
      '坐位体前屈',
      '一分钟仰卧起坐',
      '立定跳远'
    ]
    
    if (schoolStage !== '小学') {
      items.push('引体向上（男生）')
      items.push('800米跑（女生）')
      items.push('1000米跑（男生）')
    }
    
    return items
  }, [schoolStage])

  // 获取当前选择的测试项目对应的标准数据
  const getCurrentStandardData = () => {
    // 映射测试项目名称到scoreStandards中的item_name
    const itemNameMap = {
      '身高体重（BMI）': 'BMI',
      '肺活量': '肺活量',
      '50米跑': '50米跑',
      '一分钟跳绳': '一分钟跳绳',
      '坐位体前屈': '坐位体前屈',
      '一分钟仰卧起坐': '一分钟仰卧起坐',
      '立定跳远': '立定跳远',
      '引体向上（男生）': '引体向上/仰卧起坐',
      '800米跑（女生）': '800米跑',
      '1000米跑（男生）': '1000米跑'
    }
    
    // 获取对应的item_name
    const itemName = itemNameMap[testItem]
    
    // 查找对应的评分表
    let scoreTable = scoreStandards.score_tables.find(table => 
      table.item_name === itemName && table.gender === gender
    )
    
    // 处理小学男生的一分钟仰卧起坐情况
    if (!scoreTable && testItem === '一分钟仰卧起坐' && gender === '男生' && schoolStage === '小学') {
      // 小学男生的一分钟仰卧起坐数据在引体向上/仰卧起坐评分表中
      scoreTable = scoreStandards.score_tables.find(table => 
        table.item_name === '引体向上/仰卧起坐' && table.gender === gender
      )
    }
    
    if (!scoreTable) return []
    
      // 处理BMI特殊情况
    if (itemName === 'BMI') {
      // BMI数据结构特殊处理
      const bmiData = scoreTable.scores
        .filter(row => row[grade] !== undefined && row.age_or_grade !== 'nan')
        .map(row => ({
          等级: row.age_or_grade,
          分数: row.单项 || row.单项得分,
          范围: row[grade]
        }))
      
      return bmiData
    }
    
    // 提取当前年级的数据
    const currentData = scoreTable.scores
      .filter(row => row[grade] !== undefined && row.单项 !== '得分')
      .map(row => ({
        分数: row.单项,
        标准: row[grade]
      }))
      .sort((a, b) => parseInt(b.分数) - parseInt(a.分数))
    
    return currentData
  }

  // 表格列配置
  const getColumns = () => {
    if (testItem === '身高体重（BMI）') {
      return [
        { title: '等级', dataIndex: '等级', key: '等级', width: 100 },
        { title: '范围（kg/m²）', dataIndex: '范围', key: '范围', width: 200 }
      ]
    } else {
      return [
        { title: '分数', dataIndex: '分数', key: '分数', width: 100 },
        { 
          title: '标准', 
          dataIndex: '标准', 
          key: '标准', 
          width: 200,
          render: (value) => {
            if (testItem.includes('50米') || testItem.includes('800米') || testItem.includes('1000米')) {
              return `${value}秒`
            } else if (testItem.includes('肺活量')) {
              return `${value}毫升`
            } else if (testItem.includes('坐位体前屈')) {
              return `${value}厘米`
            } else if (testItem.includes('立定跳远')) {
              return `${value}厘米`
            } else {
              return value
            }
          }
        }
      ]
    }
  }

  // 获取当前选择的测试项目对应的加分表数据
  const getCurrentBonusData = () => {
    // 映射测试项目名称到scoreStandards中的item_name
    const itemNameMap = {
      '一分钟跳绳': '一分钟跳绳',
      '引体向上（男生）': '引体向上/仰卧起坐',
      '一分钟仰卧起坐': '一分钟仰卧起坐',
      '1000米跑（男生）': '1000米跑',
      '800米跑（女生）': '800米跑'
    }
    
    // 获取对应的item_name
    const itemName = itemNameMap[testItem]
    
    // 查找对应的加分表
    const bonusTable = scoreStandards.bonus_tables.find(table => 
      table.item_name === itemName && table.gender === gender
    )
    
    if (!bonusTable) return []
    
    // 提取当前年级的加分数据
    const bonusData = bonusTable.scores
      .filter(row => row[grade] !== undefined)
      .map(row => ({
        加分: row.age_or_grade,
        标准: row[grade]
      }))
      .sort((a, b) => parseInt(b.加分) - parseInt(a.加分))
    
    return bonusData
  }

  // 加分表列配置
  const getBonusColumns = () => {
    return [
      { title: '加分', dataIndex: '加分', key: '加分', width: 100 },
      { 
        title: '标准', 
        dataIndex: '标准', 
        key: '标准', 
        width: 200,
        render: (value) => {
          if (testItem.includes('800米') || testItem.includes('1000米')) {
            return `${value}秒`
          } else {
            return value
          }
        }
      }
    ]
  }

  const currentData = getCurrentStandardData()
  const columns = getColumns()
  const currentBonusData = getCurrentBonusData()
  const bonusColumns = getBonusColumns()

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>国家标准评分表</Title>
      <Text type="secondary">参考《国家学生体质健康标准》</Text>
      
      <Card style={{ marginTop: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>学段</div>
            <Select
              value={schoolStage}
              onChange={setSchoolStage}
              style={{ width: '100%' }}
            >
              <Option value="小学">小学</Option>
              <Option value="初中">初中</Option>
              <Option value="高中">高中</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>性别</div>
            <Select
              value={gender}
              onChange={setGender}
              style={{ width: '100%' }}
            >
              <Option value="男生">男生</Option>
              <Option value="女生">女生</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>年级</div>
            <Select
              value={grade}
              onChange={setGrade}
              style={{ width: '100%' }}
            >
              {gradeOptions.map(g => (
                <Option key={g} value={g}>{g}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>测试项目</div>
            <Select
              value={testItem}
              onChange={setTestItem}
              style={{ width: '100%' }}
            >
              {testItemOptions.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          {/* 评分表 */}
          <Col span={12}>
            <Card title="评分表" bordered={true}>
              <Table
                columns={columns}
                dataSource={currentData}
                rowKey="分数"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          
          {/* 加分表 */}
          {currentBonusData.length > 0 && (
            <Col span={12}>
              <Card title="加分表" bordered={true}>
                <Table
                  columns={bonusColumns}
                  dataSource={currentBonusData}
                  rowKey="加分"
                  pagination={false}
                  size="middle"
                />
              </Card>
            </Col>
          )}
        </Row>
      </Card>
      
      <Card style={{ marginTop: 20 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="评分说明" key="1">
            <div style={{ lineHeight: 2 }}>
              <h4>1. 评分等级说明：</h4>
              <ul>
                <li>优秀：90分及以上</li>
                <li>良好：80-89分</li>
                <li>及格：60-79分</li>
                <li>不及格：60分以下</li>
              </ul>
              
              <h4>2. 注意事项：</h4>
              <ul>
                <li>身高体重项目使用BMI指数进行评分</li>
                <li>50米跑、800米跑、1000米跑项目，时间越短分数越高</li>
                <li>其他项目（肺活量、跳绳、坐位体前屈、仰卧起坐、立定跳远、引体向上），数值越大分数越高</li>
                <li>引体向上仅男生测试</li>
                <li>800米跑仅女生测试</li>
                <li>1000米跑仅男生测试</li>
              </ul>
            </div>
          </TabPane>
          <TabPane tab="测试方法" key="2">
            <div style={{ lineHeight: 2 }}>
              <h4>1. 身高体重测试方法：</h4>
              <p>使用身高体重测量仪，测量学生的身高和体重，计算BMI指数（BMI = 体重(kg) / 身高(m)²）。</p>
              
              <h4>2. 肺活量测试方法：</h4>
              <p>使用肺活量计，学生深吸气后，尽力将气体吹出，测量最大呼出气体量。</p>
              
              <h4>3. 50米跑测试方法：</h4>
              <p>在标准田径场上，学生采用站立式起跑，听到发令后全力奔跑50米，记录所用时间。</p>
              
              <h4>4. 一分钟跳绳测试方法：</h4>
              <p>学生手持跳绳，听到开始信号后开始跳绳，一分钟后停止，记录跳绳次数。</p>
              
              <h4>5. 坐位体前屈测试方法：</h4>
              <p>学生坐在垫子上，双腿伸直，双脚抵住测试仪器，双手尽力向前推动游标，记录最大推动距离。</p>
              
              <h4>6. 一分钟仰卧起坐测试方法：</h4>
              <p>学生仰卧在垫子上，双手抱头，听到开始信号后做起坐动作，一分钟后停止，记录完成次数。</p>
              
              <h4>7. 立定跳远测试方法：</h4>
              <p>学生站立在起跳线后，双脚同时起跳，尽力向前跳出，测量起跳线到最近着地点的距离。</p>
              
              <h4>8. 引体向上测试方法：</h4>
              <p>学生双手正握单杠，身体悬空，向上拉至下巴超过单杠，然后缓慢下降，记录完成次数。</p>
              
              <h4>9. 800米/1000米跑测试方法：</h4>
              <p>在标准田径场上，学生采用站立式起跑，听到发令后全力奔跑，记录完成800米（女生）或1000米（男生）所用时间。</p>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default ScoreStandardsPage