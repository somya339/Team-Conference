import { useState, useCallback, useEffect, useRef } from 'react';
import { useGet } from '@/lib/api/useApiRequest';
import { Meeting } from '@/lib/common.types';
import { ModalRef } from '@/components/Modal';

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
  const [submissionsUrl, setSubmissionsUrl] = useState<string>('');
  const submissionsModalRef = useRef<ModalRef>();

  // Fetch user's meetings
  const {
    data: meetings = [],
    loading: loadingMeetings,
    error: meetingsError,
    refetch: refetchMeetings
  } = useGet<Meeting[]>('meetings');

  // Fetch submissions for a meeting
  const {
    data: meetingSubmissions = [],
    loading: loadingSubmissions,
    error: submissionsError,
    refetch: refetchSubmissions
  } = useGet<MeetingSubmission[]>(submissionsUrl, { enabled: !!submissionsUrl });

  const viewSubmissions = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setSubmissionsUrl(`submissions/meeting/${meeting.id}`);
  }, []);

  // Show modal when submissions are loaded
  useEffect(() => {
    if (meetingSubmissions.length > 0 || submissionsError) {
      submissionsModalRef.current?.present();
    }
  }, [meetingSubmissions, submissionsError]);

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
