import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFire, faComment, faSmile } from '@fortawesome/free-solid-svg-icons';
import config from '../config';
import './FireTwitPage.css';

const FireTwitPage = ({ onNavigate, currentUser, onSelectCase }) => {
    const [posts, setPosts] = useState([]);
    const [cases, setCases] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            console.log("Fetching cases from:", config.caseList);
            const response = await axios.get(config.caseList);
            console.log("Cases response:", response.data);

            if (response.data && Array.isArray(response.data)) {
                setCases(response.data);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Handle wrapped data structure if applicable
                setCases(response.data.data);
            } else {
                console.warn("Unexpected cases data format:", response.data);
                setCases([]);
            }
        } catch (error) {
            console.error("Error fetching cases for tagging", error);
            setCases([]); // Fallback to empty to prevent crash
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(config.listPosts);
            // If API returns empty or error, fallback to mock for demo if needed, 
            // but primarily trust API.
            if (response.data && Array.isArray(response.data)) {
                setPosts(response.data);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Error fetching posts", error);
            // Fallback mock data for demo if API fails
            setPosts([
                { id: 1, content: "Just closed a big deal! check out @4221A it was huge.", createdBy: "John Doe", time: "10 mins ago", tags: ["4221A"] },
                { id: 2, content: "Anyone seen the contract for @551B?", createdBy: "Sarah Smith", time: "1 hour ago", tags: ["551B"] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const tempId = Date.now().toString(); // Use string ID for consistency
        const tags = (newPost.match(/@(\w+)/g) || []).map(t => t.substring(1));

        // Optimistic update
        const createdBy = currentUser ? {
            email: currentUser.emailAddress,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            avatarUrl: currentUser.avatarUrl,
            metadata: currentUser.metadata
        } : "Me";

        const optimisticPost = {
            PK: `POST#ALL`, // Matching backend structure
            SK: `TIME#${new Date().toISOString()}`,
            id: tempId,
            content: newPost,
            createdBy: createdBy,
            createdAt: new Date().toISOString(),
            time: "Just now",
            tags: tags,
            reactionCounter: 0
        };

        setPosts([optimisticPost, ...posts]);
        setNewPost('');

        try {
            await axios.post(config.createPost, {
                content: optimisticPost.content,
                createdBy: optimisticPost.createdBy
            });
            // Optionally refetch to get server-side timestamp/ID if needed
            // fetchPosts(); 
        } catch (error) {
            console.error("Error creating post", error);
            // Revert optimistic update on failure would go here
            alert("Failed to post. Please try again.");
        }
    };

    // Helper to find full case ID from short tag
    const getFullCaseId = (shortTag) => {
        if (!cases || cases.length === 0) return shortTag;

        const tagUpper = shortTag.toUpperCase();

        const foundCase = cases.find(c => {
            const fullId = String(c.caseId || c._id || '');
            return fullId.toUpperCase().endsWith(tagUpper);
        });

        return foundCase ? (foundCase.caseId || foundCase._id) : shortTag;
    };

    const renderContent = (content) => {
        if (!content) return null;
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, index) => {
            if (part.match(/^@\w+$/)) {
                const shortId = part.substring(1);
                const fullId = getFullCaseId(shortId);
                return (
                    <span
                        key={index}
                        className="case-tag"
                        onClick={() => {
                            if (fullId !== shortId && onSelectCase) {
                                onSelectCase(fullId);
                            } else {
                                // Fallback if no full ID found or no functionality
                                console.warn("Case ID not found or onSelectCase missing:", fullId);
                            }
                        }}
                        title={fullId !== shortId ? `View Case ${fullId}` : `Case ID ending in ${shortId} not found`}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    // Helper to format timestamp
    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
        } catch (e) {
            return isoString;
        }
    };

    // Helper to generate consistent color from string
    const stringToColor = (str) => {
        if (!str) return '#ccc';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    // Helper to render avatar (consistent with CaseList)
    const renderUserAvatar = (user) => {
        if (!user) return <div className="post-avatar unknown">?</div>;

        // Handle legacy string data
        if (typeof user === 'string') {
            // Fallback to name-based color for legacy strings
            return (
                <div
                    className="post-avatar"
                    style={{ backgroundColor: stringToColor(user) }}
                    title={user}
                >
                    {getInitials(user)}
                </div>
            );
        }

        if (user.avatarUrl) {
            return <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="post-avatar image" />;
        }

        let customStyle = {};
        if (user.metadata) {
            try {
                // Handle both object and string metadata (API might return either depending on serialization)
                const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                if (meta && meta.avatarColor) {
                    customStyle = { background: meta.avatarColor }; // Override gradient
                } else {
                    customStyle = { background: stringToColor(user.firstName || 'User') };
                }
            } catch (e) {
                customStyle = { background: stringToColor(user.firstName || 'User') };
            }
        } else {
            customStyle = { background: stringToColor(user.firstName || 'User') };
        }

        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unknown';
        const initialStr = (firstName && lastName) ? `${firstName[0]}${lastName[0]}`.toUpperCase() : getInitials(firstName || '??');

        return (
            <div
                className="post-avatar"
                title={name}
                style={customStyle}
            >
                {initialStr}
            </div>
        );
    };

    return (
        <div className="firetwit-page">
            <div className="firetwit-header">
                <h1><FontAwesomeIcon icon={faFire} className="fire-icon" /> FireTwit Feed</h1>
            </div>

            <div className="firetwit-composer">
                <form onSubmit={handlePostSubmit}>
                    <textarea
                        className="post-input"
                        placeholder="What's happening? Use @CaseID to link cases..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handlePostSubmit(e);
                            }
                        }}
                        rows={3}
                    />
                    <div className="composer-footer">
                        <button type="submit" className="post-btn" disabled={!newPost.trim()}>
                            Tweet <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </form>
            </div>

            <div className="firetwit-feed">
                {loading ? (
                    <div className="loading">Loading feed...</div>
                ) : (
                    posts.map(post => {
                        const creatorName = typeof post.createdBy === 'object'
                            ? `${post.createdBy.firstName} ${post.createdBy.lastName || ''}`.trim()
                            : post.createdBy;

                        return (
                            <div key={post.id} className="post-card">
                                {renderUserAvatar(post.createdBy)}
                                <div className="post-body">
                                    <div className="post-meta">
                                        <span className="post-author">{creatorName}</span>
                                        <span className="post-time">{formatTime(post.createdAt || post.time)}</span>
                                    </div>
                                    <div className="post-content">
                                        {renderContent(post.content)}
                                    </div>
                                    <div className="post-actions">
                                        <button className="action-btn"><FontAwesomeIcon icon={faSmile} /></button>
                                        <button className="action-btn"><FontAwesomeIcon icon={faComment} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FireTwitPage;
