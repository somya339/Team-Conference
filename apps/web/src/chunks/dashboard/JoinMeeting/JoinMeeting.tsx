import { FC } from 'react';

import Button from '@/components/Button/Button.tsx';
import FormError from '@/components/FormError/FormError.tsx';
import Textbox from '@/components/Textbox/Textbox.tsx';
import { Modal } from '@/components/Modal.tsx';

import useJoinMeeting from './useJoinMeeting.ts';

interface JoinMeetingProps {
  onClose: () => void;
  onSubmit: (meetingId: string) => void;
}

export const JoinMeeting: FC<JoinMeetingProps> = ({ onClose, onSubmit }) => {
  const h = useJoinMeeting();

  const handleFormSubmit = h.form.handleSubmit(async (data) => {
    try {
      await onSubmit(data.code);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="Join Meeting">
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
      <h1 className="font-semibold">Join a Meeting</h1>
      <div className="flex flex-col gap-4">
        {h.apiRequest.error && (
          <div className="text-red-500 text-sm mt-2">
            {h.apiRequest.error}
          </div>
        )} 
        <div className="space-y-1">
          <div className="text-sm">Enter the meeting code</div>
          <Textbox placeholder="xxx-xxx-xxx" {...h.form.register('code')} />
          <FormError message={h.form.formState.errors.code?.message} />
        </div>
      </div>
      {h.apiRequest?.error && (
        <div className="rounded-md border border-danger bg-danger/20 p-2 text-sm text-danger">
          <h3 className="font-semibold">Error</h3>
          <div className="mt-2">
            {h.apiRequest.error}
          </div>
        </div>
      )}
      <Button type="submit" disabled={h.apiRequest?.loading}>
        Join meeting
      </Button>
      </form>
    </Modal>
  );
};
