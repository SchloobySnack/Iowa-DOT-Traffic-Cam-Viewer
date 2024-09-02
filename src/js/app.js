document.addEventListener('DOMContentLoaded', function() {
    const cameraGrid = document.getElementById('cameraGrid');
    const regionFilter = document.getElementById('region-filter');
    const sortNameBtn = document.getElementById('sort-name');
    const sortRegionBtn = document.getElementById('sort-region');
    const activeVideos = new Map();
    let cameras = [];

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
        const filteredCameras = selectedRegion === 'all' ? cameras : cameras.filter(camera => camera.region === selectedRegion);

        filteredCameras.forEach((camera, index) => {
            const cameraItem = document.createElement('div');
            cameraItem.className = 'camera-item';
            cameraItem.innerHTML = `
                <img src="${camera.imageUrl}" alt="${camera.name}">
                <p>${camera.name}</p>
                <p>Region: ${camera.region}</p>
                <button class="toggle-stream">Play/Pause</button>
            `;
            const toggleButton = cameraItem.querySelector('.toggle-stream');
            toggleButton.addEventListener('click', () => toggleStream(camera, cameraItem, index));
            cameraGrid.appendChild(cameraItem);
        });
    }

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