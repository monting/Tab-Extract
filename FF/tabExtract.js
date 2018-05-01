// Provide help text to the user.
browser.omnibox.setDefaultSuggestion({
  description: `Enter keywords to extract tabs with matching URL/title to new window`
});

function matchingTabs(text) {
  let keywords = text.toLowerCase().split(" ");
  return browser.tabs.query({})
    .then((tabs) => {
      return tabs.filter((tab) => {
        for (let keyword of keywords) {
          if (tab.title.toLowerCase().includes(keyword) || tab.url.toLowerCase().includes(keyword)) { return true; }
        } 
        return false;
      });
    });
}
// Update the suggestions whenever the input is changed.
browser.omnibox.onInputChanged.addListener((text, addSuggestions) => {
  matchingTabs(text)
    .then((tabs) => {
      addSuggestions([{content: '', description: tabs.length + " tabs with matching title/URL. Press enter to extract them to a new window."}])
    });
});

// Open the page based on how the user clicks on a suggestion.
browser.omnibox.onInputEntered.addListener((text, disposition) => {
  matchingTabs(text)
    .then((tabs) => {
      if (tabs.length > 0) {
        browser.windows.create()
          .then((windowInfo) => browser.tabs.move(tabs.map(tab => tab.id), { windowId: windowInfo.id, index: -1 }))
          .then((tabs) => browser.tabs.query({ windowId: tabs[0].windowId }))
          .then((newWindowTabs) => browser.tabs.remove(newWindowTabs[0].id));
      }
    })
});