import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../../components/Button/Button';
import { AppLogo } from '../../components/AppLogo/AppLogo';
import { CreateMeeting } from '../../chunks/dashboard/CreateMeeting/CreateMeeting';
import { JoinMeeting } from '../../chunks/dashboard/JoinMeeting/JoinMeeting';
import { useDashboard } from './useDashboard';
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

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.startTime || meeting.createdAt) > new Date()
  );
  const pastMeetings = meetings.filter(
    (meeting) => new Date(meeting.startTime || meeting.createdAt) <= new Date()
  );

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      await createMeeting(meetingData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      const result = await joinMeeting(meetingId);
      navigate(`/meeting/${result.meeting.id}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <AppLogo className="h-8 w-auto" />
              <h1 className="text-xl font-semibold text-gray-900">
                {config.appName}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/meeting-history')}
              >
                Meeting History
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex-1"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Create Meeting
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJoinModal(true)}
                className="flex-1"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Join Meeting
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Meetings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Meetings</h2>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'upcoming'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'past'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'upcoming' ? (
                <div>
                  {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming meetings</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new meeting.</p>
                      <div className="mt-6">
                        <Button onClick={() => setShowCreateModal(true)}>
                          Create Meeting
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                              {meeting.description && (
                                <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Created by {meeting.creator?.name}</span>
                                <span>•</span>
                                <span>{formatDate(meeting.createdAt)}</span>
                                {meeting.startTime && (
                                  <>
                                    <span>•</span>
                                    <span>Starts {formatDate(meeting.startTime)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleJoinMeeting(meeting.id.toString())}
                              >
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
                  {pastMeetings.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No past meetings</h3>
                      <p className="mt-1 text-sm text-gray-500">Your meeting history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                              {meeting.description && (
                                <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Created by {meeting.creator?.name}</span>
                                <span>•</span>
                                <span>{formatDate(meeting.createdAt)}</span>
                                {meeting.startTime && (
                                  <>
                                    <span>•</span>
                                    <span>Started {formatDate(meeting.startTime)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Completed
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
