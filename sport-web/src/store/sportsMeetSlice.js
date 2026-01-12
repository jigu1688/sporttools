import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'

// 异步thunk：获取仪表盘数据
export const fetchDashboardData = createAsyncThunk(
  'sportsMeet/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/sports-meet/dashboard')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取仪表盘数据失败')
    }
  }
)

// 异步thunk：获取运动会列表
export const fetchSportsMeets = createAsyncThunk(
  'sportsMeet/fetchSportsMeets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/sports-meet')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取运动会列表失败')
    }
  }
)

// 异步thunk：获取报名统计数据
export const fetchRegistrationStatistics = createAsyncThunk(
  'sportsMeet/fetchRegistrationStatistics',
  async (sportsMeetId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/registration-statistics`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取报名统计数据失败')
    }
  }
)

// 异步thunk：获取单个运动会详情
export const fetchSportsMeetById = createAsyncThunk(
  'sportsMeet/fetchSportsMeetById',
  async (sportsMeetId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取运动会详情失败')
    }
  }
)

// 异步thunk：创建运动会
export const createSportsMeet = createAsyncThunk(
  'sportsMeet/createSportsMeet',
  async (sportsMeetData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/sports-meet', sportsMeetData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建运动会失败')
    }
  }
)

// 异步thunk：更新运动会
export const updateSportsMeetById = createAsyncThunk(
  'sportsMeet/updateSportsMeetById',
  async ({ sportsMeetId, sportsMeetData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}`, sportsMeetData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新运动会失败')
    }
  }
)

// 异步thunk：删除运动会
export const deleteSportsMeetById = createAsyncThunk(
  'sportsMeet/deleteSportsMeetById',
  async (sportsMeetId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/${sportsMeetId}`)
      return sportsMeetId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除运动会失败')
    }
  }
)

// 异步thunk：获取项目列表
export const fetchEvents = createAsyncThunk(
  'sportsMeet/fetchEvents',
  async (sportsMeetId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/events`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取项目列表失败')
    }
  }
)

// 异步thunk：获取单个项目详情
export const fetchEventById = createAsyncThunk(
  'sportsMeet/fetchEventById',
  async ({ sportsMeetId, eventId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/events/${eventId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取项目详情失败')
    }
  }
)

// 异步thunk：创建项目
export const createEvent = createAsyncThunk(
  'sportsMeet/createEvent',
  async ({ sportsMeetId, eventData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/sports-meet/${sportsMeetId}/events`, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建项目失败')
    }
  }
)

// 异步thunk：更新项目
export const updateEventById = createAsyncThunk(
  'sportsMeet/updateEventById',
  async ({ sportsMeetId, eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}/events/${eventId}`, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新项目失败')
    }
  }
)

// 异步thunk：删除项目
export const deleteEventById = createAsyncThunk(
  'sportsMeet/deleteEventById',
  async ({ sportsMeetId, eventId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/${sportsMeetId}/events/${eventId}`)
      return { sportsMeetId, eventId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除项目失败')
    }
  }
)

// 报名管理相关异步thunk
// 异步thunk：获取报名列表
export const fetchRegistrations = createAsyncThunk(
  'sportsMeet/fetchRegistrations',
  async ({ sportsMeetId, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/registrations${params ? `?${params}` : ''}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取报名列表失败')
    }
  }
)

// 异步thunk：创建报名
export const createRegistration = createAsyncThunk(
  'sportsMeet/createRegistration',
  async ({ sportsMeetId, registrationData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/sports-meet/${sportsMeetId}/registrations`, registrationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建报名失败')
    }
  }
)

// 异步thunk：批量创建报名
export const batchCreateRegistrations = createAsyncThunk(
  'sportsMeet/batchCreateRegistrations',
  async ({ sportsMeetId, registrationsData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/sports-meet/${sportsMeetId}/registrations/batch`, registrationsData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '批量创建报名失败')
    }
  }
)

// 异步thunk：删除报名
export const deleteRegistrationById = createAsyncThunk(
  'sportsMeet/deleteRegistrationById',
  async ({ sportsMeetId, registrationId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/${sportsMeetId}/registrations/${registrationId}`)
      return { sportsMeetId, registrationId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除报名失败')
    }
  }
)

// 报名审核相关异步thunk
// 异步thunk：获取待审核报名
export const fetchPendingRegistrations = createAsyncThunk(
  'sportsMeet/fetchPendingRegistrations',
  async (sportsMeetId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/registrations/pending`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取待审核报名失败')
    }
  }
)

// 异步thunk：审核通过报名
export const approveRegistration = createAsyncThunk(
  'sportsMeet/approveRegistration',
  async ({ sportsMeetId, registrationId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}/registrations/${registrationId}/approve`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '审核通过报名失败')
    }
  }
)

