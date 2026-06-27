const extractPinnedCheckbox = document.getElementById('extractPinned');
const statusToast = document.getElementById('statusToast');

let toastTimeout;

function showToast() {
  clearTimeout(toastTimeout);
  statusToast.classList.add('show');
  toastTimeout = setTimeout(() => {
    statusToast.classList.remove('show');
  }, 2000);
}

// Load current settings
chrome.storage.sync.get({ extractPinned: true }, (items) => {
  extractPinnedCheckbox.checked = items.extractPinned;
});

// Save settings on change
extractPinnedCheckbox.addEventListener('change', () => {
  const extractPinned = extractPinnedCheckbox.checked;
  chrome.storage.sync.set({ extractPinned }, () => {
    showToast();
  });
});
