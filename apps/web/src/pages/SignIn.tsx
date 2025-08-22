import { motion } from 'motion/react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import LoginForm from '@/chunks/auth/LoginForm/LoginForm.tsx';
import AppLogo from '@/components/AppLogo/AppLogo.tsx';
import { Page } from '@/constants/pages.ts';

const SignIn: FC = () => {
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
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <LoginForm />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to={Page.SignUp}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign up for free
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
        className="hidden lg:block relative w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Professional Video Conferencing
              </h3>
              <p className="text-xl text-blue-100 leading-relaxed">
                Connect with your team seamlessly with crystal-clear video, 
                advanced collaboration tools, and enterprise-grade security.
              </p>
            </div>
            <div className="flex justify-center space-x-8 text-blue-100">
              <div className="text-center">
                <div className="text-2xl font-bold">4K</div>
                <div className="text-sm">Video Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </motion.figure>
    </main>
  );
};

export default SignIn;