// 异步thunk：审核拒绝报名
export const rejectRegistration = createAsyncThunk(
  'sportsMeet/rejectRegistration',
  async ({ sportsMeetId, registrationId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}/registrations/${registrationId}/reject`, { reason })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '审核拒绝报名失败')
    }
  }
)

// 场馆管理相关异步thunk
// 异步thunk：获取场馆列表
export const fetchVenues = createAsyncThunk(
  'sportsMeet/fetchVenues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/sports-meet/venues')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取场馆列表失败')
    }
  }
)

// 异步thunk：获取单个场馆详情
export const fetchVenueById = createAsyncThunk(
  'sportsMeet/fetchVenueById',
  async (venueId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/venues/${venueId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取场馆详情失败')
    }
  }
)

// 异步thunk：创建场馆
export const createVenue = createAsyncThunk(
  'sportsMeet/createVenue',
  async (venueData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/sports-meet/venues', venueData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建场馆失败')
    }
  }
)

// 异步thunk：更新场馆
export const updateVenueById = createAsyncThunk(
  'sportsMeet/updateVenueById',
  async ({ venueId, venueData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/venues/${venueId}`, venueData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新场馆失败')
    }
  }
)

// 异步thunk：删除场馆
export const deleteVenueById = createAsyncThunk(
  'sportsMeet/deleteVenueById',
  async (venueId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/venues/${venueId}`)
      return venueId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除场馆失败')
    }
  }
)

// 裁判管理相关异步thunk
// 异步thunk：获取裁判列表
export const fetchReferees = createAsyncThunk(
  'sportsMeet/fetchReferees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/sports-meet/referees')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取裁判列表失败')
    }
  }
)

// 异步thunk：获取单个裁判详情
export const fetchRefereeById = createAsyncThunk(
  'sportsMeet/fetchRefereeById',
  async (refereeId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/referees/${refereeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取裁判详情失败')
    }
  }
)

// 异步thunk：创建裁判
export const createReferee = createAsyncThunk(
  'sportsMeet/createReferee',
  async (refereeData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/sports-meet/referees', refereeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建裁判失败')
    }
  }
)

// 异步thunk：更新裁判
export const updateRefereeById = createAsyncThunk(
  'sportsMeet/updateRefereeById',
  async ({ refereeId, refereeData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/referees/${refereeId}`, refereeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新裁判失败')
    }
  }
)

// 异步thunk：删除裁判
export const deleteRefereeById = createAsyncThunk(
  'sportsMeet/deleteRefereeById',
  async (refereeId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/referees/${refereeId}`)
      return refereeId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除裁判失败')
    }
  }
)

// 赛程管理相关异步thunk
// 异步thunk：获取赛程列表
export const fetchSchedules = createAsyncThunk(
  'sportsMeet/fetchSchedules',
  async ({ sportsMeetId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/schedules`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取赛程列表失败')
    }
  }
)

