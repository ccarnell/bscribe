import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div className="col-span-1 lg:col-span-3">
          <Link
            href="/"
            className="flex items-center flex-initial font-bold md:mr-24"
          >
            <span className="text-2xl mr-2">📚</span>
            <span className="text-yellow-400 text-xl font-black">BScribe</span>
          </Link>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            The Tony Robbins rumor to buyout BScribe is unproven. 
            Why would he have anything to do with this?
            Unless he was searching for better motivational material.
            This and all other rumors are unsubstantiated.
          </p>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-yellow-400">BOOKS</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <span className="text-gray-400">
                No link. Literally just scroll up.
              </span>
            </li>
          </ul>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-yellow-400">SUPPORT</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <a
                href="https://988lifeline.org/"
                className="text-white transition duration-150 ease-in-out hover:text-yellow-400"
              >
                Call for Support
              </a>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <span className="text-white">
                Contact Deez via ToS
              </span>
            </li>
          </ul>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-yellow-400">LEGAL-ISH</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/privacy"
                className="text-white transition duration-150 ease-in-out hover:text-yellow-400"
              >
                Privacy Policy
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/terms"
                className="text-white transition duration-150 ease-in-out hover:text-yellow-400"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="flex items-start col-span-1 text-white lg:col-span-3 lg:justify-end">
          <div className="flex flex-col space-y-4">
            <p className="text-gray-400 text-sm max-w-xs">
              Follow for the next release!
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://letmegooglethat.com/?q=twitter"
                className="text-gray-400 hover:text-yellow-400 transition duration-150"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-between py-12 space-y-4 md:flex-row bg-zinc-900">
        <div>
          <span className="text-gray-400">
            &copy; 2024 BScribe.ai - Powered by your mother
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yellow-400">💸</span>
        </div>
      </div>
    </footer>
  );
}