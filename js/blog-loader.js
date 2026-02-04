/**
 * blog-loader.js
 * Fetches js/posts.json and renders journal cards.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('journal-container');

    if (!container) {
        console.error('Target container #journal-container not found in HTML.');
        return;
    }

    try {
        const response = await fetch('/js/posts.json');
        if (!response.ok) throw new Error('Failed to fetch posts.json');

        const data = await response.json();
        console.log('Loaded posts:', data);

        if (!data || data.length === 0) {
            container.innerHTML = '<p>No journal entries yet.</p>';
            return;
        }

        // Render posts
        container.innerHTML = data.map(post => {
            // Formatting the date for display (optional, but good for UI)
            const dateStr = post.date ? new Date(post.date).toLocaleDateString() : '';

            // Constructing the slug URL. 
            // Note: In a real static generator, "post.slug" might need to map to a generated HTML file.
            // If the user hasn't generated individual HTML pages for posts, this link might 404.
            // We'll trust the user's "Read More" request implies pages exist or will exist.
            const datePrefix = post.date ? post.date.split('T')[0] + '-' : ''; // Based on Decap slug config "{{year}}-{{month}}-{{day}}-{{slug}}"
            // Actually, if the slug in JSON is just the slug part, we might need to construct the path. 
            // But Decap usually saves the full slug property if configured.
            // Let's assume post.slug is the relative path or we just use it. 
            // The user requested href="/journal/{post.slug}"
            // Debugging link generation
            console.log('Generated Link for:', post.title, 'Slug:', post.slug);

            return `
            <div class="grid-list-items__item blog-card">
                <div class="blog-card__header">
                    <div class="blog-card__cat-links">
                        <a href="#">${dateStr}</a>
                    </div>
                    <h3 class="blog-card__title">
                        <a href="journal-post.html?slug=${post.slug}">${post.title || 'Untitled'}</a>
                    </h3>
                </div>
                <div class="blog-card__text">
                    <p>
                        ${post.description || ''}
                    </p>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p>No journal entries yet.</p>';
    }
});
