
import React, { useState, useCallback } from 'react';
import { ZapIcon } from './components/Icons';
import RepoForm from './components/RepoForm';
import FileList from './components/FileList';
import MeshViewer from './components/MeshViewer';

export interface MeshFile {
    path: string;
    url: string;
}

const App: React.FC = () => {
    const [meshFiles, setMeshFiles] = useState<MeshFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<MeshFile | null>(null);
    const [repoName, setRepoName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
        // Support both HTTPS (github.com/owner/repo) and SSH (github.com:owner/repo) formats
        const match = url.match(/github\.com[:/]([^/]+)\/([^/.\s]+)/);
        if (match && match[1] && match[2]) {
            return { owner: match[1], repo: match[2] };
        }
        return null;
    };

    const handleLoadRepository = useCallback(async (repoUrl: string) => {
        const repoInfo = parseGitHubUrl(repoUrl);
        if (!repoInfo) {
            setError("Invalid GitHub repository URL. Please use the HTTPS URL (e.g., https://github.com/user/repo) or SSH format.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMeshFiles([]);
        setSelectedFile(null);
        setRepoName('');

        try {
            const { owner, repo } = repoInfo;
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);

            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error("Repository not found. Please check the URL and ensure it is a public repository.");
                 }
                 throw new Error(`Failed to fetch repository data (status: ${response.status}).`);
            }

            const data = await response.json();
            if (data.truncated) {
                console.warn("File list is truncated. Some files may not be shown.");
            }
            
            const supportedExtensions = ['.obj', '.glb', '.gltf'];
            const files: MeshFile[] = data.tree
                .filter((item: any) => item.type === 'blob' && supportedExtensions.some(ext => item.path.toLowerCase().endsWith(ext)))
                .map((item: any) => ({
                    path: item.path,
                    url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${item.path}`,
                }));

            if (files.length === 0) {
                setError("No supported mesh files (.obj, .glb, .gltf) found in this repository.");
            } else {
                setMeshFiles(files);
                setRepoName(`${owner}/${repo}`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleReset = () => {
        setMeshFiles([]);
        setSelectedFile(null);
        setError(null);
        setRepoName('');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col antialiased font-sans">
            <header className="p-4 flex justify-between items-center border-b border-gray-800 shadow-md bg-gray-900/80 backdrop-blur-sm z-10 w-full flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <ZapIcon className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                        GitHub Mesh Visualizer
                    </h1>
                </div>
            </header>

            <main className="flex-grow flex flex-col p-4 md:p-6 overflow-hidden">
                {meshFiles.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Visualize 3D Meshes from GitHub</h2>
                        <p className="text-lg text-gray-400 mb-8 max-w-2xl">
                            Enter a public GitHub repository URL to browse and view your <code className="bg-gray-800 text-indigo-300 px-2 py-1 rounded-md font-mono">.obj</code>, <code className="bg-gray-800 text-indigo-300 px-2 py-1 rounded-md font-mono">.glb</code>, or <code className="bg-gray-800 text-indigo-300 px-2 py-1 rounded-md font-mono">.gltf</code> files.
                        </p>
                        <RepoForm onSubmit={handleLoadRepository} isLoading={isLoading} />
                         {error && <p className="mt-4 text-red-400 animate-pulse">{error}</p>}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
                        <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                           <FileList 
                                files={meshFiles} 
                                onSelect={setSelectedFile}
                                selectedFile={selectedFile}
                                repoName={repoName}
                                onReset={handleReset}
                            />
                        </aside>
                        <section className="flex-grow bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl relative">
                           {selectedFile ? (
                                <MeshViewer url={selectedFile.url} key={selectedFile.path} />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400">
                                   <p>Select a file from the list to view it</p>
                               </div>
                           )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
