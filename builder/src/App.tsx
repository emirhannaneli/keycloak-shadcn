import React, { useState, useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import JSZip from 'jszip';
import 'xterm/css/xterm.css';

// --- SCREEN COMPONENTS (ICONS) ---
const IconGithub = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
const IconPlay = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconDownload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconLoading = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function App() {
    const [status, setStatus] = useState('idle'); // idle, booting, downloading, configuring, installing, building, packaging, ready, error
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [jarName, setJarName] = useState('');
    const [textInput, setTextInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState('');
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const webContainerRef = useRef(null);

    // Cloudflare Worker URL (if needed for proxying requests)
    const CLOUDFLARE_WORKER_URL = 'https://keycloak-shadcn-builder.emirhannaneli.workers.dev';

    // GitHub Repo Information
    const REPO_OWNER = 'emirhannaneli';
    const REPO_NAME = 'keycloak-shadcn';
    const BRANCH = 'main';
    const REPO_ZIP_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${BRANCH}.zip`;
    const PROXIED_REPO_URL = `${CLOUDFLARE_WORKER_URL}?url=${encodeURIComponent(REPO_ZIP_URL)}`;

    useEffect(() => {
        // Terminal Setup
        if (terminalRef.current && !xtermRef.current) {
            const term = new Terminal({
                convertEol: true,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                fontSize: 12,
                cursorBlink: true,
                theme: {
                    background: '#0f172a', // Slate 900 uyumlu
                    foreground: '#e2e8f0',
                }
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalRef.current);
            fitAddon.fit();
            xtermRef.current = term;

            // Fit terminal when window size changes
            window.addEventListener('resize', () => fitAddon.fit());

            term.writeln('\x1b[1;36m== Keycloakify Browser Builder v1.0 ==\x1b[0m');
            term.writeln('System ready. Click the button to start the build process.');
        }

        return () => {
            // Cleanup (if needed)
        };
    }, []);

    const log = (msg, type = 'info') => {
        if (!xtermRef.current) return;
        const colors = {
            info: '\x1b[36mℹ',    // Cyan
            success: '\x1b[32m✔', // Green
            error: '\x1b[31m✖',   // Red
            warn: '\x1b[33m⚠'    // Yellow
        };
        xtermRef.current.writeln(`${colors[type] || ''} ${msg}\x1b[0m`);
    };

    // Handle text input - only allow English letters, - and _
    const handleTextInputChange = (e) => {
        const value = e.target.value;
        // Only allow English letters (a-z, A-Z), numbers, hyphens (-) and underscores (_)
        const validPattern = /^[a-zA-Z0-9_-]*$/;
        if (validPattern.test(value)) {
            setTextInput(value);
        }
    };

    // Handle image file input - max 3MB
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError('');
        
        if (!file) {
            setImageFile(null);
            return;
        }

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            setImageError('Please select an image file.');
            setImageFile(null);
            e.target.value = '';
            return;
        }

        // Check file size (3MB = 3 * 1024 * 1024 bytes)
        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError('Image size must be less than 3MB.');
            setImageFile(null);
            e.target.value = '';
            return;
        }

        setImageFile(file);
    };

    /**
     * Converts ZIP Blob data into a tree structure compatible with WebContainer file system.
     */
    const convertZipToTree = async (zipContent) => {
        const zip = await JSZip.loadAsync(zipContent);
        const tree = {};
        const rootDir = Object.keys(zip.files)[0]?.split('/')[0] || 'root';

        for (const [relativePath, file] of Object.entries(zip.files)) {
            if (file.dir || !relativePath.startsWith(rootDir)) continue;

            // Remove root folder from path (e.g., keycloak-shadcn-main/package.json -> package.json)
            const pathParts = relativePath.split('/');
            pathParts.shift();
            if (pathParts.length === 0) continue;

            let currentLevel = tree;
            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                const isFile = i === pathParts.length - 1;

                if (isFile) {
                    const content = await file.async('uint8array');
                    currentLevel[part] = {
                        file: {
                            contents: content
                        }
                    };
                } else {
                    if (!currentLevel[part]) {
                        currentLevel[part] = { directory: {} };
                    }
                    currentLevel = currentLevel[part].directory;
                }
            }
        }
        return tree;
    };

    // Validate inputs before starting build
    const validateInputs = () => {
        if (!textInput || textInput.trim() === '') {
            throw new Error('Theme Name is required. Please enter a theme name.');
        }
        if (!imageFile) {
            throw new Error('Logo is required. Please select an image file.');
        }
    };

    // Update package.json name field
    const updatePackageJson = async (themeName) => {
        const packageJsonPath = 'package.json';
        const packageJsonContent = await webContainerRef.current.fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        packageJson.name = themeName;
        const updatedContent = JSON.stringify(packageJson, null, 2);
        await webContainerRef.current.fs.writeFile(packageJsonPath, updatedContent);
        log(`  ✓ package.json updated with theme name: ${themeName}`, 'success');
    };

    // Update src/config.ts themeName
    const updateConfigTs = async (themeName) => {
        const configPath = 'src/config.ts';
        const configContent = await webContainerRef.current.fs.readFile(configPath, 'utf8');
        // Replace themeName value using regex
        const updatedContent = configContent.replace(
            /themeName:\s*["'][^"']*["']/,
            `themeName: "${themeName}"`
        );
        await webContainerRef.current.fs.writeFile(configPath, updatedContent);
        log(`  ✓ src/config.ts updated with theme name: ${themeName}`, 'success');
    };

    // Replace logo files with uploaded image
    const replaceLogoFiles = async (imageFile) => {
        const imageArrayBuffer = await imageFile.arrayBuffer();
        const imageUint8Array = new Uint8Array(imageArrayBuffer);
        const imageSizeKB = (imageFile.size / 1024).toFixed(2);
        
        // Write to both logo paths
        await webContainerRef.current.fs.writeFile('public/img/keycloak-logo.png', imageUint8Array);
        await webContainerRef.current.fs.writeFile('public/img/keycloak-logo-text.png', imageUint8Array);
        log(`  ✓ Logo files replaced successfully (${imageSizeKB} KB)`, 'success');
    };

    // Recursively read directory and add files to zip
    const addDirectoryToZip = async (zip, dirPath, basePath = '') => {
        const entries = await webContainerRef.current.fs.readdir(dirPath);
        
        for (const entry of entries) {
            const fullPath = dirPath === 'dist_keycloak' ? `dist_keycloak/${entry}` : `${dirPath}/${entry}`;
            const zipPath = basePath ? `${basePath}/${entry}` : entry;
            
            try {
                // Try to read as file first
                const fileData = await webContainerRef.current.fs.readFile(fullPath);
                zip.file(zipPath, fileData);
            } catch (fileError) {
                // If readFile fails, try to read as directory
                try {
                    const subEntries = await webContainerRef.current.fs.readdir(fullPath);
                    // If readdir succeeds, it's a directory - recurse
                    await addDirectoryToZip(zip, fullPath, zipPath);
                } catch (dirError) {
                    // If both fail, log and continue
                    log(`Warning: Could not process ${fullPath}`, 'warn');
                }
            }
        }
    };

    // Zip all files in dist_keycloak folder
    const zipDistKeycloak = async (themeName) => {
        const zip = new JSZip();
        let fileCount = 0;
        
        // Enhanced addDirectoryToZip with file counting
        const addDirectoryToZipWithCount = async (zip, dirPath, basePath = '') => {
            const entries = await webContainerRef.current.fs.readdir(dirPath);
            
            for (const entry of entries) {
                const fullPath = dirPath === 'dist_keycloak' ? `dist_keycloak/${entry}` : `${dirPath}/${entry}`;
                const zipPath = basePath ? `${basePath}/${entry}` : entry;
                
                try {
                    // Try to read as file first
                    const fileData = await webContainerRef.current.fs.readFile(fullPath);
                    zip.file(zipPath, fileData);
                    fileCount++;
                    if (fileCount % 5 === 0) {
                        log(`  Processing files... (${fileCount} files added so far)`, 'info');
                    }
                } catch (fileError) {
                    // If readFile fails, try to read as directory
                    try {
                        const subEntries = await webContainerRef.current.fs.readdir(fullPath);
                        // If readdir succeeds, it's a directory - recurse
                        await addDirectoryToZipWithCount(zip, fullPath, zipPath);
                    } catch (dirError) {
                        // If both fail, log and continue
                        log(`  Warning: Could not process ${fullPath}`, 'warn');
                    }
                }
            }
        };
        
        await addDirectoryToZipWithCount(zip, 'dist_keycloak');
        log(`  All files processed (${fileCount} files total)`, 'success');
        
        log('  Generating ZIP archive...', 'info');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipSizeMB = (zipBlob.size / 1024 / 1024).toFixed(2);
        const zipUrl = URL.createObjectURL(zipBlob);
        const zipFileName = `${themeName}.zip`;
        log(`  ✓ ZIP archive created: ${zipFileName} (${zipSizeMB} MB)`, 'success');
        return { zipUrl, zipFileName };
    };

    const startProcess = async () => {
        if (status !== 'idle' && status !== 'error' && status !== 'ready') return;

        // Validate inputs
        try {
            validateInputs();
        } catch (error) {
            setStatus('error');
            log(error.message, 'error');
            return;
        }

        setDownloadUrl(null);
        setStatus('booting');
        xtermRef.current.clear();

        try {
            // 1. Start WebContainer
            if (!webContainerRef.current) {
                log('Step 1/7: Starting WebContainer... (usually takes 5-10 seconds)', 'info');
                webContainerRef.current = await WebContainer.boot();
                log('WebContainer ready!', 'success');
            } else {
                log('Step 1/7: WebContainer already initialized, skipping...', 'info');
            }

            // 2. Download Repository and Write to File System
            setStatus('downloading');
            log(`Step 2/7: Downloading GitHub Repository: ${REPO_OWNER}/${REPO_NAME}... (usually takes 10-30 seconds depending on connection)`, 'info');

            const response = await fetch(PROXIED_REPO_URL);
            if (!response.ok) throw new Error(`Repository could not be downloaded. Status: ${response.status}`);
            const zipBlob = await response.blob();
            const zipSizeMB = (zipBlob.size / 1024 / 1024).toFixed(2);
            log(`Repository downloaded successfully (${zipSizeMB} MB)`, 'success');

            log('Step 2/7: Creating file system structure... (usually takes 5-10 seconds)', 'info');
            const fileTree = await convertZipToTree(zipBlob);

            await webContainerRef.current.mount(fileTree);
            log('Files loaded into virtual environment.', 'success');

            // 3. Update Configuration Files
            setStatus('configuring');
            log('Step 3/7: Updating configuration files... (usually takes 1-2 seconds)', 'info');
            await updatePackageJson(textInput.trim());
            await updateConfigTs(textInput.trim());

            // 4. Replace Logo Files
            log('Step 4/7: Replacing logo files... (usually takes 1 second)', 'info');
            await replaceLogoFiles(imageFile);

            // 5. Install NPM Packages
            setStatus('installing');
            log('Step 5/7: Installing dependencies (npm install)... (usually takes 2-5 minutes, this is the longest step)', 'warn');
            log('Please be patient, this step downloads and installs all required packages...', 'info');

            const installProcess = await webContainerRef.current.spawn('npm', ['install']);

            // Pipe output to terminal
            installProcess.output.pipeTo(new WritableStream({
                write(data) { xtermRef.current.write(data); }
            }));

            const installExitCode = await installProcess.exit;
            if (installExitCode !== 0) {
                throw new Error(`npm install failed (Code: ${installExitCode}).`);
            }
            log('npm install completed successfully!', 'success');

            // 6. Build Process
            setStatus('building');
            log('Step 6/7: Building theme (npm run build-keycloak-theme)... (usually takes 1-3 minutes)', 'info');
            log('Compiling React components and generating Keycloak theme files...', 'info');

            const buildProcess = await webContainerRef.current.spawn('npm', ['run', 'build-keycloak-theme']);

            buildProcess.output.pipeTo(new WritableStream({
                write(data) { xtermRef.current.write(data); }
            }));

            const buildExitCode = await buildProcess.exit;
            if (buildExitCode !== 0) {
                throw new Error(`Build process failed (Code: ${buildExitCode}).`);
            }
            log('Build process completed successfully!', 'success');

            // 7. Zip dist_keycloak Contents
            setStatus('packaging');
            log('Step 7/7: Creating ZIP archive from dist_keycloak folder... (usually takes 5-15 seconds)', 'info');

            try {
                const { zipUrl, zipFileName } = await zipDistKeycloak(textInput.trim());
                
                setJarName(zipFileName);
                setDownloadUrl(zipUrl);
                setStatus('ready');
                log('ZIP archive created successfully!', 'success');
                log('Download link prepared. All steps completed!', 'success');

            } catch (err) {
                throw new Error(`Packaging error: ${err.message}`);
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            log(`CRITICAL ERROR: ${error.message}`, 'error');

            if (error.message.includes('SharedArrayBuffer')) {
                log('TIP: Make sure COOP and COEP headers are configured on the server.', 'warn');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 py-4 sm:py-6 px-0 font-sans flex flex-col w-full">
            <div className="w-full space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">

                {/* Header and Repo Information */}
                <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <img src="/logo.png" alt="Logo" className="h-12 sm:h-16 md:h-20 w-auto flex-shrink-0" />
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent pb-2 sm:pb-3 leading-tight break-words">
                                Keycloakify Browser Builder
                            </h1>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                Serverless, fully browser-based build tool.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 bg-slate-900/50 px-3 sm:px-4 py-2 rounded-full border border-slate-700 w-full md:w-auto justify-center md:justify-start">
                        <IconGithub />
                        <a
                            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-400 transition truncate"
                        >
                            {REPO_OWNER}/{REPO_NAME}
                        </a>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-700 space-y-4">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">Configuration</h2>
                    
                    {/* Text Input */}
                    <div className="space-y-2">
                        <label htmlFor="text-input" className="block text-sm font-medium text-slate-300">
                            Theme Name (English letters, numbers, - and _ only)
                        </label>
                        <input
                            id="text-input"
                            type="text"
                            value={textInput}
                            onChange={handleTextInputChange}
                            placeholder="e.g., test-test or test_test"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {textInput && (
                            <p className="text-xs text-slate-400">Current value: {textInput}</p>
                        )}
                    </div>

                    {/* Image File Input */}
                    <div className="space-y-2">
                        <label htmlFor="image-input" className="block text-sm font-medium text-slate-300">
                            Logo (Max 3MB)
                        </label>
                        <input
                            id="image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                        />
                        {imageError && (
                            <p className="text-xs text-red-400">{imageError}</p>
                        )}
                        {imageFile && !imageError && (
                            <div className="flex items-center space-x-3 text-xs text-slate-400">
                                <span>Selected: {imageFile.name}</span>
                                <span className="text-slate-500">({(imageFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Control Panel */}
                <div className="bg-slate-800 p-1 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
                    {/* Top Bar */}
                    <div className="bg-slate-800 p-3 sm:p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">

                        {/* Status Indicator */}
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm font-medium text-slate-400">STATUS:</span>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900 border ${
                                status === 'error' ? 'border-red-900/50 text-red-400' :
                                    status === 'ready' ? 'border-green-900/50 text-green-400' :
                                        'border-slate-700 text-slate-300'
                            }`}>
                <span className={`w-2 h-2 rounded-full ${
                    status === 'idle' ? 'bg-slate-500' :
                        status === 'error' ? 'bg-red-500' :
                            status === 'ready' ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'
                }`}></span>
                                <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            {(status === 'idle' || status === 'error' || status === 'ready') ? (
                                <button
                                    onClick={startProcess}
                                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition rounded-lg font-medium text-white shadow-lg shadow-blue-900/20 text-sm sm:text-base w-full sm:w-auto"
                                >
                                    <IconPlay />
                                    <span>Start Build</span>
                                </button>
                            ) : (
                                <button disabled className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-700 text-slate-400 cursor-not-allowed rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto">
                                    <IconLoading />
                                    <span>Processing...</span>
                                </button>
                            )}

                            {status === 'ready' && downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    download={jarName}
                                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 hover:bg-green-500 active:bg-green-700 transition rounded-lg font-medium text-white shadow-lg shadow-green-900/20 animate-pulse text-sm sm:text-base w-full sm:w-auto"
                                >
                                    <IconDownload />
                                    <span className="truncate">Download ZIP ({jarName})</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="relative group">
                        <div
                            ref={terminalRef}
                            className="h-[300px] sm:h-[400px] md:h-[500px] w-full bg-[#0f172a] p-2 sm:p-4 overflow-hidden"
                        />
                        {/* Terminal Overlay Gradient */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_-20px_20px_rgba(0,0,0,0.5)]"></div>
                    </div>
                </div>

                {/* Information Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs text-slate-500">
                    <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700/50">
                        <h3 className="font-semibold text-slate-400 mb-1 text-sm sm:text-base">Security Note</h3>
                        <p className="text-xs sm:text-sm">All operations take place in a virtual container (WebContainer) inside your browser. Your code is not sent to any server.</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700/50">
                        <h3 className="font-semibold text-slate-400 mb-1 text-sm sm:text-base">Requirements</h3>
                        <p className="text-xs sm:text-sm">For this application to work, the server must send the <code className="text-xs">Cross-Origin-Embedder-Policy: require-corp</code> header.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}