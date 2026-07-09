import React from 'react'
import './body.scss'
import Powerbi from './Powerbi/Powerbi'
import { useNavigation } from 'react-router-dom'
import RedactionSkeleton from '../../../../ui/Dropdown/RedactionSkeleton'

const Body = () => {
  const navigation = useNavigation()
  if(navigation.state === "loading"){
    return <RedactionSkeleton />
  }
  return (
    <>
      <div className="bottom flex">
      <Powerbi/>
      </div>
    </>
  ) 
}

export default Body
