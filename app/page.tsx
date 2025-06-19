'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { getStripe } from '@/utils/stripe/client';
import { Analytics } from "@vercel/analytics/next"

function ConditionalAnalytics() {
  const [shouldTrack, setShouldTrack] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem('bscribe_admin_exclude');
    if (isAdmin === 'true') {
      setShouldTrack(false);
      console.log('🚫 Analytics tracking disabled for admin');
    } else {
      console.log('📊 Analytics tracking enabled');
    }
  }, []);

  return shouldTrack ? <Analytics /> : null;
}

// Hero section featured books
const freeBook = {
  id: 'free-book-1',
  productId: 'prod_free_book_1',
  title: "I Disrupted My Own Childhood Trauma using Agile Methodology",
  subtitle: "How I pivoted my inner child into a high-performing stakeholder and achieved synergistic healing at scale",
  coverUrl: "/i-disrupted-my-own-childhood-trauma-book-cover-image.png",
  isFree: true
};

const paidBook = {
  id: 'paid-book-1',
  productId: 'prod_paid_book_1',
  title: "The Millionaire Mindset For People Who Can't Afford Avocado Toast",
  subtitle: "Visualize Your Way to Wealth While Ignoring Basic Economics and Your Credit Card",
  coverUrl: "/the-millionaire-mindset-book-cover-image.png",
  originalPrice: 69.00,
  priceTiers: [
    { id: 'price_1', label: '$4.20', priceInCents: 420 },
    { id: 'price_2', label: '$6.66', priceInCents: 666 },
    { id: 'price_3', label: '$9.11', priceInCents: 911 },
    { id: 'price_4', label: '$13.37', priceInCents: 1337 },
    { id: 'price_5', label: '$90.01', priceInCents: 9001, tooltip: "Any amount paid over $69.00 will be donated to the National Suicide Prevention Lifeline" }
  ]
};

