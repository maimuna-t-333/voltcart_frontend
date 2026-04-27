'use client';
import Link from 'next/link';
import { Globe, Share2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 py-16'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-12'>
          <div className='col-span-2 md:col-span-1'>
            <h3 className='text-2xl font-bold text-brand-400 mb-4'>TechVault</h3>
            <p className='text-gray-400 text-sm leading-relaxed'>
              Your one-stop shop for the latest gadgets and electronics.
              Quality products, unbeatable prices.
            </p>
            <div className='flex gap-4 mt-6'>
            {[Globe, Share2, Heart].map((Icon, i) => (
                <a key={i} href='#' className='w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors'>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Shop', links: ['Smartphones', 'Laptops', 'Headphones', 'Tablets', 'Accessories'] },
            { title: 'Support', links: ['Help Center', 'Track Order', 'Returns', 'Warranty', 'Contact Us'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Privacy Policy', 'Terms'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className='font-bold text-white mb-4'>{col.title}</h4>
              <ul className='space-y-2'>
                {col.links.map(link => (
                  <li key={link}>
                    <Link href='#' className='text-gray-400 text-sm hover:text-brand-400 transition-colors'>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-gray-500 text-sm'>© 2026 TechVault. All rights reserved.</p>
          <div className='flex items-center gap-2'>
            <span className='text-gray-500 text-sm'>We accept:</span>
            {['💳', '🏦', '📱'].map((icon, i) => (
              <span key={i} className='text-xl'>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
