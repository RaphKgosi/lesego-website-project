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

        // Render HTML - Text Only
        container.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h1 style="margin-bottom: 0.5rem; line-height: 1.2;">${post.title}</h1>
                <p style="color: #666; font-style: italic; margin-bottom: 2rem;">${dateStr}</p>
            </div>

            <div class="post-content">
                ${marked.parse(post.body || '')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading post:', error);
        container.innerHTML = '<p>Error loading content.</p>';
    }
});
