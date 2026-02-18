import React, { useState, useEffect } from 'react';
import { PostService, CaseService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faPaperPlane, faSmile, faComment } from '@fortawesome/free-solid-svg-icons';
import './FireTwitWidget.css';

const FireTwitWidget = ({ currentUser, onSelectCase }) => {
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
            let caseList = [];
            if (Array.isArray(response)) {
                caseList = response;
            } else if (response.data && Array.isArray(response.data)) {
                caseList = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                caseList = response.data.data;
            }
            setCases(caseList);
        } catch (error) {
            console.error("Error fetching cases for tagging", error);
        }
    };

    const fetchCommentsForPost = async (postId) => {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
            const response = await PostService.listComments(postId);
            const commentList = Array.isArray(response) ? response : response.data || [];
            setComments(prev => ({ ...prev, [postId]: commentList }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const fetchPostsAndComments = async () => {
        setLoading(true);
        try {
            const response = await PostService.list();
            let postList = [];
            if (Array.isArray(response)) {
                postList = response;
            } else if (response.data && Array.isArray(response.data)) {
                postList = response.data;
            }
            const filteredPosts = postList.filter(p => (p.status || '').toUpperCase() !== 'ARCHIVED');
            setPosts(filteredPosts);

            filteredPosts.forEach(post => {
                const postId = post.id || post.SK;
                fetchCommentsForPost(postId);
            });
        } catch (error) {
            console.error("Error fetching posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setNewPost(value);
        setCursorPosition(cursorPos);

        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const searchQuery = textBeforeCursor.substring(lastAtIndex + 1);
            if (searchQuery.includes(' ')) {
                setShowAutocomplete(false);
                return;
            }

            const activeCases = cases.filter(c =>
                c.status !== 'completed' &&
                (c.status || '').toUpperCase() !== 'ARCHIVED'
            );

            if (searchQuery === '') {
                setAutocompleteResults(activeCases);
                setShowAutocomplete(true);
            } else {
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

    const handleAutocompleteSelect = (selectedCase) => {
        const textBeforeCursor = newPost.substring(0, cursorPosition);
        const textAfterCursor = newPost.substring(cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const shortId = String(selectedCase.caseId || selectedCase._id).slice(-4).toUpperCase();
            const newText =
                textBeforeCursor.substring(0, lastAtIndex) +
                `@${shortId} ` +
                textAfterCursor;
            setNewPost(newText);
        }
        setShowAutocomplete(false);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const tempId = Date.now().toString();
        const tags = (newPost.match(/@(\w+)/g) || []).map(t => t.substring(1));

        const createdBy = currentUser ? {
            email: currentUser.emailAddress,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            avatarUrl: currentUser.avatarUrl,
            metadata: currentUser.metadata
        } : "Me";

        const optimisticPost = {
            PK: `POST#ALL`,
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
                createdBy: createdBy
            });
        } catch (error) {
            console.error("Error creating post", error);
        }
    };

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
            const newCommentObj = response.data || response;
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newCommentObj]
            }));
            setNewComment(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

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
                        className="ft-widget-tag"
                        onClick={() => {
                            if (fullId !== shortId && onSelectCase) {
                                onSelectCase(fullId);
                            }
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const stringToColor = (str) => {
        if (!str) return '#ccc';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    const renderUserAvatar = (user, size = 'md') => {
        if (!user) return <div className={`ft-widget-avatar size-${size} unknown`}>?</div>;

        if (typeof user === 'string') {
            return (
                <div
                    className={`ft-widget-avatar size-${size}`}
                    style={{ backgroundColor: stringToColor(user) }}
                >
                    {user.substring(0, 2).toUpperCase()}
                </div>
            );
        }

        if (user.avatarUrl) {
            return <img src={user.avatarUrl} alt="Avatar" className={`ft-widget-avatar size-${size} image`} />;
        }

        let customStyle = {};
        const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata || '{}') : (user.metadata || {});
        customStyle = {
            backgroundColor: meta.avatarColor || stringToColor(user.firstName || 'User'),
            backgroundImage: 'none'
        };

        const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';

        return (
            <div className={`ft-widget-avatar size-${size}`} style={customStyle}>
                {initials}
            </div>
        );
    };

    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diff = (now - date) / 1000; // in seconds

            if (diff < 60) return 'Just now';
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return 'Recently';
        }
    };

    return (
        <div className="firetwit-widget">
            <div className="ft-widget-header">
                <h4 className="ft-widget-title">
                    <FontAwesomeIcon icon={faFire} className="fire-icon" /> Team Activity
                </h4>
            </div>

            <div className="ft-widget-composer">
                <form onSubmit={handlePostSubmit}>
                    <div className="ft-widget-input-wrapper">
                        <textarea
                            className="ft-widget-input"
                            placeholder="Post activity... use @case"
                            value={newPost}
                            onChange={handleTextChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !showAutocomplete) {
                                    e.preventDefault();
                                    handlePostSubmit(e);
                                }
                            }}
                            rows={2}
                        />
                        {showAutocomplete && (
                            <div className="ft-widget-autocomplete">
                                {autocompleteResults.slice(0, 3).map((caseItem) => (
                                    <div
                                        key={caseItem.caseId || caseItem._id}
                                        className="ft-autocomplete-item"
                                        onClick={() => handleAutocompleteSelect(caseItem)}
                                    >
                                        <span className="ft-ac-id">#{String(caseItem.caseId || caseItem._id).slice(-4).toUpperCase()}</span>
                                        <span className="ft-ac-name">{caseItem.data?.clientDetails?.clientName?.split(' ')[0] || 'Client'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="ft-widget-composer-actions">
                        <button type="submit" className="ft-widget-send-btn" disabled={!newPost.trim()}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </form>
            </div>

            <div className="ft-widget-feed">
                {loading ? (
                    <div className="ft-widget-loading">Loading...</div>
                ) : (
                    posts.map(post => {
                        const creatorName = typeof post.createdBy === 'object'
                            ? `${post.createdBy.firstName} ${post.createdBy.lastName || ''}`.trim()
                            : post.createdBy;

                        const postId = post.id || post.SK;

                        return (
                            <div key={postId} className="ft-widget-post">
                                <div className="ft-widget-post-main">
                                    {renderUserAvatar(post.createdBy, 'sm')}
                                    <div className="ft-widget-post-body">
                                        <div className="ft-widget-post-meta">
                                            <span className="ft-author-name">{creatorName}</span>
                                            <span className="ft-post-time">{formatTime(post.createdAt || post.time)}</span>
                                        </div>
                                        <div className="ft-widget-post-content">
                                            {renderContent(post.content)}
                                        </div>
                                        <div className="ft-widget-post-actions">
                                            <button className="ft-action-icon"><FontAwesomeIcon icon={faSmile} /></button>
                                            <button className="ft-action-icon">
                                                <FontAwesomeIcon icon={faComment} />
                                                {(comments[postId]?.length || 0) > 0 && (
                                                    <span className="ft-comment-count">{comments[postId].length}</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Comments Area */}
                                {comments[postId]?.length > 0 && (
                                    <div className="ft-widget-comments-list">
                                        {comments[postId].slice(-2).map((comment, idx) => (
                                            <div key={idx} className="ft-widget-comment-item">
                                                <span className="ft-comment-author">{typeof comment.createdBy === 'object' ? comment.createdBy.firstName : comment.createdBy}:</span>
                                                <span className="ft-comment-text">{comment.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={(e) => handleCommentSubmit(e, postId)} className="ft-widget-comment-form">
                                    <input
                                        type="text"
                                        placeholder="Reply..."
                                        className="ft-widget-comment-input"
                                        value={newComment[postId] || ''}
                                        onChange={(e) => setNewComment(prev => ({ ...prev, [postId]: e.target.value }))}
                                    />
                                </form>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FireTwitWidget;
