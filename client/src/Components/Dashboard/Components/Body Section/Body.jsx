import React from 'react'
import './body.scss'
import MyDayDashboard from '../../../MyDayDashboard'
import { useNavigation } from 'react-router-dom'
import RedactionSkeleton from '../../../../ui/Dropdown/RedactionSkeleton'

const Body = () => {
  const navigation = useNavigation()
  if(navigation.state === "loading"){
    return <RedactionSkeleton />
  }
  return (
    <>
      <div className="bottom flex" style={{ width: '100%', height: 'auto', minHeight: '600px' }}>
        <MyDayDashboard />
      </div>
    </>
  ) 
}

export default Body
