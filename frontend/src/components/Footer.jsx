import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-primary mb-4">HomelyHub</h3>
            <p className="text-gray-400 mb-4">
              Find your perfect stay with unique accommodations worldwide.
            </p>
            <div className="flex space-x-4">
              <FaFacebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <FaTwitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <FaInstagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-white">Safety Information</Link></li>
              <li><Link to="/cancellation" className="hover:text-white">Cancellation Options</Link></li>
              <li><Link to="/support" className="hover:text-white">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/blog" className="hover:text-white">HomelyHub Blog</Link></li>
              <li><Link to="/forum" className="hover:text-white">Community Forum</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/referrals" className="hover:text-white">Referrals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white">Press</Link></li>
              <li><Link to="/policies" className="hover:text-white">Policies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 HomelyHub. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
            <Link to="/sitemap" className="text-gray-400 hover:text-white text-sm">Sitemap</Link>
            <Link to="/company" className="text-gray-400 hover:text-white text-sm">Company details</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer