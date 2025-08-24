import '@livekit/components-styles';

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { AppLogo } from '../../components/AppLogo/AppLogo';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal';
import { apiClient } from '../../lib/api/axios';
import { authService } from '../../lib/auth/AuthService';
import useRxState from '../../lib/storage/useRxState';
import { formatMeetingCode } from '../../lib/utils';

interface Meeting {
  id: string;
  title: string;
  code: string;
  roomName: string;
  roomUrl: string;
}

interface JoinMeetingRes {
  meeting: Meeting;
  token: string;
}

function Meeting() {
  const { code } = useParams<{ code: string }>();
  const [meeting, setMeeting] = useState<JoinMeetingRes['meeting']>();
  const [token, setToken] = useState<string>();
  const user = useRxState(authService.user$);
  const room = useMemo(() => new Room(), []);
  const navigate = useNavigate();
  const submitModalRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const joinMeeting = async () => {
      if (!code) return;
      
      try {
        // First fetch meeting details
        const meetingResponse = await apiClient.get(`/meetings/${code}`);
        setMeeting(meetingResponse.data);
        
        // Then join the meeting to get LiveKit token
        const joinResponse = await apiClient.post('/meetings/join', { meetingId: code });
        setToken(joinResponse.data.token);
      } catch (error) {
        console.error('Failed to join meeting:', error);
        navigate('/dashboard');
      }
    };
    
    joinMeeting();
  }, [code, navigate]);

  const leaveRoom = async () => {
    try {
      await apiClient.put('/meetings/leave', { code });
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
    navigate(Page.Dashboard);
  };

  const handleSubmit = async (files: File[]) => {
    if (!files.length || !meeting?.id) return;

    const formData = new FormData();
    const file = files[0];
    formData.append('file', file, file.name);
    
    try {
      try {
        await apiClient.post(`/meetings/${meeting.id}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        enqueueSnackbar('Files uploaded successfully', { variant: 'success' });
        submitModalRef.current?.dismiss();
      } catch (error) {
        console.error('Failed to upload files:', error);
        enqueueSnackbar('Failed to upload files', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Failed to submit document', {
        variant: 'error',
      });
    }
  };

  if (!meeting) return null;

  return (
    <div className="flex">
      <div className="flex-col hidden basis-[30rem] space-y-4 bg-primary px-4 py-8 text-text lg:flex">
        <AppLogo className="!text-2xl !text-text" />
        <div className="flex flex-col gap-2 rounded-xl bg-light/40 px-2 py-4">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <h2 className="font-semibold">{formatMeetingCode(meeting.code)}</h2>
          <p>{meeting.description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-light/40 px-2 py-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURI(user?.username)}&background=292D32&color=fff&size=128`}
            alt="Profile image"
            className="size-10 rounded-full"
          />
          <div>
            <div className="font-bold">{user?.username}</div>
            <div className="text-sm text-dark">{user?.email}</div>
          </div>
        </div>
        <div className="flex-1" />
        <Button variant="subtle" className="w-full" onClick={() => submitModalRef.current?.present()}>
          <Icon icon="solar:document-check-outline" className="size-5" />
          Submit document for grading
        </Button>
      </div>
      <LiveKitRoom
        connect={Boolean(token && room)}
        room={room}
        video={true}
        audio={true}
        token={token}
        serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onDisconnected={leaveRoom}
        onError={leaveRoom}
      >
        <MyVideoConference />
        <RoomAudioRenderer />
        <ControlBar />
      </LiveKitRoom>
      <Modal ref={submitModalRef}>
        <SubmissionPortal 
          onSubmit={handleSubmit} 
          onCancel={() => submitModalRef.current?.dismiss()} 
          isSubmitting={submitApiRequest.loading}
        />
      </Modal>
    </div>
  );
}

export default Meeting;

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
