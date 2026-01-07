import { createSlice } from '@reduxjs/toolkit'

// 初始状态
const initialState = {
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
    }
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
  clearError
} = sportsMeetSlice.actions

// 导出reducer
export default sportsMeetSlice.reducer