importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBmrcuw21jbqnL6dP2OQufvhhEibRHMU50",
    authDomain: "shnoor-lms-e1f44.firebaseapp.com",
    projectId: "shnoor-lms-e1f44",
    storageBucket: "shnoor-lms-e1f44.firebasestorage.app",
    messagingSenderId: "628973656264",
    appId: "1:628973656264:web:e6373537b71e2985372dfd",
    measurementId: "G-51X474W04J"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './just_logo.jpeg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
