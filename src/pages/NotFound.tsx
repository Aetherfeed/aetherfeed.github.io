import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound: React.FC = () => {
    useEffect(() => {
        document.title = 'Page Not Found | Aetherfeed';
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 text-center">
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-6">
                <Compass aria-hidden="true" className="w-12 h-12 text-aether-500" />
            </div>
            <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-3">
                Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md mb-6 text-pretty">
                The page you requested does not exist. Return to the plugin feed to continue browsing.
            </p>
            <Link
                to="/"
                className="px-5 py-2.5 text-sm font-semibold rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-aether-600 dark:hover:bg-aether-200 transition-colors"
            >
                Back to Plugin Feed
            </Link>
        </div>
    );
};

export default NotFound;
