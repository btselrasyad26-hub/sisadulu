importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:"AIzaSyDCgccxfkB4F72SIz4DiZkXSFEs3RivEgY",authDomain:"sisadulu-b1b7d.firebaseapp.com",projectId:"sisadulu-b1b7d",storageBucket:"sisadulu-b1b7d.firebasestorage.app",messagingSenderId:"642442579953",appId:"1:642442579953:web:e20b3893dfd58c66907e50"});
const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{const title=payload.notification?.title||'Pengingat Kedaluwarsa SisaDulu';const options={body:payload.notification?.body||'Ada bahan yang perlu diperiksa.',data:payload.data||{}};self.registration.showNotification(title,options);});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow('/'));});
