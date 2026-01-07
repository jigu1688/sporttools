import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 模拟登录API请求
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功响应
      return {
        user: {
          id: 1,
          username: credentials.username,
          name: '管理员',
          email: 'admin@example.com',
          phone: '13800138000',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    } catch {
      return rejectWithValue('登录失败，请检查用户名和密码')
    }
  }
)

// 模拟注册API请求
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功响应
      return {
        message: '注册成功'
      }
    } catch {
      return rejectWithValue('注册失败，请稍后重试')
    }
  }
)

// 登出操作
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟成功响应
      return { message: '登出成功' }
    } catch {
      return rejectWithValue('登出失败')
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
      })
  }
})

// 导出action creators
export const { clearError } = authSlice.actions

// 导出reducer
export default authSlice.reducer