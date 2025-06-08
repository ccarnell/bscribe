import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full px-6 py-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Logo and Tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center flex-initial font-bold"
            >
              <span className="text-2xl mr-2">📚</span>
              <span className="text-emerald-500 text-xl font-black">BScribe</span>
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              The Tony Robbins rumor to buyout BScribe is unproven. 
              Why would he have anything to do with this?
              Unless he was searching for better motivational material.
              This and all other rumors are unsubstantiated.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <p className="font-bold text-emerald-500 mb-3">BOOKS</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/generate"
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  Generate your own BS
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  Vote on BS titles
                </Link>
              </li>
              <li>
                <span className="text-gray-400">
                  No "Back to Top" link.
                  <br />Literally just scroll up.
                </span>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="col-span-1">
            <p className="font-bold text-emerald-500 mb-3">LEGAL-ISH</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-gray-400">
                  Contact Deez via ToS
                </span>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="col-span-1">
            <p className="font-bold text-emerald-500 mb-3">SUPPORT</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://988lifeline.org/"
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  Call for Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-800">
          <span className="text-gray-400">
            &copy; [Year], Placeholder Footer Text
          </span>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <a
              href="https://letmegooglethat.com/?q=twitter"
              className="text-gray-400 hover:text-emerald-500 transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <span className="text-emerald-500">💸</span>
          </div>
        </div>
      </div>
    </footer>
  );
}