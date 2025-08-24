import { useState, useCallback, useEffect } from 'react';
import { useGet } from '@/lib/api/useApiRequest';
import { Meeting } from '@/lib/common.types';
import { ModalRef } from '@/components/Modal';
import { useRef } from 'react';

export type MeetingSubmission = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
};

export default function useMeetingHistory() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const submissionsModalRef = useRef<ModalRef>();

  // Fetch user's meetings
  const {
    data: meetings = [],
    loading: loadingMeetings,
    error: meetingsError,
    refetch: refetchMeetings
  } = useGet<Meeting[]>('meetings');

  // Fetch submissions for a meeting
  const submissionsUrl = selectedMeeting ? `submissions/meeting/${selectedMeeting.id}` : '';
  const {
    data: meetingSubmissions = [],
    loading: loadingSubmissions,
    error: submissionsError,
    refetch: refetchSubmissions
  } = useGet<MeetingSubmission[]>(submissionsUrl);

  const viewSubmissions = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    // Show submissions modal will be triggered by the useEffect below
  }, []);

  // Update submissions when selected meeting changes and show modal
  useEffect(() => {
    if (selectedMeeting) {
      refetchSubmissions().then(() => {
        submissionsModalRef.current?.present();
      });
    }
  }, [selectedMeeting, refetchSubmissions]);

  return {
    meetings,
    loading: loadingMeetings,
    error: meetingsError,
    fetchMeetings: refetchMeetings,
    submissions: meetingSubmissions,
    submissionsLoading: loadingSubmissions,
    submissionsError,
    viewSubmissions,
    selectedMeeting,
    submissionsModalRef,
  };
}
