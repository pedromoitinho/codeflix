<script>
    import "./home.scss";
<<<<<<< HEAD
    import { onMount } from 'svelte';
=======
    import { onMount, onDestroy } from 'svelte';
>>>>>>> 913257c (switching api)

    let showTrailer = false;
    let currentTrailer = null;
    let currentTitle = '';
<<<<<<< HEAD

    const ANILIST_URL = 'https://graphql.anilist.co';
    const imageCache = new Map();

    async function fetchAnimeImages(count) {
        const query = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(type: ANIME, sort: POPULARITY_DESC) {
                        coverImage {
                            extraLarge
                        }
                        trailer {
                            id
                            site
                            thumbnail
                        }
                        title {
                            english
                            native
                        }
                    }
                }
            }
        `;

        try {
            const response = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        page: Math.floor(Math.random() * 10) + 1,
                        perPage: count
                    }
                })
            });

            const { data } = await response.json();
            return data.Page.media.map(m => ({
                image: m.coverImage.extraLarge,
                trailer: m.trailer,
                title: m.title.english || m.title.native
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    function openTrailer(trailer, title) {
        if (!trailer) {
            alert(`No trailer available for ${title}`);
            return;
        }
        
        if (trailer.site === 'youtube') {
            currentTrailer = trailer.id;
            currentTitle = title;
            showTrailer = true;
        }
    }

    function closeTrailer() {
=======
    let loading = true;
    let error = null;

    // Cache for API responses
    const cache = new Map();
    const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
    const JIKAN_URL = 'https://api.jikan.moe/v4';
    const RETRY_ATTEMPTS = 3;
    const RETRY_DELAY = 1000;

    async function fetchWithRetry(url, attempts = RETRY_ATTEMPTS) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return response;
        } catch (error) {
            if (attempts > 0) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return fetchWithRetry(url, attempts - 1);
            }
            throw error;
        }
    }

    async function fetchAnimeImages(count) {
        const cacheKey = `anime_${count}`;
        
        // Check cache first
        if (cache.has(cacheKey)) {
            const { data, timestamp } = cache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TIME) {
                return data;
            }
            cache.delete(cacheKey);
        }

        try {
            loading = true;
            error = null;
            
            const page = Math.floor(Math.random() * 10) + 1;
            const response = await fetchWithRetry(
                `${JIKAN_URL}/top/anime?page=${page}&limit=${count}`
            );
            
            const { data } = await response.json();
            
            // Process and cache the response
            const processedData = data.map(anime => ({
                image: anime.images.jpg.large_image_url,
                trailer: {
                    id: anime.trailer?.youtube_id,
                    site: 'youtube'
                },
                title: anime.title_english || anime.title
            }));

            cache.set(cacheKey, {
                data: processedData,
                timestamp: Date.now()
            });

            return processedData;
        } catch (err) {
            error = 'Failed to fetch anime data';
            console.error('Error:', err);
            return [];
        } finally {
            loading = false;
        }
    }

    // Debounced trailer opening
    let timeoutId;
    function openTrailer(trailer, title) {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!trailer?.id) {
            error = `No trailer available for ${title}`;
            return;
        }
        
        timeoutId = setTimeout(() => {
            showTrailer = true;
            currentTrailer = trailer.id;
            currentTitle = title;
        }, 300);
    }

    function closeTrailer() {
        if (timeoutId) clearTimeout(timeoutId);
>>>>>>> 913257c (switching api)
        showTrailer = false;
        currentTrailer = null;
    }

<<<<<<< HEAD
    onMount(async () => {
        const containers = document.querySelectorAll('.videocont');
        const animeData = await fetchAnimeImages(containers.length);

        containers.forEach((container, index) => {
            const img = container.querySelector('img');
            if (animeData[index]) {
                img.src = animeData[index].image;
                img.title = animeData[index].title;
                
                // Add click handler
                container.onclick = () => openTrailer(animeData[index].trailer, animeData[index].title);
            }
        });
    });
</script>

<body>
    <section>
        <nav class="navBar">
            <div class="navBarBrand">
                <i class="fa-solid fa-code" id="icon"></i>
            </div>
            <div class="navBarCenter">
                <h1 id="title">CodeFlix</h1>
            </div>
            <div class="navBarEnd">
                <a id="contato" href="https://pedrolinks.vercel.app/" target="_blank">Contato</a>
            </div>
        </nav>
        <div class="main">
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
            <div class="videocont"><img alt="Anime"></div>
        </div>
    </section>

    <!-- Trailer Modal -->
=======
    let cleanup = () => {};

    onMount(async () => {
        const containers = document.querySelectorAll('.videocont');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        try {
            const animeData = await fetchAnimeImages(containers.length);
            
            containers.forEach((container, index) => {
                const img = container.querySelector('img');
                if (animeData[index]) {
                    img.src = animeData[index].image;
                    img.title = animeData[index].title;
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    img.width = 300;
                    img.height = 169;
                    img.fetchpriority = 'high';
                    
                    container.onclick = () => openTrailer(
                        animeData[index].trailer, 
                        animeData[index].title
                    );
                    
                    observer.observe(container);
                }
            });

            cleanup = () => {
                containers.forEach(container => {
                    observer.unobserve(container);
                    container.onclick = null;
                });
                observer.disconnect();
            };
        } catch (err) {
            error = 'Failed to load content';
            console.error('Mount error:', err);
        }
    });

    onDestroy(() => {
        cleanup();
        cache.clear();
    });
</script>

<section>
    <nav class="navBar">
        <div class="navBarBrand">
            <i class="fa-solid fa-code" id="icon"></i>
        </div>
        <div class="navBarCenter">
            <h1 id="title">CodeFlix</h1>
        </div>
        <div class="navBarEnd">
            <a id="contato" href="https://pedrolinks.vercel.app/" target="_blank">Contato</a>
        </div>
    </nav>
    
    <div class="main">
        {#each Array(12) as _, i}
            <div class="videocont">
                <img 
                    alt="Anime Cover"
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="169"
                    fetchpriority="high"
                />
                {#if loading}
                    <div class="loading-skeleton"></div>
                {/if}
            </div>
        {/each}
    </div>

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

>>>>>>> 913257c (switching api)
    {#if showTrailer}
        <div class="modal-overlay" on:click={closeTrailer}>
            <div class="modal-content" on:click|stopPropagation>
                <button class="close-btn" on:click={closeTrailer}>×</button>
                <h2>{currentTitle}</h2>
                <div class="video-container">
                    <iframe
<<<<<<< HEAD
                        src="https://www.youtube.com/embed/{currentTrailer}"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
=======
                        src="https://www.youtube.com/embed/{currentTrailer}?rel=0&playsinline=1"
                        title="YouTube video player"
                        loading="lazy"
                        width="560"
                        height="315"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        playsinline
>>>>>>> 913257c (switching api)
                    ></iframe>
                </div>
            </div>
        </div>
    {/if}
<<<<<<< HEAD
</body>

<style lang="scss">
    
=======
</section>

<style lang="scss">
    .loading-skeleton {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
>>>>>>> 913257c (switching api)
</style>
