import React from 'react'
import ProfileImage from '../components/onboarding/ProfileImage'
import About from '../components/onboarding/About'
import College from '../components/onboarding/College'
import CollegeFee from '../components/onboarding/CollegeFee'
import ContactDetails from '../components/onboarding/ContactDetails'
import OnboardingCard from '../components/onboarding/OnboardingCard'

export const Profile = () => {
  return (
    <div className='flex flex-col lg:flex-row w-full min-h-screen items-start py-4 bg-base-200'>
      {/* Sticky Sidebar / Top Bar */}
      <div className='w-full lg:w-1/2 sticky top-0 z-5 h-fit lg:h-screen flex items-center justify-center'>
        <OnboardingCard />
      </div>

      {/* Scrollable Content */}
      <div className='w-full lg:w-1/2 h-fit my-auto py-4 lg:p-10 gap-2 flex flex-col items-center justify-center'>
        <ProfileImage />
        <About />
        <College />
        <CollegeFee />
        <ContactDetails />
      </div>
    </div>
  )
}
