<script>
    import "./home.scss";
    import { onMount } from 'svelte';

    let showTrailer = false;
    let currentTrailer = null;
    let currentTitle = '';

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
    {#if showTrailer}
        <div class="modal-overlay" on:click={closeTrailer}>
            <div class="modal-content" on:click|stopPropagation>
                <button class="close-btn" on:click={closeTrailer}>×</button>
                <h2>{currentTitle}</h2>
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/{currentTrailer}"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        </div>
    {/if}
</body>

<style lang="scss">
    
</style>
