import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import schoolService from '../services/schoolService'

// 异步thunk actions
export const fetchSchools = createAsyncThunk(
  'school/fetchSchools',
  async (params = {}) => {
    const response = await schoolService.getSchools(params)
    return response
  }
)

export const fetchSchool = createAsyncThunk(
  'school/fetchSchool',
  async (id) => {
    const response = await schoolService.getSchool(id)
    return response
  }
)

export const createSchool = createAsyncThunk(
  'school/createSchool',
  async (schoolData) => {
    const response = await schoolService.createSchool(schoolData)
    return response
  }
)

export const updateSchool = createAsyncThunk(
  'school/updateSchool',
  async ({ id, schoolData }) => {
    const response = await schoolService.updateSchool(id, schoolData)
    return response
  }
)

export const deleteSchool = createAsyncThunk(
  'school/deleteSchool',
  async (id) => {
    await schoolService.deleteSchool(id)
    return id
  }
)

export const fetchSchoolStatistics = createAsyncThunk(
  'school/fetchSchoolStatistics',
  async (id) => {
    const response = await schoolService.getSchoolStatistics(id)
    return response
  }
)

export const uploadSchoolLogo = createAsyncThunk(
  'school/uploadSchoolLogo',
  async ({ id, formData }) => {
    const response = await schoolService.uploadLogo(id, formData)
    return response
  }
)

// 初始状态
const initialState = {
  schools: [],
  currentSchool: null,
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    search: '',
    status: ''
  }
}

// 创建slice
const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    // 设置筛选条件
    setSchoolFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // 重置筛选条件
    resetSchoolFilters: (state) => {
      state.filters = initialState.filters
    },
    
    // 设置分页
    setSchoolPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    
    // 清除错误
    clearSchoolError: (state) => {
      state.error = null
    },
    
    // 清除当前学校
    clearCurrentSchool: (state) => {
      state.currentSchool = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取学校列表
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取学校详情
      .addCase(fetchSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchool.fulfilled, (state, action) => {
        state.loading = false
        state.currentSchool = action.payload.data || action.payload
      })
      .addCase(fetchSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 创建学校
      .addCase(createSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.loading = false
        const newSchool = action.payload.data || action.payload
        state.schools.unshift(newSchool)
        state.pagination.total += 1
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 更新学校
      .addCase(updateSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.loading = false
        const updatedSchool = action.payload.data || action.payload
        const index = state.schools.findIndex(school => school.id === updatedSchool.id)
        if (index !== -1) {
          state.schools[index] = updatedSchool
        }
        if (state.currentSchool && state.currentSchool.id === updatedSchool.id) {
          state.currentSchool = updatedSchool
        }
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 删除学校
      .addCase(deleteSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.loading = false
        state.schools = state.schools.filter(school => school.id !== action.payload)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        if (state.currentSchool && state.currentSchool.id === action.payload) {
          state.currentSchool = null
        }
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取学校统计
      .addCase(fetchSchoolStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchoolStatistics.fulfilled, (state, action) => {
        state.loading = false
        state.statistics = action.payload.data || action.payload
      })
      .addCase(fetchSchoolStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 上传logo
      .addCase(uploadSchoolLogo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadSchoolLogo.fulfilled, (state, action) => {
        state.loading = false
        const updatedSchool = action.payload.data || action.payload
        const index = state.schools.findIndex(school => school.id === updatedSchool.id)
        if (index !== -1) {
          state.schools[index] = updatedSchool
        }
        if (state.currentSchool && state.currentSchool.id === updatedSchool.id) {
          state.currentSchool = updatedSchool
        }
      })
      .addCase(uploadSchoolLogo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

// 导出actions
export const {
  setSchoolFilters,
  resetSchoolFilters,
  setSchoolPagination,
  clearSchoolError,
  clearCurrentSchool
} = schoolSlice.actions

// 导出reducer
export default schoolSlice.reducer

// 选择器
export const selectSchools = (state) => state.school.schools
export const selectCurrentSchool = (state) => state.school.currentSchool
export const selectSchoolStatistics = (state) => state.school.statistics
export const selectSchoolLoading = (state) => state.school.loading
export const selectSchoolError = (state) => state.school.error
export const selectSchoolPagination = (state) => state.school.pagination
export const selectSchoolFilters = (state) => state.school.filters