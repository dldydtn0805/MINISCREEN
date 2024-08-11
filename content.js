function init() {
  // MINISCREEN이 이미 존재하면 초기화 하지 않음
  if (document.getElementById("miniscreen")) {
    return;
  }

  // MINISCREEN을 위한 DIV를 생성
  const miniScreen = document.createElement("div");
  miniScreen.id = "miniscreen";
  miniScreen.style.position = "fixed";
  miniScreen.style.bottom = "10px";
  miniScreen.style.right = "10px";
  miniScreen.style.width = "25%";
  miniScreen.style.height = "80%";
  miniScreen.style.backgroundColor = "white";
  miniScreen.style.border = "1px solid black";
  miniScreen.style.zIndex = "9999";
  miniScreen.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  miniScreen.style.borderRadius = "8px";
  miniScreen.style.overflow = "hidden";
  miniScreen.style.display = "flex";
  miniScreen.style.flexDirection = "column";

  // 미니 스크린의 HTML 내용 설정
  miniScreen.innerHTML = `
    <div class="mini-screen-header">
      <input type="text" id="url-input" placeholder="SEARCH WORD OR URL">
      <button id="back-button" class="button-with-icon"><</button>
      <button id="go-button" class="button-with-icon">></button>
      <button id="add-bookmark-button" class="button-with-icon">+</button>
      <button id="toggle-bookmark-button" class="button-with-icon">★</button>
      <button id="close-button" class="button-with-icon">X</button>
    </div>
    <ul class="bookmark-list" style="display: none;"></ul>
    <iframe id="mini-iframe" sandbox="allow-same-origin allow-scripts"></iframe>
  `;

  // DOM 요소들 가져오기
  const urlInput = miniScreen.querySelector("#url-input");
  const backButton = miniScreen.querySelector("#back-button");
  const goButton = miniScreen.querySelector("#go-button");
  const closeButton = miniScreen.querySelector("#close-button");
  const iframe = miniScreen.querySelector("#mini-iframe");
  const header = miniScreen.querySelector(".mini-screen-header");
  const bookmarkList = miniScreen.querySelector(".bookmark-list");
  const addBookmarkButton = miniScreen.querySelector("#add-bookmark-button");
  const toggleBookmarkButton = miniScreen.querySelector(
    "#toggle-bookmark-button"
  );

  // 뒤로가기 버튼 추가
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // 북마크 추가 버튼 클릭 시 현재 URL을 북마크로 추가
  addBookmarkButton.addEventListener("click", () => {
    const currentUrl = iframe.src;
    addBookmark(currentUrl);
  });

  // 미니 스크린 헤더를 드래그해서 이동할 수 있도록 설정
  header.addEventListener("mousedown", (event) => {
    const offsetX = event.clientX - miniScreen.getBoundingClientRect().left;
    const offsetY = event.clientY - miniScreen.getBoundingClientRect().top;
    const onMouseMove = (event) => {
      miniScreen.style.left = `${event.clientX - offsetX}px`;
      miniScreen.style.top = `${event.clientY - offsetY}px`;
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // 기본 URL 설정
  const defaultURL = "https://youtube.com";
  iframe.src = defaultURL;

  // GO 버튼 클릭 시 페이지를 이동
  let targetUrl;
  let isComposing = false;

  goButton.addEventListener("click", () => {
    if (!urlInput.value) {
      targetUrl = defaultURL;
    } else if (!urlInput.value.includes(".")) {
      const queryParams = encodeURIComponent(urlInput.value);
      targetUrl = `https://www.google.com/search?q=${queryParams}`;
    } else {
      targetUrl =
        urlInput.value.startsWith("http://") ||
        urlInput.value.startsWith("https://")
          ? urlInput.value
          : "https://" + urlInput.value;
    }
    urlInput.value = "";
    iframe.src = targetUrl;
  });

  // 입력 시작 시 isComposing을 true로 설정
  urlInput.addEventListener("compositionstart", () => {
    isComposing = true;
  });

  // 입력 종료 시 isComposing을 false로 설정
  urlInput.addEventListener("compositionend", () => {
    isComposing = false;
  });

  // ENTER 키를 눌러도 페이지 이동
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isComposing) {
      event.preventDefault();
      goButton.click();
    }
  });

  // CLOSE 버튼 클릭 시 MINISCREEN 종료
  closeButton.addEventListener("click", () => {
    miniScreen.remove();
  });

  // 북마크를 chrome.storage.sync에 저장
  function saveBookmarks() {
    const bookmarks = [...bookmarkList.children].map((item) => {
      const url = item.dataset.url;
      return url;
    });
    chrome.storage.sync.set({ bookmarks: bookmarks }, () => {
      console.log("Bookmarks saved to sync storage");
    });
  }

  // chrome.storage.sync에서 북마크를 로드
  function loadBookmarks() {
    chrome.storage.sync.get(["bookmarks"], (result) => {
      const bookmarks = result.bookmarks || [];
      bookmarks.forEach((url) => addBookmark(url));
    });
  }

  // 북마크 추가
  function addBookmark(url) {
    // 중복된 URL은 추가하지 않음
    if ([...bookmarkList.children].some((item) => item.dataset.url === url)) {
      return;
    }

    const listItem = document.createElement("li");
    listItem.dataset.url = url;
    listItem.textContent = url;
    listItem.addEventListener("click", () => {
      iframe.src = url;
    });
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeBookmark(url);
    });
    listItem.appendChild(deleteButton);
    bookmarkList.appendChild(listItem);
    saveBookmarks();
  }

  // 북마크 삭제
  function removeBookmark(url) {
    const items = [...bookmarkList.children];
    const item = items.find((item) => item.dataset.url === url);
    if (item) {
      bookmarkList.removeChild(item);
      saveBookmarks();
    }
  }

  // 북마크 목록을 표시하거나 숨김
  toggleBookmarkButton.addEventListener("click", () => {
    const bookmarkListElement = miniScreen.querySelector(".bookmark-list");
    bookmarkListElement.style.display =
      bookmarkListElement.style.display === "none" ? "block" : "none";
  });

  // 미니 스크린 생성 시 북마크 데이터 로드
  loadBookmarks();

  document.body.appendChild(miniScreen);
}

init();
