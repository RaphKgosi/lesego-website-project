/**
 * single-post.js
 * Fetches js/posts.json and renders a single post based on the ?slug URL parameter.
 * Uses 'marked' library to parse Markdown content.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('single-post-container');
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!container) {
        console.error('Container #single-post-container not found.');
        return;
    }

    console.log('Current Slug:', slug);

    if (!slug) {
        container.innerHTML = `
            <div class="row">
                <div class="column xl-12">
                    <h1>Post Not Found</h1>
                    <p>No post specified in URL.</p>
                </div>
            </div>`;
        return;
    }

    try {
        const response = await fetch('js/posts.json');
        if (!response.ok) throw new Error('Failed to fetch posts.json');

        const posts = await response.json();
        const post = posts.find(p => p.slug === slug);

        if (!post) {
            console.log('Post not found in loaded data. Available slugs:', posts.map(p => p.slug));
            container.innerHTML = `
            <div class="row">
                <div class="column xl-12">
                    <h1>Post Not Found</h1>
                    <p>The requested journal entry could not be found.</p>
                </div>
            </div>`;
            return;
        }

        // Parse Date
        const dateStr = post.date ? new Date(post.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';

        // Render HTML
        // Replicating structure from single.html
        container.innerHTML = `
            <!-- Header -->
            <div class="s-pageheader entry__header">
                <div class="row">
                    <div class="column xl-12">
                        <h1 class="entry__title">
                            ${post.title}
                        </h1>
                        <div class="entry__meta">
                            <div class="entry__meta-date">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="7.25" stroke="currentColor" stroke-width="1.5"></circle>
                                    <path stroke="currentColor" stroke-width="1.5" d="M12 8V12L14 14"></path>
                                </svg>
                                ${dateStr}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="s-pagecontent entry__content">
                
                ${post.image ? `
                <div class="row entry__media">
                    <div class="column xl-12">
                        <figure class="featured-image">
                            <!-- Image path fixed by builder, so we use it directly -->
                            <img src="${post.image}" alt="${post.title}">
                        </figure>
                    </div>
                </div>
                ` : ''}

                <div class="row entry__primary width-narrower">
                    <div class="column xl-12">
                        ${marked.parse(post.body || '')}
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading post:', error);
        container.innerHTML = '<p>Error loading content.</p>';
    }
});
