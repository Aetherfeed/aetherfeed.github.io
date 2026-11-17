import React, { useEffect } from 'react';
import { Construction } from 'lucide-react';

const Resources: React.FC = () => {
    useEffect(() => {
        document.title = 'Resources | Aetherfeed';
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 text-center">
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-6">
                <Construction aria-hidden="true" className="w-12 h-12 text-aether-500" />
            </div>
            <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
                Work in Progress
            </h1>
        </div>
    );
};

export default Resources;
