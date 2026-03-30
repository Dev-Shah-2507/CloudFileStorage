import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = `/api/files`;
const AUTH_URL = `/api/auth`;

export const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({ totalFiles: 0, totalStorageUsed: 0 });
    const [uploading, setUploading] = useState(false);
    
    const navigate = useNavigate();

    // Check Auth and Fetch data when the dashboard loads
    useEffect(() => {
        const verifyAndLoad = async () => {
            try {
                const authRes = await fetch(`${AUTH_URL}/check-auth`, { credentials: 'include' });
                const authData = await authRes.json();

                if (!authData.success) {
                    navigate('/login');
                    return; 
                }
                fetchData();
            } catch (error) {
                console.error("Authentication check failed:", error);
                navigate('/login');
            }
        };

        verifyAndLoad();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const statsRes = await fetch(`${API_URL}/stats`, { credentials: 'include' });
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.stats);

            const filesRes = await fetch(API_URL, { credentials: 'include' });
            const filesData = await filesRes.json();
            
            if (filesData.success) {
                setFiles(filesData.files || filesData.data || []); 
            }
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
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success) {
                fetchData(); 
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
            e.target.value = null; 
        }
    };

    const handleDownload = async (fileId) => {
        try {
            const res = await fetch(`${API_URL}/download/${fileId}`, { credentials: 'include' });
            const data = await res.json();
            
            if (data.success) {
                window.open(data.url, '_blank');
                fetchData(); 
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
                fetchData(); 
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // NEW: Logout Function
    const handleLogout = async () => {
        try {
            await fetch(`${AUTH_URL}/logout`, { 
                method: 'POST', // or GET depending on your backend setup
                credentials: 'include' 
            });
            navigate('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', // Sleek dark green gradient
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: '#ecfdf5' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: '#34d399' }}>Secure Cloud</h1>
                    <button 
                        onClick={handleLogout} 
                        style={{ padding: '8px 16px', background: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                        onMouseOver={(e) => { e.target.style.background = '#fca5a5'; e.target.style.color = '#022c22'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#fca5a5'; }}
                    >
                        Log Out
                    </button>
                </div>
                
                {/* Stats Section (Glassmorphism Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ color: '#a7f3d0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Files</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{stats.totalFiles}</div>
                    </div>
                    <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ color: '#a7f3d0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Storage Used</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{(stats.totalStorageUsed / (1024 * 1024)).toFixed(2)} <span style={{fontSize: '1.2rem', color: '#6ee7b7'}}>MB</span></div>
                    </div>
                </div>

                {/* Upload Section */}
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '24px', borderRadius: '12px', marginBottom: '40px', border: '1px dashed rgba(52, 211, 153, 0.5)', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, color: '#6ee7b7', marginBottom: '15px' }}>Upload New File</h3>
                    <input 
                        type="file" 
                        onChange={handleUpload} 
                        disabled={uploading} 
                        style={{ color: 'white', cursor: 'pointer' }}
                    />
                    {uploading && <div style={{ marginTop: '15px', color: '#10b981', fontWeight: 'bold' }}>Uploading to AWS Sandbox... ⏳</div>}
                </div>

                {/* Files Table */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', color: '#34d399' }}>My Files</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(52, 211, 153, 0.3)' }}>
                                <th style={{ padding: '12px 10px', color: '#a7f3d0' }}>Name</th>
                                <th style={{ padding: '12px 10px', color: '#a7f3d0' }}>Size</th>
                                <th style={{ padding: '12px 10px', color: '#a7f3d0' }}>Downloads</th>
                                <th style={{ padding: '12px 10px', color: '#a7f3d0', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 10px', fontWeight: '500' }}>{file.originalName}</td>
                                    <td style={{ padding: '16px 10px', color: '#cbd5e1' }}>{(file.fileSize / 1024).toFixed(1)} KB</td>
                                    <td style={{ padding: '16px 10px', color: '#cbd5e1' }}>
                                        <span style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '4px 8px', borderRadius: '20px', color: '#6ee7b7', fontSize: '0.85rem' }}>
                                            {file.downloadCount}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 10px', textAlign: 'right' }}>
                                        <button onClick={() => handleDownload(file._id)} style={{ marginRight: '10px', padding: '6px 14px', background: '#10b981', color: '#022c22', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>Download</button>
                                        <button onClick={() => handleDelete(file._id)} style={{ padding: '6px 14px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {files.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px 0', textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>
                                        No files securely stored yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
            </div>
        </div>
    );
};