import * as Yup from 'yup';

import Textarea from '@/components/Textarea/Textarea.tsx';

import { CreateMeetingField } from './CreateMeeting.types.ts';

export const createMeetingSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: Yup.string().optional().max(500, 'Description must not exceed 500 characters'),
  startTime: Yup.string().optional(),
  endTime: Yup.string().optional(),
  maxParticipants: Yup.number().optional().min(1, 'Must be at least 1').max(100, 'Cannot exceed 100'),
});

export const createMeetingFields: CreateMeetingField[] = [
  {
    fieldName: 'title',
    placeholder: 'Meeting Headline',
  },
  {
    fieldName: 'description',
    placeholder: 'Meeting Description',
    component: Textarea,
  },
  {
    fieldName: 'startTime',
    placeholder: 'Start Time',
    type: 'datetime-local',
  },
  {
    fieldName: 'endTime',
    placeholder: 'End Time',
    type: 'datetime-local',
  },
  {
    fieldName: 'maxParticipants',
    placeholder: 'Max Participants (default: 50)',
    type: 'number',
  },
];
