import { createSlice } from '@reduxjs/toolkit'

// 初始状态
const initialState = {
  // 测试项目配置
  testItems: [
    // 共性指标（所有年级）
    {
      id: 1,
      itemName: '体重指数（BMI）',
      itemCode: 'bmi',
      itemType: 'required',
      unit: 'kg/m²',
      minValue: 10,
      maxValue: 40,
      weight: 15,
      applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学', '初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 2,
      itemName: '肺活量',
      itemCode: 'vitalCapacity',
      itemType: 'required',
      unit: 'ml',
      minValue: 500,
      maxValue: 10000,
      weight: 15,
      applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学', '初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 3,
      itemName: '50米跑',
      itemCode: 'run50m',
      itemType: 'required',
      unit: 's',
      minValue: 5,
      maxValue: 20,
      weight: 20,
      applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学', '初中', '高中', '大学'],
      isPreset: true
    },
    // 小学一、二年级特有指标
    {
      id: 4,
      itemName: '坐位体前屈',
      itemCode: 'sitAndReach',
      itemType: 'required',
      unit: 'cm',
      minValue: -20,
      maxValue: 50,
      weight: 30,
      applicableGrades: ['一年级', '二年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 5,
      itemName: '一分钟跳绳',
      itemCode: 'ropeSkipping',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 200,
      weight: 20,
      applicableGrades: ['一年级', '二年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    // 小学三、四年级特有指标
    {
      id: 6,
      itemName: '坐位体前屈',
      itemCode: 'sitAndReach',
      itemType: 'required',
      unit: 'cm',
      minValue: -20,
      maxValue: 50,
      weight: 20,
      applicableGrades: ['三年级', '四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 7,
      itemName: '一分钟跳绳',
      itemCode: 'ropeSkipping',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 200,
      weight: 20,
      applicableGrades: ['三年级', '四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 8,
      itemName: '一分钟仰卧起坐',
      itemCode: 'sitUps',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 100,
      weight: 10,
      applicableGrades: ['三年级', '四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    // 小学五、六年级特有指标
    {
      id: 9,
      itemName: '坐位体前屈',
      itemCode: 'sitAndReach',
      itemType: 'required',
      unit: 'cm',
      minValue: -20,
      maxValue: 50,
      weight: 10,
      applicableGrades: ['五年级', '六年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 10,
      itemName: '一分钟跳绳',
      itemCode: 'ropeSkipping',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 200,
      weight: 10,
      applicableGrades: ['五年级', '六年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 11,
      itemName: '一分钟仰卧起坐',
      itemCode: 'sitUps',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 100,
      weight: 20,
      applicableGrades: ['五年级', '六年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    {
      id: 12,
      itemName: '50米×8往返跑',
      itemCode: 'run50m8x',
      itemType: 'required',
      unit: 's',
      minValue: 20,
      maxValue: 100,
      weight: 10,
      applicableGrades: ['五年级', '六年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['小学'],
      isPreset: true
    },
    // 初中、高中、大学各年级特有指标
    {
      id: 13,
      itemName: '坐位体前屈',
      itemCode: 'sitAndReach',
      itemType: 'required',
      unit: 'cm',
      minValue: -20,
      maxValue: 50,
      weight: 10,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 14,
      itemName: '立定跳远',
      itemCode: 'standingLongJump',
      itemType: 'required',
      unit: 'cm',
      minValue: 50,
      maxValue: 300,
      weight: 10,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male', 'female'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 15,
      itemName: '引体向上',
      itemCode: 'pullUps',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 30,
      weight: 10,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 16,
      itemName: '一分钟仰卧起坐',
      itemCode: 'sitUps',
      itemType: 'required',
      unit: '个',
      minValue: 0,
      maxValue: 100,
      weight: 10,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['female'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 17,
      itemName: '1000米跑',
      itemCode: 'run1000m',
      itemType: 'required',
      unit: 's',
      minValue: 200,
      maxValue: 600,
      weight: 20,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['male'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    },
    {
      id: 18,
      itemName: '800米跑',
      itemCode: 'run800m',
      itemType: 'required',
      unit: 's',
      minValue: 180,
      maxValue: 500,
      weight: 20,
      applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
      applicableGenders: ['female'],
      applicableStages: ['初中', '高中', '大学'],
      isPreset: true
    }
  ],
  
  // 体测记录
  testRecords: [
    {
      id: 1,
      studentName: '学生1',
      educationId: '20240701001',
      gender: 'male',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 120,
        weight: 25,
        vitalCapacity: 1500,
        run50m: 8.5,
        sitAndReach: 15
      },
      totalScore: 85,
      gradeLevel: '良好',
      isApproved: true,
      approvedBy: '管理员',
      approvedTime: '2026-01-04 10:00:00'
    },
    {
      id: 2,
      studentName: '学生2',
      educationId: '20240701002',
      gender: 'female',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 115,
        weight: 22,
        vitalCapacity: 1400,
        run50m: 9.0,
        sitAndReach: 18
      },
      totalScore: 82,
      gradeLevel: '良好',
      isApproved: true,
      approvedBy: '管理员',
      approvedTime: '2026-01-04 10:00:00'
    },
    {
      id: 3,
      studentName: '学生3',
      educationId: '20240701003',
      gender: 'male',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 125,
        weight: 28,
        vitalCapacity: 1600,
        run50m: 8.0,
        sitAndReach: 12
      },
      totalScore: 88,
      gradeLevel: '良好',
      isApproved: false,
      approvedBy: '',
      approvedTime: ''
    }
  ],
  
  // 统计数据
  statistics: {
    totalStudents: 500,
    testedStudents: 450,
    excellentRate: 25,
    goodRate: 40,
    passRate: 25,
    failRate: 10,
    averageScore: 75
  },
  
  // 加载状态
  loading: false,
  
  // 错误信息
  error: null
}

// 创建体测slice
export const physicalTestSlice = createSlice({
  name: 'physicalTest',
  initialState,
  reducers: {
    // 测试项目相关操作
    setTestItems: (state, action) => {
      state.testItems = action.payload
    },
    addTestItem: (state, action) => {
      state.testItems.push(action.payload)
    },
    updateTestItem: (state, action) => {
      const index = state.testItems.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.testItems[index] = action.payload
      }
    },
    deleteTestItem: (state, action) => {
      state.testItems = state.testItems.filter(item => item.id !== action.payload)
    },
    
    // 体测记录相关操作
    setTestRecords: (state, action) => {
      state.testRecords = action.payload
    },
    addTestRecord: (state, action) => {
      state.testRecords.push(action.payload)
    },
    updateTestRecord: (state, action) => {
      const index = state.testRecords.findIndex(record => record.id === action.payload.id)
      if (index !== -1) {
        state.testRecords[index] = action.payload
      }
    },
    deleteTestRecord: (state, action) => {
      state.testRecords = state.testRecords.filter(record => record.id !== action.payload)
    },
    approveTestRecord: (state, action) => {
      const index = state.testRecords.findIndex(record => record.id === action.payload.id)
      if (index !== -1) {
        state.testRecords[index] = {
          ...state.testRecords[index],
          isApproved: true,
          approvedBy: action.payload.approvedBy,
          approvedTime: action.payload.approvedTime
        }
      }
    },
    
    // 统计数据相关操作
    setStatistics: (state, action) => {
      state.statistics = action.payload
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
    
    // 加载状态管理
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

// 导出action creators
export const {
  // 测试项目相关
  setTestItems,
  addTestItem,
  updateTestItem,
  deleteTestItem,
  
  // 体测记录相关
  setTestRecords,
  addTestRecord,
  updateTestRecord,
  deleteTestRecord,
  approveTestRecord,
  
  // 统计数据相关
  setStatistics,
  updateStatistics,
  
  // 加载状态管理
  setLoading,
  setError,
  clearError
} = physicalTestSlice.actions

// 导出reducer
export default physicalTestSlice.reducer
