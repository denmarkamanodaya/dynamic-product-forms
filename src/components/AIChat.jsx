import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const AIChat = ({ currentUser, isOpen, onToggle }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Initial load and listener for cross-tab sync
    useEffect(() => {
        // Load existing messages
        const storedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
        setMessages(storedMessages);

        // Listen for storage events (updates from other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'chat_messages') {
                const updatedMessages = JSON.parse(e.newValue || '[]');
                setMessages(updatedMessages);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            text: newMessage,
            sender: currentUser.name,
            timestamp: new Date().toISOString(),
            isMine: true // Just a local flag, persistence logic ignores this really
        };

        // Update local state immediately
        const updatedMessages = [...messages, message];
        setMessages(updatedMessages);

        // Persist to localStorage (triggers storage event in other tabs)
        localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));

        setNewMessage('');
    };

    return (
        <div className={`ai-chat-widget ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <span className="ai-chat-title">FireBot</span>
                        <button className="close-btn" onClick={() => onToggle(false)}>×</button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                                No messages yet. Ask FireBrain!
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMine = msg.sender === currentUser.name;
                            return (
                                <div
                                    key={msg.id}
                                    className={`message-bubble ${isMine ? 'sent' : 'received'}`}
                                >
                                    {!isMine && <div className="message-sender">{msg.sender}</div>}
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="ai-chat-input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="glass-btn" style={{ marginLeft: '0.5rem' }}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChat;
