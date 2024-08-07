// 확장 프로그램 아이콘을 클릭하면 content.js가 실행된다
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});
