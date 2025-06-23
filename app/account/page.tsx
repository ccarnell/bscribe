import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Account() {
  const supabase = createClient();

  // Get the authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  // Try to get user details - but don't fail if table doesn't exist
  let userDetails = null;
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    userDetails = data;
  } catch (e) {
    // Table might not exist or user might not have a record
    console.log('Could not fetch user details');
  }

  // Try to get subscription - but don't fail if table doesn't exist
  let subscription = null;
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .eq('user_id', user.id)
      .in('status', ['trialing', 'active'])
      .order('created', { ascending: false })
      .limit(1)
      .maybeSingle();
    subscription = data;
  } catch (e) {
    // Table might not exist or user might not have a subscription
    console.log('Could not fetch subscription');
  }

  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            We partnered with Stripe for a simplified billing.
          </p>
        </div>
      </div>
      <div className="p-4">
        <CustomerPortalForm subscription={subscription} />
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
      </div>
    </section>
  );
}