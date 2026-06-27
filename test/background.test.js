import test from 'node:test';
import assert from 'node:assert';

let inputChangedListener = null;
let lastDefaultSuggestion = null;

let mockSettings = { extractPinned: true };

// Mock chrome API before importing background.js (must use dynamic import to avoid static import hoisting)
global.chrome = {
  omnibox: {
    setDefaultSuggestion: (obj) => {
      lastDefaultSuggestion = obj;
    },
    onInputChanged: {
      addListener: (fn) => {
        inputChangedListener = fn;
      }
    },
    onInputEntered: {
      addListener: () => {}
    }
  },
  tabs: {
    query: () => {}
  },
  storage: {
    sync: {
      get: (defaults) => {
        return Promise.resolve({ ...defaults, ...mockSettings });
      }
    }
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

test('omnibox.onInputChanged listener provides correct suggestion count text', async () => {
  const mockTabs = [
    { id: 1, url: 'https://youtube.com', title: 'Video 1', audible: true },
    { id: 2, url: 'https://google.com', title: 'Search', audible: false }
  ];

  chrome.tabs.query = () => Promise.resolve(mockTabs);

  // Assert the listener was captured
  assert.ok(inputChangedListener, 'onInputChanged listener should be registered');

  // Test case 1: Query that matches 1 tab (audible youtube tab)
  await new Promise((resolve) => {
    inputChangedListener('youtube -a', (suggestions) => {
      const expectedText = '1 tabs matching - hit enter to extract. Type "-a" to extract tabs with sound playing';
      assert.deepEqual(suggestions, [{ content: 'youtube -a', description: expectedText }]);
      assert.deepEqual(lastDefaultSuggestion, { description: expectedText });
      resolve();
    });
  });

  // Test case 2: Query that matches 0 tabs (silent google tab with -a filter)
  await new Promise((resolve) => {
    inputChangedListener('google -a', (suggestions) => {
      const expectedText = '0 tabs matching. Enter another keyword or press ESC to cancel.';
      assert.deepEqual(suggestions, [{ content: 'google -a', description: expectedText }]);
      assert.deepEqual(lastDefaultSuggestion, { description: expectedText });
      resolve();
    });
  });
});

test('getMatchingTabs respects extractPinned setting', async () => {
  const mockTabs = [
    { id: 1, url: 'https://youtube.com', title: 'Video 1', pinned: true },
    { id: 2, url: 'https://youtube.com', title: 'Video 2', pinned: false }
  ];

  chrome.tabs.query = () => Promise.resolve(mockTabs);

  // Test case 1: extractPinned = true (default)
  mockSettings.extractPinned = true;
  const resultTrue = await getMatchingTabs('youtube');
  assert.deepEqual(resultTrue.map(t => t.id), [1, 2]);

  // Test case 2: extractPinned = false
  mockSettings.extractPinned = false;
  const resultFalse = await getMatchingTabs('youtube');
  assert.deepEqual(resultFalse.map(t => t.id), [2]);
});
