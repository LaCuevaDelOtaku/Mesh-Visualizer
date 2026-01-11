import React, { useState, useCallback, useEffect } from 'react';
import { ZapIcon } from './components/Icons';
import RepoForm from './components/RepoForm';
import FileList from './components/FileList';
import MeshViewer from './components/MeshViewer';

export interface MeshFile {
    path: string;
    url: string;
}

const STORAGE_KEY = 'mesh_viz_recent_repos';
const DEFAULT_REPO = 'https://github.com/LaCuevaDelOtaku/test-meshes';

const App: React.FC = () => {
    const [meshFiles, setMeshFiles] = useState<MeshFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<MeshFile | null>(null);
    const [repoName, setRepoName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recentRepos, setRecentRepos] = useState<string[]>([]);

    // Load recent repos from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setRecentRepos(JSON.parse(saved));
            } else {
                setRecentRepos([DEFAULT_REPO]);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const saveToHistory = (url: string) => {
        setRecentRepos(prev => {
            const cleanedUrl = url.trim();
            const filtered = prev.filter(u => u !== cleanedUrl);
            const updated = [cleanedUrl, ...filtered].slice(0, 6); // Keep top 6
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

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
                saveToHistory(repoUrl);
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
        <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col antialiased font-sans selection:bg-white selection:text-black">
            <header className="p-4 flex justify-between items-center border-b border-zinc-800 shadow-xl bg-zinc-950/80 backdrop-blur-md z-10 w-full flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-zinc-800 rounded-md border border-zinc-700">
                         <ZapIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                        Mesh<span className="text-zinc-500">Viz</span>
                    </h1>
                </div>
            </header>

            <main className="flex-grow flex flex-col p-4 md:p-6 overflow-hidden">
                {meshFiles.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-600 tracking-tighter">
                            VISUALIZE <br/> GIT MESHES
                        </h2>
                        <p className="text-lg text-zinc-500 mb-10 max-w-2xl font-light">
                            Enter a GitHub repository to load <span className="text-zinc-300 font-medium">.obj</span>, <span className="text-zinc-300 font-medium">.glb</span>, or <span className="text-zinc-300 font-medium">.gltf</span> assets instantly.
                        </p>
                        <RepoForm 
                            onSubmit={handleLoadRepository} 
                            isLoading={isLoading} 
                            recentRepos={recentRepos}
                        />
                         {error && <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-md animate-in fade-in slide-in-from-bottom-2">{error}</div>}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
                        <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
                           <FileList 
                                files={meshFiles} 
                                onSelect={setSelectedFile}
                                selectedFile={selectedFile}
                                repoName={repoName}
                                onReset={handleReset}
                            />
                        </aside>
                        <section className="flex-grow bg-black rounded-xl overflow-hidden border border-zinc-800 relative shadow-2xl">
                           {selectedFile ? (
                                <MeshViewer url={selectedFile.url} key={selectedFile.path} />
                           ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                                   <div className="w-16 h-16 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center">
                                     <ZapIcon className="w-6 h-6 opacity-20" />
                                   </div>
                                   <p className="font-mono text-sm uppercase tracking-widest">Select a file to render</p>
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