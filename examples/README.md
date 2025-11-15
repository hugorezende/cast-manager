# Cast Manager Examples

This directory contains example implementations for different frameworks.

## Running Examples

Each example has its own setup instructions. Navigate to the specific example directory for details.

## Available Examples

- **vanilla-js** - Pure JavaScript implementation
- **react-example** - React application using the cast-manager hook
- **angular-example** - Angular application using the cast-manager service
- **vue-example** - Vue.js application
- **svelte-example** - Svelte application

## Quick Example - HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Cast Manager Example</title>
  </head>
  <body>
    <div id="app">
      <button id="castBtn">Cast</button>
      <button id="playBtn" disabled>Play</button>
      <button id="pauseBtn" disabled>Pause</button>
      <button id="stopBtn" disabled>Stop</button>
      <div id="status">Not connected</div>
    </div>

    <script type="module">
      import {
        CastManager,
        CastState,
      } from "./path-to/cast-manager/dist/index.mjs";

      const castManager = new CastManager({
        receiverApplicationId: "YOUR_APP_ID",
      });

      await castManager.initialize();

      const castBtn = document.getElementById("castBtn");
      const playBtn = document.getElementById("playBtn");
      const pauseBtn = document.getElementById("pauseBtn");
      const stopBtn = document.getElementById("stopBtn");
      const status = document.getElementById("status");

      castManager.onCastStateChanged((event) => {
        if (event.castState === CastState.CONNECTED) {
          status.textContent = "Connected";
          playBtn.disabled = false;
          pauseBtn.disabled = false;
          stopBtn.disabled = false;
          castBtn.disabled = true;
        } else {
          status.textContent = "Not connected";
          playBtn.disabled = true;
          pauseBtn.disabled = true;
          stopBtn.disabled = true;
          castBtn.disabled = false;
        }
      });

      castBtn.onclick = () => castManager.requestSession();
      playBtn.onclick = () => castManager.sendMessage({ action: "play" });
      pauseBtn.onclick = () => castManager.sendMessage({ action: "pause" });
      stopBtn.onclick = () => castManager.endSession();
    </script>
  </body>
</html>
```
