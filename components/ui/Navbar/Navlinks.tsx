'use client';
import Link from 'next/link';
import { useState } from 'react';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        {/* Bscribe Logo */}
        <Link href="/" className="flex items-center space-x-2" aria-label="Bscribe Home">
          <span className="text-2xl">📚</span>
          <span className="text-emerald-500 text-2xl font-black">BScribe</span>
          <span className="text-gray-400 text-sm hidden md:block">.ai</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="ml-4 md:ml-8 space-x-2 md:space-x-6 hidden sm:block">
          <Link href="/#books" className={`${s.link} hover:text-emerald-500 transition-colors text-sm md:text-base`}>
            Books
          </Link>
          <Link href="/#bundle" className={`${s.link} hover:text-emerald-500 transition-colors text-sm md:text-base`}>
            Bundle
          </Link>
          <Link href="/coming-soon" className={`${s.link} hover:text-emerald-500 transition-colors text-sm md:text-base hidden md:inline-flex`}>
            Generate BS
          </Link>
          {user && (
            <Link href="/account" className={`${s.link} hover:text-emerald-500 transition-colors text-sm md:text-base`}>
              My Purchases
            </Link>
          )}
        </nav>
      </div>
      
      {/* Auth Section */}
      <div className="flex justify-end items-center space-x-2 md:space-x-6">
        {/* Mobile menu button */}
        <button 
          className="block sm:hidden text-white focus:outline-none" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm hidden md:block">
              Welcome back, fellow consumer of BS
            </span>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input type="hidden" name="pathName" value={usePathname()} />
              <button 
                type="submit" 
                className="text-white hover:text-emerald-500 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex justify-end">
            <Link 
              href="/#books" 
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-3 py-1 md:px-4 md:py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105"
            >
              Buy the BS
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black shadow-lg py-4 px-6 sm:hidden z-50">
          <div className="flex flex-col space-y-4">
            <Link href="/#books" className="text-white hover:text-emerald-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Books
            </Link>
            <Link href="/#bundle" className="text-white hover:text-emerald-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Bundle
            </Link>
            <Link href="/coming-soon" className="text-white hover:text-emerald-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Generate BS
            </Link>
            {user && (
              <Link href="/account" className="text-white hover:text-emerald-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                My Purchases
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}