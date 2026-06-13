import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface mt-auto overflow-hidden relative">
      {/* Newsletter Section */}
      <div className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left text-white">
              <h3 className="font-serif text-3xl font-black tracking-widest uppercase mb-2">Join the SouthZone Club</h3>
              <p className="text-sm text-white/40">Subscribe for early access to drops and exclusive offers.</p>
            </div>
            <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                className="w-full sm:flex-1 bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wider uppercase font-semibold"
              />
              <button className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all glow-red-hover">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
          
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2">
            <Image
              src="/images/LOGO.png"
              alt="SouthZone"
              width={150}
              height={45}
              className="h-8 w-auto mb-6 brightness-125"
            />
            <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-8">
              SouthZone is more than a brand; it's a movement. We blend traditional craftsmanship with modern streetwear to deliver fits that define a generation. Designed for the bold, made in India.
            </p>
            <div className="flex space-x-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center glass rounded-xl text-white/50 hover:text-white hover:bg-accent hover:border-accent/30 transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-serif text-lg font-black text-white tracking-widest uppercase mb-6">Collections</h3>
            <ul className="space-y-4">
              {[
                { label: 'The Formal Edit', query: 'Midnight Selection' },
                { label: 'Heritage Collection', query: 'Avant-Garde Edge' },
                { label: 'Daily Essentials', query: 'Minimalist Noir' },
                { label: 'Active Performance', query: 'Urban Elite' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={`/shop?category=${encodeURIComponent(item.query)}`} className="text-sm text-white/40 hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-lg font-black text-white tracking-widest uppercase mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/track" className="text-sm text-white/40 hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="text-sm text-white/40 hover:text-accent transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="text-sm text-white/40 hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-white/40 hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-lg font-black text-white tracking-widest uppercase mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-white/40 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="text-sm text-white/40 hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/40 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/coupons" className="text-sm text-white/40 hover:text-accent transition-colors">Coupons</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-white/30 uppercase tracking-widest font-medium text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} SouthZone Wear. All rights reserved.</p>
            <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
            <p>Designed and Manufactured in India</p>
          </div>
          
          {/* Simulated Payment Icons */}
          <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="px-2 py-1 border border-white/20 rounded text-[10px] text-white font-bold">VISA</div>
             <div className="px-2 py-1 border border-white/20 rounded text-[10px] text-white font-bold">MASTER</div>
             <div className="px-2 py-1 border border-white/20 rounded text-[10px] text-white font-bold">UPI</div>
             <div className="px-2 py-1 border border-white/20 rounded text-[10px] text-white font-bold">G-PAY</div>
          </div>
        </div>
      </div>
    </footer>
  );
}