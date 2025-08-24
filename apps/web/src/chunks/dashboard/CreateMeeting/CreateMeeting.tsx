import { Icon } from '@iconify/react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import Button from '@/components/Button/Button.tsx';
import FormError from '@/components/FormError/FormError.tsx';
import Textbox from '@/components/Textbox/Textbox.tsx';
import { Modal } from '@/components/Modal.tsx';
import { copyToClipboard, formatMeetingCode } from '@/lib/utils.ts';

import { createMeetingFields } from './CreateMeeting.config.ts';
import useCreateMeeting from './useCreateMeeting.ts';

interface CreateMeetingProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

export const CreateMeeting: FC<CreateMeetingProps> = ({ onClose , onSubmit }) => {
  const h = useCreateMeeting();

  const handleFormSubmit = h.form.handleSubmit(async (data) => {
    try {
      // Normalize datetime-local values to ISO (UTC) to avoid timezone drift server-side
      if (data.startTime) {
        const d = new Date(data.startTime);
        if (!isNaN(d.getTime())) data.startTime = d.toISOString();
      }
      if (data.endTime) {
        const d = new Date(data.endTime);
        if (!isNaN(d.getTime())) data.endTime = d.toISOString();
      }
      const result = await onSubmit(data);
      if (result) {
        h.setCreatedMeeting(result);
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  });

  if (h.createdMeeting) {
    const formattedCode = formatMeetingCode(h.createdMeeting.code);
    return (
      <Modal isOpen={true} onClose={onClose} title="Meeting Created">
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-semibold text-dark">Meeting created</h1>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="subtle" onClick={() => copyToClipboard(formattedCode)}>
              {formattedCode}
              <Icon icon="solar:copy-bold" className="ml-2 size-6" />
            </Button>
            <Button onClick={() => copyToClipboard(h.meetingLink)}>
              <Icon icon="solar:copy-bold" className="size-6" /> Copy link
            </Button>
          </div>
          <Button asChild>
            <Link to={h.meetingLink}>Join the meeting</Link>
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Meeting">
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
      <h1 className="font-semibold">Create a Meeting</h1>
      <div className="flex flex-col gap-4">
        {createMeetingFields.map(({ fieldName, component, ...props }) => {
          const Comp = component ?? Textbox;
          return (
            <div key={fieldName} className="space-y-1">
              <div className="text-sm">{props.placeholder}</div>
              <Comp {...props} {...h.form.register(fieldName)} />
              <FormError message={h.form.formState.errors[fieldName]?.message} />
            </div>
          );
        })}
      </div>
      <Button type="submit">
        Create meeting
      </Button>
      </form>
    </Modal>
  );
};
