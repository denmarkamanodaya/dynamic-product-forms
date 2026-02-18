import React, { useState, useEffect } from 'react';
import { PostService, CaseService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faPaperPlane, faSmile, faComment } from '@fortawesome/free-solid-svg-icons';
import './FireTwitPage.css';

const FireTwitPage = ({ onNavigate, currentUser, onSelectCase }) => {
    const [posts, setPosts] = useState([]);
    const [cases, setCases] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteResults, setAutocompleteResults] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [comments, setComments] = useState({}); // Comments by postId
    const [newComment, setNewComment] = useState({}); // New comment input by postId
    const [loadingComments, setLoadingComments] = useState({});

    useEffect(() => {
        fetchPostsAndComments();
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await CaseService.list();
            console.log("Cases response:", response);

            let caseList = [];
            if (Array.isArray(response)) {
                caseList = response;
            } else if (response.data && Array.isArray(response.data)) {
                caseList = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                caseList = response.data.data;
            } else {
                console.warn("Unexpected cases data format:", response);
            }
            setCases(caseList);
        } catch (error) {
            console.error("Error fetching cases for tagging", error);
            setCases([]); // Fallback to empty to prevent crash
        }
    };

    // Handle textarea change and @ autocomplete
    const handleTextChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setNewPost(value);
        setCursorPosition(cursorPos);

        // Detect @ mention
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const searchQuery = textBeforeCursor.substring(lastAtIndex + 1);
            // Check if there's a space between @ and cursor (stop autocomplete)
            if (searchQuery.includes(' ')) {
                setShowAutocomplete(false);
                return;
            }

            // Filter active cases (not archived, not completed)
            const activeCases = cases.filter(c =>
                c.status !== 'completed' &&
                (c.status || '').toUpperCase() !== 'ARCHIVED'
            );

            if (searchQuery === '') {
                // Show all active cases
                setAutocompleteResults(activeCases);
                setShowAutocomplete(true);
            } else {
                // Filter by search query
                const filtered = activeCases.filter(c => {
                    const caseId = String(c.caseId || c._id).toLowerCase();
                    const clientName = (c.data?.clientDetails?.clientName || '').toLowerCase();
                    const query = searchQuery.toLowerCase();
                    return caseId.includes(query) || clientName.includes(query);
                });
                setAutocompleteResults(filtered);
                setShowAutocomplete(filtered.length > 0);
            }
        } else {
            setShowAutocomplete(false);
        }
    };

    // Handle autocomplete selection
    const handleAutocompleteSelect = (selectedCase) => {
        const textBeforeCursor = newPost.substring(0, cursorPosition);
        const textAfterCursor = newPost.substring(cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const shortId = String(selectedCase.caseId || selectedCase._id).slice(-5).toUpperCase();
            const newText =
                textBeforeCursor.substring(0, lastAtIndex) +
                `@${shortId} ` +
                textAfterCursor;
            setNewPost(newText);
        }

        setShowAutocomplete(false);
    };



    // Fetch comments for a specific post
    const fetchCommentsForPost = async (postId) => {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
            const response = await PostService.listComments(postId);
            const commentList = Array.isArray(response) ? response : response.data || [];
            setComments(prev => ({ ...prev, [postId]: commentList }));
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments(prev => ({ ...prev, [postId]: [] }));
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        const commentText = newComment[postId];
        if (!commentText || !commentText.trim()) return;

        const createdBy = currentUser ? {
            email: currentUser.emailAddress,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            avatarUrl: currentUser.avatarUrl,
            metadata: currentUser.metadata
        } : "Me";

        try {
            const response = await PostService.createComment({
                postId,
                content: commentText,
                createdBy
            });

            // Add new comment to local state
            const newCommentObj = response.data || response;
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newCommentObj]
            }));

            // Clear input
            setNewComment(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
        }
    };

    const fetchPostsAndComments = async () => {
        setLoading(true);
        try {
            const response = await PostService.list();
            // If API returns empty or error, fallback to mock for demo if needed, 
            // but primarily trust API.
            let postList = [];
            if (Array.isArray(response)) {
                postList = response;
            } else if (response.data && Array.isArray(response.data)) {
                postList = response.data;
            }
            // Filter out ARCHIVED posts
            const filteredPosts = postList.filter(p => (p.status || '').toUpperCase() !== 'ARCHIVED');
            setPosts(filteredPosts);

            // Auto-fetch comments for all posts
            filteredPosts.forEach(post => {
                const postId = post.id || post.SK;
                fetchCommentsForPost(postId);
            });
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
            await PostService.create({
                content: newPost,
                createdBy: createdBy, // Pass the full createdBy object
                caseId: undefined
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
                    customStyle = {
                        backgroundColor: meta.avatarColor,
                        backgroundImage: 'none'
                    };
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
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !showAutocomplete) {
                                e.preventDefault();
                                handlePostSubmit(e);
                            }
                        }}
                        rows={3}
                    />
                    {showAutocomplete && autocompleteResults.length > 0 && (
                        <div className="autocomplete-dropdown">
                            {autocompleteResults.slice(0, 5).map((caseItem) => (
                                <div
                                    key={caseItem.caseId || caseItem._id}
                                    className="autocomplete-item"
                                    onClick={() => handleAutocompleteSelect(caseItem)}
                                >
                                    <div className="autocomplete-case-id">
                                        #{String(caseItem.caseId || caseItem._id).slice(-5).toUpperCase()}
                                    </div>
                                    <div className="autocomplete-client-name">
                                        {caseItem.data?.clientDetails?.clientName || 'Unknown Client'}
                                    </div>
                                    <div className="autocomplete-status">
                                        <span className={`status-badge status-${caseItem.status?.toLowerCase() || 'default'}`}>
                                            {caseItem.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                        <button className="action-btn">
                                            <FontAwesomeIcon icon={faComment} />
                                            {(comments[post.id || post.SK]?.length || 0) > 0 && (
                                                <span className="comment-count">{comments[post.id || post.SK]?.length}</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Comment Section - Always Visible */}
                                    <div className="comment-section">
                                        {loadingComments[post.id || post.SK] ? (
                                            <div className="loading-comments">Loading comments...</div>
                                        ) : (
                                            <>
                                                {/* Comment List */}
                                                {comments[post.id || post.SK]?.length > 0 && (
                                                    <div className="comments-list">
                                                        {comments[post.id || post.SK].map((comment, idx) => {
                                                            const commentCreator = typeof comment.createdBy === 'object'
                                                                ? `${comment.createdBy.firstName} ${comment.createdBy.lastName || ''}`.trim()
                                                                : comment.createdBy;

                                                            return (
                                                                <div key={idx} className="comment-item">
                                                                    {renderUserAvatar(comment.createdBy)}
                                                                    <div className="comment-body">
                                                                        <div className="comment-meta">
                                                                            <span className="comment-author">{commentCreator}</span>
                                                                            <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                                                        </div>
                                                                        <div className="comment-text">{comment.content}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Comment Input */}
                                                <form onSubmit={(e) => handleCommentSubmit(e, post.id || post.SK)} className="comment-input-form">
                                                    <input
                                                        type="text"
                                                        className="comment-input"
                                                        placeholder="Write a comment..."
                                                        value={newComment[post.id || post.SK] || ''}
                                                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id || post.SK]: e.target.value }))}
                                                    />
                                                    <button type="submit" className="comment-submit-btn" disabled={!newComment[post.id || post.SK]?.trim()}>
                                                        <FontAwesomeIcon icon={faPaperPlane} />
                                                    </button>
                                                </form>
                                            </>
                                        )}
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
