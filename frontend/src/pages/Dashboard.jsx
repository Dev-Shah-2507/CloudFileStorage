import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- NEW: Import useNavigate

const BASE = import.meta.env.VITE_API_URL;

const API_URL = `/api/files`;
const AUTH_URL = `/api/auth`;

export const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({ totalFiles: 0, totalStorageUsed: 0 });
    const [uploading, setUploading] = useState(false);
    
    const navigate = useNavigate(); // <-- NEW: Initialize navigate

    // Check Auth and Fetch data when the dashboard loads
    useEffect(() => {
        const verifyAndLoad = async () => {
            try {
                // 1. Check if the user is logged in
                const authRes = await fetch(`${AUTH_URL}/check-auth`, { credentials: 'include' });
                const authData = await authRes.json();

                if (!authData.success) {
                    // If not authenticated, kick them back to login page
                    navigate('/login');
                    return; 
                }

                // 2. If authenticated, fetch their files and stats
                fetchData();
            } catch (error) {
                console.error("Authentication check failed:", error);
                navigate('/login'); // Redirect to login on error
            }
        };

        verifyAndLoad();
    }, [navigate]);

    const fetchData = async () => {
        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_URL}/stats`, { credentials: 'include' });
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.stats);

            // Fetch Files
            const filesRes = await fetch(`${API_URL}/`, { credentials: 'include' });
            const filesData = await filesRes.json();
            if (filesData.success) setFiles(filesData.files);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include' // This automatically sends your JWT cookie!
            });
            const data = await res.json();
            
            if (data.success) {
                alert('File uploaded successfully!');
                fetchData(); // Refresh the list and stats
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
            e.target.value = null; // Clear the input
        }
    };

    const handleDownload = async (fileId) => {
        try {
            const res = await fetch(`${API_URL}/download/${fileId}`, { credentials: 'include' });
            const data = await res.json();
            
            if (data.success) {
                // Open the GCP Signed URL in a new tab to start the download
                window.open(data.url, '_blank');
                fetchData(); // Refresh to update the download count
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const res = await fetch(`${API_URL}/delete/${fileId}`, { 
                method: 'DELETE',
                credentials: 'include' 
            });
            const data = await res.json();

            if (data.success) {
                fetchData(); // Refresh the list and stats
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
            <h1>My Cloud Storage</h1>
            
            {/* Stats Section */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                <div><strong>Total Files:</strong> {stats.totalFiles}</div>
                <div><strong>Storage Used:</strong> {(stats.totalStorageUsed / (1024 * 1024)).toFixed(2)} MB</div>
            </div>

            {/* Upload Section */}
            <div style={{ marginBottom: '30px' }}>
                <input type="file" onChange={handleUpload} disabled={uploading} style={{ color: 'white' }}/>
                {uploading && <span> Uploading to Cloud...</span>}
            </div>

            {/* Files Table */}
            <h2>My Files</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
                        <th style={{ paddingBottom: '10px' }}>Name</th>
                        <th style={{ paddingBottom: '10px' }}>Size</th>
                        <th style={{ paddingBottom: '10px' }}>Downloads</th>
                        <th style={{ paddingBottom: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(file => (
                        <tr key={file._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '15px 0' }}>{file.originalName}</td>
                            <td>{(file.fileSize / 1024).toFixed(1)} KB</td>
                            <td>{file.downloadCount}</td>
                            <td>
                                <button onClick={() => handleDownload(file._id)} style={{ marginRight: '10px', padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download</button>
                                <button onClick={() => handleDelete(file._id)} style={{ padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr><td colSpan="4" style={{ padding: '20px 0', textAlign: 'center', fontStyle: 'italic' }}>No files uploaded yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};