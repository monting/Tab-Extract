(function() {

  var matches = function( keywords, tab ) {
    // Check if this is a Marvellous Suspender suspended tab
    const suspenderPrefix = "chrome-extension://noogafoofpebimajpfpamcfhoaifemoa/suspended.html";
    if (tab.url.startsWith(suspenderPrefix)) {
      // Extract the original URL and title from the suspended tab URL
      try {
        const hashParams = new URL(tab.url).hash.substring(1);
        const params = new URLSearchParams(hashParams);
        const originalUrl = params.get('uri') || '';
        const originalTitle = decodeURIComponent(params.get('ttl') || '');
        
        // Search in the original URL and title
        for(var i = 0; i < keywords.length; i++) {
          if( originalUrl.toLowerCase().search(keywords[i]) > -1 ) { return true; }
          if( originalTitle.toLowerCase().search(keywords[i]) > -1 ) { return true; }
        }
      } catch (e) {
        // If parsing fails, fall back to normal matching
      }
    }
    
    // Normal matching for non-suspended tabs
    for(var i = 0; i < keywords.length; i++) {
      if( (tab.url.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
      if( (tab.title.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
    }
    return false;
  };

  var getMatchingTabs = function( text, callback ) {
    var matchingTabs = [];
    var queryInfo = {
      windowType: "normal"
    };
    chrome.tabs.query( queryInfo, function( tabs ) {
      var keywords = text.toLowerCase().split(" ");
      if( keywords[0] == "" ) {
        return callback([]);
      }
      for(var i = 0; i < tabs.length; i++) {
        if( matches( keywords, tabs[i] ) ) {
          matchingTabs.push( tabs[i] );
        }
      }
      callback( matchingTabs );
    } );
  };

  var getPinnedTabIDs = function(tabs) {
    return tabs.filter(t => t.pinned).map(t => t.id);
  }

  chrome.omnibox.onInputChanged.addListener( function( text, suggest ) {
    getMatchingTabs( text, function( matchingTabs ) {
      var pinnedTabIDs = getPinnedTabIDs(matchingTabs);
      var suggestionText = (matchingTabs.length < 1) ? 
        "0 tabs matching. Enter another keyword or press ESC to cancel."
        : matchingTabs.length + " tabs matching. Press enter to move them to a new window.";
      suggest( [{content: " ", description: suggestionText}] );
  
    } );
  } );

  chrome.omnibox.onInputEntered.addListener( function( text ) {
    getMatchingTabs( text, function( matchingTabs ) {

      if( matchingTabs.length < 1 || text === "" ) {
        // Do nothing - the omnibox already shows "0 tabs matching" as feedback
        return;
      }
      else {
        chrome.windows.create( {type: "normal"}, function( win ) {
          var newWindow = win;
          const pinnedTabIDs = getPinnedTabIDs(matchingTabs)

          chrome.tabs.move( matchingTabs.map(t => t.id), { windowId: newWindow.id, index: -1 }, function() {
            pinnedTabIDs.forEach(function(id) {
              chrome.tabs.update(id, {pinned: true});
            });
          } );
          chrome.tabs.remove( newWindow.tabs[newWindow.tabs.length - 1].id );
        } );
      }

    } );
  } );

})();

