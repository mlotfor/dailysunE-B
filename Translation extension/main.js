document.addEventListener('DOMContentLoaded', () => {
    const orderToggle = document.getElementById('order-toggle');
    const resultContainer = document.getElementById('result-container');
    const statusMessage = document.getElementById('status-message');
    const headingsContainer = document.getElementById('headings-container');
    const heading1 = document.getElementById('heading-1');
    const heading2 = document.getElementById('heading-2');

    let articleSentences = {
        bn: { heading: '', sentences: [] },
        en: { heading: '', sentences: [] }
    };

    function renderContent() {
        resultContainer.innerHTML = '';
        const isEnFirst = orderToggle.checked;

        const firstLangData = isEnFirst ? articleSentences.en : articleSentences.bn;
        const secondLangData = isEnFirst ? articleSentences.bn : articleSentences.en;
        
        headingsContainer.style.display = 'block';
        heading1.textContent = firstLangData.heading;
        heading2.textContent = secondLangData.heading;

        const maxLength = Math.min(firstLangData.sentences.length, secondLangData.sentences.length);

        for (let i = 0; i < maxLength; i++) {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'article-pair';

            const p1 = document.createElement('p');
            p1.textContent = firstLangData.sentences[i];

            const p2 = document.createElement('p');
            p2.textContent = secondLangData.sentences[i];
            p2.classList.add('blurred');

            pairDiv.appendChild(p1);
            pairDiv.appendChild(p2);
            resultContainer.appendChild(pairDiv);
        }
    }
    
    // Load data from storage and render
    chrome.storage.local.get(['banglaData', 'englishData'], (result) => {
        if (result.banglaData && result.englishData) {
            // --- NEW: Sentence splitting logic ---
            const fullBanglaText = result.banglaData.paragraphs.join(' ');
            const fullEnglishText = result.englishData.paragraphs.join(' ');

            // Split Bangla text by 'danda' (।)
            articleSentences.bn.sentences = fullBanglaText.split('।').map(s => s.trim()).filter(Boolean);
            articleSentences.bn.heading = result.banglaData.heading;

            // Split English text by sentence-ending punctuation. This regex is simple but effective.
            articleSentences.en.sentences = fullEnglishText.match(/[^.!?]+[.!?]+/g) || [];
            articleSentences.en.sentences = articleSentences.en.sentences.map(s => s.trim()).filter(Boolean);
            articleSentences.en.heading = result.englishData.heading;
            // --- End of new logic ---

            renderContent();
            chrome.storage.local.remove(['banglaData', 'englishData']);
        } else {
            statusMessage.textContent = 'Error: Source data not found in storage. Please set both Bangla and English sources from the article pages.';
            statusMessage.className = 'error';
        }
    });

    orderToggle.addEventListener('change', renderContent);
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && resultContainer.hasChildNodes()) {
            event.preventDefault();
            const secondParagraphs = document.querySelectorAll('.article-pair p:nth-child(2)');
            secondParagraphs.forEach(p => p.classList.toggle('blurred'));
        }
    });
});