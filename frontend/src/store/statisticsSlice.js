import { createSlice } from '@reduxjs/toolkit'

// 初始状态
const initialState = {
  // 筛选条件
  filters: {
    grade: '',
    classes: [],
    gender: 'all',
    dateRange: [],
    studentStatus: 'all',
    dimension: 'grade'
  },
  
  // 加载状态
  loading: false,
  
  // 错误信息
  error: null,
  
  // 统计数据
  data: {
    // 关键指标
    summary: {
      totalStudents: 0,
      testedStudents: 0,
      exemptStudents: 0,
      averageScore: 0,
      excellentRate: 0,
      goodRate: 0,
      passRate: 0,
      failRate: 0
    },
    
    // 总分分布数据
    scoreDistribution: [],
    
    // 等级分布数据
    gradeDistribution: [],
    
    // 年级成绩对比数据
    gradeComparison: [],
    
    // 性别成绩对比数据
    genderComparison: [],
    
    // 单项成绩分析数据
    itemAnalysis: [],
    
    // 详细统计表格数据
    tableData: []
  }
}

// 创建统计分析slice
export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    // 设置筛选条件
    setStatisticsFilters: (state, action) => {
      state.filters = action.payload
    },
    
    // 更新单个筛选条件
    updateStatisticsFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },
    
    // 重置筛选条件
    resetStatisticsFilters: (state) => {
      state.filters = initialState.filters
    },
    
    // 设置加载状态
    setStatisticsLoading: (state, action) => {
      state.loading = action.payload
    },
    
    // 设置错误信息
    setStatisticsError: (state, action) => {
      state.error = action.payload
    },
    
    // 清除错误信息
    clearStatisticsError: (state) => {
      state.error = null
    },
    
    // 设置统计数据
    setStatisticsData: (state, action) => {
      state.data = action.payload
    },
    
    // 更新关键指标
    updateStatisticsSummary: (state, action) => {
      state.data.summary = { ...state.data.summary, ...action.payload }
    },
    
    // 更新总分分布数据
    updateScoreDistribution: (state, action) => {
      state.data.scoreDistribution = action.payload
    },
    
    // 更新等级分布数据
    updateGradeDistribution: (state, action) => {
      state.data.gradeDistribution = action.payload
    },
    
    // 更新年级成绩对比数据
    updateGradeComparison: (state, action) => {
      state.data.gradeComparison = action.payload
    },
    
    // 更新性别成绩对比数据
    updateGenderComparison: (state, action) => {
      state.data.genderComparison = action.payload
    },
    
    // 更新单项成绩分析数据
    updateItemAnalysis: (state, action) => {
      state.data.itemAnalysis = action.payload
    },
    
    // 更新统计表格数据
    updateStatisticsTableData: (state, action) => {
      state.data.tableData = action.payload
    }
  }
})

// 导出action creators
export const {
  setStatisticsFilters,
  updateStatisticsFilter,
  resetStatisticsFilters,
  setStatisticsLoading,
  setStatisticsError,
  clearStatisticsError,
  setStatisticsData,
  updateStatisticsSummary,
  updateScoreDistribution,
  updateGradeDistribution,
  updateGradeComparison,
  updateGenderComparison,
  updateItemAnalysis,
  updateStatisticsTableData
} = statisticsSlice.actions

// 导出reducer
export default statisticsSlice.reducer