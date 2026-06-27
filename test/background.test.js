import test from 'node:test';
import assert from 'node:assert';

// Mock chrome API before importing background.js (must use dynamic import to avoid static import hoisting)
global.chrome = {
  omnibox: {
    setDefaultSuggestion: () => {},
    onInputChanged: { addListener: () => {} },
    onInputEntered: { addListener: () => {} }
  },
  tabs: {
    query: () => {}
  }
};

const { matches, getMatchingTabs } = await import('../src/background.js');

test('matches filters playing sound when onlyAudible is set', () => {
  const silentTab = { url: 'https://youtube.com', title: 'Silent Video', audible: false };
  const playingTab = { url: 'https://youtube.com', title: 'Playing Video', audible: true };

  // Keywords matching the title, with onlyAudible true
  assert.equal(matches(['video'], silentTab, true), false);
  assert.equal(matches(['video'], playingTab, true), true);

  // Keywords empty, onlyAudible true
  assert.equal(matches([], silentTab, true), false);
  assert.equal(matches([], playingTab, true), true);
});

test('getMatchingTabs parses flags --audible, --audio, and -a correctly', async () => {
  const mockTabs = [
    { id: 1, url: 'https://youtube.com/watch', title: 'Video 1', audible: true },
    { id: 2, url: 'https://google.com', title: 'Search', audible: false },
    { id: 3, url: 'https://spotify.com', title: 'Music', audible: true }
  ];

  // Mock chrome.tabs.query
  chrome.tabs.query = (queryInfo) => {
    return Promise.resolve(mockTabs);
  };

  // Test "-a" flag
  const result1 = await getMatchingTabs('-a');
  assert.deepEqual(result1.map(t => t.id), [1, 3]);

  // Test "--audio" flag
  const result2 = await getMatchingTabs('--audio');
  assert.deepEqual(result2.map(t => t.id), [1, 3]);

  // Test "--audible" flag
  const result3 = await getMatchingTabs('--audible');
  assert.deepEqual(result3.map(t => t.id), [1, 3]);

  // Test combined query "video -a"
  const result4 = await getMatchingTabs('video -a');
  assert.deepEqual(result4.map(t => t.id), [1]);

  // Test normal query "search" without flags
  const result5 = await getMatchingTabs('search');
  assert.deepEqual(result5.map(t => t.id), [2]);
});