// 异步thunk：获取单个赛程详情
export const fetchScheduleById = createAsyncThunk(
  'sportsMeet/fetchScheduleById',
  async ({ sportsMeetId, scheduleId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/schedules/${scheduleId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取赛程详情失败')
    }
  }
)

// 异步thunk：创建赛程
export const createSchedule = createAsyncThunk(
  'sportsMeet/createSchedule',
  async ({ sportsMeetId, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/sports-meet/${sportsMeetId}/schedules`, scheduleData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建赛程失败')
    }
  }
)

// 异步thunk：更新赛程
export const updateScheduleById = createAsyncThunk(
  'sportsMeet/updateScheduleById',
  async ({ sportsMeetId, scheduleId, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}/schedules/${scheduleId}`, scheduleData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新赛程失败')
    }
  }
)

// 异步thunk：删除赛程
export const deleteScheduleById = createAsyncThunk(
  'sportsMeet/deleteScheduleById',
  async ({ sportsMeetId, scheduleId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/${sportsMeetId}/schedules/${scheduleId}`)
      return scheduleId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除赛程失败')
    }
  }
)

// 成绩管理相关异步thunk
// 异步thunk：获取成绩列表
export const fetchResults = createAsyncThunk(
  'sportsMeet/fetchResults',
  async ({ sportsMeetId, eventId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/results${eventId ? `?event_id=${eventId}` : ''}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取成绩列表失败')
    }
  }
)

// 异步thunk：获取单个成绩详情
export const fetchResultById = createAsyncThunk(
  'sportsMeet/fetchResultById',
  async ({ sportsMeetId, resultId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sports-meet/${sportsMeetId}/results/${resultId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取成绩详情失败')
    }
  }
)

// 异步thunk：创建成绩
export const createResult = createAsyncThunk(
  'sportsMeet/createResult',
  async ({ sportsMeetId, resultData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/sports-meet/${sportsMeetId}/results`, resultData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建成绩失败')
    }
  }
)

// 异步thunk：更新成绩
export const updateResultById = createAsyncThunk(
  'sportsMeet/updateResultById',
  async ({ sportsMeetId, resultId, resultData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/sports-meet/${sportsMeetId}/results/${resultId}`, resultData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新成绩失败')
    }
  }
)

// 异步thunk：删除成绩
export const deleteResultById = createAsyncThunk(
  'sportsMeet/deleteResultById',
  async ({ sportsMeetId, resultId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sports-meet/${sportsMeetId}/results/${resultId}`)
      return resultId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除成绩失败')
    }
  }
)

// 初始状态
const initialState = {
  // 仪表盘数据
  dashboardData: {
    totalSportsMeets: 0,
    upcomingSportsMeets: 0,
    totalAthletes: 0,
    totalEvents: 0,
    totalRegistrations: 0
  },
  // 运动会列表
  sportsMeets: [],
  // 当前选中的运动会
  currentSportsMeet: null,
  // 项目列表
  events: [],
  // 运动员列表
  athletes: [],
  // 报名信息
  registrations: [],
  // 赛程信息
  schedules: [],
  // 分组信息
  groups: [],
  // 成绩信息
  results: [],
  // 裁判列表
  referees: [],
  // 裁判分配信息
  refereeAssignments: [],
  // 编号规则配置
  numberingRules: {
    // 默认规则
    default: {
      format: 'grade+class+gender+sequence', // 编号格式：年级+班级+性别+序号
      gradeDigits: 1, // 年级位数
      classDigits: 1, // 班级位数
      genderDigits: 1, // 性别位数（1:男, 2:女）
      sequenceDigits: 1, // 序号位数
      separator: '' // 分隔符
    }
  },
  // 场馆相关
  venues: [],
  // 加载状态
  loading: false,
  // 错误信息
  error: null
}

