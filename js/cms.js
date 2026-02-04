
// Sanity Configuration
const PROJECT_ID = 'njm9yfal';
const DATASET = 'production';
const API_VERSION = '2023-01-01'; // use current date or fixed version
const CDN_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=`;

// Helper to construct image URL
function urlFor(source) {
    if (!source || !source.asset || !source.asset._ref) return '';
    const ref = source.asset._ref;
    // ref example: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
    const parts = ref.split('-');
    if (parts.length < 4) return '';
    const file = parts[1];
    const dimension = parts[2];
    const format = parts[3];
    return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${file}-${dimension}.${format}`;
}

async function fetchPosts() {
    const query = encodeURIComponent('*[_type == "post"] | order(publishedAt desc)');
    const url = CDN_URL + query;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

function renderPosts(posts) {
    const container = document.querySelector('.grid-list-items');
    if (!container) return;

    // Clear existing static content if any (or we might want to keep a loader)
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p>No journal entries found.</p>';
        return;
    }

    posts.forEach(post => {
        const postUrl = `single.html?slug=${post.slug.current}`;
        const imageUrl = post.mainImage ? urlFor(post.mainImage) : 'images/default-placeholder.png'; // Fallback logic
        const category = post.category || 'Journal';

        const article = document.createElement('div');
        article.className = 'grid-list-items__item blog-card';

        article.innerHTML = `
      <div class="blog-card__header">
          <div class="blog-card__cat-links">
              <a href="journal.html">${category}</a>
          </div>
          <h3 class="blog-card__title"><a href="${postUrl}">${post.title}</a></h3>
      </div>
      <div class="blog-card__text">
          <p>
          ${post.excerpt || ''}
          </p>
      </div>
    `;

        // Add image if exists
        if (post.mainImage) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = post.title;
            article.prepend(img);
        }

        container.appendChild(article);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const posts = await fetchPosts();
    renderPosts(posts);
});
