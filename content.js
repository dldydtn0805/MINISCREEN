function init() {
  // MINISCREEN이 꺼진 상태만 동작한다
  if (document.getElementById("miniscreen")) {
    return;
  }

  // MINISCREEN을 위한 DIV를 생성한다
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

  // 직접 HTML을 넣는다
  miniScreen.innerHTML = `
   <div class="mini-screen-header">
     
     <input type="text" id="url-input" placeholder="SEARCH WORD OR URL">
     <button id="go-button" class="button-with-icon">></button>
     <button id="add-bookmark-button" class="button-with-icon">+</button>
     <button id="toggle-bookmark-button" class="button-with-icon">★</button>
     <button id="close-button" class="button-with-icon">X</button>
   </div>
   <ul class="bookmark-list" style="display: none;"></ul>
   <iframe id="mini-iframe"></iframe>
 `;

  // URL 입력 및 이동 기능을 JS로 가져온다
  const urlInput = miniScreen.querySelector("#url-input");
  const goButton = miniScreen.querySelector("#go-button");
  const closeButton = miniScreen.querySelector("#close-button");
  const iframe = miniScreen.querySelector("#mini-iframe");
  const header = miniScreen.querySelector(".mini-screen-header");
  const bookmarkList = miniScreen.querySelector(".bookmark-list");
  const addBookmarkButton = miniScreen.querySelector("#add-bookmark-button");
  const toggleBookmarkButton = miniScreen.querySelector(
    "#toggle-bookmark-button"
  );

  addBookmarkButton.addEventListener("click", () => {
    const currentUrl = iframe.src;
    addBookmark(currentUrl);
  });

  // 미니 스크린 헤더를 드래그해서 이동할 수 있다
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

  // 기본 URL을 설정한다
  const defaultURL = "https://youtube.com";
  iframe.src = defaultURL;

  // GO 버튼은 페이지를 이동시킨다
  let targetUrl;
  goButton.addEventListener("click", () => {
    // 검색어가 없다면 defaultURL로 이동한다
    if (!urlInput.value) {
      targetUrl = defaultURL;
      // 주소 검색 아니라면 구글 검색을 한다
    } else if (!urlInput.value.includes(".")) {
      const queryParams = encodeURIComponent(urlInput.value);
      targetUrl = `https://www.google.com/search?q=${queryParams}`;
      // https:// 를 붙이지 않았더라도 정상적인 주소 이동을 하게 한다
    } else {
      targetUrl =
        urlInput.value.startsWith("http://") ||
        urlInput.value.startsWith("https://")
          ? urlInput.value
          : "https://" + urlInput.value;
    }
    // 입력창을 다시 비운다
    urlInput.value = "";
    iframe.src = targetUrl;
  });

  // ENTER를 해도 페이지를 이동한다
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      goButton.click();
    }
  });

  // CLOSE 버튼은 MINISCREEN을 종료시킨다
  closeButton.addEventListener("click", () => {
    miniScreen.remove();
  });

  // 북마크 데이터 저장
  function saveBookmarks() {
    const bookmarks = [...bookmarkList.children].map((item) => {
      const url = item.dataset.url;
      return url;
    });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  // 북마크 데이터 로드
  function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks.forEach((url) => addBookmark(url));
  }

  // 북마크 추가
  function addBookmark(url) {
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
