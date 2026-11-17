import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 dark:bg-void-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
            <a
                href="#main-content"
                className="visually-hidden fixed top-3 left-3 z-60 px-4 py-2 rounded-xl bg-aether-600 text-white text-sm font-semibold shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-aether-400"
            >
                Skip to main content
            </a>

            <div
                id="scroll-top-sentinel"
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 h-[300px] w-px"
            />

            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-aether-500/20 dark:bg-aether-600/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-float delay-1000" />
            </div>

            <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <main id="main-content" tabIndex={-1} className="grow z-10 pt-16 outline-none">
                <Outlet context={{ searchTerm, setSearchTerm }} />
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Layout;
