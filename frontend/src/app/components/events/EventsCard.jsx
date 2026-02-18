
import { Link2, X, GuitarIcon as AvatarIcon } from 'lucide-react';
import { FilterEvents } from './FilterEvents';

const EventsCard = () => {
const eventsData = [
  {
    id: 1,
    title: 'Savitribai Phule Smriti',
    category: 'Cultural',
    themes: ['CLASSICAL DANCE', 'FOLK SINGING', 'POETRY'],
    participants: 1200,
    avatars: ['💃', '🎤', '🎻'],
    status: ['OFFLINE', 'OPEN'],
    startDate: '10/02/26',
    socialLinks: [
      { icon: 'link', label: 'Website' },
      { icon: 'instagram', label: 'Instagram' },
    ],
  },
  {
    id: 2,
    title: 'Vivekananda Yuva Mahotsav',
    category: 'Talent Hunt',
    themes: ['DEBATE', 'ELOCUTION', 'QUIZ'],
    participants: 800,
    avatars: ['🗣️', '💡', '📚'],
    status: ['OFFLINE', 'OPEN'],
    startDate: '21/02/26',
    socialLinks: [
      { icon: 'link', label: 'Website' },
      { icon: 'x', label: 'Twitter' },
    ],
  },
  {
    id: 3,
    title: 'Kalam Vision 2026',
    category: 'Guest Lecture',
    themes: ['INNOVATION', 'LEADERSHIP', 'ETHICS'],
    participants: 2000,
    avatars: ['👨‍🏫', '🎓', '🚀'],
    status: ['ONLINE', 'OPEN'],
    startDate: '15/03/26',
    socialLinks: [
      { icon: 'link', label: 'Website' },
      { icon: 'instagram', label: 'Instagram' },
    ],
  },
  {
    id: 4,
    title: 'Khelo India Kridotsav',
    category: 'Sports',
    themes: ['KABADDI', 'CRICKET', 'ATHLETICS'],
    participants: 1500,
    avatars: ['🏃‍♂️', '🏏', '🏆'],
    status: ['OFFLINE', 'REGISTRATION'],
    startDate: '05/04/26',
    socialLinks: [
      { icon: 'link', label: 'Website' },
      { icon: 'x', label: 'Twitter' },
    ],
  },
];

  return (
    <section className="w-full py-5 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FilterEvents/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventsData.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border-2 p-4 border-gray-300 hover:border-blue-500 transition-all"
            >
              {/* Header with title and social links */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{event.category}</p>
                </div>

                {/* Social Icons */}
                <div className="flex gap-2">
                  {event.socialLinks.map((link, idx) => (
                    <button
                      key={idx}
                      aria-label={link.label}
                      className="cursor-pointer p-2 border-2 border-blue-100 hover:border-blue-500 rounded-full bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      {link.icon === 'link' && (
                        <Link2 className="w-8 h-8 text-blue-500" />
                      )}
                      {link.icon === 'instagram' && (
                        <svg
                          className="w-8 h-8 text-blue-500" 
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                        </svg>
                      )}
                      {link.icon === 'x' && (
                        <X className="w-8 h-8 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Themes Section */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-semibold mb-2">
                  THEME
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 border border-gray-200 rounded-full text-xs font-medium text-gray-600"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Participants Section */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {event.avatars.map((avatar, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg border-2 border-white"
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <span className="text-lg font-semibold text-teal-600">
                  +{event.participants} participating
                </span>
              </div>

              {/* Status and Date Section */}
              <div className="flex flex-wrap gap-3 mb-6">
                {event.status.map((stat, idx) => (
                  <span
                    key={idx}
                    className="p-3 bg-gray-100 rounded-xl text-md font-semibold text-gray-700"
                  >
                    {stat}
                  </span>
                ))}
                <span className="p-3 bg-gray-100 rounded-xl text-md font-semibold text-gray-700">
                  STARTS {event.startDate}
                </span>
              </div>

              {/* Apply Button */}
              <button className="w-full btn btn-secondary text-xl text-white font-semibold py-2">
                Apply now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsCard;
