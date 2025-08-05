document.addEventListener('DOMContentLoaded', () => {
    const setBnBtn = document.getElementById('set-bn-btn');
    const setEnBtn = document.getElementById('set-en-btn');
    const compareBtn = document.getElementById('compare-btn');
    const bnStatusLight = document.getElementById('bn-status-light');
    const enStatusLight = document.getElementById('en-status-light');

    // Function to update the status lights and compare button
    function updateStatus() {
        chrome.storage.local.get(['banglaData', 'englishData'], (result) => {
            const bnReady = result.banglaData && result.banglaData.paragraphs.length > 0;
            const enReady = result.englishData && result.englishData.paragraphs.length > 0;

            if (bnReady) bnStatusLight.classList.add('ready');
            if (enReady) enStatusLight.classList.add('ready');

            compareBtn.disabled = !(bnReady && enReady);
        });
    }

    setBnBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content-script.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "extractArticle", lang: "bangla" }, (response) => {
                    if (response && response.success) {
                        console.log("Bangla data saved.");
                        updateStatus();
                    } else {
                        console.error("Failed to extract Bangla data.");
                    }
                });
            });
        });
    });

    setEnBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content-script.js']
            }, () => {
                 chrome.tabs.sendMessage(tabs[0].id, { action: "extractArticle", lang: "english" }, (response) => {
                    if (response && response.success) {
                        console.log("English data saved.");
                        updateStatus();
                    } else {
                        console.error("Failed to extract English data.");
                    }
                });
            });
        });
    });

    compareBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'main.html' });
    });

    // Initial status check when popup opens
    updateStatus();
});