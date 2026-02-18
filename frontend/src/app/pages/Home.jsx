import React from 'react'
import { TypeWriterEffect } from '../components/effects/TypeWritterEffect'
import { HomeHereText } from '../components/text/HomeHereText'
import { Mangodolly } from '../components/mangodolly/Mangodolly'
import { SubFooter } from '../components/common/SubFooter'

export const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full'>
      {/* home page hero text */}
      <HomeHereText />
      {/* Mangodolly model */}
      <Mangodolly/>
      {/* sub footer part */}
      <SubFooter/>
    </div>
  )
}
