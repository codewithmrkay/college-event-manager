import React from 'react'
import ProfileImage from '../components/onboarding/ProfileImage'
import About from '../components/onboarding/About'
import College from '../components/onboarding/College'

export const Profile = () => {
  return (
    <div className='flex flex-col w-full'>
      <ProfileImage/>
      <About/>
      <College/>
    </div>
  )
}
