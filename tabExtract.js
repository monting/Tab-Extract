(function() {

  var keywords;
  var tabsToMove;
  var entered;
  var suggestPtr;

  // This event is fired each time the user updates the text in the omnibox,
  // as long as the extension's keyword mode is still active.
  chrome.omnibox.onInputChanged.addListener( function( text, suggest ) {
    //console.log('inputChanged: ' + text);
    entered = false;

    // pointer to suggest to be used inside callback function for getWindow
    suggestPtr = suggest;
    suggestStart( text );
  } );

  // This event is fired with the user accepts the input in the omnibox.
  chrome.omnibox.onInputEntered.addListener(start);

  function start( text ) {
    entered = true;
    tabsToMove = [];
    keywords = text.toLowerCase().split(" ");
    chrome.windows.getAll( {"populate" : true}, getWindows );
  }

  function suggestStart( text ) {
    tabsToMove = [];
    keywords = text.toLowerCase().split(" ");
    chrome.windows.getAll( {"populate" : true}, getWindows );
  }

  //searches for keyword matches in tab titles and url
  function matchTheKeywords( tab ) {
    var numKeywords = keywords.length;
    for (var i = 0; i < numKeywords; i++) {
      var keyw = keywords[i];
      if ( (tab.url.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
      if ( (tab.title.toLowerCase()).search(keywords[i]) > -1 ) { return true; }
    }
    return false;
  }

  function getWindows( windows ) {
    var numWindows = windows.length;

    //for each window
    for (var i = 0; i < numWindows; i++) {
      var win = windows[i];
      var numTabs = win.tabs.length;

      //for each tab
      for (var j = 0; j < numTabs; j++) {
        var currTab = win.tabs[j];
        if ( matchTheKeywords(currTab) && !currTab.pinned ) {
          //add to tabsToMove list
          tabsToMove.push( win.tabs[j] );
        }

      }
    }

    // users pressed enter
    if (entered){
      if ( tabsToMove.length < 1 || keywords[0] === "" ) {
        alert(
          'no matches found for the keywords "' + keywords + '".'
          + "\nNote: You do not need to press down to select a suggestion. Just press enter after entering keywords."
        );
      }
      else {
        //create new window and move all tabs in tabsToMove to the new window
        chrome.windows.create( {}, moveTabs );
      }
    }
    // user has not yet pressed enter, make suggestion
    else {
      var descr;
      if ( tabsToMove.length < 1 ) {
        descr = tabsToMove.length + " tabs matching. Enter another keyword or press ESC to cancel.";
        suggestPtr( [{content: "", description: descr}] );
      }
      else {
        descr = tabsToMove.length + " tabs matching. Press enter to move them to a new window.";
        suggestPtr( [{content: "", description: descr}] );
      }
    }
  }

  //move tabs from tabsToMove to new window
  function moveTabs(win) {
    for (var i = 0; i < tabsToMove.length; i++) {
      chrome.tabs.move( tabsToMove[i].id, {"windowId": win.id, "index": i} );
    }

    //remove the empty tab created with window creation
    chrome.tabs.remove( win.tabs[win.tabs.length - 1].id );
  }

})();

