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
      </div>
      
      {/* Auth Section */}
      <div className="flex justify-end items-center space-x-2 md:space-x-6">
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
              href="/#bundle" 
              className="bg-[#ff6b35] hover:bg-[#ff8c42] text-white px-6 py-2 md:px-6 md:py-3 rounded-lg font-bold text-base transition-all transform hover:scale-105"
            >
              Buy the BS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
