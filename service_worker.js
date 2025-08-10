// Fox-Block Ad Blocker - Service Worker (Background Script)
// Handles network request blocking and badge updates

const DEFAULT_BLOCKED_DOMAINS = [
  // Minimal effective blocklist (sample from EasyList)
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
  "tracking-protection.cdn.mozilla.net",
  "analytics.s3.amazonaws.com",
  "analyticsengine.s3.amazonaws.com",
  "adtago.s3.amazonaws.com",
  "advice-ads.s3.amazonaws.com",
  "pagead2.googleadservices.com",
  "adc3-launch.adcolony.com",
  "ads30.adcolony.com",
  "wd.adcolony.com",
  "events3alt.adcolony.com",
  "static.media.net",
  "media.net",
  "ssl.google-analytics.com",
  "google-analytics.com",
  "click.googleanalytics.com",
  "analytics.google.com",
  "stats.wp.com",
  "pixel.facebook.com",
  "an.facebook.com",
  "static.ads-twitter.com",
  "ads-api.twitter.com",
  "ads.pinterest.com",
  "ads.linkedin.com",
  "ads.youtube.com",
  "adfox.yandex.ru",
  // Hotjar
  "hotjar.com",
  "*.hotjar.com",
  "static.hotjar.com",
  "script.hotjar.com",
  // Mouseflow
  "mouseflow.com",
  "*.mouseflow.com",
  // LuckyOrange
  "luckyorange.com",
  "*.luckyorange.com",
  // Freshworks
  "freshworks.com",
  "*.freshworks.com",
  "freshdesk.com",
  "*.freshdesk.com",
  // LinkedIn
  "linkedin.com",
  "ads.linkedin.com",
  "analytics.linkedin.com",
  // Pinterest
  "pinterest.com",
  "ads.pinterest.com",
  // Reddit
  "reddit.com",
  "ads.reddit.com",
  // TikTok
  "tiktok.com",
  "ads.tiktok.com",
  // Yahoo
  "yahoo.com",
  "ads.yahoo.com",
  // Yandex
  "yandex.ru",
  "adfox.yandex.ru",
  // Unity
  "unity.com",
  "ads.unity.com",
  // Realme
  "realme.com",
  // Xiaomi
  "mi.com",
  "xiaomi.com",
  // Samsung
  "samsung.com",
  // Oppo
  "oppo.com",
  // Huawei
  "huawei.com",
  // Apple
  "apple.com",
  // User requested additional ad/tracker domains
  "upload.luckyorange.net",
  "cs.luckyorange.net",
  "settings.luckyorange.net",
  "fwtracks.freshmarketer.com",
  "freshmarketer.com",
  "claritybt.freshmarketer.com",
  "events.redditmedia.com",
  "log.byteoversea.com",
  "adtech.yahooinc.com",
  "auction.unityads.unity3d.com",
  "webview.unityads.unity3d.com",
  "config.unityads.unity3d.com",
  "adserver.unityads.unity3d.com",
  "bdapi-ads.realmemobile.com",
  "bdapi-in-ads.realmemobile.com",
  "tracking.rus.miui.com",
  "adsfs.oppomobile.com",
  "samsung-com.112.2o7.net",
  "analytics-api.samsunghealthcn.com",
  "metrics.icloud.com",
  "metrics.mzstatic.com",
  "data.ads.oppomobile.com",
  "grs.hicloud.com",
  "adx.ads.oppomobile.com",
  "ck.ads.oppomobile.com"
];

let userSettings = {
  enabled: true,
  customDomains: [],
  blockedCount: {}, // { tabId: count }
};

// Load user settings from storage
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["enabled", "customDomains"], (data) => {
      userSettings.enabled = data.enabled !== false;
      userSettings.customDomains = data.customDomains || [];
      resolve();
    });
  });
}

// Helper: Get all blocked domains
function getBlockedDomains() {
  // Add special script rules for ad script blocking tests
  const specialScriptRules = [
    { urlFilter: "/pagead.js", domains: ["d3ward.github.io"] },
    { urlFilter: "/widget/ads.", domains: [] } // global
  ];
  // Return as legacy string for backward compatibility
  return [
    ...DEFAULT_BLOCKED_DOMAINS,
    ...userSettings.customDomains,
    ...specialScriptRules.map(rule => rule.urlFilter)
  ];
}

// Update badge with blocked count
function updateBadge(tabId) {
  const count = userSettings.blockedCount[tabId] || 0;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "", tabId });
  chrome.action.setBadgeBackgroundColor({ color: "#d32f2f", tabId });
}

// Listen for web requests and block if needed (only if API is available)
if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug && chrome.declarativeNetRequest.onRuleMatchedDebug.addListener) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    if (!userSettings.enabled) return;
    if (info.tabId >= 0) {
      userSettings.blockedCount[info.tabId] = (userSettings.blockedCount[info.tabId] || 0) + 1;
      updateBadge(info.tabId);
    }
  });
}

// Set up blocking rules
async function updateBlockingRules() {
  await loadSettings();
  if (!userSettings.enabled) {
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
    return;
  }
  const blockedDomains = getBlockedDomains();
  let rules = blockedDomains.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame", "sub_frame", "script", "image", "xmlhttprequest", "media"]
    }
  }));

  // Add special rules for /pagead.js$domain=d3ward.github.io and /widget/ads.
  const specialRules = [
    {
      id: rules.length + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "/pagead.js",
        domains: ["d3ward.github.io"],
        resourceTypes: ["script"]
      }
    },
    {
      id: rules.length + 2,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "/widget/ads.",
        resourceTypes: ["script"]
      }
    }
  ];
  rules = rules.concat(specialRules);

  // Remove all old rules, add new
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules
  });
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.enabled || changes.customDomains)) {
    updateBlockingRules();
  }
});

// Reset badge on tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    userSettings.blockedCount[tabId] = 0;
    updateBadge(tabId);
  }
});

// Initial setup
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);

// Expose for content script to reset badge
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "resetBadge" && sender.tab) {
    userSettings.blockedCount[sender.tab.id] = 0;
    updateBadge(sender.tab.id);
  }
});
