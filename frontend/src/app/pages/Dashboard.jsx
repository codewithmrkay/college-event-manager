import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useEventStore } from '../store/event.store';
import {
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  LayoutDashboard,
  AlertCircle,
  Heart,
  Star,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const { user, getProfile } = useUserStore();
  const { events, fetchPublicEvents, loading } = useEventStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If user already exists in store, no need to fetch again
      if (!user) {
        await getProfile();
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [getProfile, user]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      fetchPublicEvents(); // Fetch public events to populate dashboard
    }
  }, [user, fetchPublicEvents]);

  const stats = useMemo(() => {
    const upcoming = events.filter(e => e.registrationStart === null).length;
    const live = events.filter(e => e.registrationStart !== null && (!e.eventEndDate || new Date(e.eventEndDate) > new Date())).length;
    const interested = events.filter(e => e.isInterested).length;

    return [
      { label: 'Upcoming Events', value: upcoming, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Live Events', value: live, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { label: 'Interested', value: interested, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
    ];
  }, [events]);

  const interestedEvents = useMemo(() => {
    return events.filter(e => e.isInterested).slice(0, 3);
  }, [events]);

  const discoverEvents = useMemo(() => {
    return events.filter(e => !e.isInterested).slice(0, 4);
  }, [events]);

  if (isChecking || (loading && events.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full h-screen">
        <div className="loading loading-bars loading-xl text-purple-600"></div>
        <p className="mt-4 text-gray-500 text-2xl font-mangodolly font-medium animate-pulse">Loading your Dashboard...</p>
      </div>
    );
  }

  if (user && (user.role === "admin" || user.role === "super-admin")) {
    return <Navigate to="/admin-dashboard" />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-mangodolly">
            Hello, <span className='text-purple-600'> {user?.fullName?.split(' ')[0] || 'Student'}!</span>
          </h1>
          <p className="text-gray-500 text-xl font-medium mt-1">
            Ready to discover amazing events on campus?
          </p>
        </div>
        {!user?.isOnboarded && (
          <Link
            to="/onboarding"
            className="btn btn-primary btn-lg bg-pink-500 hover:bg-pink-600 border-none rounded-md px-6 shadow-lg text-white"
          >
            <Star className="w-5 h-5 mr-2" /> Complete Profile
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-4xl font-mangodolly font-black text-gray-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-md`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Interested Events */}
          {interestedEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-8 h-8 animate-pulse text-pink-500 fill-pink-500" /> Your Interested Events
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {interestedEvents.map((event) => (
                  <Link key={event._id} to={`/events/${event.slug}`} className="bg-white border p-4 border-gray-100 rounded-md shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-24 w-full sm:w-40 aspect-video rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {event.bannerImage ? (
                        <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-400">
                          <Calendar className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1 block">{event.category}</span>
                          <h4 className="font-bold text-xl text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                            {event.title}
                          </h4>
                        </div>
                        <div className="hidden sm:flex p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-4 h-4" />
                          {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'TBA'}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1.5 truncate">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Discover Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-sans font-bold text-gray-800 flex items-center">
                Discover Events
              </h2>
              <Link to="/events" className="text-xl font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {discoverEvents.length > 0 ? (
                discoverEvents.map((event) => (
                  <Link key={event._id} to={`/events/${event.slug}`} className="bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
                    <div className="h-40 w-full bg-gray-100 overflow-hidden relative flex-shrink-0">
                      {event.bannerImage ? (
                        <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-300">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm font-medium text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'TBA'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 p-12 text-center bg-white border border-gray-100 rounded-md">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No events found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    There are no new events to discover right now. Check back later!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile status & Tips */}
        <div className="space-y-6">
          {!user?.isOnboarded ? (
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-md text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-2xl mb-2 relative z-10">Complete Your Profile!</h3>
              <p className="text-pink-100 text-md leading-relaxed mb-6 relative z-10">
                You need to complete your profile to register for events and show interest.
              </p>
              <Link to="/onboarding" className="relative z-10 btn w-full bg-white hover:bg-pink-50 text-pink-600 border-none font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                Complete Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : !user?.isVerified ? (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-md text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-2xl mb-2 relative z-10 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" /> Profile Pending
              </h3>
              <p className="text-amber-100 text-md leading-relaxed relative z-10">
                Your profile is currently pending verification from admins. You'll be able to register for events once approved.
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-md text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-2xl mb-2 relative z-10 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-200" /> Account Verified
              </h3>
              <p className="text-blue-100 text-md leading-relaxed relative z-10">
                You're all set! You can now register for live events and show interest in upcoming ones.
              </p>
              <div className="mt-6 pt-6 border-t border-blue-500/30 flex items-center gap-3 relative z-10">
                <div className="h-12 w-12 rounded-full bg-white/20 p-1 flex-shrink-0">
                  <img src={user.profilePic || 'https://ui-avatars.com/api/?name=' + user.fullName?.split(' ').join('+') + '&background=random'} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-bold truncate">
                    {user.class} • {user.department}
                  </p>
                </div>
              </div>

            </div>
          )}

          <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
              <LayoutDashboard className="w-5 h-5 text-blue-500" /> Quick Links
            </h3>
            <div className="space-y-3">
              <Link to="/events" className="flex items-center justify-between btn btn-lg">
                <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Browse All Events</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between btn btn-lg btn-secondary text-white">
                <span className="font-bold  ">My Profile</span>
                <ChevronRight className="w-4 h-4  " />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
