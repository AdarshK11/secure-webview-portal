# Secure WebView Portal - PoC

A small static web portal used as the web-side companion for the Android Secure WebView Container PoC.

## Pages
- `/index.html` - Home + bridge demo buttons
- `/login.html` - Fake login
- `/profile.html` - Shows stored token

## Web ↔ Native Bridge Calls
The portal expects a native bridge object:

```js
window.NativeBridge
```
Used methods:

- getDeviceInfo()

- copyToClipboard(text)

- logEvent(json)

- showToast(message)

If opened in a normal browser, the portal gracefully falls back (no native bridge).

## Hosting

Deployed using GitHub Pages.
