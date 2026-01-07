import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import { useSelector } from 'react-redux'

// 页面组件
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SchoolInfo from './pages/SchoolInfo'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Users from './pages/Users'
import SchoolYearManagement from './pages/SchoolYearManagement'
import StudentHistory from './pages/StudentHistory'

// 体测系统页面组件
import PhysicalTestDashboard from './pages/PhysicalTest/Dashboard'
import TestItems from './pages/PhysicalTest/TestItems'
import ScoreManagementPage from './pages/PhysicalTest/ScoreManagementPage'
import StatisticsPage from './pages/PhysicalTest/StatisticsPage'

// 运动会编排系统页面组件
import SportsMeetDashboard from './pages/SportsMeet/Dashboard'
import SportsMeetManagement from './pages/SportsMeet/SportsMeetManagement'
import EventManagementPage from './pages/SportsMeet/EventManagementPage'
import RegistrationManagementPage from './pages/SportsMeet/RegistrationManagementPage'
import RegistrationAuditPage from './pages/SportsMeet/RegistrationAuditPage'
import RegistrationStatisticsPage from './pages/SportsMeet/RegistrationStatisticsPage'
import SchedulingPage from './pages/SportsMeet/SchedulingPage'
import ResultRecordPage from './pages/SportsMeet/ResultRecordPage'
import ReportGenerationPage from './pages/SportsMeet/ReportGenerationPage'
import RefereeManagement from './pages/SportsMeet/RefereeManagement'
import VenueManagement from './pages/SportsMeet/VenueManagement'
import TestComponent from './pages/SportsMeet/TestComponent'

// 受保护路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  
  console.log('ProtectedRoute isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <div className="app">
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 受保护路由 */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/school-info" element={<ProtectedRoute><SchoolInfo /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/school-year" element={<ProtectedRoute><SchoolYearManagement /></ProtectedRoute>} />
        <Route path="/student-history" element={<ProtectedRoute><StudentHistory /></ProtectedRoute>} />
        
        {/* 体测系统路由 */}
        <Route path="/physical-test" element={<ProtectedRoute><PhysicalTestDashboard /></ProtectedRoute>} />
        <Route path="/physical-test/test-items" element={<ProtectedRoute><TestItems /></ProtectedRoute>} />
        <Route path="/physical-test/score-management" element={<ProtectedRoute><ScoreManagementPage /></ProtectedRoute>} />
        <Route path="/physical-test/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
        
        {/* 运动会编排系统路由 */}
        <Route path="/sports-meet" element={<ProtectedRoute><SportsMeetDashboard /></ProtectedRoute>} />
        <Route path="/sports-meet/management" element={<ProtectedRoute><SportsMeetManagement /></ProtectedRoute>} />
        <Route path="/sports-meet/events" element={<ProtectedRoute><EventManagementPage /></ProtectedRoute>} />
        <Route path="/sports-meet/registration" element={<ProtectedRoute><RegistrationManagementPage /></ProtectedRoute>} />
        <Route path="/sports-meet/audit" element={<ProtectedRoute><RegistrationAuditPage /></ProtectedRoute>} />
        <Route path="/sports-meet/statistics" element={<ProtectedRoute><RegistrationStatisticsPage /></ProtectedRoute>} />
        <Route path="/sports-meet/scheduling" element={<ProtectedRoute><SchedulingPage /></ProtectedRoute>} />
        <Route path="/sports-meet/results" element={<ProtectedRoute><ResultRecordPage /></ProtectedRoute>} />
        <Route path="/sports-meet/reports" element={<ProtectedRoute><ReportGenerationPage /></ProtectedRoute>} />
        <Route path="/sports-meet/test" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
        <Route path="/sports-meet/referees" element={<ProtectedRoute><RefereeManagement /></ProtectedRoute>} />
        <Route path="/sports-meet/venues" element={<ProtectedRoute><VenueManagement /></ProtectedRoute>} />
        
        {/* 404路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
