import { Link2, X, GuitarIcon as AvatarIcon, Heart } from 'lucide-react';
import { FilterEvents } from './FilterEvents';
import { useState, useEffect } from 'react';
import { getPublicEvents, showInterest } from '../../services/event.services';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';

const EventsCard = () => {
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const { user, getProfile } = useAuthStore();

  useEffect(() => {
    // Refresh profile to ensure latest isOnboarded status
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getPublicEvents({ status: activeFilter });
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeFilter]);

  const displayEvents = events.map(backendEvent => ({
    id: backendEvent._id,
    slug: backendEvent.slug,
    title: backendEvent.title || 'Untitled Event',
    category: backendEvent.category || 'General',
    themes: [backendEvent.category, backendEvent.eventType].filter(Boolean),
    participants: backendEvent.interestCount || 0,
    isInterested: backendEvent.isInterested || false,
    avatars: ['🎓', '🚀', '⭐'],
    status: [
      backendEvent.isOnline ? 'ONLINE' : 'OFFLINE',
      backendEvent.participationType ? backendEvent.participationType.toUpperCase() : 'SOLO'
    ],
    startDate: backendEvent.eventStartDate ? new Date(backendEvent.eventStartDate).toLocaleDateString() : 'TBD',
    socialLinks: [
      { icon: 'link', label: 'Website' }
    ]
  }));

  const handleToggleInterest = async (eventId) => {
    if (!user) {
      toast.error('Please login to show interest in events.');
      return;
    }

    if (!user.isOnboarded) {
      toast.error('Please complete your profile (onboarding) before showing interest.');
      return;
    }

    // Optimistic update
    setEvents(prevEvents => prevEvents.map(event => {
      if (event._id === eventId) {
        const isCurrentlyInterested = event.isInterested;
        return {
          ...event,
          isInterested: !isCurrentlyInterested,
          interestCount: isCurrentlyInterested ? (event.interestCount - 1) : (event.interestCount + 1)
        };
      }
      return event;
    }));

    try {
      const result = await showInterest(eventId);
      // Synchronize with server response just in case
      setEvents(prevEvents => prevEvents.map(event => {
        if (event._id === eventId) {
          return {
            ...event,
            isInterested: result.isInterested,
            interestCount: result.interestCount
          };
        }
        return event;
      }));
    } catch (err) {
      // Revert optimistic update on error
      console.error("Failed to toggle interest:", err);
      // Re-fetching might be safer than manual revert for complex logic
      const data = await getPublicEvents({ status: activeFilter });
      setEvents(data.events || []);

      if (err?.response?.status === 403) {
        toast.error(err.response.data.message || 'Please complete your profile first.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update interest. Please make sure you are logged in.');
      }
    }
  };

  return (
    <section className="w-full py-5">
      <div className="max-w-6xl mx-auto">
        <FilterEvents activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        {loading ? (
          <div className="flex justify-center items-center h-screen "><span className="text-gray-500 font-mangodolly text-2xl">Loading events...</span></div>
        ) : displayEvents.length === 0 ? (
          <div className="flex justify-center items-center h-screen "><span className="text-gray-500 font-mangodolly text-2xl">No {activeFilter} events found.</span></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank', 'noopener,noreferrer')}
                className="bg-white h-fit rounded-lg border-2 p-4 border-gray-300 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
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
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
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
                    {event.participants} {activeFilter === 'upcoming' ? 'interested' : 'participating'}
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

                {/* Apply / Like Button */}
                {activeFilter === 'upcoming' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleInterest(event.id);
                    }}
                    className={`w-full btn border-2 text-xl font-semibold py-2 flex items-center justify-center gap-2 rounded-xl transition-colors ${event.isInterested
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-red-500 text-red-500 hover:bg-red-50'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${event.isInterested ? 'fill-current' : ''}`} />
                    {event.isInterested ? 'Interested' : 'Show Interest'}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/events/${event.slug || event.id}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full btn btn-secondary text-xl text-white py-2 font-semibold"
                  >
                    View Details & Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsCard;
