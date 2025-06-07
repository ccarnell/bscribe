'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { getStripe } from '@/utils/stripe/client';
import { Analytics } from "@vercel/analytics/next"

// Featured books data
const featuredBooks = [
  {
    id: 1,
    productID: 'prod_book_1',
    title: "The 7 F*cking Secrets of How to Hack the Art of Everything You Need to Know",
    price: 9.99,
    priceInCents: 999,
    description: "Finally, a self-help book that admits it's completely made up.",
    coverUrl: "/placeholder-cover-1.jpg"
  },
  {
    id: 2,
    productId: 'prod_book_2',
    title: "Think Like a Motherf*cking Navy SEAL CEO", 
    price: 12.99,
    priceInCents: 1299,
    description: "Corporate buzzwords meet military discipline meets absolute nonsense.",
    coverUrl: "/placeholder-cover-2.jpg"
  },
  {
    id: 3,
    productId: 'prod_book_3',
    title: "From Broke-Ass Loser to F*ckable Billionaire in 30 Minutes",
    price: 7.99,
    priceInCents: 799,
    description: "The quickest path to success that definitely won't work.",
    coverUrl: "/placeholder-cover-3.jpg"
  },
  {
    id: 4,
    productId: 'prod_book_4',
    title: "The 42-Parameter Deep Learning Framework for Optimizing Your Neural Pathways",
    price: 14.99,
    priceInCents: 1499,
    description: "AI-speak meets self-help. It's as confused as you are.",
    coverUrl: "/placeholder-cover-4.jpg"
  },
  {
    id: 5,
    productId: 'prod_book_5',
    title: "Authentically Leveraging Your Personal Brand's F*cking Synergy",
    price: 11.99,
    priceInCents: 1199,
    description: "LinkedIn thought leadership at its most ridiculous.",
    coverUrl: "/placeholder-cover-5.jpg"
  },
  {
    id: 6,
    productId: 'prod_book_6',
    title: "Zero-Shot Learning the Art of Maximum F*ckery",
    price: 8.99,
    priceInCents: 899,
    description: "Machine learning meets life advice. Neither makes sense.",
    coverUrl: "/placeholder-cover-6.jpg"
  }
];

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
  coverUrl: "/the-millionare-mindset-book-cover-image.png",
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
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Get selected price tier for paid book
  const getSelectedPrice = () => {
    const selected = paidBook.priceTiers.find(tier => tier.id === selectedPriceId);
    return selected || paidBook.priceTiers[0];
  };

  const handleDownloadFreeBook = async () => {
    // Implement free download logic here
    setLoading('free');
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // For now, we'll just alert, but in a real implementation, 
      // this would trigger a download or redirect to a download page
      alert('Your free book is now downloading!');
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
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
        headers: { 'Content-Type': 'application/json'},
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
        headers: { 'Content-Type': 'application/json'},
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
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 3999, // $39.99 in cents
          bookTitle: 'Complete Bullsh*t Bundle - All 6 Books',
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
      <div className="flex items-center text-left">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">0 Ratings. They are just a social construct anyway.</span>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-left">10 pages</p>
    </div>
  );

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Two Book Layout */}
      <section className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight text-center">
            I Spent{' '}
            <span className="text-emerald-500">7 Months</span>
            <br />
            Building This So{' '}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Free Book */}
            <div 
              className="bg-[#1a1a1a] rounded-lg p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <h2 className="text-lg font-bold mb-2 line-clamp-1 text-left">
                {freeBook.title}
              </h2>
              
              <div className="flex justify-center mb-3">
                <Image 
                  src={freeBook.coverUrl}
                  alt={freeBook.title}
                  width={300}
                  height={450}
                  className="rounded-md shadow-lg max-w-full h-auto"
                  priority
                />
              </div>
              
              <StarRating />
              
              <div className="mt-2 mb-1 text-left">
                <span className="line-through text-red-500 text-lg font-bold">$0.01</span>
              </div>
              
              <div className="mb-2">
                <span className="bg-emerald-500 text-black px-3 py-1 rounded-md font-bold inline-block transform -rotate-3 relative border-2 border-dashed border-yellow-400 shadow-lg text-sm">
                  <span className="absolute top-0 right-0 text-xs bg-yellow-400 text-black px-1 py-0.5 rounded-bl-md transform translate-x-1 -translate-y-1 font-black">DEAL</span>
                  100% OFF
                </span>
              </div>
              
              <div className="mt-auto">
                <Button
                  variant="flat"
                  className="font-bold px-4 py-2 disabled:opacity-50 w-full text-md shadow-lg hover:scale-105 transition-all"
                  onClick={handleDownloadFreeBook}
                  disabled={loading === 'free'}
                >
                  {loading === 'free' ? 'Loading...' : 'Just take it'}
                </Button>
              </div>
            </div>
            
            {/* Right Column - Paid Book */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <h2 className="text-lg font-bold mb-2 line-clamp-1 text-left">
                {paidBook.title}
              </h2>
              
              <div className="flex justify-center mb-3">
                <Image 
                  src={paidBook.coverUrl}
                  alt={paidBook.title}
                  width={300}
                  height={450}
                  className="rounded-md shadow-lg max-w-full h-auto"
                  priority
                />
              </div>
              
              <StarRating />
              
              <div className="mt-2 mb-1 text-left">
                <span className="line-through text-red-500 text-lg font-bold">${paidBook.originalPrice.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-gray-400 mb-2">
                Choose whichever number speaks to your inner entrepreneur.
              </p>
              
              <div className="mb-2">
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {paidBook.priceTiers.slice(0, 3).map((tier) => (
                    <div key={tier.id} className="h-8 flex items-stretch">
                      <button
                        className={`w-full flex items-center justify-center py-1 px-1 text-xs rounded ${
                          selectedPriceId === tier.id
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                        }`}
                        onClick={() => setSelectedPriceId(tier.id)}
                      >
                        {tier.label}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {paidBook.priceTiers.slice(3, 4).map((tier) => (
                    <div key={tier.id} className="h-8 flex items-stretch">
                      <button
                        className={`w-full flex items-center justify-center py-1 px-1 text-xs rounded ${
                          selectedPriceId === tier.id
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                        }`}
                        onClick={() => setSelectedPriceId(tier.id)}
                      >
                        {tier.label}
                      </button>
                    </div>
                  ))}
                  {paidBook.priceTiers.slice(4, 5).map((tier) => (
                    <div key={tier.id} className="h-8 flex items-stretch">
                      <button
                        className={`w-full flex items-center justify-center py-1 px-1 text-xs rounded relative ${
                          selectedPriceId === tier.id
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-[#2d2d2d] text-white hover:bg-[#ff6b35]'
                        }`}
                        onClick={() => setSelectedPriceId(tier.id)}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        {tier.label}
                        {showTooltip && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded text-xs w-64 mb-2 shadow-lg z-10">
                            {tier.tooltip}
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto">
                <Button
                  variant="orange"
                  className="font-bold px-4 py-2 disabled:opacity-50 w-full text-md shadow-lg hover:scale-105 transition-all"
                  onClick={handleBuyPaidBook}
                  disabled={loading === 'paid'}
                >
                  {loading === 'paid' ? 'Loading...' : 'Buy this BS'}
                </Button>
              </div>
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
              <Button
                variant="orange"
                className="font-bold px-8 py-3 rounded-lg text-lg w-full shadow-lg transform hover:scale-105 transition-all"
                onClick={handleBuyBundle}
              >
                Buy their BS
              </Button>
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
            <Button
              variant="orange"
              className="font-bold px-10 py-4 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all"
              onClick={handleBuyBundle}
            >
              Buy their BS
            </Button>
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
      <section className="py-20 px-4" style={{backgroundColor: '#ff0000'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            STOP OVERTHINKING
          </h2>
          
          <p className="text-xl mb-8 text-white">
            Obnoxious red section? Your wakeup call.
            <br />Cancel just 1 of your forgotten 12 subscriptions and buy this BS instead.
          </p>
          
          <Button
            variant="flat"
            className="font-bold text-xl px-10 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-auto"
            onClick={handleBuyBundle}
            disabled={loading === 'bundle'}
          >
            {loading === 'bundle' ? 'Loading...' : 'BUY THE BS'}
          </Button>
          
          <p className="text-sm text-black mt-4">
            No refunds. We don't want it back.
          </p>
        </div>
      </section>
    </div>
  );
}