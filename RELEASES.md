   Release Notes: v1.6.0

  This release introduces a modernized, unified build pipeline using Vite, upgrades the Firefox port to Manifest V3, introduces
  settings options for pinned tabs, adds audio search modifiers, and establishes a robust test suite.

  ## 🚀 Key Features

  • Unified Manifest V3 Architecture:
      • Upgraded the Firefox extension to target Manifest V3 (aligning with Chrome).
      • Consolidated separate platform manifests into a single root  manifest.json  using conditional browser prefixes.
      • Consolidated separate browser background scripts into a single, shared background.js that runs on both platforms using
      standard  chrome.*  APIs.
  • New Settings Page:
      • Created a modern, glassmorphic settings page (options.html) allowing users to toggle whether pinned tabs should be
      extracted or left in their original window.
  • Audio Filter Flag:
      • Added the  --audio  /  --audible  /  -a  flag. Typing these keywords in the omnibox filters the extraction query for
      tabs that are currently playing sound (e.g.,  ex youtube -a ).


  ## 🛠️ Build Pipeline & Developer Tooling

  • Vite-based Build Pipeline:
      • Replaced manual file moving with a fully automated packaging pipeline powered by  vite  and  vite-plugin-web-extension .
      • Running  npm run build  compiles platform-specific assets under  dist/chrome  and  dist/firefox .
  • Added Automated Test Suite:
      • Set up a unit test suite using Node's native test runner ( npm test ) in background.test.js with fully mocked browser
      extension globals.
      • Verifies query flag parsing, sound-playing filters, settings exclusion logic, and omnibox dynamic suggestion text
      formatting.


  ## 🐛 Bug Fixes & Improvements

  • Omnibox UI Responsiveness:
      • Fixed an issue where the omnibox dropdown suggestion list did not immediately update the matched tab count until a
      trailing space was typed. Suggestions now update dynamically on every keystroke.
  • Chrome Compatibility Fixes:
      • Fixed a strict  TypeError  thrown in Chrome due to passing an unsupported  populate  property to  chrome.windows.create .
  • Suspended Tab Support on Firefox:
      • By unifying the codebases, Firefox now inherits Marvellous Suspender tab extraction logic (previously only available on
      Chrome).
