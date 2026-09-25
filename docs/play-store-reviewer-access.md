# Google Play — reviewer access (App access)

Swell requires sign-in. In **Play Console → Policy → App content → App access**, choose **All or some functionality is restricted** and paste the instructions below (update the phone and code to match your Railway env).

## 1. Set backend env (Railway → API service)

| Variable | Example | Notes |
|----------|---------|--------|
| `PLAY_STORE_REVIEW_PHONE` | `+919876543210` | E.164 (India example). Use a number you do **not** give to real users. |
| `PLAY_STORE_REVIEW_OTP` | `847291` | Exactly 6 digits. |

Redeploy the API after saving. For this number, **Send code** does not send SMS; verification uses the fixed OTP only.

## 2. Text for Play Console (copy/paste)

```
Swell requires a phone number and one-time passcode to create an account.

Reviewer test account (no SMS required):
1. Install the app and open it.
2. Enter the 10-digit phone number matching PLAY_STORE_REVIEW_PHONE (e.g. for +919876543210 enter 9876543210).
3. Tap "Send code".
4. Enter OTP: [YOUR PLAY_STORE_REVIEW_OTP] (6 digits).
5. Complete onboarding (name, habit, etc.) — all fields are required to reach the home screen.
6. Tap "Ride it out" to open a 3-minute craving game.

Alternative: On the login screen, tap "Use email instead" → create account with any email + password (8+ chars) → enter the email OTP (requires SendGrid configured on the server).

Support: nilamadhab47@gmail.com
```

Replace bracketed values with your real review phone (as users would type it in India: 10-digit mobile without country code if that is what the app expects) and OTP.

**India note:** The app collects a 10-digit mobile number and sends `+91…` to the API. For review, use a number you configured in `PLAY_STORE_REVIEW_PHONE` as E.164 (e.g. `+919876543210`).

## 3. Data safety alignment (v1.0.1+)

- **Microphone:** Not collected — app does not request `RECORD_AUDIO`.
- **Sign-in:** Phone OTP; optional email; Apple on iOS only (not in Android build).
- **Privacy policy:** https://www.useswell.site/privacy
