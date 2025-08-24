import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/constants/pages.ts';
import { authService } from '@/lib/auth/AuthService.ts';

import { loginSchema } from './LoginForm.config.ts';

export default function useLoginForm() {
  const form = useForm({ resolver: yupResolver(loginSchema) });
  // Remove unused API hook - using authService directly
  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('🔐 useLoginForm: Form submitted', { 
      email: data.email, 
      timestamp: new Date().toISOString() 
    });
    
    try {
      // Use authService.login directly instead of duplicate API call
      const authResponse = await authService.login(data as { email: string; password: string });
      if (authResponse) {
        console.log('✅ useLoginForm: Login successful, navigating to dashboard', { 
          userId: authResponse.user.id, 
          email: authResponse.user.email 
        });
        
        navigate(Page.Dashboard);
      }
    } catch (error) {
      console.error('❌ useLoginForm: Login failed', error);
    }
  });

  return { form, handleSubmit, apiRequest: { loading: false, errors: [] } };
}
