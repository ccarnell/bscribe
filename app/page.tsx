'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { getStripe } from '@/utils/stripe/client';
import { Analytics } from "@vercel/analytics/next"

// Book data with prices in cents
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

export default function HomePage() {
  const [loading, setLoading] = useState<number | null>(null);

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
    setLoading(999);
    
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

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            I Spent{' '}
            <span className="text-emerald-500">7 Months</span>
            <br />
            Building This So{' '}
            <span className="text-emerald-500">You Don't</span>
            <Analytics />
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-4xl mx-auto">
            I've been unemployed for months.
            <br />
            <br />This is your chance to help me so that I can help you to help yourself by helping others to help me too. And just maybe, that will help them to help others who do the same.
          </p>

          {/* Featured Books Grid */}
          <div id="books" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            {featuredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-gray-900 rounded-lg p-4 md:p-6 hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                {/* Placeholder for book cover image */}
                <div className="bg-slate-700 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-sm">Book Cover Image</span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                  {book.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4">
                  {book.description}
                </p>
                
                <div className="text-center">
                  <div className="text-emerald-500 font-bold text-xl mb-3">
                    ${book.price}
                  </div>
                  <Button
                    variant="slim"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 disabled:opacity-50 w-full"
                    onClick={() => handleBuyBook(book)}
                    disabled={loading === book.id}
                  >
                    {loading === book.id ? 'Loading...' : 'Buy This Bullsh*t'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <div id="bundle">
            <Button
            variant="slim"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-base md:text-xl px-6 md:px-12 py-3 md:py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-auto"
            onClick={handleBuyBundle}
            disabled={loading === 999}
          >
            {loading === 999 ? 'Loading...' : (
              <span>
                <span className="hidden md:inline">Get All 6 Books for $39.99 (Save Your Dignity Later)</span>
                <span className="md:hidden">Bundle All 6 Books - $39.99</span>
              </span>
            )}
          </Button>
        </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Let's Be <span className="text-emerald-500">Honest</span>
          </h2>
          
          <div className="text-lg md:text-xl space-y-6 text-gray-300">
            <p>
              You found BScribe because you thought you saw a funny title. 
              But now you realize you've just landed on an absolute gold mine.
            </p>
            
            <p>
              We both know you could probably put your meta-prompt engineering 
              genius to work and vibe code this yourself in the next 2 hours. 
              But I already did all the work for you.
            </p>
            
            <div className="flex justify-center">
              <Link 
                href="/#books" 
                className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105"
              >
                Buy the BS
              </Link>
          </div>

            <p>  
              I could probably make more money selling courses to people on how to do this too. But I'm not.
              So, I'm kindly asking you to just give me your money so you can enjoy the life you deserve
            </p>
            
            <p>
              <strong>The deal:</strong> You give me money, I give you a PDF that will make you laugh for 5 minutes, 
              then you'll forget about it forever. It's like buying a coffee, except the coffee is existential 
              dread with Comic Sans formatting.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof (Obviously Fake) */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Join <span className="text-emerald-500">Real People</span> Who Can't Believe What They've Just Read
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-800 p-6 rounded-lg">
              <p className="text-white mb-4">
                "You know when you're deep in a book and after a few pages you sort've "wake up" and realize you have no clue what you've been reading? That's what BScribe can offer you."
              </p>
              <p className="text-emerald-500 font-bold">- Sarah K., Professional Overthinker</p>
            </div>
            
            <div className="bg-indigo-800 p-6 rounded-lg">
              <p className="text-white mb-4">
                "Finally, a self-help book that was completely helpless. Refreshingly honest and now I don't feel so alone."
              </p>
              <p className="text-emerald-500 font-bold">- Mike D., Change Agent</p>
            </div>
            
            <div className="bg-indigo-800 p-6 rounded-lg">
              <p className="text-white mb-4">
                "No purchase has ever made me want to get my life back together more."
              </p>
              <p className="text-emerald-500 font-bold">- Alex R., Parent of 8</p>
            </div>
          </div>
          
          {/* Fake counter */}
          <div className="text-center mt-12">
            <p className="text-gray-400">
              <span className="text-emerald-500 font-bold text-2xl">8+ BILLION</span> people haven't taken this opportunity yet! 
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4" style={{backgroundColor: '#ff0000'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Stop Overthinking It
          </h2>
          
          <p className="text-xl mb-8 text-white">
            This obnoxious red section is your wakeup call. Cancel your forgotten meditation app subs. Put that money to something you'll actually use.
          </p>
          
          <Button
            variant="slim"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xl md:text-2xl px-8 md:px-16 py-4 md:py-6 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-auto"
            onClick={handleBuyBundle}
            disabled={loading === 999}
          >
            {loading === 999 ? 'Loading...' : 'BUY THE BS'}
          </Button>
          
          <p className="text-sm text-gray-700 mt-4">
            No refunds. We don't want it back.
          </p>
        </div>
      </section>
    </div>
  );
}