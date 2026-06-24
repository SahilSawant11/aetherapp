# Push Notifications Plan

This app is a bare React Native app with Supabase already in place, so the cleanest setup is:

1. Use Firebase Cloud Messaging (FCM) for Android and iOS delivery.
2. Register each logged-in device and save its push token in Supabase.
3. Define reusable notification campaigns in Supabase.
4. Run a scheduled backend job every few minutes to send campaigns that are due in each user's local time zone.

## Recommended stack

- Client push library: `@react-native-firebase/app` + `@react-native-firebase/messaging`
- Optional foreground/local display control: `@notifee/react-native`
- Database and scheduling metadata: Supabase Postgres
- Sender: Supabase Edge Function or another trusted server process with service-role access

## Why this shape fits Aether

Local notifications are fine if the app itself decides what to show on one device.

Remote push is the right choice if you want to:

- send custom messages from your backend
- target specific users or roles like parents vs teachers
- deliver at morning / afternoon / evening based on each user's timezone
- keep sending even when the app is closed

## Data model

The schema adds three core tables:

- `push_devices`: one row per installed app/device token
- `notification_campaigns`: reusable scheduled messages
- `notification_deliveries`: send log for idempotency, retries, and debugging

## Delivery flow

1. User signs in.
2. App asks for notification permission.
3. App fetches the FCM token.
4. App upserts a row in `push_devices` with `user_id`, `platform`, `push_token`, and `timezone`.
5. An admin or backend inserts a row into `notification_campaigns`.
6. A scheduled server job runs every 5 to 15 minutes.
7. The job finds active campaigns due now.
8. It resolves matching users and device tokens.
9. It sends through FCM.
10. It records the result in `notification_deliveries`.

## Time-of-day scheduling

Use `timezone_mode = 'user_local'` when you want "8:00 AM for each user wherever they are".

Use `timezone_mode = 'fixed'` when you want one specific timezone like "8:00 AM Asia/Kolkata for everyone".

Examples:

- Morning reminder: `send_strategy = 'daily'`, `scheduled_time = '08:00'`, `timezone_mode = 'user_local'`
- One-time announcement: `send_strategy = 'once'`, `scheduled_date = '2026-04-30'`, `scheduled_time = '18:30'`, `timezone_mode = 'fixed'`, `fixed_timezone = 'Asia/Kolkata'`

## Client work needed

The mobile app still needs:

- native Firebase setup for Android and iOS
- permission request flow
- FCM token fetch + refresh handling
- Supabase upsert into `push_devices`
- foreground notification behavior

Suggested shape:

- `src/lib/notifications.ts`: register permissions, fetch token, handle refresh
- call registration after session bootstrap when `user` becomes available

## Backend work needed

The server job should:

- read active campaigns
- calculate which users are due right now
- skip users with `notifications_enabled = false`
- avoid duplicates using `notification_deliveries`
- mark invalid tokens inactive when FCM rejects them

## Practical first milestone

Build this in order:

1. Add Firebase messaging to the app.
2. Save device tokens into `push_devices`.
3. Create one manual server script or Edge Function that sends a push to one user.
4. Add the scheduled campaign runner.
5. Add an admin UI later if needed.

## Important note on iOS

iOS push requires:

- Apple Push Notifications capability in Xcode
- APNs key/certificate configured in Firebase
- a real device for end-to-end testing

The iOS simulator does not fully represent real push delivery behavior.
