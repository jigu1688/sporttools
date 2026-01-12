import { getStageByGradeCode, getGradeNameByCode } from './gradeCodeMapping'

const primarySchoolGrades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
const middleSchoolGrades = ['初一', '初二', '初三']
const highSchoolGrades = ['高一', '高二', '高三']
const collegeGrades = ['大一', '大二', '大三', '大四']

const primarySchoolItems = [
  { code: 'height', name: '身高(cm)', required: true },
  { code: 'weight', name: '体重(kg)', required: true },
  { code: 'vitalCapacity', name: '肺活量(ml)', required: true },
  { code: 'run50m', name: '50米跑(s)', required: true },
  { code: 'sitAndReach', name: '坐位体前屈(cm)', required: true },
  { code: 'ropeSkipping', name: '一分钟跳绳(个)', grades: primarySchoolGrades },
  { code: 'sitUps', name: '一分钟仰卧起坐(个)', grades: ['三年级', '四年级', '五年级', '六年级'] },
  { code: 'run50m8x', name: '50米×8往返跑(s)', grades: ['五年级', '六年级'] }
]

const middleHighSchoolItems = [
  { code: 'height', name: '身高(cm)', required: true },
  { code: 'weight', name: '体重(kg)', required: true },
  { code: 'vitalCapacity', name: '肺活量(ml)', required: true },
  { code: 'run50m', name: '50米跑(s)', required: true },
  { code: 'sitAndReach', name: '坐位体前屈(cm)', required: true },
  { code: 'standingLongJump', name: '立定跳远(cm)', required: true },
  { code: 'pullUps', name: '引体向上(个)', gender: 'male' },
  { code: 'sitUps', name: '一分钟仰卧起坐(个)', gender: 'female' },
  { code: 'run1000m', name: '1000米跑(s)', gender: 'male' },
  { code: 'run800m', name: '800米跑(s)', gender: 'female' }
]

const collegeItems = [
  { code: 'height', name: '身高(cm)', required: true },
  { code: 'weight', name: '体重(kg)', required: true },
  { code: 'vitalCapacity', name: '肺活量(ml)', required: true },
  { code: 'run50m', name: '50米跑(s)', required: true },
  { code: 'sitAndReach', name: '坐位体前屈(cm)', required: true },
  { code: 'standingLongJump', name: '立定跳远(cm)', required: true },
  { code: 'pullUps', name: '引体向上(个)', gender: 'male' },
  { code: 'sitUps', name: '一分钟仰卧起坐(个)', gender: 'female' },
  { code: 'run1000m', name: '1000米跑(s)', gender: 'male' },
  { code: 'run800m', name: '800米跑(s)', gender: 'female' }
]

// 统一的年级阶段获取函数，支持年级名称或年级编码
export const getStageByGrade = (grade) => {
  // 如果是数字，认为是年级编码
  if (typeof grade === 'number') {
    return getStageByGradeCode(grade)
  }
  
  // 如果是字符串，认为是年级名称
  if (primarySchoolGrades.includes(grade)) {
    return '小学'
  }
  if (middleSchoolGrades.includes(grade)) {
    return '初中'
  }
  if (highSchoolGrades.includes(grade)) {
    return '高中'
  }
  if (collegeGrades.includes(grade)) {
    return '大学'
  }
  return '未知'
}

export const getTestItemsForGrade = (grade, gender = 'male') => {
  const stage = getStageByGrade(grade)
  
  // 处理年级编码情况，转换为年级名称
  const gradeName = typeof grade === 'number' ? getGradeNameByCode(grade) : grade
  
  if (stage === '小学') {
    return primarySchoolItems.filter(item => {
      if (item.required) return true
      if (item.grades && item.grades.includes(gradeName)) return true
      return false
    })
  }
  
  if (stage === '初中' || stage === '高中') {
    return middleHighSchoolItems.filter(item => {
      if (item.required) return true
      if (item.gender && item.gender !== gender) return false
      return true
    })
  }
  
  if (stage === '大学') {
    return collegeItems.filter(item => {
      if (item.required) return true
      if (item.gender && item.gender !== gender) return false
      return true
    })
  }
  
  // 如果年级未知，默认返回中学测试项目（包含所有必测项目）
  return middleHighSchoolItems.filter(item => {
    if (item.required) return true
    if (item.gender && item.gender !== gender) return false
    return true
  })
}

export const getTableColumnsForGrade = (grade, gender = 'male') => {
  const items = getTestItemsForGrade(grade, gender)
  return items.map(item => ({
    title: item.name,
    dataIndex: ['testItems', item.code],
    key: item.code,
    width: 120
  }))
}
