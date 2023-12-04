import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const streamBtn = document.getElementById("streamBtn");
const previewVideo = document.getElementById("previewVideo");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  mp4: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  streamBtn.removeEventListener("click", handleDownload);
  streamBtn.innerText = "Transcoding";
  streamBtn.disabled = true;
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => console.log(message));
  const coreResponse = await fetch(`${baseURL}/ffmpeg-core.js`);
  const wasmResponse = await fetch(`${baseURL}/ffmpeg-core.wasm`);
  const coreBlob = new Blob([await coreResponse.text()], {
    type: "text/javascript",
  });
  const wasmBlob = new Blob([await wasmResponse.arrayBuffer()], {
    type: "application/wasm",
  });
  const coreURL = URL.createObjectURL(coreBlob);
  const wasmURL = URL.createObjectURL(wasmBlob);
  await ffmpeg.load({ coreURL, wasmURL });
  await ffmpeg.writeFile(files.input, await fetchFile(videoFile));
  await ffmpeg.exec(["-i", files.input, "-r", "60", files.mp4]);
  await ffmpeg.exec([
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb,
  ]);
  const mp4File = await ffmpeg.readFile(files.mp4);
  const thumbnailFile = await ffmpeg.readFile(files.thumb);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "img/jpg" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

  downloadFile(mp4Url, "My recording.mp4");

  downloadFile(thumbnailUrl, "My Thumbnail.jpg");

  ffmpeg.exec(["unlink", files.input]);
  ffmpeg.exec(["unlink", files.mp4]);
  ffmpeg.exec(["unlink", files.thumb]);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbnailUrl);
  URL.revokeObjectURL(videoFile);
  streamBtn.disabled = false;
  streamBtn.innerText = "Recording again";
  streamBtn.addEventListener("click", handleRecording);
  init();
};

const handleStopRecording = () => {
  streamBtn.innerText = "Download Recording";
  streamBtn.removeEventListener("click", handleStopRecording);
  streamBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleRecording = () => {
  streamBtn.innerText = "Stop Recording";
  streamBtn.removeEventListener("click", handleRecording);
  streamBtn.addEventListener("click", handleStopRecording);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    previewVideo.srcObject = null;
    previewVideo.src = videoFile;
    previewVideo.loop = true;
    previewVideo.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  previewVideo.srcObject = stream;
  previewVideo.play();
};
init();

streamBtn.addEventListener("click", handleRecording);
