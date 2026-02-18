import React from 'react'
import { TypeWriterEffect } from '../effects/TypeWritterEffect'

export const HomeHereText = () => {
    return (
        <div className='relative w-full mt-5 flex items-center justify-start'>
            <div className='hidden md:block max-w-6xl mx-auto w-full aspect-4/2  md:aspect-4/3 relative'>
                <div className='hidden absolute inset-0 md:grid grid-cols-3 grid-rows-2 gap-4 md:ml-16'>
                    {/* Row 1 */}
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/dance.png'
                        alt="Image 1"
                    />
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/kick.png'
                        alt="Image 2"
                    />
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/study.png'
                        alt="Image 3"
                    />

                    {/* Row 2 */}
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/meditate.png'
                        alt="Image 4"
                    />
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/selfie.png'
                        alt="Image 5"
                    />
                    <img
                        className='aspect-4/3 w-[80%] object-cover rounded-md'
                        src='/images/sket.png'
                        alt="Image 6"
                    />

                </div>
                <div className='hidden md:block absolute bottom-0 left-0 w-full border-t-2 border-gray-300'>
                    <h1 className='text-3xl md:text-7xl font-medium inline-block'>Meet Event Paradise , </h1>
                    <span className=' text-3xl md:text-7xl font-bold underline underline-offset-4 decoration-6 md:decoration-8 decoration-pink-500'>MangoDolly.</span>
                </div>
            </div>
            <div className='font-sans font-medium md:absolute top-0 left-0 w-full mx-auto md:aspect-video flex-col flex items-start md:items-center justify-start md:justify-center text-black'>
                <h1 className='text-3xl md:text-7xl'>College
                    <span className='font-bold'> Events </span>
                    like,</h1>
                <div>
                    <TypeWriterEffect />
                </div>
                <h1 className='text-3xl md:text-7xl'>Made <span className='font-bold'> Easy </span></h1>
            </div>
        </div>
    )
}
