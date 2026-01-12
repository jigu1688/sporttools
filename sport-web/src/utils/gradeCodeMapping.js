// 年级编号映射关系
// 编码规则：
// - 第一位数字表示学段：1=小学，2=初中，3=高中，4=大学
// - 第二位数字表示年级：1=一年级，2=二年级，3=三年级，4=四年级，5=五年级，6=六年级

const gradeCodeMap = {
  // 小学
  11: '一年级',
  12: '二年级',
  13: '三年级',
  14: '四年级',
  15: '五年级',
  16: '六年级',
  // 初中
  21: '初一',
  22: '初二',
  23: '初三',
  // 高中
  31: '高一',
  32: '高二',
  33: '高三',
  // 大学
  41: '大一',
  42: '大二',
  43: '大三',
  44: '大四'
}

const gradeNameToCodeMap = {
  // 小学
  '一年级': 11,
  '二年级': 12,
  '三年级': 13,
  '四年级': 14,
  '五年级': 15,
  '六年级': 16,
  // 初中
  '初一': 21,
  '初二': 22,
  '初三': 23,
  // 高中
  '高一': 31,
  '高二': 32,
  '高三': 33,
  // 大学
  '大一': 41,
  '大二': 42,
  '大三': 43,
  '大四': 44
}

// 获取年级阶段
const getStageByGradeCode = (gradeCode) => {
  if (!gradeCode) return '未知'
  const stageCode = Math.floor(gradeCode / 10)
  switch (stageCode) {
    case 1:
      return '小学'
    case 2:
      return '初中'
    case 3:
      return '高中'
    case 4:
      return '大学'
    default:
      return '未知'
  }
}

// 获取年级名称
const getGradeNameByCode = (gradeCode) => {
  return gradeCodeMap[gradeCode] || '未知'
}

// 获取年级编码
const getGradeCodeByName = (gradeName) => {
  return gradeNameToCodeMap[gradeName] || null
}

// 获取所有年级列表
const getAllGrades = () => {
  return Object.entries(gradeCodeMap).map(([code, name]) => ({
    code: parseInt(code),
    name,
    stage: getStageByGradeCode(parseInt(code))
  }))
}

// 获取指定阶段的年级列表
const getGradesByStage = (stage) => {
  return getAllGrades().filter(grade => grade.stage === stage)
}

export {
  gradeCodeMap,
  gradeNameToCodeMap,
  getStageByGradeCode,
  getGradeNameByCode,
  getGradeCodeByName,
  getAllGrades,
  getGradesByStage
}