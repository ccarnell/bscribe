import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AdminGenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Temporarily disabled fro testing
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // For now, just check if user exists - you can add role checking later
  if (!user) {
    redirect('/signin');
  }
*/
  return (
    <div className="bg-black text-white min-h-screen">
      {children}
    </div>
  );
}