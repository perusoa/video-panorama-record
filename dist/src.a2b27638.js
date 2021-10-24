// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/styles.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

require("./styles.css");

Vue.component("video-player-loader", {
  template: "\n    <div class=\"c-video-player-loader\">\n      <div class=\"preloader-wrapper big active\">\n        <div class=\"spinner-layer spinner-blue-only\">\n          <div class=\"circle-clipper left\">\n            <div class=\"circle\"></div>\n          </div><div class=\"gap-patch\">\n            <div class=\"circle\"></div>\n          </div><div class=\"circle-clipper right\">\n            <div class=\"circle\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  "
});
Vue.component("video-player-controls", {
  props: ["video", "currentTime", "duration", "videoMode", "panorama"],
  template: "\n    <div class=\"c-video-player-controls\">\n      <div ref=\"progressBar\" class=\"c-video-player-controls__progress-bar\" @click=\"updateTime\" @mousemove=\"updateHoveredTime\">\n        <div class=\"c-video-player-controls__progress\" :style=\"{ flexBasis: progress + '%', maxWidth: progress + '%' }\"></div>\n        <span ref=\"progressTime\" class=\"c-video-player-controls__progress-time\">{{ hoveredTime | prettyTime }}</span>\n      </div>\n      <div class=\"c-video-player-controls__wrapper\">\n        <button @click=\"togglePlayPause\" class=\"c-video-player-controls__play-pause\">\n          <i v-if=\"!isPlaying\" class=\"material-icons\">play_arrow</i>\n          <i v-if=\"isPlaying\" class=\"material-icons\">pause</i>\n        </button>\n        <button class=\"c-video-player-controls__volume\" @click=\"toggleVolume\">\n          <i v-if=\"volume === 1\" class=\"material-icons\">volume_up</i>\n          <i v-if=\"volume === 0\" class=\"material-icons\">volume_off</i>\n        </button>\n        <div class=\"c-video-player-controls__time\">\n          {{ currentTime | prettyTime }} / {{ duration | prettyTime }}\n        </div>\n        <button class=\"c-video-player-controls__mode btn btn-small btn-flat\" @click=\"$emit('change-video-mode')\">\n          {{ videoMode === 'panorama' ? 'Standard' : 'Panorama' }} View\n        </button>\n        <button v-if=\"videoMode === 'panorama' && browserCanRecord\" class=\"c-video-player-controls__record\" :class=\"{ 'c-video-player-controls__record--recording': isRecording }\" @click=\"toggleRecording\">\n          Rec\n          <i class=\"material-icons\">fiber_manual_record</i>\n          ({{ recordingTime }})\n        </button>\n        <select class=\"c-video-player-controls__playback\" v-model=\"playbackRate\" @change=\"updatePlayback\">\n          <option :value=\"0.5\">0.5x</option>\n          <option :value=\"1.0\">1x</option>\n          <option :value=\"1.5\">1.5x</option>\n          <option :value=\"2.0\">2x</option>\n        </select>\n        <div class=\"c-video-player-controls__seeks\">\n          <button class=\"c-video-player-controls__seek\" @click=\"seekVideo(-10)\">\n            <i class=\"material-icons\">replay_10</i>\n          </button>\n          <button class=\"c-video-player-controls__seek\" @click=\"seekVideo(10)\">\n            <i class=\"material-icons\">forward_10</i>\n          </button>\n        </div>\n        <button @click=\"toggleFullscreen\" class=\"c-video-player-controls__fullscreen\">\n          <i class=\"material-icons\">fullscreen</i>\n        </button>\n      </div>\n    </div>\n  ",
  data: function data() {
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
  mounted: function mounted() {
    this.updateProgress();

    if (this.videoMode === 'panorama') {
      if (MediaRecorder.isTypeSupported('video/webm')) {
        this.browserCanRecord = true;
        this.initializeVideoStream();
      }
    }
  },
  methods: {
    updateProgress: function updateProgress() {
      this.progress = this.currentTime / this.duration * 100;
    },
    updateTime: function updateTime(event) {
      var x = event.offsetX;
      var width = this.$refs.progressBar.clientWidth;
      var percentHovered = x / width;
      this.video.currentTime = this.duration * percentHovered;
    },
    updateHoveredTime: function updateHoveredTime(event) {
      var x = event.offsetX;
      var width = this.$refs.progressBar.clientWidth;
      var percentHovered = x / width;
      this.hoveredTime = this.duration * percentHovered;
      this.$refs.progressTime.style.left = "calc(" + percentHovered * 100 + "% - " + this.$refs.progressTime.clientWidth / 2 + "px)";
    },
    togglePlayPause: function togglePlayPause() {
      if (this.video.paused) {
        this.video.play();
        this.isPlaying = true;
      } else {
        this.video.pause();
        this.isPlaying = false;
      }
    },
    seekVideo: function seekVideo(duration) {
      this.video.currentTime += duration;
    },
    updatePlayback: function updatePlayback(event) {
      this.video.playbackRate = event.target.value;
    },
    toggleVolume: function toggleVolume() {
      this.volume = this.volume === 1 ? 0 : 1;

      if (this.volume === 0) {
        this.video.muted = true;
        this.video.volume = 0;
      } else {
        this.video.muted = false;
        this.video.volume = 1;
      }
    },
    toggleFullscreen: function toggleFullscreen() {
      if (this.video.requestFullscreen) {
        this.video.requestFullscreen();
      } else if (this.video.webkitRequestFullscreen) {
        this.video.webkitRequestFullscreen();
      } else if (this.video.msRequestFullscreen) {
        this.video.msRequestFullscreen();
      } else if (this.video.webkitEnterFullScreen) {
        this.video.webkitEnterFullScreen();
      }
    },
    initializeVideoStream: function initializeVideoStream() {
      var _this = this;

      this.videoStream = this.panorama.captureStream();
      var streamOptions;

      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        streamOptions = {
          mimeType: 'video/webm; codecs=vp9'
        };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        streamOptions = {
          mimeType: 'video/webm; codecs=vp8'
        };
      } else {
        streamOptions = {
          mimeType: 'video/webm'
        };
      }

      this.mediaRecorder = new MediaRecorder(this.videoStream, streamOptions);
      this.mediaRecorder.addEventListener('dataavailable', function (e) {
        _this.videoChunks.push(e.data);
      });
      this.mediaRecorder.addEventListener('stop', function (e) {
        var videoBlob = new Blob(_this.videoChunks, {
          'type': 'video/mp4'
        });
        _this.videoChunks = [];
        _this.clippedVideo = URL.createObjectURL(videoBlob);

        if (window.confirm('Are you sure you want to download this clip?')) {
          _this.downloadVideoFile(videoBlob, uuidv4() + '.mp4');
        }
      });
    },
    toggleRecording: function toggleRecording() {
      if (!this.isRecording) {
        this.startVideoRecording();
      } else {
        this.stopVideoRecording();
      }
    },
    startVideoRecording: function startVideoRecording() {
      var _this2 = this;

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.recordingInterval = setInterval(function () {
        _this2.recordingTime++;

        if (_this2.recordingTime > 60) {
          _this2.stopVideoRecording();
        }
      }, 1000);
    },
    stopVideoRecording: function stopVideoRecording() {
      this.mediaRecorder.stop();
      this.isRecording = false;
      clearInterval(this.recordingInterval);
      this.recordingTime = 0;
    },
    downloadVideoFile: function downloadVideoFile(data, filename, mime, bom) {
      var blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
      var blob = new Blob(blobData, {
        type: mime || 'application/octet-stream'
      });

      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var blobURL = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename); // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.

        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click(); // Fixes "webkit blob resource error 1"

        setTimeout(function () {
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        }, 200);
      }
    }
  },
  watch: {
    currentTime: function currentTime() {
      this.updateProgress();
    }
  },
  filters: {
    prettyTime: function prettyTime(value) {
      var hrs = ~~(value / 3600);
      var mins = ~~(value % 3600 / 60);
      var secs = ~~value % 60;
      var ret = "";

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
  template: "\n    <div class=\"c-video-player\">\n      <div v-if=\"isPanoramaMode\" ref=\"panoramaWrapper\" class=\"c-video-player__video\">\n        <div class=\"c-video-player__help-text\" ref=\"panoramaHelpText\">Click &amp; Drag To Navigate Panorama</div>\n        <canvas ref=\"panorama\" class=\"c-video-player__canvas\"></canvas>\n        <video-player-controls\n          v-if=\"video\"\n          :video=\"video\"\n          :current-time=\"currentTime\"\n          :duration=\"duration\"\n          :video-mode=\"videoMode\"\n          :panorama=\"panorama\"\n          @change-video-mode=\"toggleVideoMode\">\n        </video-player-controls>\n        <video-player-loader v-if=\"isLoading\"></video-player-loader>\n      </div>\n      <div class=\"c-video-player__video\" :class=\"{ 'c-video-player__video--panorama': isPanoramaMode }\">\n        <video\n          ref=\"video\"\n          class=\"c-video-player__player\"\n          :src=\"currentVideo\"\n          width=\"3840\"\n          height=\"900\"\n          playsinline\n          crossorigin=\"anonymous\"\n          @timeupdate=\"updateTime\"\n          @loadedmetadata=\"updateDuration\"\n        >\n          <source :src=\"currentVideo\" type=\"video/mp4\">\n        </video>\n        <video-player-controls\n          v-if=\"video && !isPanoramaMode\"\n          :video=\"video\"\n          :current-time=\"currentTime\"\n          :duration=\"duration\"\n          :video-mode=\"videoMode\"\n          @change-video-mode=\"toggleVideoMode\">\n        </video-player-controls>\n      </div>\n    </div>\n  ",
  data: function data() {
    return {
      isLoading: false,
      videoMode: "panorama",
      // 'hd' or 'panorama'
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
    currentVideo: function currentVideo() {
      return this.videoMode === "panorama" ? this.panoramaVideoUrl : this.hdVideoUrl;
    },
    isPanoramaMode: function isPanoramaMode() {
      return this.videoMode === "panorama";
    }
  },
  mounted: function mounted() {
    this.isLoading = true;
    this.video = this.$refs.video;

    if (this.videoMode === 'panorama') {
      this.initializeVideoCanvas();
    }
  },
  methods: {
    initializeVideoCanvas: function initializeVideoCanvas() {
      var _this3 = this;

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

      var render = function render() {
        _this3.canvas.renderAll();

        fabric.util.requestAnimFrame(render);
      };

      fabric.util.requestAnimFrame(render);
      this.canvas.on("object:moving", this.handleCanvasBoundaries);
      this.canvas.on("mouse:wheel", this.setZoom);
      this.canvas.on("mouse:down", function () {
        _this3.$refs.panoramaHelpText.classList.add("is-hidden");
      });
      this.currentX = this.videoEl.left;
      this.currentY = this.videoEl.top;
    },
    handleCanvasBoundaries: function handleCanvasBoundaries(event) {
      var obj = event.target;
      var canvasWidth = this.panorama.clientWidth;
      var canvasHeight = this.panorama.clientHeight;
      var canvasEdgeLeft = 0;
      var canvasEdgeTop = 0;
      obj.setCoords();
      this.xBoundary = canvasWidth - obj.getScaledWidth();
      this.yBoundary = canvasHeight - obj.getScaledHeight();
      var scaledVideo = obj.getBoundingRect();
      canvasEdgeLeft = (this.canvas.getWidth() * this.zoom - this.canvas.getWidth()) / 4;
      canvasEdgeTop = (this.canvas.getHeight() * this.zoom - this.canvas.getHeight()) / 4;
      this.xBoundary = this.xBoundary - canvasEdgeLeft / 2;
      this.yBoundary = this.yBoundary - canvasEdgeTop / 2;

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
    toggleVideoMode: function toggleVideoMode() {
      var _this4 = this;

      this.videoMode = this.videoMode === "panorama" ? "hd" : "panorama";

      if (this.videoMode === "panorama") {
        this.$nextTick(function () {
          _this4.initializeVideoCanvas();
        });
      }
    },
    sizeCanvas: function sizeCanvas() {
      this.$refs.panorama.width = this.$refs.panoramaWrapper.clientWidth;
      this.$refs.panorama.height = this.$refs.panoramaWrapper.clientHeight;
    },
    resizeCanvas: function resizeCanvas() {
      this.canvas.setWidth(this.$refs.panoramaWrapper.clientWidth);
      this.canvas.setHeight(this.$refs.panoramaWrapper.clientHeight);
      this.videoEl.scaleToHeight(this.panorama.clientHeight);
      this.canvas.calcOffset();
      this.canvas.centerObject(this.videoEl);
    },
    updateTime: function updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
    updateDuration: function updateDuration(event) {
      this.isLoading = false;
      this.duration = event.target.duration;
    },
    setZoom: function setZoom(_ref) {
      var event = _ref.e;
      this.zoom += event.deltaY * -0.01;
      this.zoom = Number(Math.min(Math.max(1, this.zoom), 4).toFixed(2));
      var canvasCenter = this.canvas.getCenter();
      this.canvas.zoomToPoint({
        x: canvasCenter.left,
        y: canvasCenter.top
      }, this.zoom);
      this.videoEl.setCoords();
      event.preventDefault();
      event.stopPropagation();
      this.canvas.fire('object:moving', {
        target: this.videoEl
      });
    }
  },
  watch: {
    currentVideo: function currentVideo() {
      var _this5 = this;

      this.isLoading = true;
      this.$nextTick(function () {
        _this5.video.currentTime = _this5.currentTime;

        _this5.$forceUpdate();
      });
    }
  }
});
new Vue({
  el: "#app"
});
},{"./styles.css":"src/styles.css"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58396" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map