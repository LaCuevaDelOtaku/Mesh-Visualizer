
import React from 'react';
import type { MeshFile } from '../App';
import { FileCodeIcon, GitHubIcon } from './Icons';

interface FileListProps {
    files: MeshFile[];
    selectedFile: MeshFile | null;
    repoName: string;
    onSelect: (file: MeshFile) => void;
    onReset: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, selectedFile, repoName, onSelect, onReset }) => {

    const getFileExtension = (path: string) => {
        return path.split('.').pop()?.toUpperCase() || '';
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-300 mb-2 break-all">
                    <GitHubIcon className="w-6 h-6 flex-shrink-0"/>
                    <span className="truncate">{repoName}</span>
                </div>
                 <button 
                    onClick={onReset}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 text-sm"
                >
                    Load Another Repository
                </button>
            </div>
            <p className="text-sm text-gray-400 mb-3 flex-shrink-0">{files.length} mesh file(s) found</p>
            <ul className="flex-grow overflow-y-auto space-y-2 -mr-2 pr-2">
                {files.map((file) => (
                    <li key={file.path}>
                        <button
                            onClick={() => onSelect(file)}
                            className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${
                                selectedFile?.path === file.path
                                    ? 'bg-indigo-500/30 text-indigo-200'
                                    : 'hover:bg-gray-700/50 text-gray-300'
                            }`}
                        >
                            <FileCodeIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                            <span className="flex-grow truncate text-sm" title={file.path}>
                                {file.path}
                            </span>
                            <span className="flex-shrink-0 text-xs font-mono px-1.5 py-0.5 rounded bg-gray-600 text-gray-300">
                                {getFileExtension(file.path)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
