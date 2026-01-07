import { Layout as AntLayout } from 'antd'
import Sidebar from './Sidebar'
import Header from './Header'

const { Content } = AntLayout

const Layout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <AntLayout style={{ 
        flex: 1, 
        display: 'flex',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}>
        <Sidebar />
        <AntLayout style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}>
          <Header />
          <Content style={{ 
            flex: 1, 
            overflow: 'auto',
            margin: '8px',
            padding: 16,
            background: '#fff',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
            boxSizing: 'border-box'
          }}>
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    </div>
  )
}

export default Layout