// 创建运动会slice
export const sportsMeetSlice = createSlice({
  name: 'sportsMeet',
  initialState,
  reducers: {
    // 运动会相关
    setSportsMeets: (state, action) => {
      state.sportsMeets = action.payload
    },
    addSportsMeet: (state, action) => {
      state.sportsMeets.push(action.payload)
    },
    updateSportsMeet: (state, action) => {
      const index = state.sportsMeets.findIndex(meet => meet.id === action.payload.id)
      if (index !== -1) {
        state.sportsMeets[index] = action.payload
      }
    },
    deleteSportsMeet: (state, action) => {
      state.sportsMeets = state.sportsMeets.filter(meet => meet.id !== action.payload)
    },
    setCurrentSportsMeet: (state, action) => {
      state.currentSportsMeet = action.payload
    },
    
    // 项目相关
    setEvents: (state, action) => {
      state.events = action.payload
    },
    addEvent: (state, action) => {
      state.events.push(action.payload)
    },
    updateEvent: (state, action) => {
      const index = state.events.findIndex(event => event.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload)
    },
    
    // 运动员相关
    setAthletes: (state, action) => {
      state.athletes = action.payload
    },
    addAthlete: (state, action) => {
      state.athletes.push(action.payload)
    },
    updateAthlete: (state, action) => {
      const index = state.athletes.findIndex(athlete => athlete.id === action.payload.id)
      if (index !== -1) {
        state.athletes[index] = action.payload
      }
    },
    deleteAthlete: (state, action) => {
      state.athletes = state.athletes.filter(athlete => athlete.id !== action.payload)
    },
    
    // 报名相关
    setRegistrations: (state, action) => {
      state.registrations = action.payload
    },
    addRegistration: (state, action) => {
      state.registrations.push(action.payload)
    },
    batchAddRegistrations: (state, action) => {
      state.registrations.push(...action.payload)
    },
    updateRegistration: (state, action) => {
      const index = state.registrations.findIndex(registration => registration.id === action.payload.id)
      if (index !== -1) {
        state.registrations[index] = action.payload
      }
    },
    deleteRegistration: (state, action) => {
      state.registrations = state.registrations.filter(registration => registration.id !== action.payload)
    },
    batchRemoveRegistrations: (state, action) => {
      state.registrations = state.registrations.filter(registration => !action.payload.includes(registration.id))
    },
    
    // 赛程相关
    setSchedules: (state, action) => {
      state.schedules = action.payload
    },
    addSchedule: (state, action) => {
      state.schedules.push(action.payload)
    },
    updateSchedule: (state, action) => {
      const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id)
      if (index !== -1) {
        state.schedules[index] = action.payload
      }
    },
    deleteSchedule: (state, action) => {
      state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload)
    },
    
    // 分组相关
    setGroups: (state, action) => {
      state.groups = action.payload
    },
    addGroup: (state, action) => {
      state.groups.push(action.payload)
    },
    updateGroup: (state, action) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id)
      if (index !== -1) {
        state.groups[index] = action.payload
      }
    },
    deleteGroup: (state, action) => {
      state.groups = state.groups.filter(group => group.id !== action.payload)
    },
    
    // 成绩相关
    setResults: (state, action) => {
      state.results = action.payload
    },
    addResult: (state, action) => {
      state.results.push(action.payload)
    },
    updateResult: (state, action) => {
      const index = state.results.findIndex(result => result.id === action.payload.id)
      if (index !== -1) {
        state.results[index] = action.payload
      }
    },
    deleteResult: (state, action) => {
      state.results = state.results.filter(result => result.id !== action.payload)
    },
    
    // 裁判相关
    setReferees: (state, action) => {
      state.referees = action.payload
    },
    addReferee: (state, action) => {
      state.referees.push(action.payload)
    },
    updateReferee: (state, action) => {
      const index = state.referees.findIndex(referee => referee.id === action.payload.id)
      if (index !== -1) {
        state.referees[index] = action.payload
      }
    },
    deleteReferee: (state, action) => {
      state.referees = state.referees.filter(referee => referee.id !== action.payload)
    },
    
    // 裁判分配相关
    setRefereeAssignments: (state, action) => {
      state.refereeAssignments = action.payload
    },
    addRefereeAssignment: (state, action) => {
      state.refereeAssignments.push(action.payload)
    },
    updateRefereeAssignment: (state, action) => {
      const index = state.refereeAssignments.findIndex(assignment => assignment.id === action.payload.id)
      if (index !== -1) {
        state.refereeAssignments[index] = action.payload
      }
    },
    deleteRefereeAssignment: (state, action) => {
      state.refereeAssignments = state.refereeAssignments.filter(assignment => assignment.id !== action.payload)
    },
    
    // 场馆相关
    setVenues: (state, action) => {
      state.venues = action.payload
    },
    addVenue: (state, action) => {
      state.venues.push(action.payload)
    },
    updateVenue: (state, action) => {
      const index = state.venues.findIndex(venue => venue.id === action.payload.id)
      if (index !== -1) {
        state.venues[index] = action.payload
      }
    },
    deleteVenue: (state, action) => {
      state.venues = state.venues.filter(venue => venue.id !== action.payload)
    },
    
    // 编号规则配置
    setNumberingRules: (state, action) => {
      state.numberingRules = action.payload
    },
    updateNumberingRule: (state, action) => {
      const { ruleId, ...ruleConfig } = action.payload
      state.numberingRules[ruleId] = ruleConfig
    },
    addNumberingRule: (state, action) => {
      const { ruleId, ...ruleConfig } = action.payload
      state.numberingRules[ruleId] = ruleConfig
    },
    deleteNumberingRule: (state, action) => {
      delete state.numberingRules[action.payload]
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
    },
    // 仪表盘数据管理
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload
    }
  },
  extraReducers: (builder) => {
    // 处理获取仪表盘数据
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardData = action.payload
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理获取运动会列表
    builder
      .addCase(fetchSportsMeets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSportsMeets.fulfilled, (state, action) => {
        state.loading = false
        state.sportsMeets = action.payload
      })
      .addCase(fetchSportsMeets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理获取报名统计数据
    builder
      .addCase(fetchRegistrationStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRegistrationStatistics.fulfilled, (state, action) => {
        state.loading = false
        // 可以根据需要将统计数据存储在state中
      })
      .addCase(fetchRegistrationStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理获取单个运动会详情
    builder
      .addCase(fetchSportsMeetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSportsMeetById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSportsMeet = action.payload
      })
      .addCase(fetchSportsMeetById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理创建运动会
    builder
      .addCase(createSportsMeet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSportsMeet.fulfilled, (state, action) => {
        state.loading = false
        state.sportsMeets.push(action.payload)
      })
      .addCase(createSportsMeet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理更新运动会
    builder
      .addCase(updateSportsMeetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSportsMeetById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.sportsMeets.findIndex(meet => meet.id === action.payload.id)
        if (index !== -1) {
          state.sportsMeets[index] = action.payload
        }
        if (state.currentSportsMeet && state.currentSportsMeet.id === action.payload.id) {
          state.currentSportsMeet = action.payload
        }
      })
      .addCase(updateSportsMeetById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理删除运动会
    builder
      .addCase(deleteSportsMeetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSportsMeetById.fulfilled, (state, action) => {
        state.loading = false
        state.sportsMeets = state.sportsMeets.filter(meet => meet.id !== action.payload)
        if (state.currentSportsMeet && state.currentSportsMeet.id === action.payload) {
          state.currentSportsMeet = null
        }
      })
      .addCase(deleteSportsMeetById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理获取项目列表
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理获取单个项目详情
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false
        // 可以根据需要将单个项目详情存储在state中
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理创建项目
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.events.push(action.payload)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理更新项目
    builder
      .addCase(updateEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEventById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.events.findIndex(event => event.id === action.payload.id)
        if (index !== -1) {
          state.events[index] = action.payload
        }
      })
      .addCase(updateEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理删除项目
    builder
      .addCase(deleteEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEventById.fulfilled, (state, action) => {
        state.loading = false
        state.events = state.events.filter(event => event.id !== action.payload.eventId)
      })
      .addCase(deleteEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 处理报名管理相关异步thunk
    // 获取报名列表
    builder
      .addCase(fetchRegistrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.loading = false
        state.registrations = action.payload
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 创建报名
    builder
      .addCase(createRegistration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRegistration.fulfilled, (state, action) => {
        state.loading = false
        state.registrations.push(action.payload)
      })
      .addCase(createRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 批量创建报名
    builder
      .addCase(batchCreateRegistrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(batchCreateRegistrations.fulfilled, (state, action) => {
        state.loading = false
        state.registrations.push(...action.payload)
      })
      .addCase(batchCreateRegistrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 删除报名
    builder
      .addCase(deleteRegistrationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRegistrationById.fulfilled, (state, action) => {
        state.loading = false
        state.registrations = state.registrations.filter(reg => reg.id !== action.payload.registrationId)
      })
      .addCase(deleteRegistrationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 获取待审核报名
    builder
      .addCase(fetchPendingRegistrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingRegistrations.fulfilled, (state, action) => {
        state.loading = false
        // 可以将待审核报名单独存储，或者使用filters参数获取
        // 这里暂时将其存储到registrations中，实际使用时可以根据需要调整
        state.registrations = action.payload
      })
      .addCase(fetchPendingRegistrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 审核通过报名
    builder
      .addCase(approveRegistration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveRegistration.fulfilled, (state, action) => {
        state.loading = false
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id)
        if (index !== -1) {
          state.registrations[index] = action.payload
        }
      })
      .addCase(approveRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
    // 审核拒绝报名
    builder
      .addCase(rejectRegistration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectRegistration.fulfilled, (state, action) => {
        state.loading = false
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id)
        if (index !== -1) {
          state.registrations[index] = action.payload
        }
      })
      .addCase(rejectRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 场馆管理相关异步thunk处理
    // 获取场馆列表
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false
        state.venues = action.payload
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 创建场馆
    builder
      .addCase(createVenue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.loading = false
        state.venues.push(action.payload)
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 更新场馆
    builder
      .addCase(updateVenueById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVenueById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.venues.findIndex(venue => venue.id === action.payload.id)
        if (index !== -1) {
          state.venues[index] = action.payload
        }
      })
      .addCase(updateVenueById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 删除场馆
    builder
      .addCase(deleteVenueById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVenueById.fulfilled, (state, action) => {
        state.loading = false
        state.venues = state.venues.filter(venue => venue.id !== action.payload)
      })
      .addCase(deleteVenueById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 裁判管理相关异步thunk处理
    // 获取裁判列表
    builder
      .addCase(fetchReferees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReferees.fulfilled, (state, action) => {
        state.loading = false
        state.referees = action.payload
      })
      .addCase(fetchReferees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 创建裁判
    builder
      .addCase(createReferee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createReferee.fulfilled, (state, action) => {
        state.loading = false
        state.referees.push(action.payload)
      })
      .addCase(createReferee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 更新裁判
    builder
      .addCase(updateRefereeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRefereeById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.referees.findIndex(referee => referee.id === action.payload.id)
        if (index !== -1) {
          state.referees[index] = action.payload
        }
      })
      .addCase(updateRefereeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 删除裁判
    builder
      .addCase(deleteRefereeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRefereeById.fulfilled, (state, action) => {
        state.loading = false
        state.referees = state.referees.filter(referee => referee.id !== action.payload)
      })
      .addCase(deleteRefereeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 赛程管理相关异步thunk处理
    // 获取赛程列表
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 创建赛程
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false
        state.schedules.push(action.payload)
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 更新赛程
    builder
      .addCase(updateScheduleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateScheduleById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id)
        if (index !== -1) {
          state.schedules[index] = action.payload
        }
      })
      .addCase(updateScheduleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 删除赛程
    builder
      .addCase(deleteScheduleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteScheduleById.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload)
      })
      .addCase(deleteScheduleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 成绩管理相关异步thunk处理
    // 获取成绩列表
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 创建成绩
    builder
      .addCase(createResult.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createResult.fulfilled, (state, action) => {
        state.loading = false
        state.results.push(action.payload)
      })
      .addCase(createResult.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 更新成绩
    builder
      .addCase(updateResultById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateResultById.fulfilled, (state, action) => {
        state.loading = false
        const index = state.results.findIndex(result => result.id === action.payload.id)
        if (index !== -1) {
          state.results[index] = action.payload
        }
      })
      .addCase(updateResultById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 删除成绩
    builder
      .addCase(deleteResultById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteResultById.fulfilled, (state, action) => {
        state.loading = false
        state.results = state.results.filter(result => result.id !== action.payload)
      })
      .addCase(deleteResultById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// 导出action creators
export const {
  // 运动会相关
  setSportsMeets,
  addSportsMeet,
  updateSportsMeet,
  deleteSportsMeet,
  setCurrentSportsMeet,
  
  // 项目相关
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  
  // 运动员相关
  setAthletes,
  addAthlete,
  updateAthlete,
  deleteAthlete,
  
  // 报名相关
  setRegistrations,
  addRegistration,
  batchAddRegistrations,
  updateRegistration,
  deleteRegistration,
  batchRemoveRegistrations,
  
  // 赛程相关
  setSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  
  // 分组相关
  setGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  
  // 成绩相关
  setResults,
  addResult,
  updateResult,
  deleteResult,
  
  // 裁判相关
  setReferees,
  addReferee,
  updateReferee,
  deleteReferee,
  
  // 裁判分配相关
  setRefereeAssignments,
  addRefereeAssignment,
  updateRefereeAssignment,
  deleteRefereeAssignment,
  
  // 场馆相关
  setVenues,
  addVenue,
  updateVenue,
  deleteVenue,
  
  // 编号规则配置
  setNumberingRules,
  updateNumberingRule,
  addNumberingRule,
  deleteNumberingRule,
  
  // 加载状态管理
  setLoading,
  setError,
  clearError,
  // 仪表盘数据管理
  setDashboardData
} = sportsMeetSlice.actions

// 导出reducer
export default sportsMeetSlice.reducer