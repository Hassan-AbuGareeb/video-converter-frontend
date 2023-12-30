"use client";
import { useEffect, useState } from "react";
import Search from "@/util/Search";

export default function Home() {
  //search entered by user
  const [search, setSearch] = useState("");
  //search results from the api
  const [searchResults, setSearchResults] = useState([]);

  //download list states
  const [downloadsList, setDownloadsList] = useState([]);

  useEffect(() => {
    //fetch only if the search contains any value
    search &&
      getSearchResults(search).then((videos) => setSearchResults(videos.items));
  }, [search]);

  function addToList(videoId, videoName, thumbnail) {
    for (const vid of downloadsList) {
      if (vid.videoName === videoName) {
        alert("video already exists");
        return;
      }
    }
    setDownloadsList((prev) => {
      return [...prev, { videoId, videoName, thumbnail }];
    });
  }

  function removeAllDownloads() {
    setDownloadsList([]);
  }

  function removeFromList(videoName) {
    let tempDownloadsList = [];
    for (const vid of downloadsList) {
      if (vid.videoName !== videoName) {
        tempDownloadsList = [...tempDownloadsList, vid];
      }
    }
    setDownloadsList([...tempDownloadsList]);
  }

  function downloadAll() {
    for (const vid of downloadsList) {
      getVideoMp3File(vid.videoId, vid.videoName);
    }
    removeAllDownloads();
  }

  const videoCards = searchResults.map((video) => {
    const videoId = video.id.videoId;
    const videoTitle = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.default.url;
    return (
      <div
        key={videoId}
        className="flex felx-col flex-wrap justify-center w-[350px] p-2 bg-slate-500 rounded-lg shadow-lg shadow-violet-700/50"
      >
        {/* display the fetched video */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          allowFullScreen={true}
          className="rounded-lg w-80 h-48 border border-slate-400 "
        />
        <div className="px-auto py-2 text-center flex flex-col justify-between">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
            {videoTitle}
          </h5>
          <div className="flex flex-wrap gap-x-5 justify-center py-3">
            <button
              onClick={() => getVideoMp3File(videoId, videoTitle)}
              className="text-slate-300  bg-slate-700 rounded-md font-semibold px-3 py-1 hover:bg-slate-800"
            >
              Download MP3
            </button>
            <button
              onClick={() => addToList(videoId, videoTitle, thumbnail)}
              className="text-slate-300 bg-slate-700 rounded-md font-semibold px-3 py-1 hover:bg-slate-800"
            >
              Add to download list
            </button>
          </div>
        </div>
      </div>
    );
  });

  const downloadsListCards = downloadsList.map((video) => {
    return (
      <div
        key={video.videoId}
        className="bg-slate-600 w-full h-24 p-2 rounded-md flex flex-row justify-between items-center"
      >
        <p className="text-slate-300 text-md font-semibold w-56">
          {video.videoName}
        </p>
        <button
          className="text-slate-300  bg-red-500 rounded-md font-semibold px-3 py-1 hover:bg-slate-800 w-20 h-10 "
          onClick={() => removeFromList(video.videoName)}
        >
          Remove
        </button>
      </div>
    );
  });

  return (
    <div className="">
      <Search onSearchClick={setSearch} />
      <div className="flex flex-row p-4 justify-between">
        <div
          className={`flex flex-row flex-wrap 
           py-5 justify-center gap-10`}
        >
          {videoCards}
        </div>
        {downloadsList.length !== 0 && (
          <div
            className={`bg-slate-300 rounded-lg w-[800px] max-h-[1100px] mr-9 px-4 py-4 overflow-y-scroll`}
          >
            <div className="flex flex-row justify-between">
              <button
                className="text-slate-300  bg-slate-700 rounded-md font-semibold px-3 py-1 hover:bg-slate-800"
                onClick={downloadAll}
              >
                Download All
              </button>
              <button
                className="text-slate-300  bg-slate-700 rounded-md font-semibold px-3 py-1 hover:bg-slate-800"
                onClick={removeAllDownloads}
              >
                Remove All
              </button>
            </div>
            <div className="w-full my-4 flex flex-col gap-y-4 rounded-md">
              {downloadsListCards}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function getSearchResults(videoTitle) {
  const options = {
    headers: {
      Accept: "application/json",
    },
  };
  const searchResultsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAVUpF36gRO-H4bRwq5o4kRb9AFotteCKE&q=${videoTitle}&type=video&part=snippet&maxResults=5&videoDuration=any&videoCategoryId=10`,
    options
  );
  const searchResultsData = await searchResultsResponse.json();
  return searchResultsData;
}

async function getVideoMp3File(videoId, videoName) {
  try {
    const mp3FileResp = await fetch(
      `https://video-converter-backend-production-b841.up.railway.app/${videoId}`
    );
    const mp3FileData = await mp3FileResp.blob();
    if (mp3FileResp.ok) {
      console.log("hello");
      //search for this thing
      const url = window.URL.createObjectURL(mp3FileData);
      //create an anchor tag, assign it the url and download path, and click it.
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      //search for this thing too
      window.URL.revokeObjectURL(url);
    } else {
      alert("Error converting video");
    }
  } catch (error) {
    console.error("Error converting video", error);
  }
}
