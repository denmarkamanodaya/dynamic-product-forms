
import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

const ChatWidget = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
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
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span className="chat-title">Team Chat</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                                No messages yet. Say hi!
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

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
