SisaDulu expiry notification package

Files include the current saved SisaDulu HTML, Firebase messaging service worker, Netlify config, package.json, and scheduled expiry reminder function.

IMPORTANT: Do NOT upload Firebase Admin service-account JSON to GitHub. Before notifications can work, add FIREBASE_SERVICE_ACCOUNT_JSON as a Netlify environment variable with the full service-account JSON. Keep Netlify access limited to trusted people.

The function expects Firestore collections kpReminderData, kpPushTokens, and kpReminderSent. The app must be permitted by Firestore Rules to write kpReminderData and kpPushTokens. Users must click Activate Notifications on the website.

Scheduled daily at 08:00 Asia/Jakarta. Package has not been deployed or tested against the live Firebase project. Validate Firestore rules and Firebase project before enabling notifications.
