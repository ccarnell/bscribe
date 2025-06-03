import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminGenerateInterface from './AdminGenerateInterface';
import { Console } from 'console';

// Server component for auth check
export default async function AdminGeneratePage() {
  const supabase = createClient();

// Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('Auth Debug:', {
    user: user?.is_anonymous,
    userEmail: user?.email,
    error: error

  });

  if (!user) {
    console.log('No user found, redirecting to signin');
    redirect('/signin');
  }
  
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Profile Debug:', {
    profile: profile,
    userId: user.id,
    role: profile?.role
  });
    
  if (profile?.role !== 'admin') {
    console.log('Access denied - not admin');
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You don't have admin privileges. If you should have access, check your profile role in the database.</p>
          <p className="mt-2 text-sm">User ID: {user.id}</p>
          <p className="text-sm">Email: {user.email}</p>
        </div>
      </div>
    );
  }
  
  // User is authenticated and has admin role
  return <AdminGenerateInterface />;
}