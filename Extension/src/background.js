// Background service worker for TruthGuard extension
console.log('TruthGuard background service worker loaded');

// API endpoints
const API_BASE_URL = 'http://localhost:5000/api';
const EXTENSION_ENDPOINT = `${API_BASE_URL}/extension`;
const AGENT_ENDPOINT = `${API_BASE_URL}/agent`;

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    handleAnalyzeContent(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Handle content analysis
async function handleAnalyzeContent(data) {
  try {
    // Log the data that would be sent
    console.log('Would send to extension endpoint:', EXTENSION_ENDPOINT, data);

    // In demo mode, simulate API call
    // When backend is ready, uncomment the actual API call below:
    /*
    const response = await fetch(EXTENSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    */

    // Demo response
    await simulateDelay(1000);

    const result = {
      status: 'success',
      verdict: 'true',
      confidence: 0.95,
      summary:
        'The information has been verified against multiple reliable sources.',
      evidence: [
        {
          source: 'https://example.com/source1',
          excerpt: 'Supporting evidence from reliable source...',
        },
      ],
      meta: {
        processedAt: new Date().toISOString(),
      },
    };

    console.log('Would receive from agent endpoint:', AGENT_ENDPOINT, result);

    return result;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

// Simulate network delay
function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (this is handled automatically by the manifest)
  console.log('Extension icon clicked on tab:', tab.id);
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TruthGuard extension installed');
    // You can open a welcome page here if needed
  } else if (details.reason === 'update') {
    console.log('TruthGuard extension updated');
  }
});
