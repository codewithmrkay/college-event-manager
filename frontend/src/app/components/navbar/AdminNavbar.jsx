import React, { useState } from 'react';
import { LogoPart } from './LeftPart.jsx';
import { AdminMiddlePart } from './AdminMiddlePart.jsx';
import { AdminRightPart } from './AdminRightPart.jsx';
import { Menu, X } from 'lucide-react';

export const AdminNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className='relative w-full mx-auto max-w-6xl'>
            <div className='border-b-2 mt-2 border-gray-300 flex items-center justify-between pb-2 gap-2 w-full'>
                <div className='justify-start'>
                    <div className='flex items-center justify-center'>
                        <LogoPart />
                    </div>
                </div>

                <div className='w-full hidden lg:flex justify-center'>
                    <AdminMiddlePart />
                </div>

                <div className='justify-end flex items-center gap-2'>
                    <AdminRightPart isMobile={false} />

                    {/* Mobile Menu Button - Bold and big */}
                    <button
                        className='lg:hidden p-2 ml-1 text-gray-800 rounded-md hover:bg-gray-100 transition-colors'
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={36} strokeWidth={3} /> : <Menu size={36} strokeWidth={3} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className='lg:hidden absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-b-xl z-50 p-6 flex flex-col gap-6 mt-1 animate-in slide-in-from-top-2'>
                    <AdminMiddlePart isMobile={true} setIsMobileMenuOpen={setIsMobileMenuOpen} />

                    <div className='pt-4 border-t border-gray-200'>
                        <AdminRightPart isMobile={true} />
                    </div>
                </div>
            )}
        </div>
    );
};
