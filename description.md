● Too many disorganized tabs open?
● Slow to find the tab you're looking for?
● Want to reduce tab and window clutter quickly?

Tab Extract helps you easily re-organize your tabs according to the subject or site, 
or quickly find a tab, or easily remove multiple tabs.

NEW features:
- Enter "-a" to extract tabs playing sound!
- Setting on options page to turn on/off pinned tab extraction.

How it works:
Tab Extract will move all tabs from any window with a keyword match (in their URL or page title), into a new window.

To use, type "ex" followed by a tab/space into the address bar, then enter keywords.

✓ "ex facebook news"
will extract all facebook tabs and any tab with "news" or "facebook" in their title or URL, into a new window.

✓ "ex ." 
merges all tabs into the same window. This works because all URLs have a "." in them.

✓ "ex youtube -a" (or "--audio", "--audible")
will extract only the YouTube tabs that are currently playing sound.

✓ Batch-remove tabs by extracting tabs to a new window using Tab Extract, and then closing the window.

✓ Tab Extract can merge tabs from across different windows into the same window by using a common keyword amongst the tabs.

Notes: There is no need to select anything in the auto complete box, just press enter. 

If your Chrome has saved some "ex <keyword>" as a search term for autocomplete, clear your history.

Firefox version: https://addons.mozilla.org/en-US/firefox/addon/tab-extract-port/



Version 1.6.0 release notes:

    Support for extracting audio-playing tabs
      - Added -a, --audio, and --audible flags to target active media/sound tabs
      - Flags can be combined with search keywords (e.g. "ex youtube -a")

    Settings Options Page
      - Added a configuration page to toggle whether to extract pinned tabs or not

    Manifest V3 Migration for Firefox
      - Firefox version upgraded to Manifest V3

    Unified Background Engine
      - Combined separate background scripts into a single codebase built with Vite

Version 1.5.0 release notes - credit goes to Vlad Lasky:

    Migrated from Chrome Extension Manifest v2 to Manifest v3
      - Background script now runs as a service worker
      - Updated minimum Chrome version to 88
      - Removed alert() for service worker compatibility (omnibox already provides feedback)

    Support for Marvellous Suspender suspended tabs
      - Extension now searches within the original URL and title of suspended tabs
      - Suspended tabs are moved while maintaining their suspended state
    
    Support for Chrome's natively unloaded tabs
      - Removed status filter to include tabs in all loading states
      - Fixes issue where unloaded tabs were not being found

    Fixed compatibility with modern Chrome versions that use tab unloading for memory management

==============================
tab management, tabs, Find tabs, TabKit, FoxTab, TabMixPlus, TreeStyleTabs, Too Many Tabs, Tab Menu, tab move, tab organize, duplicate, batch remove, tab split, window split
