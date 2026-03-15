import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, Award,
  CheckCircle, Clock, XCircle, Loader2,
  FileText, ArrowRight
} from 'lucide-react';
import { getMyApplications, cancelApplication } from '../services/event.services';
import { useUserStore } from '../store/user.store';
import toast from 'react-hot-toast';

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status, attended }) => {
  if (attended) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
        <CheckCircle className="w-3 h-3" />
        Attended
      </span>
    );
  }
  const configs = {
    confirmed: { label: 'Registered', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = configs[status] || configs.confirmed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
};

// ─── Application Card ─────────────────────────────────────────────────────────
const ApplicationCard = ({ registration, onCancel, cancelling }) => {
  const navigate = useNavigate();
  const { event, status, registeredAt, attended, _id } = registration;
  const isCancellable = status !== 'cancelled' && !attended;

  const formatDate = (d) => {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-md border-2 border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${status === 'cancelled' ? 'opacity-60 grayscale' : ''}`}>
      {/* Banner */}
      <div className="relative h-36 w-full overflow-hidden">
        {event?.bannerImage ? (
          <img src={event.bannerImage} alt={event.title} className="hover:scale-105 transition-all duration-300 w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
            <p className="text-white font-black text-xl text-center drop-shadow">{event?.title}</p>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} attended={attended} />
        </div>
        {/* Category */}
        {event?.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white backdrop-blur-sm text-xs rounded-full text-gray-500 font-bold uppercase tracking-wider">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-black text-gray-800 text-lg leading-tight line-clamp-1">
            {event?.title || 'Event Deleted'}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Applied on {formatDate(registeredAt)}
          </p>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            {formatDate(event?.eventStartDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            {event?.isOnline ? 'Online' : (event?.venue || 'TBD')}
          </span>
          <span className="flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-500" />
            {event?.registrationFee === 0 ? 'FREE' : `₹${event?.registrationFee}`}
          </span>
          {event?.hasCertificate && (
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-500" />
              Certificate
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => navigate(`/events/${event?.slug || event?._id}`)}
            className="btn btn-md text-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            View Event
          </button>

          {isCancellable && (
            <button
              onClick={() => onCancel(_id)}
              disabled={cancelling === _id}
              className="btn btn-md text-lg bg-red-500 text-white hover:bg-red-600"            >
              {cancelling === _id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Cancel'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const Applications = () => {
  const { user, loading: authLoading } = useUserStore();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null); // id of registration being cancelled
  const [activeFilter, setActiveFilter] = useState('all');
  const [isChecking, setIsChecking] = useState(true);

  const { getProfile } = useUserStore();

  useEffect(() => {
    const resolveAuth = async () => {
      if (!user) {
        await getProfile();
      }
      setIsChecking(false);
    };
    resolveAuth();
  }, [user, getProfile]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getMyApplications();
      setRegistrations(data.registrations || []);
    } catch (error) {
      toast.error('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isChecking) return;

    if (!user) {
      navigate('/signin');
      return;
    }
    fetchApplications();
  }, [user, isChecking]);

  const handleCancel = async (registrationId) => {
    setCancelling(registrationId);
    try {
      await cancelApplication(registrationId);
      toast.success('Registration cancelled');
      // Update locally
      setRegistrations(prev =>
        prev.map(r => r._id === registrationId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to cancel';
      toast.error(msg);
    } finally {
      setCancelling(null);
    }
  };

  const filtered = registrations;

  // Stats
  const stats = {
    total: registrations.length,
    attended: registrations.filter(r => r.attended).length,
  };


  if ((loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 h-screen w-full">
        <div className="loading loading-bars loading-xl text-purple-600"></div>
        <p className="mt-4 text-gray-500 text-2xl font-mangodolly font-medium animate-pulse">Loading your applications...</p>
      </div>
    );
  }




  if (!loading && !isChecking && filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center w-full h-screen">
        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-purple-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2 font-mangodolly">
          No applications yet
        </h3>
        <p className="text-gray-500 mb-8 max-w-sm text-xl">
          Browse events and click Register Now to apply for events you are interested in.
        </p>
        {true && (
          <button
            onClick={() => navigate('/events')}
            className="btn btn-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            Browse Events
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="min-h-screen pt-10  w-full">
      {/* Page Header */}
      <div className=" text-black">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-3xl font-black font-mangodolly">My Applications</h1>
            <p className="text-gray-500 text-2xl font-medium mb-8">Track all your event registrations in one place</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-white backdrop-blur-sm rounded-md p-4 text-center">
              <p className="text-2xl font-black">{stats.total}</p>
              <p className="text-lg text-gray-500 font-bold uppercase tracking-wider">Register</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-md p-4 text-center">
              <p className="text-2xl font-black text-green-300">{stats.attended}</p>
              <p className="text-lg text-gray-500 font-bold uppercase tracking-wider">Attended</p>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto">
        {/* Application Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(registration => (
              <ApplicationCard
                key={registration._id}
                registration={registration}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
