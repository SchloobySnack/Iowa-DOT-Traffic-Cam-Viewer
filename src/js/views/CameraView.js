import config from '../config.js';

class CameraView {
    constructor() {
        this.cameraGrid = document.getElementById('cameraGrid');
        this.regionFilter = document.getElementById('region-filter');
        this.sortNameBtn = document.getElementById('sort-name');
        this.sortRegionBtn = document.getElementById('sort-region');
        this.showFavoritesBtn = document.getElementById('show-favorites');
        this.themeToggle = document.querySelector('.theme-controller');
        
        this.initThemeToggle();
    }

    initThemeToggle() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.themeToggle.checked = currentTheme === 'dark';

        this.themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    renderCameras(cameras, toggleFavorite, toggleStream) {
        this.cameraGrid.innerHTML = '';
        cameras.forEach((camera, index) => {
            const cameraItem = document.createElement('div');
            cameraItem.className = 'card bg-base-100 shadow-xl';
            cameraItem.innerHTML = `
                <figure class="relative">
                    <div class="media-container w-full h-48 relative overflow-hidden">
                        <img data-src="${camera.imageUrl}" alt="${camera.name}" class="w-full h-full object-cover lazy-image absolute top-0 left-0">
                    </div>
                    <button class="favorite-btn absolute top-2 right-2 text-2xl ${camera.isFavorite ? 'text-yellow-500' : 'text-base-content'}">${camera.isFavorite ? '★' : '☆'}</button>
                </figure>
                <div class="card-body p-4">
                    <h2 class="card-title text-lg">${camera.name}</h2>
                    <p>Region: ${camera.region}</p>
                    <div class="card-actions justify-end mt-2">
                        <button class="toggle-stream btn btn-primary btn-sm">Play/Pause</button>
                    </div>
                </div>
            `;
            const favoriteBtn = cameraItem.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', () => toggleFavorite(camera.name, favoriteBtn));
            
            const streamBtn = cameraItem.querySelector('.toggle-stream');
            streamBtn.addEventListener('click', () => toggleStream(camera, cameraItem, index));
            
            this.cameraGrid.appendChild(cameraItem);
        });
    
        this.lazyLoadImages();
    }

    populateRegionFilter(regions) {
        this.regionFilter.innerHTML = '<option value="all">All Regions</option>';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            this.regionFilter.appendChild(option);
        });
    }

    updateFavoriteButton(button, isFavorite) {
        button.textContent = isFavorite ? '★' : '☆';
        button.classList.toggle('text-yellow-500', isFavorite);
        button.classList.toggle('text-base-content', !isFavorite);
    }

    updateShowFavoritesButton(showingFavorites) {
        this.showFavoritesBtn.textContent = showingFavorites ? 'Show All' : 'Show Favorites';
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('.lazy-image');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    observer.unobserve(img);
                }
            });
        }, config.lazyLoadOptions);

        images.forEach(img => imageObserver.observe(img));
    }
}

export default CameraView;