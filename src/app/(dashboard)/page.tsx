'use client';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect('/login');
    }
  }, [user, isUserLoading]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <DashboardClient />;
}
