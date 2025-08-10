// Fox-Block Ad Blocker - Options Page Script
// Handles user settings for domains/selectors and enable/disable

const DEFAULT_BLOCKED_DOMAINS = [
  "doubleclick.net",
  "googlesyndication.com",
  "adservice.google.com",
  "adnxs.com",
  "adsafeprotected.com",
  "adform.net",
  "adroll.com",
  "taboola.com",
  "outbrain.com",
  "scorecardresearch.com",
  "zedo.com",
  "quantserve.com",
  "moatads.com",
  "criteo.com",
  "rubiconproject.com",
  "openx.net",
  "pubmatic.com",
  "tracking-protection.cdn.mozilla.net"
];
const DEFAULT_BLOCKED_SELECTORS = [
  '[id^="ad_"], [class*="ad-"], [class*="_ad"], [class*="ads"], [class*="banner"], [class*="sponsor"], [class*="promo"], [class*="pop"]',
  'iframe[src*="ad"], iframe[src*="ads"], iframe[src*="doubleclick"], iframe[src*="googlesyndication"]',
  'div[id*="ad"], div[class*="ad"], div[class*="ads"], div[class*="banner"]',
  'script[src*="ad"], script[src*="track"], script[src*="analytics"]',
  'video[ad], video[src*="ad"], video[src*="ads"]',
  'a[href*="ad"], a[href*="sponsor"]',
  'img[src*="ad"], img[src*="ads"], img[src*="banner"]',
  '.ytp-ad-module, .ytp-ad-overlay-container, .ytp-ad-player-overlay, .ytp-ad-image-overlay, .ytp-ad-overlay-slot',
  '#player-ads, .video-ads, .ad-container, .ad-showing'
];

const enabledCheckbox = document.getElementById('enabled');
const domainList = document.getElementById('domainList');
const domainInput = document.getElementById('domainInput');
const addDomainBtn = document.getElementById('addDomain');
const selectorList = document.getElementById('selectorList');
const selectorInput = document.getElementById('selectorInput');
const addSelectorBtn = document.getElementById('addSelector');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

let customDomains = [];
let customSelectors = [];

function renderList(list, ul, removeCallback) {
  ul.innerHTML = '';
  list.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item;
    const rm = document.createElement('span');
    rm.textContent = '✕';
    rm.className = 'remove';
    rm.onclick = () => removeCallback(i);
    li.appendChild(rm);
    ul.appendChild(li);
  });
}

function loadOptions() {
  chrome.storage.sync.get(["enabled", "customDomains", "customSelectors"], (data) => {
    enabledCheckbox.checked = data.enabled !== false;
    customDomains = data.customDomains || [];
    customSelectors = data.customSelectors || [];
    renderList([...DEFAULT_BLOCKED_DOMAINS, ...customDomains], domainList, (i) => {
      if (i >= DEFAULT_BLOCKED_DOMAINS.length) {
        customDomains.splice(i - DEFAULT_BLOCKED_DOMAINS.length, 1);
        renderList([...DEFAULT_BLOCKED_DOMAINS, ...customDomains], domainList, arguments.callee);
      }
    });
    renderList([...DEFAULT_BLOCKED_SELECTORS, ...customSelectors], selectorList, (i) => {
      if (i >= DEFAULT_BLOCKED_SELECTORS.length) {
        customSelectors.splice(i - DEFAULT_BLOCKED_SELECTORS.length, 1);
        renderList([...DEFAULT_BLOCKED_SELECTORS, ...customSelectors], selectorList, arguments.callee);
      }
    });
  });
}

addDomainBtn.onclick = () => {
  const val = domainInput.value.trim();
  if (val && !customDomains.includes(val) && !DEFAULT_BLOCKED_DOMAINS.includes(val)) {
    customDomains.push(val);
    renderList([...DEFAULT_BLOCKED_DOMAINS, ...customDomains], domainList, (i) => {
      if (i >= DEFAULT_BLOCKED_DOMAINS.length) {
        customDomains.splice(i - DEFAULT_BLOCKED_DOMAINS.length, 1);
        renderList([...DEFAULT_BLOCKED_DOMAINS, ...customDomains], domainList, arguments.callee);
      }
    });
    domainInput.value = '';
  }
};

addSelectorBtn.onclick = () => {
  const val = selectorInput.value.trim();
  if (val && !customSelectors.includes(val) && !DEFAULT_BLOCKED_SELECTORS.includes(val)) {
    customSelectors.push(val);
    renderList([...DEFAULT_BLOCKED_SELECTORS, ...customSelectors], selectorList, (i) => {
      if (i >= DEFAULT_BLOCKED_SELECTORS.length) {
        customSelectors.splice(i - DEFAULT_BLOCKED_SELECTORS.length, 1);
        renderList([...DEFAULT_BLOCKED_SELECTORS, ...customSelectors], selectorList, arguments.callee);
      }
    });
    selectorInput.value = '';
  }
};

saveBtn.onclick = () => {
  saveBtn.disabled = true;
  chrome.storage.sync.set({
    enabled: enabledCheckbox.checked,
    customDomains,
    customSelectors
  }, () => {
    status.textContent = 'Saved!';
    setTimeout(() => { status.textContent = ''; saveBtn.disabled = false; }, 1000);
  });
};

document.addEventListener('DOMContentLoaded', loadOptions);
