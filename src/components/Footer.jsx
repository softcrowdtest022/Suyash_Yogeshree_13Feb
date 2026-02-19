import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-cyan-900 via-[#00B4D8] to-cyan-700 text-white py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
               <img src="/se.png" className='w-100' alt="" />
              
            </div>
            <p className="text-cyan-100/90 text-sm mb-8 max-w-md leading-relaxed">
              Making your life easier with our innovative solutions. 
              We're dedicated to providing the best experience for our users 
              with cutting-edge technology and exceptional support.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-3.862c0-1.881-2.002-1.722-2.002 0v3.862h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-10 h-1 bg-cyan-300 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg relative">
              Resources
              <span className="absolute -bottom-1 left-0 w-10 h-1 bg-cyan-300 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-cyan-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-300 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-10 pt-8 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-cyan-100/80 text-sm">Call us</p>
                <p className="text-white font-medium text-lg">+91 74474 78744</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-cyan-100/80 text-sm">Email us</p>
                <p className="text-white font-medium text-lg">contact@exilancesoftware.com</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-cyan-100/80 text-sm">Visit us</p>
                <p className="text-white font-medium text-lg">Nashik | Maharashtra | India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg className="w-5 h-5 text-cyan-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-cyan-100/70 text-sm">
                © {new Date().getFullYear()} Suyash Enterprises. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="text-cyan-100 hover:text-white hover:underline text-sm transition-all duration-300">
                Privacy Policy
              </a>
              <span className="text-cyan-100/30">•</span>
              <a href="#" className="text-cyan-100 hover:text-white hover:underline text-sm transition-all duration-300">
                Terms of Service
              </a>
              <span className="text-cyan-100/30">•</span>
              <a href="#" className="text-cyan-100 hover:text-white hover:underline text-sm transition-all duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;