import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminGenerateInterface from './AdminGenerateInterface';

export default async function AdminGeneratePage() {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) {
    redirect('/signin');
  }
  
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
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
  
  // User is authenticated and has admin role - show the interface
  return <AdminGenerateInterface />;
}