init();

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
        <input type="text" id="url-input" placeholder="ARCA LIVE">
        <button id="go-button">Go</button>
        <button id="close-button">Close</button>
      </div>
      <iframe id="mini-iframe"></iframe>
    `;

  // URL 입력 및 이동 기능을 JS로 가져온다
  const urlInput = miniScreen.querySelector("#url-input");
  const goButton = miniScreen.querySelector("#go-button");
  const closeButton = miniScreen.querySelector("#close-button");
  const iframe = miniScreen.querySelector("#mini-iframe");
  const header = miniScreen.querySelector(".mini-screen-header");

  // 드래그 기능
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
  const defaultURL = "https://arca.live";
  iframe.src = defaultURL;

  // GO 버튼은 페이지를 이동시킨다
  let targetUrl;
  goButton.addEventListener("click", () => {
    // 주소가 아니라면 나무위키로 검색한다
    if (!urlInput.value) {
      targetUrl = defaultURL;
    } else if (!urlInput.value.includes(".")) {
      const queryParams = encodeURIComponent(urlInput.value);
      targetUrl = `https://namu.wiki/w/${queryParams}`;
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

  document.body.appendChild(miniScreen);
}
