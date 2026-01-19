import React from 'react';
import '../../styles/Chat.css';

const ChatList = ({ chats, activeChat, onSelectChat, currentUser }) => {
    return (
        <div className="chat-sidebar">
            <div className="chat-search">
                <input type="text" placeholder="Search messages..." />
            </div>
            <div className="chat-contacts-list">
                {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p !== currentUser.uid);
                    const displayName = chat.recipientName || otherParticipant;

                    return (
                        <div
                            key={chat.id}
                            className={`chat-contact-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => onSelectChat(chat)}
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${displayName}&background=0D8ABC&color=fff`}
                                alt={displayName}
                                className="contact-avatar"
                            />
                            <div className="contact-info">
                                <div className="contact-name">{displayName}</div>
                                <div className="last-message">{chat.lastMessage}</div>
                            </div>
                            {chat.unreadCount > 0 && (
                                <div className="unread-badge">{chat.unreadCount}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;
