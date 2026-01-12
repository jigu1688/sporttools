import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'

// 创建一个自定义的存储适配器，确保在所有环境中都能正常工作
const customStorage = {
  // 只在浏览器环境中使用localStorage
  getItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key))
    }
    return Promise.resolve(null)
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
    }
    return Promise.resolve()
  }
}
import authReducer from './authSlice'
import dataReducer from './dataSlice'
import physicalTestReducer from './physicalTestSlice'
import statisticsReducer from './statisticsSlice'
import sportsMeetReducer from './sportsMeetSlice'
import schoolReducer from './schoolSlice'
import schoolYearReducer from './schoolYearSlice'
import logReducer from './logSlice'

// Redux持久化配置
const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['auth'] // 只持久化auth状态，data每次从API获取
}

// 组合reducers
const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
  physicalTest: physicalTestReducer,
  statistics: statisticsReducer,
  sportsMeet: sportsMeetReducer,
  school: schoolReducer,
  schoolYear: schoolYearReducer,
  log: logReducer
})

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 创建Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }) // 禁用序列化检查，避免redux-persist的action被拒绝
})

// 创建持久化store
const persistor = persistStore(store)

export { store, persistor }