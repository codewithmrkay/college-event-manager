import React, { useState, useEffect, useRef } from 'react';

export const Mangodolly = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!containerRef.current) return;

            // 1. Get the avatar's position on the screen
            const rect = containerRef.current.getBoundingClientRect();

            // 2. Find the center of the avatar
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // 3. Calculate the angle between the mouse and the eyes
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

            // 4. Set how far the pupils should travel (radius)
            const maxDistance = 10;

            // 5. Use Trig to calculate X and Y
            const x = Math.cos(angle) * maxDistance;
            const y = Math.sin(angle) * maxDistance;

            setPosition({ x, y });
        };

        // Add listener to window so it tracks everywhere
        window.addEventListener('mousemove', handleGlobalMouseMove);

        // Clean up on unmount
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

    return (
        /* The container determines the "whole component" area */
        <div className='w-full py-5 flex flex-col border-b-2 border-gray-300'>
            <div className='w-full flex flex-col lg:flex-row justify-center lg:items-start'>
                <div ref={containerRef} className='relative w-full'>
                    {/* Avatar Image Layer */}
                    <div className='mx-auto w-50 md:w-120 aspect-square z-9 relative pointer-events-none'>
                        <img src="/images/mangodollyavatar.webp" alt="avatar" />
                    </div>

                    {/* Pupils Layer */}
                    <div className='mx-auto w-50 md:w-120 aspect-square absolute inset-0 z-0'>
                        <div className='absolute w-full pt-[42%] gap-[10%] flex items-center justify-center'>
                            <div
                                className='rounded-full bg-black w-5 md:w-15 aspect-square transition-transform duration-75 ease-out'
                                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                            />
                            <div
                                className='rounded-full bg-black w-5 md:w-15 aspect-square transition-transform duration-75 ease-out'
                                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                            />
                        </div>
                    </div>
                    <div className='inset-0  w-full absolute h-50 md:h-80'>

                    </div>

                </div>
                <div className='w-full flex flex-col justify-start'>
                    <div className='md:hidden w-full'>
                        <h1 className='text-3xl font-medium inline-block'>Meet Event Paradise , </h1>
                        <span className='font-mangodolly text-2xl md:text-7xl font-bold underline underline-offset-4 decoration-6 md:decoration-8 decoration-pink-500'>MangoDolly.</span>
                    </div>
                    <h1 className='text-xl text-left md:text-3xl text-black'>College <span className='font-bold text-black'>Event</span>  manager. Create college events in <span className='font-bold text-black'>Minutes</span>, discover amazing competitions, and build your college experience like never before. From <br />
                        <div className='font-mangodolly mt-1 inline-block p-2 px-8 rounded-full pt-4 text-sm md:text-3xl md:pt-4 md:mt-2 font-bold text-white bg-green-400'>Sports</div> to <br />
                        <div className='font-mangodolly mt-1 inline-block p-2 px-8 rounded-full pt-4 text-sm md:text-3xl md:pt-4 md:mt-2 font-bold text-white bg-blue-400'>Cultural fests</div> to <br />
                        <div className='font-mangodolly mt-1 inline-block p-2 px-8 rounded-full pt-4 text-sm md:text-3xl md:pt-4 md:mt-2 font-bold text-white bg-violet-400'>Hackthons</div> <br />- we've got you covered.</h1>
                </div>
            </div>
            <div className=' mt-3 md:mt-0 flex flex-col w-full md:flex-row items-center justify-center gap-5'>
                <button className='font-sans btn btn-lg w-full max-w-md md:max-w-xs border-none md:btn-xl hover:bg-blue-700 bg-blue-600 text-white '>
                    Create Your First Event
                </button>
                <button className='font-sans btn btn-lg w-full max-w-md md:max-w-xs border-none md:btn-xl hover:bg-pink-700 bg-pink-600 text-pink-50'>
                    Explore Events
                </button>
            </div>
        </div>
    );
};