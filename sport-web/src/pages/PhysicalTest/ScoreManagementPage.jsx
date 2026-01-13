import ScoreManagement from '../../components/PhysicalTest/ScoreManagement'
import ErrorBoundary from '../../components/ErrorBoundary'

const ScoreManagementPage = () => {
  return (
    <ErrorBoundary>
      <ScoreManagement />
    </ErrorBoundary>
  )
}

export default ScoreManagementPage
