// Provide help text to the user.
chrome.omnibox.setDefaultSuggestion({
  description: "Enter keywords to extract tabs with matching URL/title to new window"
});

const matches = function( keywords, tab, onlyAudible ) {
  if (onlyAudible && !tab.audible) {
    return false;
  }
  if (keywords.length === 0) {
    return true;
  }
  // Check if this is a Marvellous Suspender suspended tab
  const suspenderPrefix = "chrome-extension://noogafoofpebimajpfpamcfhoaifemoa/suspended.html";
  if (tab.url && tab.url.startsWith(suspenderPrefix)) {
    // Extract the original URL and title from the suspended tab URL
    try {
      const hashParams = new URL(tab.url).hash.substring(1);
      const params = new URLSearchParams(hashParams);
      const originalUrl = params.get('uri') || '';
      const originalTitle = decodeURIComponent(params.get('ttl') || '');

      // Search in the original URL and title
      for(let i = 0; i < keywords.length; i++) {
        if( originalUrl.toLowerCase().includes(keywords[i]) ) { return true; }
        if( originalTitle.toLowerCase().includes(keywords[i]) ) { return true; }
      }
    } catch (e) {
      // If parsing fails, fall back to normal matching
    }
  }

  // Normal matching for non-suspended tabs
  for(let i = 0; i < keywords.length; i++) {
    if( tab.url && tab.url.toLowerCase().includes(keywords[i]) ) { return true; }
    if( tab.title && tab.title.toLowerCase().includes(keywords[i]) ) { return true; }
  }
  return false;
};

const getMatchingTabs = function( text ) {
  console.log("[TabExtract] getMatchingTabs called with text:", text);
  const keywords = text.toLowerCase().split(" ").filter(Boolean);
  let onlyAudible = false;
  const audibleIndex = keywords.findIndex(k => k === "--audible" || k === "--audio" || k === "-a");
  if (audibleIndex > -1) {
    onlyAudible = true;
    keywords.splice(audibleIndex, 1);
  }
  console.log("[TabExtract] onlyAudible:", onlyAudible, "keywords:", keywords);
  if( keywords.length === 0 && !onlyAudible ) {
    return Promise.resolve([]);
  }

  return chrome.storage.sync.get({ extractPinned: true })
    .then((settings) => {
      return chrome.tabs.query({ windowType: "normal" })
        .then((tabs) => {
          const matchingTabs = [];
          for(let i = 0; i < tabs.length; i++) {
            if (settings.extractPinned === false && tabs[i].pinned) {
              continue;
            }
            const isMatched = matches( keywords, tabs[i], onlyAudible );
            if( isMatched ) {
              matchingTabs.push( tabs[i] );
            }
          }
          console.log("[TabExtract] Total matching tabs found:", matchingTabs.length);
          return matchingTabs;
        });
    });
};

const getPinnedTabIDs = function(tabs) {
  return tabs.filter(t => t.pinned).map(t => t.id);
};

chrome.omnibox.onInputChanged.addListener( function( text, suggest ) {
  getMatchingTabs( text )
    .then((matchingTabs) => {
      const suggestionText = (matchingTabs.length < 1) ?
        "0 tabs matching. Enter another keyword or press ESC to cancel."
        : matchingTabs.length + ' tabs matching - hit enter to extract. Type "-a" to include tabs with sound playing';
      chrome.omnibox.setDefaultSuggestion( {description: suggestionText} );
      suggest([{ content: text, description: suggestionText }]);
    } );
} );

chrome.omnibox.onInputEntered.addListener( function( text ) {
  getMatchingTabs( text )
    .then((matchingTabs) => {
      if( matchingTabs.length < 1 ) {
        return;
      }

      chrome.windows.create( {type: "normal"} )
        .then((newWindow) => {
          const pinnedTabIDs = getPinnedTabIDs(matchingTabs);
          const defaultTabId = newWindow.tabs[0].id;

          return chrome.tabs.move( matchingTabs.map(t => t.id), { windowId: newWindow.id, index: -1 } )
            .then(() => {
              const updatePromises = pinnedTabIDs.map(id => chrome.tabs.update(id, {pinned: true}));
              return Promise.all(updatePromises);
            })
            .then(() => chrome.tabs.remove( defaultTabId ));
        });
    } );
} );

export { matches, getMatchingTabs };
