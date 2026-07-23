import './body.scss'
import MyDayDashboard from '../../../MyDayDashboard'
import { useNavigation } from 'react-router-dom'
import Loader from '../../../../ui/Dropdown/Loader'

const Body = () => {
  const navigation = useNavigation()
  if(navigation.state === "loading"){
    return <Loader/>
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
