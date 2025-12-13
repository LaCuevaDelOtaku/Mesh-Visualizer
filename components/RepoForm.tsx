
import React, { useState } from 'react';
import { GitHubIcon, LoaderIcon } from './Icons';

interface RepoFormProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

const RepoForm: React.FC<RepoFormProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
                <GitHubIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/user/repository"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    aria-label="GitHub Repository URL"
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-900 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : (
                    'Load Meshes'
                )}
            </button>
        </form>
    );
};

export default RepoForm;
