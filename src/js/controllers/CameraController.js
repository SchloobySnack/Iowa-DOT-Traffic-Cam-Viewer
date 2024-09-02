import CameraModel from '../models/CameraModel.js';
import CameraView from '../views/CameraView.js';
import config from '../config.js';

class CameraController {
    constructor() {
        this.model = new CameraModel();
        this.view = new CameraView();
        this.activeVideos = new Map();
        this.showingFavorites = false;
        this.maxSimultaneousVideos = config.maxSimultaneousVideos;

        this.view.regionFilter.addEventListener('change', () => this.filterCameras());
        this.view.sortNameBtn.addEventListener('click', () => this.sortCameras('name'));
        this.view.sortRegionBtn.addEventListener('click', () => this.sortCameras('region'));
        this.view.showFavoritesBtn.addEventListener('click', () => this.toggleFavorites());
    }

    async init() {
        await this.model.fetchCameras();
        this.view.populateRegionFilter(this.model.getRegions());
        this.renderCameras();
    }

    renderCameras() {
        let filteredCameras = this.model.cameras;
        const selectedRegion = this.view.regionFilter.value;

        if (selectedRegion !== 'all') {
            filteredCameras = filteredCameras.filter(camera => camera.region === selectedRegion);
        }

        if (this.showingFavorites) {
            filteredCameras = filteredCameras.filter(camera => this.model.isFavorite(camera.name));
        }

        filteredCameras = filteredCameras.map(camera => ({
            ...camera,
            isFavorite: this.model.isFavorite(camera.name)
        }));

        this.view.renderCameras(
            filteredCameras,
            (cameraName, button) => this.toggleFavorite(cameraName, button),
            (camera, cameraItem, index) => this.toggleStream(camera, cameraItem, index)
        );
    }

    filterCameras() {
        this.renderCameras();
    }

    sortCameras(key) {
        this.model.sortCameras(key);
        this.renderCameras();
    }

    toggleFavorite(cameraName, button) {
        this.model.toggleFavorite(cameraName);
        const isFavorite = this.model.isFavorite(cameraName);
        this.view.updateFavoriteButton(button, isFavorite);
        if (this.showingFavorites) {
            this.renderCameras();
        }
    }

    toggleFavorites() {
        this.showingFavorites = !this.showingFavorites;
        this.view.updateShowFavoritesButton(this.showingFavorites);
        this.renderCameras();
    }

    toggleStream(camera, cameraItem, index) {
        const videoId = `video-${index}`;
        const mediaContainer = cameraItem.querySelector('.media-container');
        let video = mediaContainer.querySelector(`#${videoId}`);
        
        if (video) {
            if (video.paused) {
                this.playVideo(video, videoId);
            } else {
                this.pauseVideo(video, videoId);
            }
        } else {
            if (this.activeVideos.size >= this.maxSimultaneousVideos) {
                alert(`You can only play ${this.maxSimultaneousVideos} videos simultaneously. Please pause a video before starting a new one.`);
                return;
            }
    
            video = document.createElement('video');
            video.id = videoId;
            video.controls = true;
            video.className = 'w-full h-full object-cover absolute top-0 left-0';
            mediaContainer.appendChild(video);
    
            const thumbnail = mediaContainer.querySelector('img');
            thumbnail.style.display = 'none';
    
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(camera.videoUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.playVideo(video, videoId, hls);
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = camera.videoUrl;
                video.addEventListener('loadedmetadata', () => {
                    this.playVideo(video, videoId);
                });
            }
        }
    }

    playVideo(video, videoId, hls) {
        if (this.activeVideos.size >= this.maxSimultaneousVideos) {
            const [oldestVideoId] = this.activeVideos.keys();
            this.pauseVideo(document.getElementById(oldestVideoId), oldestVideoId);
        }
    
        video.play();
        this.activeVideos.set(videoId, hls || video);
        video.style.display = 'block';
    }

    pauseVideo(video, videoId) {
        video.pause();
        const hls = this.activeVideos.get(videoId);
        if (hls instanceof Hls) {
            hls.destroy();
        }
        this.activeVideos.delete(videoId);
        
        // Show the thumbnail again
        const mediaContainer = video.closest('.media-container');
        const thumbnail = mediaContainer.querySelector('img');
        thumbnail.style.display = 'block';
        video.style.display = 'none';
    }
}

export default CameraController;