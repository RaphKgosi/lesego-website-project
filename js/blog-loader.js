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
            // Formatting the date for display
            const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : '';

            // Debugging link generation
            console.log('Generated Link for:', post.title, 'Slug:', post.slug);

            return `
            <div class="grid-list-items__item blog-card">
                 <img src="${post.image}" alt="${post.title}">
                 <div class="blog-card__cat-links">
                     <a href="journal.html">Journal</a>
                 </div>
                 <div class="blog-card__header">
                     <h3 class="blog-card__title"><a href="journal-post.html?slug=${post.slug}">${post.title || 'Untitled'}</a></h3>
                 </div>
                 <div class="blog-card__text">
                     <p>
                         ${post.description || ''}
                     </p>
                     <div class="blog-card__meta">
                         <span class="blog-card__date">${dateStr}</span>
                     </div>
                 </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p>No journal entries yet.</p>';
    }
});
