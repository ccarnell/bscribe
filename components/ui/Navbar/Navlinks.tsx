'use client';
import Link from 'next/link';
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
  
  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        {/* Bscribe Logo */}
        <Link href="/" className="flex items-center space-x-2" aria-label="Bscribe Home">
          <span className="text-2xl">📚</span>
          <span className="text-yellow-400 text-2xl font-black">BScribe</span>
          <span className="text-gray-400 text-sm hidden md:block">.ai</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="ml-8 space-x-6 lg:block">
          <Link href="/#books" className={`${s.link} hover:text-yellow-400 transition-colors`}>
            Books
          </Link>
          <Link href="/#bundle" className={`${s.link} hover:text-yellow-400 transition-colors`}>
            Bundle
          </Link>
          <Link href="/coming-soon" className={`${s.link} hover:text-yellow-400 transition-colors`}>
            Generate BS
          </Link>
          {user && (
            <Link href="/account" className={`${s.link} hover:text-yellow-400 transition-colors`}>
              My Purchases
            </Link>
          )}
        </nav>
      </div>
      
      {/* Auth Section */}
      <div className="flex justify-end items-center space-x-6">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm hidden md:block">
              Welcome back, fellow consumer of BS
            </span>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input type="hidden" name="pathName" value={usePathname()} />
              <button 
                type="submit" 
                className="text-white hover:text-yellow-400 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex justify-end">
            <Link 
              href="/#books" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105"
            >
              Buy the BS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}