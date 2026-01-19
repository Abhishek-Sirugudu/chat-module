import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaArrowLeft, FaSmile, FaPaperclip, FaTimes, FaFileAlt, FaVideo, FaImage } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import '../../styles/Chat.css';

const ChatWindow = ({ activeChat, currentUser, onSendMessage, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages?.length, activeChat?.id]);

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedFile) return;

        setIsUploading(true);

        try {
            await onSendMessage(newMessage, selectedFile);



            setNewMessage('');
            setSelectedFile(null);
            setShowEmoji(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsUploading(false);
        }
    }
};

const renderAttachment = (msg) => {
    if (!msg.attachment_url) return null;

    const type = msg.attachment_type || 'file';

    if (type === 'image') {
        return (
            <img
                src={msg.attachment_url}
                alt="attachment"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}
                onClick={() => window.open(msg.attachment_url, '_blank')}
            />
        );
    }
    if (type === 'video') {
        return (
            <video controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '5px' }}>
                <source src={msg.attachment_url} />
                Your browser does not support the video tag.
            </video>
        );
    }
    if (type === 'audio') {
        return (
            <audio controls src={msg.attachment_url} style={{ marginTop: '5px', width: '100%' }} />
        );


        return (
            <a
                href={msg.attachment_url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '8px' }}
            >
                <FaFileAlt size={20} />
                <span style={{ textDecoration: 'underline' }}>{msg.attachment_name || 'Download File'}</span>
            </a>
        );
    };

    if (!activeChat) {
        return (
            <div className="chat-main no-chat-selected">
                <div className="empty-state-content">
                    <p>Select a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    const recipientName = activeChat.recipientName || "Unknown User";

    return (
        <div className="chat-main">
            {/* --- HEADER --- */}
            <div className="chat-header">
                <button className="mobile-back-btn" onClick={onBack}>
                    <FaArrowLeft />
                </button>
                <div className="contact-info">
                    <h3 className="contact-name">{recipientName}</h3>
                </div>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="chat-messages" onClick={() => setShowEmoji(false)}>
                {activeChat.messages?.length > 0 ? (
                    activeChat.messages.map((msg) => {
                        const isMyMessage = msg.senderId === currentUser?.uid;
                        const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                        return (
                            <div key={msg.id || Math.random()} className={`message ${isMyMessage ? 'sent' : 'received'}`}>
                                <div className="message-content-wrapper">
                                    <div className="message-bubble">
                                        {renderAttachment(msg)}

                                        {msg.text && <div style={{ marginTop: msg.attachment_url ? '8px' : '0' }}>{msg.text}</div>}
                                    </div>
                                    <div className="message-time">{timeString}</div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-messages-placeholder">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* --- FILE PREVIEW BAR --- */}
            {selectedFile && (
                <div className="file-preview-bar" style={{ padding: '10px 20px', background: '#f0f9ff', borderTop: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
                        {selectedFile.type.startsWith('image/') ? <FaImage color="#3b82f6" /> :
                            selectedFile.type.startsWith('video/') ? <FaVideo color="#ef4444" /> :
                                <FaFileAlt color="#6b7280" />}
                    </div>
                    <span style={{ fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }}>
                        {selectedFile.name}
                    </span>
                    <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* --- INPUT AREA --- */}
            <div className="chat-input-area">
                <form className="chat-input-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>

                    {/* Emoji Toggle */}
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setShowEmoji(!showEmoji)}
                        style={{ color: '#fbbf24', fontSize: '1.2rem', padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <FaSmile />
                    </button>

                    {/* Emoji Picker Popup */}
                    {showEmoji && (
                        <div style={{ position: 'absolute', bottom: '60px', left: '0', zIndex: 100 }}>
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </div>
                    )}

                    {/* File Upload Trigger */}
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => fileInputRef.current.click()}
                        style={{ color: '#6b7280', fontSize: '1.1rem', padding: '0 5px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <FaPaperclip />
                    </button>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />

                    {/* Text Input */}
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        autoComplete="off"
                        disabled={isUploading}
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                        style={{ opacity: (!newMessage.trim() && !selectedFile) || isUploading ? 0.5 : 1 }}
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;