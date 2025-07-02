document.addEventListener('DOMContentLoaded', function() {
    // DOM элементы
    const gallery = document.getElementById('gallery');
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('category');
    const sortRatingBtn = document.getElementById('sort-rating');
    const sortDirectionIcon = document.getElementById('sort-direction');
    const totalCountElement = document.getElementById('total-count');
    const avgRatingElement = document.getElementById('avg-rating');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Состояние приложения
    let images = [];
    let filteredImages = [];
    let sortAscending = false;
    
    // Инициализация
    init();
    
    function init() {
        setupEventListeners();
        loadImages();
    }
    
    function setupEventListeners() {
        // Поиск при изменении ввода
        searchInput.addEventListener('input', debounce(filterImages, 300));
        
        // Фильтрация при изменении категории
        categoryFilter.addEventListener('change', filterImages);
        
        // Сортировка
        sortRatingBtn.addEventListener('click', toggleSorting);
        
        // Модальное окно
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Загрузка изображений
    function loadImages() {
        showLoading();
        
        fetch('images.json')
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети');
                return response.json();
            })
            .then(data => {
                images = data;
                filteredImages = [...images];
                updateUI();
            })
            .catch(error => {
                showError('Не удалось загрузить изображения');
                console.error('Ошибка:', error);
            });
    }
    
    // Обновление интерфейса
    function updateUI() {
        renderGallery();
        updateStats();
    }
    
    // Рендер галереи
    function renderGallery() {
        if (filteredImages.length === 0) {
            gallery.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-image"></i>
                    <p>Изображения не найдены</p>
                </div>
            `;
            return;
        }
        
        gallery.innerHTML = '';
        
        filteredImages.forEach(image => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${image.url}" alt="${image.title}" loading="lazy">
                <div class="image-overlay">
                    <div class="image-title">${image.title}</div>
                    <div class="image-rating">
                        <i class="fas fa-star"></i>
                        <span>${image.rating.toFixed(1)}</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => openImageModal(image));
            gallery.appendChild(card);
        });
    }
    
    // Фильтрация изображений
    function filterImages() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        filteredImages = images.filter(image => {
            const matchesSearch = image.title.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || image.category === category;
            return matchesSearch && matchesCategory;
        });
        
        sortImages();
        updateUI();
    }
    
    // Сортировка
    function toggleSorting() {
        sortAscending = !sortAscending;
        sortDirectionIcon.className = sortAscending ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        sortImages();
        renderGallery();
    }
    
    function sortImages() {
        filteredImages.sort((a, b) => {
            return sortAscending ? a.rating - b.rating : b.rating - a.rating;
        });
    }
    
    // Обновление статистики
    function updateStats() {
        totalCountElement.textContent = filteredImages.length;
        
        if (filteredImages.length > 0) {
            const totalRating = filteredImages.reduce((sum, img) => sum + img.rating, 0);
            const avgRating = totalRating / filteredImages.length;
            avgRatingElement.textContent = avgRating.toFixed(1);
        } else {
            avgRatingElement.textContent = '0.0';
        }
    }
    
    // Модальное окно
    function openImageModal(image) {
        document.getElementById('modal-title').textContent = image.title;
        document.getElementById('modal-image').src = image.url;
        document.getElementById('modal-image').alt = image.title;
        document.getElementById('modal-category').textContent = image.category;
        document.getElementById('modal-rating').textContent = image.rating.toFixed(1);
        document.getElementById('modal-url').href = image.url;
        
        modal.style.display = 'flex';
    }
    
    // Вспомогательные функции
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
    
    function showLoading() {
        gallery.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
    }
    
    function showError(message) {
        gallery.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
});