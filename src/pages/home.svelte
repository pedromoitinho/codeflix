<script>
    import "./home.scss";
    import { onMount, onDestroy } from 'svelte';

    let showTrailer = false;
    let currentTrailer = null;
    let currentTitle = '';
    let loading = true;
    let error = null;

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
        try {
            loading = true;
            error = null;
            
            const page = Math.floor(Math.random() * 10) + 1;
            const response = await fetchWithRetry(
                `${JIKAN_URL}/top/anime?page=${page}&limit=${count}`
            );
            
            const { data } = await response.json();
            
            return data.map(anime => ({
                image: anime.images.jpg.large_image_url,
                trailer: {
                    id: anime.trailer?.youtube_id,
                    site: 'youtube'
                },
                title: anime.title_english || anime.title
            }));
        } catch (err) {
            error = 'Failed to fetch anime data';
            console.error('Error:', err);
            return [];
        } finally {
            loading = false;
        }
    }

    function openTrailer(trailer, title) {
        if (!trailer?.id) {
            error = `No trailer available for ${title}`;
            return;
        }
        
        showTrailer = true;
        currentTrailer = trailer.id;
        currentTitle = title;
    }

    function closeTrailer() {
        showTrailer = false;
        currentTrailer = null;
    }

    onMount(async () => {
        const containers = document.querySelectorAll('.videocont');
        const animeData = await fetchAnimeImages(containers.length);

        containers.forEach((container, index) => {
            const img = container.querySelector('img');
            if (animeData[index]) {
                img.src = animeData[index].image;
                img.title = animeData[index].title;
                container.onclick = () => openTrailer(
                    animeData[index].trailer,
                    animeData[index].title
                );
            }
        });
    });

    onDestroy(() => {
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

    {#if showTrailer}
        <div class="modal-overlay" on:click={closeTrailer}>
            <div class="modal-content" on:click|stopPropagation>
                <button class="close-btn" on:click={closeTrailer}>×</button>
                <h2>{currentTitle}</h2>
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/{currentTrailer}?rel=0&playsinline=1"
                        title="YouTube video player"
                        loading="lazy"
                        width="560"
                        height="315"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        playsinline
                    ></iframe>
                </div>
            </div>
        </div>
    {/if}
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
</style>
