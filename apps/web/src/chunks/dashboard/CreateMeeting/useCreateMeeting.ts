import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createMeetingSchema } from './CreateMeeting.config.ts';
import { CreateMeetingRes } from './CreateMeeting.types.ts';

export default function useCreateMeeting() {
  const form = useForm({ resolver: yupResolver(createMeetingSchema) });
  const [createdMeeting, setCreatedMeeting] = useState<CreateMeetingRes>();
  const meetingLink = window.location.origin + '/meeting/' + createdMeeting?.code;

  return { form, createdMeeting, setCreatedMeeting, meetingLink };
}