export default function HomePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string>('price_3');
  const [selectedBundlePriceId, setSelectedBundlePriceId] = useState<string>('bundle_1');

  // Get selected price tier for paid book
  const getSelectedPrice = () => {
    const selected = paidBook.priceTiers.find(tier => tier.id === selectedPriceId);
    return selected || paidBook.priceTiers[0];
  };

  const handleDownloadFreeBook = async () => {
    // Download free book from Supabase storage
    setLoading('free');
    try {
      // Add session ID for tracking
      const sessionId = `free_${Date.now()}`;
      console.log(`Initiating free book download with session ID: ${sessionId}`);
      console.log(`Book ID being requested: ${freeBook.productId}`);

      // Fetch the secure download URL from the free downloads endpoint
      const response = await fetch('/api/download-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          bookId: freeBook.productId,
        }),
      });

      // Check response status
      console.log(`Download API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Download API error response:', errorData);
        throw new Error(`Failed to get download link: ${response.status} ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Download API response:', responseData);

      if (!responseData.downloadUrl) {
        throw new Error('No download URL returned');
      }

      // For development environment, the mock image is opened directly
      if (responseData.dev) {
        console.log(`Opening development mock image: ${responseData.downloadUrl}`);
        window.open(responseData.downloadUrl, '_blank');
        return;
      }

      // For production, open the download URL which now points to our file proxy
      console.log(`Opening download via proxy: ${responseData.downloadUrl}`);
      window.location.href = responseData.downloadUrl; // Use location.href instead of window.open for more reliable downloads
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Please try again later.'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyPaidBook = async () => {
    setLoading('paid');

    try {
      const selectedPrice = getSelectedPrice();

      // Create checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPrice.priceInCents,
          bookTitle: paidBook.title,
          productId: paidBook.productId
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleBuyBook = async (book: any) => {
    setLoading(book.id);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: book.priceInCents,
          bookTitle: book.title,
          productId: book.productId
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleBuyBundle = async () => {
    setLoading('bundle');

    try {
      // Get price based on selected bundle price
      const priceInCents = selectedBundlePriceId === 'bundle_1' ? 1337 : 9001;
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceInCents, // in cents
          bookTitle: 'Complete Bullsh*t Bundle - All Books',
          productId: 'prod_bundle',
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Star rating component
  const StarRating = () => (
    <div className="flex flex-col">
      <div className="flex items-center text-left flex-wrap">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          ))}
        </div>
        <span className="text-xs text-gray-300 ml-2 break-words md:whitespace-nowrap">(0) Ratings are just a social construct anyway.</span>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Two Book Layout */}
      <section id="books" className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight text-center">
            I Spent{' '}
            <span className="text-emerald-500">7 Months</span>
            <br />
            Building This So{' '}
            <br />
            <span className="text-emerald-500">You Don't</span>
            <Analytics />
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl mb-10 text-gray-300 max-w-4xl mx-auto text-center">
            Listen, I've been unemployed for months.
            <br />
            <br />This is your chance to help me so that I can help you to help yourself by helping others to help me too. And maybe, just maybe, that will help them to help others who do the same.
          </p>

          {/* Two Column Book Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:max-w-5xl mx-auto">
            {/* Left Column - Free Book */}
            <div
              onClick={handleDownloadFreeBook}
              className="bg-[#1a1a1a] rounded-lg p-6 md:p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
              <h2 className="text-lg font-bold mb-1 line-clamp-1 text-left">
                {freeBook.title}
              </h2>

              <p className="text-xs text-gray-400 mb-2 text-left">7 Pages | Download free digital book</p>

              <div className="flex justify-center mb-3">
                <Image
                  src={freeBook.coverUrl}
                  alt={freeBook.title}
                  width={300}
                  height={450}
                  className="rounded-md shadow-lg max-w-full h-auto md:w-[90%] md:mx-auto"
                  priority
                />
              </div>

              <StarRating />

              <div className="mt-2 mb-1 text-left">
                <span className="line-through text-red-500 text-lg font-bold">$0.01</span>
                <div className="mt-1">
                  <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-md font-bold inline-block transform -rotate-3 relative border-2 border-dashed border-yellow-400 shadow-lg text-xs">
                    <span className="absolute top-0 right-0 text-[10px] bg-yellow-400 text-black px-0.5 py-px rounded-bl-md transform translate-x-6 -translate-y-1 font-black">DEAL</span>
                    100% OFF
                  </span>
                </div>
              </div>

              <div className="flex-1"></div>

              <div className="grid grid-cols-3 gap-3 mb-2 mt-3">
                <div className="flex flex-col items-center">
                  <button
                    className="w-full flex items-center justify-center py-1 px-1 text-sm rounded bg-emerald-500 text-black font-bold h-10 mb-1"
                  >
                    $0.00
                  </button>
                  <span className="text-xs text-gray-400">Free</span>
                </div>
                <div className="col-span-2"></div>
              </div>

              <div className="mt-auto">
                <Button
                  variant="flat"
                  className="font-bold px-4 py-2 disabled:opacity-50 w-full text-lg shadow-lg hover:scale-105 transition-all"
                  onClick={() => handleDownloadFreeBook()}
                  disabled={loading === 'free'}
                >
                  {loading === 'free' ? 'Loading...' : 'Just take it'}
                </Button>
              </div>
            </div>

            {/* Right Column - Paid Book */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 md:p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <h2 className="text-lg font-bold mb-1 line-clamp-1 text-left">
                {paidBook.title}
              </h2>

              <p className="text-xs text-gray-400 mb-2 text-left">19 Pages | Purchase unhinged digital book</p>

              <div className="flex justify-center mb-3">
                <Image
                  src={paidBook.coverUrl}
                  alt={paidBook.title}
                  width={300}
                  height={450}
                  className="rounded-md shadow-lg max-w-full h-auto md:w-[90%] md:mx-auto"
                  priority
                />
              </div>

              <StarRating />

              <div className="mt-2 mb-1 text-left">
                <span className="line-through text-red-500 text-lg font-bold">${paidBook.originalPrice.toFixed(2)}</span>
                <p className="text-xs text-gray-400 mt-1">
                  Someone mentioned A/B testing... 'price elasticity' (whatever that means). Same product, choose your price.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-2 mt-3">
                <div className="flex flex-col items-center">
                  <button
                    className={`w-full flex items-center justify-center py-1 px-1 text-sm rounded mb-1 h-10 ${selectedPriceId === 'price_1'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                      }`}
                    onClick={() => setSelectedPriceId('price_1')}
                  >
                    $4.20
                  </button>
                  <span className="text-xs text-gray-400">Dank</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    className={`w-full flex items-center justify-center py-1 px-1 text-sm rounded mb-1 h-10 ${selectedPriceId === 'price_2'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                      }`}
                    onClick={() => setSelectedPriceId('price_2')}
                  >
                    $6.66
                  </button>
                  <span className="text-xs text-gray-400">Ohh, edgy</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    className={`w-full flex items-center justify-center py-1 px-1 text-sm rounded mb-1 h-10 ${selectedPriceId === 'price_3'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                      }`}
                    onClick={() => setSelectedPriceId('price_3')}
                  >
                    $9.11
                  </button>
                  <span className="text-xs text-gray-400">Never forget</span>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  variant="orange"
                  className="font-bold px-4 py-2 w-full text-lg shadow-lg hover:scale-105 transition-all"
                  onClick={() => handleBuyPaidBook()}
                  disabled={loading === 'paid'}
                >
                  {loading === 'paid' ? 'Loading...' : 'Buy this BS'}
                </Button>
              </div>
            </div>
          </div>

          {/* Bundle Offering */}
          <div id="bundle" className="mt-8 text-center md:max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-4">One less click for conversion rate optimizers</h3>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-2">
              <div className="flex flex-col items-center">
                <button
                  className={`w-full flex items-center justify-center py-1 px-1 text-sm rounded mb-1 h-10 ${selectedBundlePriceId === 'bundle_1'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                    }`}
                  onClick={() => setSelectedBundlePriceId('bundle_1')}
                >
                  $13.37
                </button>
                <span className="text-xs text-gray-400">Only for the Elite</span>
              </div>
              <div className="flex flex-col items-center">
                <button
                  className={`w-full flex items-center justify-center py-1 px-1 text-sm rounded mb-1 h-10 ${selectedBundlePriceId === 'bundle_2'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                    }`}
                  onClick={() => setSelectedBundlePriceId('bundle_2')}
                >
                  $90.01
                </button>
                <span className="text-xs text-gray-400">Because you can</span>
              </div>
            </div>

            <div className="max-w-xs mx-auto">
              <Button
                variant="orange"
                className="font-bold px-4 py-2 mx-auto max-w-xs w-full text-lg shadow-lg hover:scale-105 transition-all"
                onClick={() => handleBuyBundle()}
                disabled={loading === 'bundle'}
              >
                {loading === 'bundle' ? 'Loading...' : 'Bundle this BS'}
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section - updated colors */}
      <section className="py-20 px-4 bg-[#2d2d2d] mb-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Let's Be <span className="text-emerald-500">Honest</span>
          </h2>

          <div className="text-lg md:text-xl space-y-6 text-gray-300">
            <p>
              You found yourself here after seeing a ridiculous title or quote.
              But now you realize you've just landed on an absolute gold mine.
            </p>

            <p>
              We both know you could put your meta-prompt engineering
              genius to work and vibe code this yourself in 2 hours.
              Fortunately, I already wasted your time for you.
            </p>

            <div className="flex justify-center">
              <Link
                href="/#books"
                className="bg-[#ff6b35] hover:bg-[#ff8c42] text-white px-12 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                Buy the BS
              </Link>
            </div>

            <p>
              The neurotypicals probably make more money selling courses on how to do this.
              <br />But I'm not.
            </p>

            <p>
              <strong>THE DEAL:</strong> You pay. I give you life-changing content (admittedly for better or worse).
              <br />Did Starbucks try this hard for your coin?
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof - updated colors */}
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Join <span className="text-emerald-500">Real People</span> Who Can't Believe What They've Just Read
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#2d2d2d] p-6 rounded-lg">
              <p className="text-white mb-4">
                "You know when you're deep in a book and after a few pages you sort've "wake up" and realize you have no clue what you've been reading? That's what BScribe did for me."
              </p>
              <p className="text-emerald-500 font-bold">- Sarah K., Professional Overthinker</p>
            </div>

            {/* Mobile "Buy their BS" button - only visible on mobile */}
            <div className="block md:hidden my-4">
              <Link href="/#books">
                <Button
                  variant="orange"
                  className="font-bold px-8 py-3 rounded-lg text-lg w-full shadow-lg transform hover:scale-105 transition-all"
                >
                  Buy their BS
                </Button>
              </Link>
            </div>

            <div className="bg-[#2d2d2d] p-6 rounded-lg">
              <p className="text-white mb-4">
                "Finally, a self-help book that was completely helpless. Refreshingly honest and now I don't feel so alone."
              </p>
              <p className="text-emerald-500 font-bold">- Mike D., Change Agent</p>
            </div>

            <div className="bg-[#2d2d2d] p-6 rounded-lg">
              <p className="text-white mb-4">
                "No purchase has ever made me want to get my life back together more."
              </p>
              <p className="text-emerald-500 font-bold">- Alex R., Parent of 8</p>
            </div>
          </div>

          {/* Desktop "Buy their BS" button - only visible on desktop */}
          <div className="hidden md:flex justify-center mt-10">
            <Link href="/#books">
              <Button
                variant="orange"
                className="font-bold px-10 py-4 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all"
              >
                Buy their BS
              </Button>
            </Link>
          </div>

          {/* Fake counter */}
          <div className="text-center mt-12">
            <p className="text-gray-400">
              <span className="text-emerald-500 font-bold text-2xl">8+ BILLION </span> people haven't taken this opportunity yet!
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA - updated color */}
      <section className="py-20 px-4" style={{ backgroundColor: '#ff0000' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            STOP OVERTHINKING
          </h2>

          <p className="text-xl mb-8 text-white">
            Cancel one of your 12 forgotten subscriptions and buy this BS instead.
          </p>

          <Link href="/#books">
            <Button
              variant="flat"
              className="font-bold text-2xl px-10 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-auto"
            >
              BUY THE BS
            </Button>
          </Link>

        </div>
      </section>
      {process.env.NODE_ENV === 'production' && <ConditionalAnalytics />}
    </div>
  );
}
