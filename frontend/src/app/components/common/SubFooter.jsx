import React, { useState, useEffect } from 'react';


const HeartIcon = ({ className = "" }) => {
  return (
    <span
      className={`inline-block animate-heartbeat ${className}`}
      style={{
        color: '#ec4899',
      }}
      aria-label="love"
    >
      ♥
    </span>
  );
};

const NAV_LINKS = [
  { label: 'Explore Events', href: '/events' },
  { label: 'Create Event', href: '/create-event' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'About', href: '#about' },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export const SubFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-2 border-gray-100 min-h-screen flex flex-col justify-between overflow-x-hidden relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 w-full flex flex-col grow">
        {/* Main Brand Section */}
        <div className="mt-12 md:mt-15">
          <div className="flex flex-col lg:flex-row w-full items-center justify-start gap-2 md:gap-4">
            <div className="font-mangodolly text-3xl md:text-7xl font-bold text-black whitespace-nowrap">
              Mango
            </div>
            <div
              className="font-mangodolly text-3xl md:text-7xl  font-bold text-pink-500 tracking-tighter"
            >
              Dolly.
            </div>
          </div>
          <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-3xl font-medium text-gray-500 max-w-2xl leading-tight">
            The beating heart of campus life. <br className="hidden sm:block" />
            Where events turn into legends.
          </p>
        </div>

        {/* Action / Links Section */}
        <div className="flex flex-col lg:flex-row gap-10 items-start justify-between w-full mt-15">

          {/* Large Vertical Navigation */}
          <div className="flex flex-col gap-4 md:gap-6 w-fit">
            <h3 className="font-mangodolly text-md md:text-2xl font-bold uppercase text-black mb-2 md:mb-4">
              Explore the Paradise
            </h3>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 md:gap-4 text-3xl sm:text-4xl md:text-6xl font-bold text-black hover:text-pink-500 transition-all duration-300 ease-in-out"
              >
                <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  {link.label}
                </span>
              </a>
            ))}
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col justify-between items-start h-full w-fit">
            {/* TOP SECTION: Social Links */}
            <div className="w-full">
              <h3 className="font-mangodolly text-md md:text-2xl mb-5">
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-4 md:gap-8">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 md:gap-3 text-black hover:text-pink-500 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 border-gray-400 flex items-center justify-center group-hover:border-pink-500 group-hover:bg-pink-50 transition-all duration-300">
                      {s.icon}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      {s.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* BOTTOM SECTION: About */}
            <div className="mt-5 md:mt-5">
              <h3 className="font-mangodolly text-md md:text-2xl mt-4">
                About
              </h3>
              <p className="text-base md:text-xl text-gray-500 leading-relaxed max-w-sm">
                MangoDolly is a premium college event management platform built for the next generation of campus leaders.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar - Ultra Premium */}
      <div className=" flex flex-col items-center justify-center gap-3 mt-5 mb-5 w-full">

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 lg:gap-12 text-center md:text-left">
          <p className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-medium text-gray-800">
            Made with <HeartIcon className="text-2xl md:text-5xl animate-pulse" /> by
            <span className="font-bold text-black">
              Mango Boyes
            </span>
          </p>
        </div>
        <p className="text-md md:text-xl text-gray-400 font-medium">
          © {currentYear} MangoDolly. All rights reserved.
        </p>

        {/* <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <a href="#" className="text-[10px] md:text-sm font-bold uppercase tracking-widest hover:text-pink-500 transition-colors">Privacy</a>
            <a href="#" className="text-[10px] md:text-sm font-bold uppercase tracking-widest hover:text-pink-500 transition-colors">Terms</a>
            <a href="#" className="text-[10px] md:text-sm font-bold uppercase tracking-widest hover:text-pink-500 transition-colors">Contact</a>
          </div> */}

      </div>

    </footer >
  );
};
