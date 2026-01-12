import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { statisticsService } from '../services/statisticsService'

// 异步thunks
export const fetchStatisticsData = createAsyncThunk(
  'statistics/fetchStatisticsData',
  async (filters = {}) => {
    const response = await statisticsService.getStatistics(filters)
    return response
  }
)

export const fetchScoreDistribution = createAsyncThunk(
  'statistics/fetchScoreDistribution',
  async (filters = {}) => {
    const response = await statisticsService.getScoreDistribution(filters)
    return response
  }
)

export const fetchGradeDistribution = createAsyncThunk(
  'statistics/fetchGradeDistribution',
  async (filters = {}) => {
    const response = await statisticsService.getGradeDistribution(filters)
    return response
  }
)

export const fetchGradeComparison = createAsyncThunk(
  'statistics/fetchGradeComparison',
  async (filters = {}) => {
    const response = await statisticsService.getGradeComparison(filters)
    return response
  }
)

export const fetchGenderComparison = createAsyncThunk(
  'statistics/fetchGenderComparison',
  async (filters = {}) => {
    const response = await statisticsService.getGenderComparison(filters)
    return response
  }
)

export const fetchItemAnalysis = createAsyncThunk(
  'statistics/fetchItemAnalysis',
  async (filters = {}) => {
    const response = await statisticsService.getItemAnalysis(filters)
    return response
  }
)

export const exportStatisticsData = createAsyncThunk(
  'statistics/exportStatisticsData',
  async ({ filters, format = 'csv' }) => {
    const response = await statisticsService.exportStatistics(filters, format)
    return response
  }
)

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
      // 处理API返回的数据格式
      if (action.payload.summary) {
        state.data.summary = {
          totalStudents: action.payload.summary.total_students || action.payload.summary.totalStudents || 0,
          testedStudents: action.payload.summary.tested_students || action.payload.summary.testedStudents || 0,
          exemptStudents: action.payload.summary.exempt_students || action.payload.summary.exemptStudents || 0,
          averageScore: action.payload.summary.average_score || action.payload.summary.averageScore || 0,
          excellentRate: action.payload.summary.excellent_rate || action.payload.summary.excellentRate || 0,
          goodRate: action.payload.summary.good_rate || action.payload.summary.goodRate || 0,
          passRate: action.payload.summary.pass_rate || action.payload.summary.passRate || 0,
          failRate: action.payload.summary.fail_rate || action.payload.summary.failRate || 0
        }
      }
      
      // 处理其他数据类型
      if (action.payload.scoreDistribution) {
        state.data.scoreDistribution = action.payload.scoreDistribution
      }
      if (action.payload.gradeDistribution) {
        state.data.gradeDistribution = action.payload.gradeDistribution
      }
      if (action.payload.gradeComparison) {
        state.data.gradeComparison = action.payload.gradeComparison
      }
      if (action.payload.genderComparison) {
        state.data.genderComparison = action.payload.genderComparison
      }
      if (action.payload.itemAnalysis) {
        state.data.itemAnalysis = action.payload.itemAnalysis
      }
      if (action.payload.tableData) {
        state.data.tableData = action.payload.tableData
      }
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
  },
  extraReducers: (builder) => {
    builder
      // 获取统计数据
      .addCase(fetchStatisticsData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStatisticsData.fulfilled, (state, action) => {
        state.loading = false
        state.data.summary = action.payload.summary || initialState.data.summary
        state.data.scoreDistribution = action.payload.scoreDistribution || []
        state.data.gradeDistribution = action.payload.gradeDistribution || []
        state.data.gradeComparison = action.payload.gradeComparison || []
        state.data.genderComparison = action.payload.genderComparison || []
        state.data.itemAnalysis = action.payload.itemAnalysis || []
        state.data.tableData = action.payload.tableData || []
      })
      .addCase(fetchStatisticsData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取总分分布
      .addCase(fetchScoreDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchScoreDistribution.fulfilled, (state, action) => {
        state.loading = false
        state.data.scoreDistribution = action.payload.data || action.payload || []
      })
      .addCase(fetchScoreDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取等级分布
      .addCase(fetchGradeDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGradeDistribution.fulfilled, (state, action) => {
        state.loading = false
        state.data.gradeDistribution = action.payload.data || action.payload || []
      })
      .addCase(fetchGradeDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取年级对比
      .addCase(fetchGradeComparison.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGradeComparison.fulfilled, (state, action) => {
        state.loading = false
        state.data.gradeComparison = action.payload.data || action.payload || []
      })
      .addCase(fetchGradeComparison.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取性别对比
      .addCase(fetchGenderComparison.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGenderComparison.fulfilled, (state, action) => {
        state.loading = false
        state.data.genderComparison = action.payload.data || action.payload || []
      })
      .addCase(fetchGenderComparison.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取单项分析
      .addCase(fetchItemAnalysis.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItemAnalysis.fulfilled, (state, action) => {
        state.loading = false
        state.data.itemAnalysis = action.payload.data || action.payload || []
      })
      .addCase(fetchItemAnalysis.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 导出数据
      .addCase(exportStatisticsData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(exportStatisticsData.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(exportStatisticsData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
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