import { motion } from 'motion/react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import RegisterForm from '@/chunks/auth/RegisterForm/RegisterForm.tsx';
import {AppLogo} from '@/components/AppLogo/AppLogo.tsx';
import { Page } from '@/constants/pages.ts';

const SignUp: FC = () => {
  return (
    <main className="min-h-screen flex">
      {/* Left Section - Form */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-blue-50"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-2">
            <AppLogo className="mx-auto h-12 w-auto text-blue-600" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join thousands of professionals using Stellar
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <RegisterForm />
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to={Page.SignIn}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.section>

      {/* Right Section - Banner */}
      <motion.figure
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="hidden lg:block relative w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Join the Future of Collaboration
              </h3>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Experience seamless team collaboration with advanced features, 
                real-time communication, and powerful productivity tools.
              </p>
            </div>
            <div className="flex justify-center space-x-8 text-indigo-100">
              <div className="text-center">
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm">Unlimited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">⚡</div>
                <div className="text-sm">Fast Setup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">🔒</div>
                <div className="text-sm">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </motion.figure>
    </main>
  );
};

export default SignUp;
