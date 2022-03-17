import React from 'react';
import '@reach/combobox/styles.css';
import './LocateUser.css'

const LocateUser = (props) => {
  const {moveTo} = props

  return (
  <button 
    className='locate'
    onClick={() => {
      navigator
      .geolocation
      .getCurrentPosition((position) => {
        moveTo({lat: position.coords.latitude, lng:position.coords.longitude})
      },() => null)
    }}
  >
      Locate Me!
  </button>
  )
}

export default LocateUser;