import config from '../config.js';

class CameraModel {
    constructor() {
        this.cameras = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    }

    async fetchCameras() {
        try {
            const response = await fetch(config.apiUrl);
            const data = await response.json();
            this.cameras = data.features.map(feature => ({
                name: feature.attributes.Desc_,
                imageUrl: feature.attributes.ImageURL,
                videoUrl: feature.attributes.VideoURL,
                latitude: feature.attributes.latitude,
                longitude: feature.attributes.longitude,
                region: feature.attributes.REGION || 'Unknown'
            })).filter(camera => camera.imageUrl && camera.videoUrl);
        } catch (error) {
            console.error('Error fetching camera data:', error);
        }
    }

    getRegions() {
        return [...new Set(this.cameras.map(camera => camera.region))].sort();
    }

    toggleFavorite(cameraName) {
        const index = this.favorites.indexOf(cameraName);
        if (index === -1) {
            this.favorites.push(cameraName);
        } else {
            this.favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    isFavorite(cameraName) {
        return this.favorites.includes(cameraName);
    }

    sortCameras(key) {
        this.cameras.sort((a, b) => a[key].localeCompare(b[key]));
    }
}

export default CameraModel;