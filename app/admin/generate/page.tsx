import { createClient } from '@/utils/supabase/server';

export default async function AdminGeneratePage() {
  const supabase = createClient();
  
  // Get auth data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Get profile data (only if user exists)
  let userProfile = null;
  let profileError = null;
  
  if (user) {
    const { data: profileData, error: profError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userProfile = profileData;
    profileError = profError;
  }
  
  // DEBUG DISPLAY - Show everything on page
  return (
    <div className="container mx-auto p-8 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Auth Debug Info</h1>
      
      <div className="bg-gray-800 p-6 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-400">User Data:</h2>
        <pre className="text-sm text-green-300 whitespace-pre-wrap">
          {JSON.stringify({
            userId: user?.id || 'NO USER',
            userEmail: user?.email || 'NO EMAIL',
            userExists: !!user,
            authError: authError?.message || 'No auth error'
          }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-gray-800 p-6 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Profile Data:</h2>
        <pre className="text-sm text-blue-300 whitespace-pre-wrap">
          {JSON.stringify({
            profile: userProfile || 'NO PROFILE',
            profileRole: userProfile?.role || 'NO ROLE',
            roleType: typeof userProfile?.role,
            isAdmin: userProfile?.role === 'admin',
            profileError: profileError?.message || 'No profile error'
          }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-gray-800 p-6 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">Auth Decision:</h2>
        <div className="text-lg">
          {!user && <div className="text-red-400">❌ No user - would redirect to /signin</div>}
          {user && !userProfile && <div className="text-red-400">❌ User exists but no profile found</div>}
          {user && userProfile && userProfile.role !== 'admin' && <div className="text-red-400">❌ User has profile but role is: {userProfile.role}</div>}
          {user && userProfile && userProfile.role === 'admin' && <div className="text-green-400">✅ User is admin - should show admin interface</div>}
        </div>
      </div>
      
      <div className="bg-emerald-900 p-6 rounded">
        <h2 className="text-xl font-semibold mb-4 text-emerald-300">Next Steps:</h2>
        <div className="text-emerald-200">
          Once we see what's wrong above, we'll replace this debug page with the real admin interface.
        </div>
      </div>
    </div>
  );
}