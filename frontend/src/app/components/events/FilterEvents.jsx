import React, { useState } from 'react'

export const FilterEvents = () => {
    const [activeFilter, setActiveFilter] = useState('live');
    const filterButtons = [
    { id: 'past', label: 'Past Events', count: '5' },
    { id: 'live', label: 'Live Events', count: '7' },
    { id: 'upcoming', label: 'Upcoming Events', count: '9' },
  ];
  return (
    <div>
        <div className="flex gap-4 mb-5 justify-center flex-wrap">
          {filterButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setActiveFilter(button.id)}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
                activeFilter === button.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
              }`}
            >
              {button.label}
              {/* <span className="ml-2 font-bold">({button.count})</span> */}
            </button>
          ))}
        </div>
    </div>
  )
}
