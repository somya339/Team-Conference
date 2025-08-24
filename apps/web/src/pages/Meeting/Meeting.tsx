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
import { Modal, ModalRef } from '../../components/Modal';
import { Chat } from '../../components/Chat';
import { apiClient } from '../../lib/api/axios';
import { authService } from '../../lib/auth/AuthService';
import useRxState from '../../lib/storage/useRxState';
import { formatMeetingCode } from '../../lib/utils';
import SubmissionPortal from '../../chunks/meeting/SubmissionPortal';
import { usePost } from '../../lib/api/useApiRequest';

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
  console.log('🎯 Meeting component mounted!');
  const { meetingId: code } = useParams<{ meetingId: string }>();
  console.log('📋 Meeting ID from params:', code);
  const [meeting, setMeeting] = useState<JoinMeetingRes['meeting']>();
  const [token, setToken] = useState<string>();
  const [joined, setJoined] = useState(false);
  const user = useRxState(authService.user$);
  const room = useMemo(() => new Room(), []);
  const navigate = useNavigate();
  const submitModalRef = useRef<ModalRef>(null);
  const { enqueueSnackbar } = useSnackbar();
  const submitApiRequest = usePost(`/meetings/${meeting?.id}/files`);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const joinMeeting = async () => {
      if (!code) return;
      
      try {
        // Join the meeting (returns meeting, token, roomUrl)
        console.log('🎫 Requesting LiveKit token for meeting:', code);
        const joinResponse = await apiClient.post('/meetings/join', { meetingId: code });
        console.log('🎫 Received token response:', joinResponse.data);
        
        // Decode and log token details for debugging
        try {
          const tokenPayload = JSON.parse(atob(joinResponse.data.token.split('.')[1]));
          console.log('🔍 Token payload:', tokenPayload);
          console.log('🏠 Room URL:', joinResponse.data.roomUrl);
          console.log('🏠 Room name from token:', tokenPayload.video?.room);
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
        
        const { token: lkToken, roomUrl, meeting: joinedMeeting } = joinResponse.data as { token: string; roomUrl?: string; meeting: Meeting };
        setToken(lkToken);
        setMeeting({ ...joinedMeeting, roomUrl: roomUrl || joinedMeeting.roomUrl });
      } catch (error) {
        console.error('Failed to join meeting:', error);
        navigate('/dashboard');
      }
    };
    
    joinMeeting();
  }, [code, navigate]);

  const leaveRoom = async () => {
    try {
      if (joined) {
        await apiClient.put('/meetings/leave', { meetingId: code });
      }
    } catch (error: any) {
      // Ignore 404: not a participant (e.g., join failed/cancelled)
      const status = error?.response?.status;
      if (status !== 404) {
        console.error('Failed to leave meeting:', error);
      }
    } finally {
      setJoined(false);
      navigate('/dashboard');
    }
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

  if (!meeting || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-300/30 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-300/20 border-b-blue-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Stellar Conferencing</h2>
            <p className="text-purple-200">
              {!meeting ? 'Loading meeting details...' : 'Connecting to meeting room...'}
            </p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex-col hidden basis-[30rem] space-y-6 bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-700 px-6 py-8 text-white shadow-2xl lg:flex">
        <AppLogo className="!text-3xl !text-white drop-shadow-lg" />
        <div className="flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{meeting.title}</h1>
          <p className="text-sm text-blue-100 font-medium bg-blue-500/20 px-3 py-1 rounded-full w-fit">{formatMeetingCode(code)}</p>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-6 shadow-lg">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold" className="size-5 text-yellow-300" />
            Participants
          </p>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-lg ring-2 ring-white/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-blue-200">Host</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => submitModalRef.current?.present()}
          className="mt-auto flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border border-green-400/30"
        >
          <Icon icon="solar:document-check-outline" className="size-5" />
          Submit document for grading
        </Button>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-gray-900 to-black">
          <LiveKitRoom
            connect={Boolean(token && room)}
            room={room}
            video={true}
            audio={true}
            token={token}
            serverUrl={meeting.roomUrl}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={leaveRoom}
            onError={(error) => {
              console.error('🚨 LiveKit connection error:', error);
              console.log('🔧 Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                serverUrl: meeting.roomUrl,
                roomName: room,
                tokenValid: !!token
              });
              setJoined(false);
              enqueueSnackbar('Failed to connect to meeting room. Please check your connection.', { variant: 'error' });
            }}
            onConnected={() => {
              console.log('✅ Successfully connected to LiveKit room');
              setJoined(true);
            }}
          >
            <div className="relative h-full">
              <MyVideoConference />
              <RoomAudioRenderer />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/10">
                  <ControlBar />
                </div>
              </div>
              {/* Chat Component inside LiveKitRoom */}
              <Chat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
            </div>
          </LiveKitRoom>
        </div>
        
        {/* Floating action button for mobile */}
        <button
          onClick={() => submitModalRef.current?.present()}
          className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-200 z-40"
        >
          <Icon icon="solar:document-check-outline" className="size-6 text-white" />
        </button>
      </div>
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
