import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'

// 真实登录API请求
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth/login', credentials)
      
      // 返回真实的令牌和用户信息
      return {
        user: data.user_info,
        token: data.access_token
      }
    } catch (error) {
      // 确保返回的是字符串错误，而不是对象
      let errorMessage = '登录失败，请检查用户名和密码'
      if (error.response) {
        const data = error.response.data
        if (data) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (typeof data.message === 'string') {
            errorMessage = data.message
          } else if (Array.isArray(data)) {
            // 处理多个错误的情况
            errorMessage = data.map(err => err.msg || '未知错误').join('; ')
          } else if (typeof data === 'string') {
            errorMessage = data
          }
        }
      } else {
        errorMessage = '登录失败，请检查网络连接或服务器状态'
      }
      return rejectWithValue(errorMessage)
    }
  }
)

// 真实注册API请求
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth/register', userData)
      
      return {
        message: '注册成功'
      }
    } catch (error) {
      // 确保返回的是字符串错误，而不是对象
      let errorMessage = '注册失败，请稍后重试'
      if (error.response) {
        const data = error.response.data
        if (data) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (typeof data.message === 'string') {
            errorMessage = data.message
          } else if (Array.isArray(data)) {
            // 处理多个错误的情况
            errorMessage = data.map(err => err.msg || '未知错误').join('; ')
          } else if (typeof data === 'string') {
            errorMessage = data
          }
        }
      } else {
        errorMessage = '注册失败，请检查网络连接或服务器状态'
      }
      return rejectWithValue(errorMessage)
    }
  }
)

// 真实登出API请求
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState().auth
      // 从state获取token，处理可能的undefined情况
      const token = state?.token || ''
      
      // 调用后端登出API（不关心结果，因为前端会强制清除状态）
      try {
        if (token) {
          await apiClient.post('/auth/logout')
        }
      } catch (error) {
        // 忽略登出API调用错误，因为前端会强制清除状态
      }
      
      // 清除localStorage中的持久化数据
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('persist:root')
        window.localStorage.removeItem('auth')
      }
      
      return { message: '登出成功' }
    } catch (error) {
      // 即使出错，也要清除localStorage中的持久化数据
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('persist:root')
        window.localStorage.removeItem('auth')
      }
      return rejectWithValue('登出失败，请检查网络连接或服务器状态')
    }
  }
)

// 初始化状态
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false
}

// 创建auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 登录处理
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // 保存auth状态到localStorage，方便apiClient直接获取
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('auth', JSON.stringify({
            token: action.payload.token,
            user: action.payload.user,
            isAuthenticated: true
          }))
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 注册处理
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 登出处理
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
        // 清除localStorage中的auth状态
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('auth')
        }
      })
  }
})

// 导出action creators
export const { clearError } = authSlice.actions

// 导出reducer
export default authSlice.reducer