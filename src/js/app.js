document.addEventListener('DOMContentLoaded', function() {
    const cameraGrid = document.getElementById('cameraGrid');
    const regionFilter = document.getElementById('region-filter');
    const sortNameBtn = document.getElementById('sort-name');
    const sortRegionBtn = document.getElementById('sort-region');
    const showFavoritesBtn = document.getElementById('show-favorites');
    const activeVideos = new Map();
    let cameras = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let showingFavorites = false;

    fetch('https://services.arcgis.com/8lRhdTsQyJpO52F1/arcgis/rest/services/Traffic_Cameras_View/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=')
        .then(response => response.json())
        .then(data => {
            cameras = data.features.map(feature => ({
                name: feature.attributes.Desc_,
                imageUrl: feature.attributes.ImageURL,
                videoUrl: feature.attributes.VideoURL,
                latitude: feature.attributes.latitude,
                longitude: feature.attributes.longitude,
                region: feature.attributes.REGION || 'Unknown'
            })).filter(camera => camera.imageUrl && camera.videoUrl);

            populateRegionFilter();
            renderCameras();

            regionFilter.addEventListener('change', renderCameras);
            sortNameBtn.addEventListener('click', () => sortCameras('name'));
            sortRegionBtn.addEventListener('click', () => sortCameras('region'));
        })
        .catch(error => console.error('Error fetching camera data:', error));

    function populateRegionFilter() {
        const regions = [...new Set(cameras.map(camera => camera.region))].sort();
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }

    function renderCameras() {
        cameraGrid.innerHTML = '';
        const selectedRegion = regionFilter.value;
        let filteredCameras = selectedRegion === 'all' ? cameras : cameras.filter(camera => camera.region === selectedRegion);
        
        if (showingFavorites) {
            filteredCameras = filteredCameras.filter(camera => favorites.includes(camera.name));
        }

        filteredCameras.forEach((camera, index) => {
            const cameraItem = document.createElement('div');
            cameraItem.className = 'card bg-base-100 shadow-xl';
            const isFavorite = favorites.includes(camera.name);
            cameraItem.innerHTML = `
                <figure class="relative">
                    <img src="${camera.imageUrl}" alt="${camera.name}" class="w-full h-48 object-cover">
                    <button class="favorite-btn absolute top-2 right-2 text-2xl ${isFavorite ? 'text-yellow-500' : 'text-white'}">${isFavorite ? '★' : '☆'}</button>
                </figure>
                <div class="card-body p-4">
                    <h2 class="card-title text-lg">${camera.name}</h2>
                    <p>Region: ${camera.region}</p>
                    <div class="card-actions justify-end mt-2">
                        <button class="toggle-stream btn btn-primary btn-sm">Play/Pause</button>
                    </div>
                </div>
            `;
            const toggleButton = cameraItem.querySelector('.toggle-stream');
            toggleButton.addEventListener('click', () => toggleStream(camera, cameraItem, index));
            
            const favoriteButton = cameraItem.querySelector('.favorite-btn');
            favoriteButton.addEventListener('click', () => toggleFavorite(camera, favoriteButton));
            
            cameraGrid.appendChild(cameraItem);
        });
    }

    function toggleFavorite(camera, button) {
        const index = favorites.indexOf(camera.name);
        if (index === -1) {
            favorites.push(camera.name);
            button.textContent = '★';
            button.classList.remove('text-white');
            button.classList.add('text-yellow-500');
        } else {
            favorites.splice(index, 1);
            button.textContent = '☆';
            button.classList.remove('text-yellow-500');
            button.classList.add('text-white');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (showingFavorites) renderCameras();
    }

    showFavoritesBtn.addEventListener('click', () => {
        showingFavorites = !showingFavorites;
        showFavoritesBtn.textContent = showingFavorites ? 'Show All' : 'Show Favorites';
        renderCameras();
    });

    function sortCameras(key) {
        cameras.sort((a, b) => a[key].localeCompare(b[key]));
        renderCameras();
    }

    function toggleStream(camera, cameraItem, index) {
        const videoId = `video-${index}`;
        let video = cameraItem.querySelector(`#${videoId}`);
        
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        } else {
            video = document.createElement('video');
            video.id = videoId;
            video.controls = true;
            video.style.display = 'none';
            cameraItem.insertBefore(video, cameraItem.firstChild);

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(camera.videoUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play();
                    showVideo(cameraItem, video);
                });
                activeVideos.set(videoId, hls);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = camera.videoUrl;
                video.addEventListener('loadedmetadata', function() {
                    video.play();
                    showVideo(cameraItem, video);
                });
                activeVideos.set(videoId, video);
            }
        }
    }

    function showVideo(cameraItem, video) {
        video.style.display = 'block';
        cameraItem.querySelector('img').style.display = 'none';
    }
});