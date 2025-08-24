import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ModalRef } from '@/components/Modal.tsx';
import { Page } from '@/constants/pages.ts';
import { authService } from '@/lib/auth/AuthService.ts';
import useRxState from '@/lib/storage/useRxState.ts';
import { apiClient } from '@/lib/api/axios.ts';

const useDashboard = () => {
  const navigate = useNavigate();
  const user = useRxState(authService.user$);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createModalRef = useRef<ModalRef>();
  const joinModalRef = useRef<ModalRef>();

  // Fetch meetings when user is available
  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/meetings');
      setMeetings(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (meetingData: any) => {
    try {
      setError(null);
      const response = await apiClient.post('/meetings', meetingData);
      await fetchMeetings(); // Refresh meetings list
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const joinMeeting = async (meetingCode: string) => {
    try {
      setError(null);
      const response = await apiClient.get(`/meetings/${meetingCode}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to join meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await authService.logout();
    navigate(Page.SignIn);
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const actions = [
    {
      icon: 'material-symbols:video-call',
      title: 'Create meeting',
      clickHandler: () => createModalRef.current.present(),
    },
    {
      icon: 'ic:baseline-group', 
      title: 'Join meeting',
      clickHandler: () => joinModalRef.current.present(),
    },
    { 
      icon: 'mdi:calendar-edit',
      title: 'Schedule meeting'
    },
    {
      icon: 'mdi:history',
      title: 'Meeting history',
      clickHandler: () => navigate(Page.MeetingHistory)
    },
  ];

  return { 
    user, 
    meetings, 
    isLoading, 
    error, 
    createMeeting, 
    joinMeeting, 
    logout, 
    actions, 
    itemVariants, 
    createModalRef, 
    joinModalRef 
  };
}

export default useDashboard;

