import React from 'react'
import './body.scss'
import Powerbi from './Powerbi/Powerbi'
import { useNavigation } from 'react-router-dom'
import Loader from '../../../../ui/Dropdown/Loader'
import AlertsFeed from '../../../../Components/AlertsFeed'

const Body = () => {
  const navigation = useNavigation()
  if(navigation.state === "loading"){
    return <Loader/>
  }
  return (
    <div className="bottom flex" style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: '600px' }}>
      <Powerbi/>
    </div>
  ) 
}

export default Body

