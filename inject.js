const partyUtil = {
  secondsTimeToHms: (d) => {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const hDisplay = h > 0 ? h + "小時" : "";
    const mDisplay = m > 0 ? m + "分" : "";
    const sDisplay = s > 0 ? s + "秒" : "";
    return hDisplay + mDisplay + sDisplay;
  },
};

const initHtmlController = (elementSingleton) => {
  switch (elementSingleton.getPaltform()) {
    case "youtube":
      elementSingleton.getChatHeader().prepend(elementSingleton.getPartyInfo());
      break;
    case "netflix":
      elementSingleton
        .getChatHeader()
        .appendChild(elementSingleton.getPartyInfo());
      break;
  }
};

const initVideoController = (elementSingleton) => {
  elementSingleton.getPlatformVideoPlayer().addCurrentTimeChangedEvent(() => {
    elementSingleton.getPartyInfo().textContent = partyUtil.secondsTimeToHms(
      Math.floor(
        elementSingleton.getPlatformVideoPlayer().getCurrentTime() /
          { netflix: 1000, youtube: 1 }[elementSingleton.getPaltform()]
      )
    );
  });
};

const initElementSingleton = () => {
  let partyInfo = document.createElement("div");
  let timeline = document.createTextNode("");
  partyInfo.id = "show-party-timeline";
  partyInfo.appendChild(timeline);

  const url = document.URL;
  const [paltform, err] = url.match(/youtube/)
    ? ["youtube", null]
    : url.match(/netflix/)
    ? ["netflix", null]
    : ["", new Error("not match paltform")];
  if (err) {
    return [null, err];
  }

  let paltformVideoPlayer = null;

  switch (paltform) {
    case "youtube":
      partyInfo.style = "padding:13px;font-size:16px;color:#969696;";

      let youtubePlayer = document.getElementById("movie_player");
      youtubePlayer.addCurrentTimeChangedEvent = (callback) => {
        setInterval(callback, 1000);
      };
      paltformVideoPlayer = youtubePlayer;
      break;
    case "netflix":
      partyInfo.style = "color:#969696;";

      const videoPlayer =
        netflix.appContext.state.playerApp.getAPI().videoPlayer;
      const netflixPlayer = videoPlayer.getVideoPlayerBySessionId(
        videoPlayer.getAllPlayerSessionIds()[0]
      );
      netflixPlayer.addCurrentTimeChangedEvent = (callback) => {
        netflixPlayer.addEventListener("currenttimechanged", callback);
      };
      paltformVideoPlayer = netflixPlayer;
      break;
  }

  return [
    {
      getPaltform: () => paltform,
      getPartyInfo: () => {
        return partyInfo;
      },
      getPartyInfo: () => {
        return partyInfo;
      },
      getChatHeader: () => {
        return {
          netflix: document.getElementById("chat-header-container"),
          youtube: document.getElementById("youtube-party-sidebar"),
        }[paltform];
      },
      getPlatformVideoPlayer: () => {
        return paltformVideoPlayer;
      },
    },
    null,
  ];
};

(() => {
  const [elementSingleton, err] = initElementSingleton();
  if (err) {
    console.error("init element singleton error: ", err);
    return;
  }

  initHtmlController(elementSingleton);
  initVideoController(elementSingleton);
})();
