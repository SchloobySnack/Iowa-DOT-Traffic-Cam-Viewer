/**
 * @fileoverview Controller for managing camera operations in the DOT Traffic Camera Grid application.
 */

import CameraModel from '../models/CameraModel.js';
import CameraView from '../views/CameraView.js';
import config from '../config.js';

/**
 * @class CameraController
 * @description Manages the interaction between the CameraModel and CameraView,
 * handling user interactions and updating the view based on model changes.
 */
class CameraController {
    /**
     * Creates an instance of CameraController.
     * @constructor
     */
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

    /**
     * Pauses a video stream and handles cleanup.
     * 
     * @param {HTMLVideoElement} video - The video element to pause.
     * @param {string} videoId - The unique identifier for the video.
     * 
     * @description This function performs the following actions:
     * 1. Pauses the video playback.
     * 2. If an HLS instance exists for this video, it destroys it to free up resources.
     * 3. Removes the video from the list of active videos.
     * 4. Shows the thumbnail image associated with the video.
     * 5. Hides the video element.
     * 
     * @throws {Error} Throws an error if the video element or its container cannot be found.
     * 
     * @example
     * // Assuming 'this' is an instance of a class containing activeVideos Map
     * this.pauseVideo(document.getElementById('video-1'), 'video-1');
     */
    pauseVideo(video, videoId) {
        video.pause();
        const hls = this.activeVideos.get(videoId);
        if (hls instanceof Hls) {
            hls.destroy();
        }
        this.activeVideos.delete(videoId);
    
        // Show the thumbnail again
        const mediaContainer = video.closest('.media-container');
        if (!mediaContainer) {
            throw new Error('Media container not found');
        }
        const thumbnail = mediaContainer.querySelector('img');
        if (!thumbnail) {
            throw new Error('Thumbnail image not found');
        }
        thumbnail.style.display = 'block';
        video.style.display = 'none';
    }
}

export default CameraController;