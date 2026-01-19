import React from 'react';
import '../../styles/Chat.css';

const ChatList = ({ chats, activeChat, onSelectChat, currentUser }) => {
    return (
        <div className="chat-sidebar">
            <div className="chat-search">
                <input type="text" placeholder="Search messages..." />
            </div>

            <div className="start-chat-btn-container mb-sm" style={{ padding: '0 15px' }}>
            </div>

            <div className="chat-groups-section" style={{ padding: '0 15px 15px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '10px' }}>Course Groups</h4>
                <div className="group-list">
                    {['React Basics Group', 'Advanced JS Squad', 'UI/UX Design Team'].map((group, idx) => (
                        <div
                            key={`group-${idx}`}
                            className="chat-contact-item"
                            onClick={() => onSelectChat({ id: `group_${idx}`, recipientName: group, isGroup: true, messages: [] })}
                        >
                            <div className="contact-avatar" style={{ background: '#E8AA25', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {group.charAt(0)}
                            </div>
                            <div className="contact-info">
                                <div className="contact-name">{group}</div>
                                <div className="last-message">Tap to chat with peers</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-contacts-list" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', margin: '0 0 10px 15px' }}>Direct Messages</h4>
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
