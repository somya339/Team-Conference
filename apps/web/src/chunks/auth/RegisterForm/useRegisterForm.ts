import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/constants/pages.ts';
import { apiClient } from '@/lib/api/axios.ts';
import { usePost } from '@/lib/api/useApiRequest.ts';
import { authService } from '@/lib/auth/AuthService.ts';

import { registerSchema } from './RegisterForm.config.ts';
import { RegisterRes } from './RegisterForm.types.ts';

export default function useRegisterForm() {
  const form = useForm({ resolver: yupResolver(registerSchema) });
  const { execute: registerUser, loading, error } = usePost<RegisterRes>('auth/register');
  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('📝 useRegisterForm: Form submitted', { 
      email: data.email, 
      name: data.name, 
      timestamp: new Date().toISOString() 
    });
    
    try {
      const res = await registerUser(data);
      if (res) {
        console.log('✅ useRegisterForm: Registration successful, storing data and navigating', { 
          userId: res.user.id, 
          email: res.user.email 
        });
        
        await authService.register(data);
        navigate(Page.Dashboard);
      }
    } catch (error) {
      console.error('❌ useRegisterForm: Registration failed', error);
    }
  });

  return { form, handleSubmit, loading, error };
}
