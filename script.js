/* ============================================================
   Secure WebView Portal - script.js
   - Works in normal browser
   - Works inside Android WebView with JS bridge
   - Provides safe-ish wrappers & fallbacks
   ============================================================ */

(function () {
  // Show current URL quickly
  const currentUrlEl = document.getElementById("currentUrl");
  if (currentUrlEl) currentUrlEl.textContent = window.location.href;

  // Detect NativeBridge
  const hasNativeBridge =
    typeof window.NativeBridge !== "undefined" &&
    window.NativeBridge !== null;

  const bridgeStatusEl = document.getElementById("bridgeStatus");
  if (bridgeStatusEl) {
    bridgeStatusEl.innerHTML = hasNativeBridge
      ? "✅ NativeBridge detected (running inside WebView container)"
      : "ℹ️ NativeBridge not found (running in normal browser)";
  }

  // Helper: safe output to UI + console
  function writeOutput(msg) {
    console.log("[Portal]", msg);
    const output = document.getElementById("output");
    if (output) {
      const now = new Date().toISOString();
      output.textContent = `[${now}] ${msg}\n\n` + output.textContent;
    }
  }

  // ============================================================
  // Native demo calls (these expect your Android WebView to implement)
  // ============================================================
  window.NativeDemo = {
    getDeviceInfo: function () {
      writeOutput("Requesting device info from native…");

      if (!hasNativeBridge || typeof window.NativeBridge.getDeviceInfo !== "function") {
        writeOutput("NativeBridge.getDeviceInfo() not available. (Fallback: browser mode)");
        return;
      }

      try {
        // Most bridges return a string
        const info = window.NativeBridge.getDeviceInfo();
        writeOutput("Native returned device info: " + info);
      } catch (e) {
        writeOutput("Error calling getDeviceInfo(): " + String(e));
      }
    },

    copyToken: function () {
      const token = localStorage.getItem("demo_token") || "demo-token-not-set";
      writeOutput("Requesting native clipboard copy… token=" + token);

      if (!hasNativeBridge || typeof window.NativeBridge.copyToClipboard !== "function") {
        // Browser fallback
        navigator.clipboard?.writeText(token)
          .then(() => writeOutput("Copied token via browser clipboard API ✅"))
          .catch(() => writeOutput("Clipboard copy not available in this browser ❌"));
        return;
      }

      try {
        window.NativeBridge.copyToClipboard(token);
        writeOutput("Native clipboard copy requested ✅");
      } catch (e) {
        writeOutput("Error calling copyToClipboard(): " + String(e));
      }
    },

    logEvent: function () {
      const event = {
        eventName: "portal_event",
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      };

      writeOutput("Sending event to native logEvent(): " + JSON.stringify(event));

      if (!hasNativeBridge || typeof window.NativeBridge.logEvent !== "function") {
        writeOutput("NativeBridge.logEvent() not available. Logged in browser console only.");
        return;
      }

      try {
        window.NativeBridge.logEvent(JSON.stringify(event));
        writeOutput("Native logEvent() called ✅");
      } catch (e) {
        writeOutput("Error calling logEvent(): " + String(e));
      }
    },

    triggerNativeToast: function () {
      writeOutput("Requesting native toast…");

      if (!hasNativeBridge || typeof window.NativeBridge.showToast !== "function") {
        alert("Native toast requested (fallback alert in browser).");
        writeOutput("NativeBridge.showToast() not available. Used browser alert fallback.");
        return;
      }

      try {
        window.NativeBridge.showToast("Hello from Web Portal 👋");
        writeOutput("Native toast requested ✅");
      } catch (e) {
        writeOutput("Error calling showToast(): " + String(e));
      }
    },

    openUrlFromInput: function () {
      const input = document.getElementById("urlInput");
      const url = input ? input.value.trim() : "";
      if (!url) {
        writeOutput("No URL provided.");
        return;
      }

      writeOutput("Requesting native openExternalUrl(): " + url);

      if (!hasNativeBridge || typeof window.NativeBridge.openExternalUrl !== "function") {
        // Browser fallback
        window.open(url, "_blank", "noopener,noreferrer");
        writeOutput("Opened URL using browser window.open() fallback.");
        return;
      }

      try {
        window.NativeBridge.openExternalUrl(url);
        writeOutput("Native openExternalUrl() requested ✅");
      } catch (e) {
        writeOutput("Error calling openExternalUrl(): " + String(e));
      }
    },

    simulateNativeCallback: function () {
      writeOutput("Simulating native callback by directly calling window.onNativeMessage()…");
      if (typeof window.onNativeMessage === "function") {
        window.onNativeMessage("demo", { hello: "from simulated native callback" });
      } else {
        writeOutput("window.onNativeMessage() not defined yet (define it below).");
      }
    },
  };

  // ============================================================
  // Native callback handler:
  // Your Android code can call this with evaluateJavascript:
  // window.onNativeMessage("type", {"key":"value"})
  // ============================================================
  window.onNativeMessage = function (type, payload) {
    writeOutput("✅ Received message from native: type=" + type + ", payload=" + JSON.stringify(payload));
  };

  // ============================================================
  // Fake auth demo
  // ============================================================
  window.AuthDemo = {
    login: function () {
      const email = document.getElementById("email")?.value?.trim() || "";
      const password = document.getElementById("password")?.value?.trim() || "";

      if (!email || !password) {
        alert("Enter email and password (anything works for this PoC).");
        return;
      }

      // Fake token: in real apps, never do this insecurely
      const token = "demo_jwt_" + Math.random().toString(36).slice(2) + "_" + Date.now();
      localStorage.setItem("demo_token", token);
      localStorage.setItem("demo_user", JSON.stringify({ email }));

      writeOutput("✅ Fake login succeeded. Token stored in localStorage.");
      window.location.href = "./profile.html";
    },

    logout: function () {
      localStorage.removeItem("demo_token");
      localStorage.removeItem("demo_user");
      alert("Logged out ✅");
      window.location.href = "./index.html";
    },

    renderProfile: function () {
      const tokenBox = document.getElementById("tokenBox");
      if (!tokenBox) return;

      const token = localStorage.getItem("demo_token");
      const user = localStorage.getItem("demo_user");

      if (!token) {
        tokenBox.textContent = "❌ No token found. Please login first.";
        return;
      }

      let email = "(unknown)";
      try {
        email = user ? JSON.parse(user).email : "(unknown)";
      } catch {}

      tokenBox.textContent =
        "✅ Logged in as: " + email + "\n\n" +
        "Token:\n" + token;
    },
  };

  // Initial log
  writeOutput("Portal loaded. NativeBridge present=" + hasNativeBridge);
})();
