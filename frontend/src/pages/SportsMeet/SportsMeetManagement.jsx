import React from 'react'
import { Card } from 'antd'
import SportsMeetList from '../../components/SportsMeet/SportsMeetList'

const SportsMeetManagement = () => {
  return (
    <div>
      <Card>
        <SportsMeetList />
      </Card>
    </div>
  )
}

export default SportsMeetManagement