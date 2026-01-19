import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { auth } from '../auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                socket.emit('join_user', user.uid);

                const fetchUnread = async () => {
                    try {
                        const res = await axios.get('http://localhost:3001/api/chats', {
                            params: { firebase_uid: user.uid }
                        });
                        const counts = {};
                        res.data.forEach(chat => {
                            if (chat.unread_count > 0) {
                                counts[chat.chat_id] = chat.unread_count;
                            }
                        });
                        setUnreadCounts(counts);
                    } catch (err) {
                        console.error("Failed to fetch unread counts", err);
                    }
                };
                fetchUnread();

                socket.on('new_notification', (msg) => {
                    console.log("🔔 New Notification:", msg);
                    setUnreadCounts(prev => ({
                        ...prev,
                        [msg.chat_id]: (prev[msg.chat_id] || 0) + 1
                    }));
                });
            } else {
                setUnreadCounts({});
            }
        });

        return () => {
            unsubscribe();
            socket.off('new_notification');
        };
    }, [socket]);

    const markChatRead = (chatId) => {
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[chatId];
            return newCounts;
        });
    };

    const value = {
        socket,
        unreadCounts,
        setUnreadCounts,
        markChatRead
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
