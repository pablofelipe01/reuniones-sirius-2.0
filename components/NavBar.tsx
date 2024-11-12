// components/NavBar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 w-full bg-black bg-opacity-50 z-50"
      style={{ backdropFilter: "blur(5px)" }} // Optional: Adds a blur effect to the background
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0">
          <Link href="/">
  <div className="relative h-14 w-40"> {/* Increased height and width */}
    <Image
      src="/logo2.png" // Ensure logo2.png is in your public folder
      alt="Logo"
      fill
      style={{ objectFit: "contain" }}
    />
  </div>
</Link>

          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.3 5.71a1 1 0 00-1.42-1.42L12 9.17 7.12 4.29A1 1 0 105.7 5.7L10.59 10.6 5.7 15.49a1 1 0 101.42 1.42L12 11.83l4.88 4.88a1 1 0 001.42-1.42L13.41 10.6l4.89-4.89z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link
              href="/clientes"
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Clientes
            </Link>
            <Link
              href="/test"
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Test
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-black bg-opacity-75">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/clientes"
              className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-white bg-gray-800 focus:outline-none focus:bg-gray-700 focus:border-blue-500"
            >
              Clientes
            </Link>
            <Link
              href="/test"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:text-gray-300 hover:bg-gray-800 hover:border-gray-700"
            >
              Test
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
