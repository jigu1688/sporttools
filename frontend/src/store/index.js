import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import dataReducer from './dataSlice'
import physicalTestReducer from './physicalTestSlice'
import statisticsReducer from './statisticsSlice'
import sportsMeetReducer from './sportsMeetSlice'

// 创建Redux store，暂时移除持久化功能
const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    physicalTest: physicalTestReducer,
    statistics: statisticsReducer,
    sportsMeet: sportsMeetReducer
  }
})

export default store