(function() {

  var matches = function( keywords, tab ) {
    for(var i = 0; i < keywords.length; i++) {
      if( (tab.url.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
      if( (tab.title.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
    }
    return false;
  };

  var getMatchingTabs = function( text, callback ) {
    var matchingTabs = [];
    var queryInfo = {
      pinned: false,
      status: "complete",
      windowType: "normal"
    };
    chrome.tabs.query( queryInfo, function( tabs ) {
      var keywords = text.toLowerCase().split(" ");
      if( keywords[0] == "" ) {
        return callback([]);
      }
      for(var i = 0; i < tabs.length; i++) {
        if( matches( keywords, tabs[i] ) ) {
          matchingTabs.push( tabs[i].id );
        }
      }
      callback( matchingTabs );
    } );
  };

  chrome.omnibox.onInputChanged.addListener( function( text, suggest ) {
    getMatchingTabs( text, function( matchingTabs ) {

      var suggestionText = (matchingTabs.length < 1) ? 
        "0 tabs matching. Enter another keyword or press ESC to cancel."
        : matchingTabs.length + " tabs matching. Press enter to move them to a new window.";
      suggest( [{content: " ", description: suggestionText}] );
  
    } );
  } );

  chrome.omnibox.onInputEntered.addListener( function( text ) {
    getMatchingTabs( text, function( matchingTabs ) {

      if( matchingTabs.length < 1 || text === "" ) {
        alert(
          'no matches found for the keywords "' + text + '".'
          + "\nNote: You do not need to press down to select a suggestion. Just press enter after entering keywords."
        );
      }
      else {
        chrome.windows.create( {type: "normal"}, function( win ) {
          var newWindow = win;
          chrome.tabs.move( matchingTabs, { windowId: newWindow.id, index: -1 }, function( tabs ) {
          } )
          chrome.tabs.remove( newWindow.tabs[newWindow.tabs.length - 1].id );
        } );
      }

    } );
  } );

})();

