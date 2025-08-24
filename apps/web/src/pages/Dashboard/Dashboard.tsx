import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../../components/Button/Button';
import { AppLogo } from '../../components/AppLogo/AppLogo';
import { CreateMeeting } from '../../chunks/dashboard/CreateMeeting/CreateMeeting';
import { JoinMeeting } from '../../chunks/dashboard/JoinMeeting/JoinMeeting';
import  useDashboard  from './useDashboard';
import { config } from '../../lib/config';
import { formatDate } from '../../lib/utils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    meetings,
    isLoading,
    error,
    createMeeting,
    joinMeeting,
    logout,
  } = useDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Remove this useEffect - authentication is handled by ProtectedRoute in App.tsx
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user]);

  const upcomingMeetings = meetings?.filter((meeting) => {
    // If meeting has a startTime, use it to determine if it's upcoming
    if (meeting.startTime) {
      return new Date(meeting.startTime) > new Date();
    }
    // If no startTime, consider it upcoming (newly created meetings without schedule)
    return true;
  });
  const pastMeetings = meetings?.filter((meeting) => {
    // Only show in past if it has a startTime and it's in the past
    if (meeting.startTime) {
      return new Date(meeting.startTime) <= new Date();
    }
    // If no startTime, don't show in past
    return false;
  });

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const result = await createMeeting(meetingData);
      // Don't close modal here - let CreateMeeting component handle success state
      return result;
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  };

  const handleJoinMeeting = async (meetingCode: string) => {
    try {
      await joinMeeting(meetingCode);
      navigate(`/meeting/${meetingCode}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loading your dashboard</h3>
            <p className="text-gray-600">Please wait while we prepare everything...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <AppLogo className="h-8 w-auto text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {config.appName}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{user?.name?.charAt(0)}</span>
                </div>
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/meeting-history')}
                className="hidden sm:flex"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h2>
                <p className="text-blue-100">
                  Ready to connect with your team? Create a new meeting or join an existing one.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                leftIcon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                <div className="text-left">
                  <div className="font-semibold">Create Meeting</div>
                  <div className="text-sm opacity-90">Start a new video call</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJoinModal(true)}
                className="h-16 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                leftIcon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                <div className="text-left">
                  <div className="font-semibold">Join Meeting</div>
                  <div className="text-sm text-gray-600">Enter meeting code</div>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Meetings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Meetings</h3>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'upcoming'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Upcoming ({upcomingMeetings?.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'past'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Past ({pastMeetings?.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'upcoming' ? (
                <div>
                  {upcomingMeetings?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming meetings</h3>
                      <p className="text-gray-600 mb-6">Get started by creating your first meeting.</p>
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Create Meeting
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingMeetings?.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200 bg-gradient-to-r from-white to-blue-50/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <h4 className="text-lg font-semibold text-gray-900">{meeting?.title}</h4>
                              </div>
                              {meeting?.description && (
                                <p className="text-gray-600 mb-3">{meeting?.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {meeting.creator?.name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDate(meeting.createdAt)}
                                </span>
                                {meeting.startTime && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Starts {formatDate(meeting.startTime)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-6">
                              <Button
                                size="sm"
                                onClick={() => handleJoinMeeting(meeting.code)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Join
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {pastMeetings?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No past meetings</h3>
                      <p className="text-gray-600">Your meeting history will appear here once you have completed meetings.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastMeetings?.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-xl p-6 bg-gray-50/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <h4 className="text-lg font-semibold text-gray-900">{meeting?.title}</h4>
                              </div>
                              {meeting?.description && (
                                <p className="text-gray-600 mb-3">{meeting?.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {meeting.creator?.name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDate(meeting.createdAt)}
                                </span>
                                {meeting.startTime && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Started {formatDate(meeting.startTime)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="ml-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeeting
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMeeting}
        />
      )}

      {showJoinModal && (
        <JoinMeeting
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinMeeting}
        />
      )}
    </div>
  );
};
