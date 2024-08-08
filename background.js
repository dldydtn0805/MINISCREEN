// // V3에서 X-FRAME-OPTIONS를 우회하기 위해 declarativeNetRequest를 사용한다
function ignoreXFameOptions (trigger) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'X-Frame-Options', operation: trigger }
        ]
      },
      condition: {
        urlFilter: '*',
        resourceTypes: ['sub_frame']
      }
    }
  ]
})}

// 확장 프로그램 아이콘을 클릭하면 content.js가 실행된다
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
    ignoreXFameOptions('remove')
});