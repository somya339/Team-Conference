import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import joinMeetingSchema from './JoinMeeting.config.ts';

export default function useJoinMeeting() {
  const form = useForm({ resolver: yupResolver(joinMeetingSchema) });
  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('🎯 JoinMeeting form submitted with code:', data.code);
    const code = String(data.code).trim();
    const targetUrl = '/meeting/' + code;
    console.log('🚀 JoinMeeting navigating to:', targetUrl);
    navigate(targetUrl);
  });

  // Keep return shape stable if UI expects apiRequest; it's unused here
  const apiRequest: Partial<{ loading: boolean; errors: string[] }> = {};
  return { form, handleSubmit, apiRequest } as unknown as { form: typeof form; handleSubmit: typeof handleSubmit; apiRequest: any };
}
