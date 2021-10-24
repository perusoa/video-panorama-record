import "./styles.css";

Vue.component("video-player-loader", {
  template: `
    <div class="c-video-player-loader">
      <div class="preloader-wrapper big active">
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div><div class="gap-patch">
            <div class="circle"></div>
          </div><div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    </div>
  `
});

Vue.component("video-player-controls", {
  props: ["video", "currentTime", "duration", "videoMode", "panorama"],
  template: `
    <div class="c-video-player-controls">
      <div ref="progressBar" class="c-video-player-controls__progress-bar" @click="updateTime" @mousemove="updateHoveredTime">
        <div class="c-video-player-controls__progress" :style="{ flexBasis: progress + '%', maxWidth: progress + '%' }"></div>
        <span ref="progressTime" class="c-video-player-controls__progress-time">{{ hoveredTime | prettyTime }}</span>
      </div>
      <div class="c-video-player-controls__wrapper">
        <button @click="togglePlayPause" class="c-video-player-controls__play-pause">
          <i v-if="!isPlaying" class="material-icons">play_arrow</i>
          <i v-if="isPlaying" class="material-icons">pause</i>
        </button>
        <button class="c-video-player-controls__volume" @click="toggleVolume">
          <i v-if="volume === 1" class="material-icons">volume_up</i>
          <i v-if="volume === 0" class="material-icons">volume_off</i>
          {{ volume }}
        </button>
        <div class="c-video-player-controls__time">
          {{ currentTime | prettyTime }} / {{ duration | prettyTime }}
        </div>
        <button class="c-video-player-controls__mode btn btn-small btn-flat" @click="$emit('change-video-mode')">
          {{ videoMode === 'panorama' ? 'Standard' : 'Panorama' }} View
        </button>
        <button v-if="videoMode === 'panorama' && browserCanRecord" class="c-video-player-controls__record" :class="{ 'c-video-player-controls__record--recording': isRecording }" @click="toggleRecording">
          Rec
          <i class="material-icons">fiber_manual_record</i>
          ({{ recordingTime }})
        </button>
        <select class="c-video-player-controls__playback" v-model="playbackRate" @change="updatePlayback">
          <option :value="0.5">0.5x</option>
          <option :value="1.0">1x</option>
          <option :value="1.5">1.5x</option>
          <option :value="2.0">2x</option>
        </select>
        <div class="c-video-player-controls__seeks">
          <button class="c-video-player-controls__seek" @click="seekVideo(-10)">
            <i class="material-icons">replay_10</i>
          </button>
          <button class="c-video-player-controls__seek" @click="seekVideo(10)">
            <i class="material-icons">forward_10</i>
          </button>
        </div>
        <button @click="toggleFullscreen" class="c-video-player-controls__fullscreen">
          <i class="material-icons">fullscreen</i>
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      isPlaying: !this.video.paused,
      volume: 1,
      playbackRate: 1.0,
      progress: 0,
      hoveredTime: 0,
      isRecording: false,
      videoChunks: [],
      videoStream: null,
      mediaRecorder: null,
      recordingInterval: null,
      recordingTime: 0,
      browserCanRecord: false
    };
  },
  mounted () {
    this.updateProgress();
    if (this.videoMode === 'panorama') {
      if (MediaRecorder.isTypeSupported('video/webm')) {
        this.browserCanRecord = true;
        this.initializeVideoStream();
      }
    }
  },
  methods: {
    updateProgress () {
      this.progress = (this.currentTime / this.duration) * 100;
    },
    updateTime(event) {
      const x = event.offsetX;
      const width = this.$refs.progressBar.clientWidth;
      const percentHovered = x / width;
      this.video.currentTime = this.duration * percentHovered;
    },
    updateHoveredTime(event) {
      const x = event.offsetX;
      const width = this.$refs.progressBar.clientWidth;
      const percentHovered = x / width;
      this.hoveredTime = this.duration * percentHovered;
      this.$refs.progressTime.style.left =
        "calc(" +
        percentHovered * 100 +
        "% - " +
        this.$refs.progressTime.clientWidth / 2 +
        "px)";
    },
    togglePlayPause() {
      if (this.video.paused) {
        this.video.play();
        this.isPlaying = true;
      } else {
        this.video.pause();
        this.isPlaying = false;
      }
    },
    seekVideo(duration) {
      this.video.currentTime += duration;
    },
    updatePlayback(event) {
      this.video.playbackRate = event.target.value;
    },
    toggleVolume() {
      this.volume = this.volume === 1 ? 0 : 1;
      if (this.volume === 0) {
        this.video.muted = true;
        this.video.volume = 0;
      } else {
        this.video.muted = false;
        this.video.volume = 1;
      }
    },
    toggleFullscreen() {
      if (this.video.requestFullscreen) {
        this.video.requestFullscreen();
      } else if (this.video.webkitRequestFullscreen) {
        this.video.webkitRequestFullscreen();
      } else if (this.video.msRequestFullscreen) {
        this.video.msRequestFullscreen();
      }
    },
    initializeVideoStream () {
      this.videoStream = this.panorama.captureStream();
      let streamOptions;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        streamOptions = { mimeType: 'video/webm; codecs=vp9' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        streamOptions = { mimeType: 'video/webm; codecs=vp8' };
      } else {
        streamOptions = { mimeType: 'video/webm' };
      }
      this.mediaRecorder = new MediaRecorder(this.videoStream, streamOptions);

      this.mediaRecorder.addEventListener('dataavailable', (e) => {
        this.videoChunks.push(e.data);
      });

      this.mediaRecorder.addEventListener('stop', (e) => {
        const videoBlob = new Blob(this.videoChunks, { 'type': 'video/mp4' });
        this.videoChunks = [];
        this.clippedVideo = URL.createObjectURL(videoBlob);
        if (window.confirm('Are you sure you want to download this clip?')) {
          this.downloadVideoFile(videoBlob, uuidv4() + '.mp4');
        }
      });
    },
    toggleRecording () {
      if (!this.isRecording) {
        this.startVideoRecording();
      } else {
        this.stopVideoRecording();
      }
    },
    startVideoRecording () {
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.recordingInterval = setInterval(() => {
        this.recordingTime++;
        if (this.recordingTime > 60) {
          this.stopVideoRecording();
        }
      }, 1000);
    },
    stopVideoRecording () {
      this.mediaRecorder.stop();
      this.isRecording = false;
      clearInterval(this.recordingInterval);
      this.recordingTime = 0;
    },
    downloadVideoFile (data, filename, mime, bom) {
      var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
      var blob = new Blob(blobData, {type: mime || 'application/octet-stream'});
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      }
      else {
        var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();

        // Fixes "webkit blob resource error 1"
        setTimeout(function() {
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        }, 200);
      }
    }
  },
  watch: {
    currentTime() {
      this.updateProgress();
    }
  },
  filters: {
    prettyTime(value) {
      let hrs = ~~(value / 3600);
      let mins = ~~((value % 3600) / 60);
      let secs = ~~value % 60;

      let ret = "";
      if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
      }
      ret += "" + mins + ":" + (secs < 10 ? "0" : "");
      ret += "" + secs;
      return ret;
    }
  }
});

Vue.component("video-player", {
  props: ["hdVideoUrl", "panoramaVideoUrl"],
  template: `
    <div class="c-video-player">
      <div v-if="isPanoramaMode" ref="panoramaWrapper" class="c-video-player__video">
        <div class="c-video-player__help-text" ref="panoramaHelpText">Click &amp; Drag To Navigate Panorama</div>
        <canvas ref="panorama" class="c-video-player__canvas"></canvas>
        <video-player-controls
          v-if="video"
          :video="video"
          :current-time="currentTime"
          :duration="duration"
          :video-mode="videoMode"
          :panorama="panorama"
          @change-video-mode="toggleVideoMode">
        </video-player-controls>
        <video-player-loader v-if="isLoading"></video-player-loader>
      </div>
      <div class="c-video-player__video" :class="{ 'c-video-player__video--panorama': isPanoramaMode }">
        <video
          ref="video"
          class="c-video-player__player"
          :src="currentVideo"
          width="3840"
          height="900"
          playsinline
          crossorigin="anonymous"
          @timeupdate="updateTime"
          @loadedmetadata="updateDuration"
        >
          <source :src="currentVideo" type="video/mp4">
        </video>
        <video-player-controls
          v-if="video && !isPanoramaMode"
          :video="video"
          :current-time="currentTime"
          :duration="duration"
          :video-mode="videoMode"
          @change-video-mode="toggleVideoMode">
        </video-player-controls>
      </div>
    </div>
  `,
  data() {
    return {
      isLoading: false,
      videoMode: "panorama", // 'hd' or 'panorama'
      canvas: null,
      video: null,
      videoEl: null,
      panorama: null,
      xBoundary: 0,
      yBoundary: 0,
      currentX: 0,
      currentY: 0,
      zoom: 1,
      currentTime: 0,
      duration: 0
    };
  },
  computed: {
    currentVideo() {
      return this.videoMode === "panorama"
        ? this.panoramaVideoUrl
        : this.hdVideoUrl;
    },
    isPanoramaMode() {
      return this.videoMode === "panorama";
    }
  },
  mounted() {
    this.isLoading = true;
    this.video = this.$refs.video;
    if (this.videoMode === 'panorama') {
      this.initializeVideoCanvas();
    }
  },
  methods: {
    initializeVideoCanvas() {
      this.sizeCanvas();
      window.addEventListener("resize", this.resizeCanvas);
      this.canvas = new fabric.Canvas(this.$refs.panorama);
      this.canvas.selection = false;
      this.panorama = this.$refs.panorama;
      this.videoEl = new fabric.Image(this.video, {
        left: 0,
        top: 0,
        objectCaching: false,
        hasControls: false,
        hasBorders: false,
        centeredScaling: true
      });

      this.videoEl.scaleToHeight(this.panorama.clientHeight);
      this.canvas.add(this.videoEl);
      this.canvas.centerObject(this.videoEl);

      const render = () => {
        this.canvas.renderAll();
        fabric.util.requestAnimFrame(render);
      };

      fabric.util.requestAnimFrame(render);

      this.canvas.on("object:moving", this.handleCanvasBoundaries);
      this.canvas.on("mouse:wheel", this.setZoom);
      this.canvas.on("mouse:down", () => {
        this.$refs.panoramaHelpText.classList.add("is-hidden");
      });

      this.currentX = this.videoEl.left;
      this.currentY = this.videoEl.top;
    },
    handleCanvasBoundaries(event) {
      let obj = event.target;
      const canvasWidth = this.panorama.clientWidth;
      const canvasHeight = this.panorama.clientHeight;
      let canvasEdgeLeft = 0;
      let canvasEdgeTop = 0;
      obj.setCoords();
      this.xBoundary = canvasWidth - obj.getScaledWidth();
      this.yBoundary = canvasHeight - obj.getScaledHeight();
      const scaledVideo = obj.getBoundingRect();
      canvasEdgeLeft = (((this.canvas.getWidth() * this.zoom) - this.canvas.getWidth()) / 4);
      canvasEdgeTop = (((this.canvas.getHeight() * this.zoom) -this.canvas.getHeight()) / 4);
      this.xBoundary = this.xBoundary - (canvasEdgeLeft / 2);
      this.yBoundary = this.yBoundary - (canvasEdgeTop / 2);

      if (obj.left > canvasEdgeLeft) {
        obj.left = canvasEdgeLeft;
      } else if (obj.left < this.xBoundary) {
        obj.left = this.xBoundary;
      }

      if (obj.top > canvasEdgeTop) {
        obj.top = canvasEdgeTop;
      } else if (obj.top < this.yBoundary) {
        obj.top = this.yBoundary;
      }
    },
    toggleVideoMode() {
      this.videoMode = this.videoMode === "panorama" ? "hd" : "panorama";
      if (this.videoMode === "panorama") {
        this.$nextTick(() => {
          this.initializeVideoCanvas();
        });
      }
    },
    sizeCanvas() {
      this.$refs.panorama.width = this.$refs.panoramaWrapper.clientWidth;
      this.$refs.panorama.height = this.$refs.panoramaWrapper.clientHeight;
    },
    resizeCanvas() {
      this.canvas.setWidth(this.$refs.panoramaWrapper.clientWidth);
      this.canvas.setHeight(this.$refs.panoramaWrapper.clientHeight);
      this.videoEl.scaleToHeight(this.panorama.clientHeight);
      this.canvas.calcOffset();
      this.canvas.centerObject(this.videoEl);
    },
    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
    updateDuration(event) {
      this.isLoading = false;
      this.duration = event.target.duration;
    },
    setZoom({ e: event }) {
      this.zoom += event.deltaY * -0.01;
      this.zoom = Number(Math.min(Math.max(1, this.zoom), 4).toFixed(2));
      const canvasCenter = this.canvas.getCenter();
      this.canvas.zoomToPoint({ x: canvasCenter.left, y: canvasCenter.top }, this.zoom);
      this.videoEl.setCoords();
      event.preventDefault();
      event.stopPropagation();
      this.canvas.fire('object:moving', { target: this.videoEl });
    }
  },
  watch: {
    currentVideo() {
      this.isLoading = true;
      this.$nextTick(() => {
        this.video.currentTime = this.currentTime;
        this.$forceUpdate();
      });
    }
  }
});

new Vue({
  el: "#app"
});
