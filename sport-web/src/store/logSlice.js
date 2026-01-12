import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import logService from '../services/logService'

// 异步thunk actions
export const fetchLogs = createAsyncThunk(
  'log/fetchLogs',
  async (params = {}) => {
    const response = await logService.getLogs(params)
    return response
  }
)

export const fetchLog = createAsyncThunk(
  'log/fetchLog',
  async (id) => {
    const response = await logService.getLog(id)
    return response
  }
)

export const fetchLogsByUser = createAsyncThunk(
  'log/fetchLogsByUser',
  async ({ userId, params = {} }) => {
    const response = await logService.getLogsByUser(userId, params)
    return response
  }
)

export const fetchLogsByAction = createAsyncThunk(
  'log/fetchLogsByAction',
  async ({ action, params = {} }) => {
    const response = await logService.getLogsByAction(action, params)
    return response
  }
)

export const fetchSystemLogs = createAsyncThunk(
  'log/fetchSystemLogs',
  async (params = {}) => {
    const response = await logService.getSystemLogs(params)
    return response
  }
)

export const fetchUserActionLogs = createAsyncThunk(
  'log/fetchUserActionLogs',
  async (params = {}) => {
    const response = await logService.getUserActionLogs(params)
    return response
  }
)

export const fetchSecurityLogs = createAsyncThunk(
  'log/fetchSecurityLogs',
  async (params = {}) => {
    const response = await logService.getSecurityLogs(params)
    return response
  }
)

export const fetchErrorLogs = createAsyncThunk(
  'log/fetchErrorLogs',
  async (params = {}) => {
    const response = await logService.getErrorLogs(params)
    return response
  }
)

export const fetchLogsByDateRange = createAsyncThunk(
  'log/fetchLogsByDateRange',
  async ({ startDate, endDate, params = {} }) => {
    const response = await logService.getLogsByDateRange(startDate, endDate, params)
    return response
  }
)

export const searchLogs = createAsyncThunk(
  'log/searchLogs',
  async (searchParams) => {
    const response = await logService.searchLogs(searchParams)
    return response
  }
)

export const fetchLogStatistics = createAsyncThunk(
  'log/fetchLogStatistics',
  async (params = {}) => {
    const response = await logService.getLogStatistics(params)
    return response
  }
)

export const exportLogs = createAsyncThunk(
  'log/exportLogs',
  async (params = {}) => {
    const response = await logService.exportLogs(params)
    return response
  }
)

export const cleanupLogs = createAsyncThunk(
  'log/cleanupLogs',
  async (daysOld) => {
    const response = await logService.cleanupLogs(daysOld)
    return response
  }
)

export const fetchLogLevelDistribution = createAsyncThunk(
  'log/fetchLogLevelDistribution',
  async (params = {}) => {
    const response = await logService.getLogLevelDistribution(params)
    return response
  }
)

export const fetchActionTypeDistribution = createAsyncThunk(
  'log/fetchActionTypeDistribution',
  async (params = {}) => {
    const response = await logService.getActionTypeDistribution(params)
    return response
  }
)

// 初始状态
const initialState = {
  logs: [],
  currentLog: null,
  statistics: null,
  levelDistribution: null,
  actionTypeDistribution: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },
  filters: {
    userId: '',
    action: '',
    level: '',
    startDate: null,
    endDate: null,
    search: '',
    logType: 'all' // all, system, user, security, error
  },
  exportLoading: false
}

// 创建slice
const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    // 设置筛选条件
    setLogFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // 重置筛选条件
    resetLogFilters: (state) => {
      state.filters = initialState.filters
    },
    
    // 设置分页
    setLogPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    
    // 清除错误
    clearLogError: (state) => {
      state.error = null
    },
    
    // 清除当前日志
    clearCurrentLog: (state) => {
      state.currentLog = null
    },
    
    // 清除统计数据
    clearLogStatistics: (state) => {
      state.statistics = null
      state.levelDistribution = null
      state.actionTypeDistribution = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取日志列表
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取日志详情
      .addCase(fetchLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLog.fulfilled, (state, action) => {
        state.loading = false
        state.currentLog = action.payload.data || action.payload
      })
      .addCase(fetchLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 根据用户获取日志
      .addCase(fetchLogsByUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogsByUser.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchLogsByUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 根据操作类型获取日志
      .addCase(fetchLogsByAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogsByAction.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchLogsByAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取系统日志
      .addCase(fetchSystemLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取用户操作日志
      .addCase(fetchUserActionLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserActionLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchUserActionLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取安全日志
      .addCase(fetchSecurityLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSecurityLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchSecurityLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取错误日志
      .addCase(fetchErrorLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchErrorLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchErrorLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 根据日期范围获取日志
      .addCase(fetchLogsByDateRange.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogsByDateRange.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(fetchLogsByDateRange.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 搜索日志
      .addCase(searchLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data || action.payload.results || []
        if (action.payload.total) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(searchLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取统计信息
      .addCase(fetchLogStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogStatistics.fulfilled, (state, action) => {
        state.loading = false
        state.statistics = action.payload.data || action.payload
      })
      .addCase(fetchLogStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 导出日志
      .addCase(exportLogs.pending, (state) => {
        state.exportLoading = true
        state.error = null
      })
      .addCase(exportLogs.fulfilled, (state) => {
        state.exportLoading = false
      })
      .addCase(exportLogs.rejected, (state, action) => {
        state.exportLoading = false
        state.error = action.error.message
      })
      
      // 清理日志
      .addCase(cleanupLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cleanupLogs.fulfilled, (state, action) => {
        state.loading = false
        // 清理后重新获取日志列表
        state.logs = []
        state.pagination.total = 0
      })
      .addCase(cleanupLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取日志级别分布
      .addCase(fetchLogLevelDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogLevelDistribution.fulfilled, (state, action) => {
        state.loading = false
        state.levelDistribution = action.payload.data || action.payload
      })
      .addCase(fetchLogLevelDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // 获取操作类型分布
      .addCase(fetchActionTypeDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActionTypeDistribution.fulfilled, (state, action) => {
        state.loading = false
        state.actionTypeDistribution = action.payload.data || action.payload
      })
      .addCase(fetchActionTypeDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

// 导出actions
export const {
  setLogFilters,
  resetLogFilters,
  setLogPagination,
  clearLogError,
  clearCurrentLog,
  clearLogStatistics
} = logSlice.actions

// 导出reducer
export default logSlice.reducer

// 选择器
export const selectLogs = (state) => state.log.logs
export const selectCurrentLog = (state) => state.log.currentLog
export const selectLogStatistics = (state) => state.log.statistics
export const selectLogLevelDistribution = (state) => state.log.levelDistribution
export const selectActionTypeDistribution = (state) => state.log.actionTypeDistribution
export const selectLogLoading = (state) => state.log.loading
export const selectLogExportLoading = (state) => state.log.exportLoading
export const selectLogError = (state) => state.log.error
export const selectLogPagination = (state) => state.log.pagination
export const selectLogFilters = (state) => state.log.filters