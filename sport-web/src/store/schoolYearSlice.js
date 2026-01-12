import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import schoolYearService from '../services/schoolYearService'

// 异步thunk actions
export const fetchSchoolYears = createAsyncThunk(
  'schoolYear/fetchSchoolYears',
  async (params = {}) => {
    const response = await schoolYearService.getSchoolYears(params)
    return response
  }
)

export const fetchSchoolYear = createAsyncThunk(
  'schoolYear/fetchSchoolYear',
  async (id) => {
    const response = await schoolYearService.getSchoolYear(id)
    return response
  }
)

export const createSchoolYear = createAsyncThunk(
  'schoolYear/createSchoolYear',
  async (schoolYearData) => {
    const response = await schoolYearService.createSchoolYear(schoolYearData)
    return response
  }
)

export const updateSchoolYear = createAsyncThunk(
  'schoolYear/updateSchoolYear',
  async ({ id, schoolYearData }) => {
    const response = await schoolYearService.updateSchoolYear(id, schoolYearData)
    return response
  }
)

export const deleteSchoolYear = createAsyncThunk(
  'schoolYear/deleteSchoolYear',
  async (id) => {
    await schoolYearService.deleteSchoolYear(id)
    return id
  }
)

export const activateSchoolYear = createAsyncThunk(
  'schoolYear/activateSchoolYear',
  async (id) => {
    const response = await schoolYearService.activateSchoolYear(id)
    return { ...response.data || response, id }
  }
)

export const completeSchoolYear = createAsyncThunk(
  'schoolYear/completeSchoolYear',
  async ({ id, completedBy }) => {
    const response = await schoolYearService.completeSchoolYear(id, completedBy)
    return { ...response.data || response, id }
  }
)

export const promoteSchoolYear = createAsyncThunk(
  'schoolYear/promoteSchoolYear',
  async (id) => {
    const response = await schoolYearService.promoteSchoolYear(id)
    return response
  }
)

export const fetchActiveSchoolYear = createAsyncThunk(
  'schoolYear/fetchActiveSchoolYear',
  async (schoolId) => {
    const response = await schoolYearService.getActiveSchoolYear(schoolId)
    return response
  }
)

export const fetchSchoolYearStatistics = createAsyncThunk(
  'schoolYear/fetchSchoolYearStatistics',
  async (id) => {
    const response = await schoolYearService.getSchoolYearStatistics(id)
    return response
  }
)

// 初始状态
const initialState = {
  schoolYears: [],
  currentSchoolYear: null,
  activeSchoolYear: null,
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    schoolId: '',
    status: '',
    search: ''
  }
}

// 创建slice
const schoolYearSlice = createSlice({
  name: 'schoolYear',
  initialState,
  reducers: {
    // 设置筛选条件
    setSchoolYearFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // 重置筛选条件
    resetSchoolYearFilters: (state) => {
      state.filters = initialState.filters
    },
    
    // 设置分页
    setSchoolYearPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    
    // 清除错误
    clearSchoolYearError: (state) => {
      state.error = null
    },
    
    // 清除当前学年
    clearCurrentSchoolYear: (state) => {
      state.currentSchoolYear = null
    },
    
    // 清除统计数据
    clearSchoolYearStatistics: (state) => {
      state.statistics = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取学年列表
      .addCase(fetchSchoolYears.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchoolYears.fulfilled, (state, action) => {
        state.loading = false
        // 处理直接返回数组或包装在data/results中的情况
        if (Array.isArray(action.payload)) {
          state.schoolYears = action.payload
        } else {
          state.schoolYears = action.payload.data || action.payload.results || []
        }
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchSchoolYears.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取学年详情
      .addCase(fetchSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        state.currentSchoolYear = action.payload.data || action.payload
      })
      .addCase(fetchSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 创建学年
      .addCase(createSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        // 处理直接返回对象或包装在data中的情况
        const newSchoolYear = action.payload.data || action.payload
        if (newSchoolYear && newSchoolYear.id) {
          state.schoolYears.unshift(newSchoolYear)
          state.pagination.total += 1
        }
      })
      .addCase(createSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 更新年级
      .addCase(updateSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        const updatedSchoolYear = action.payload.data || action.payload
        const index = state.schoolYears.findIndex(sy => sy.id === updatedSchoolYear.id)
        if (index !== -1) {
          state.schoolYears[index] = updatedSchoolYear
        }
        if (state.currentSchoolYear && state.currentSchoolYear.id === updatedSchoolYear.id) {
          state.currentSchoolYear = updatedSchoolYear
        }
        if (state.activeSchoolYear && state.activeSchoolYear.id === updatedSchoolYear.id) {
          state.activeSchoolYear = updatedSchoolYear
        }
      })
      .addCase(updateSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 删除学年
      .addCase(deleteSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        state.schoolYears = state.schoolYears.filter(sy => sy.id !== action.payload)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        if (state.currentSchoolYear && state.currentSchoolYear.id === action.payload) {
          state.currentSchoolYear = null
        }
        if (state.activeSchoolYear && state.activeSchoolYear.id === action.payload) {
          state.activeSchoolYear = null
        }
      })
      .addCase(deleteSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 激活学年
      .addCase(activateSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(activateSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        // 将所有其他学年设为非激活状态
        state.schoolYears.forEach(sy => {
          sy.status = 'inactive'
        })
        // 设置当前学年为激活状态
        const index = state.schoolYears.findIndex(sy => sy.id === action.payload.id)
        if (index !== -1) {
          state.schoolYears[index].status = 'active'
        }
        // 更新当前激活学年
        state.activeSchoolYear = state.schoolYears.find(sy => sy.id === action.payload.id)
      })
      .addCase(activateSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 完成学年
      .addCase(completeSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(completeSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        const index = state.schoolYears.findIndex(sy => sy.id === action.payload.id)
        if (index !== -1) {
          state.schoolYears[index].status = 'completed'
        }
        if (state.currentSchoolYear && state.currentSchoolYear.id === action.payload.id) {
          state.currentSchoolYear.status = 'completed'
        }
        if (state.activeSchoolYear && state.activeSchoolYear.id === action.payload.id) {
          state.activeSchoolYear = null
        }
      })
      .addCase(completeSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取激活学年
      .addCase(fetchActiveSchoolYear.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveSchoolYear.fulfilled, (state, action) => {
        state.loading = false
        state.activeSchoolYear = action.payload.data || action.payload
      })
      .addCase(fetchActiveSchoolYear.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取统计信息
      .addCase(fetchSchoolYearStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchoolYearStatistics.fulfilled, (state, action) => {
        state.loading = false
        state.statistics = action.payload.data || action.payload
      })
      .addCase(fetchSchoolYearStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

// 导出actions
export const {
  setSchoolYearFilters,
  resetSchoolYearFilters,
  setSchoolYearPagination,
  clearSchoolYearError,
  clearCurrentSchoolYear,
  clearSchoolYearStatistics
} = schoolYearSlice.actions

// 导出reducer
export default schoolYearSlice.reducer

// 选择器
export const selectSchoolYears = (state) => state.schoolYear.schoolYears
export const selectCurrentSchoolYear = (state) => state.schoolYear.currentSchoolYear
export const selectActiveSchoolYear = (state) => state.schoolYear.activeSchoolYear
export const selectSchoolYearStatistics = (state) => state.schoolYear.statistics
export const selectSchoolYearLoading = (state) => state.schoolYear.loading
export const selectSchoolYearError = (state) => state.schoolYear.error
export const selectSchoolYearPagination = (state) => state.schoolYear.pagination
export const selectSchoolYearFilters = (state) => state.schoolYear.filters