export const Page = {
  SignIn: '/signin',
  SignUp: '/signup',
  Dashboard: '/dashboard',
  Meeting: (code: string) => `/meeting/${code}`,
  MeetingHistory: '/meeting-history',
};
