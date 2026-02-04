
// Sanity Configuration
const PROJECT_ID = 'njm9yfal';
const DATASET = 'production';
const API_VERSION = '2023-01-01';
const CDN_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=`;

// Helper to construct image URL
function urlFor(source) {
    if (!source || !source.asset || !source.asset._ref) return '';
    const ref = source.asset._ref;
    const parts = ref.split('-');
    if (parts.length < 4) return '';
    const file = parts[1];
    const dimension = parts[2];
    const format = parts[3];
    return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${file}-${dimension}.${format}`;
}

// Get slug from URL
function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

async function fetchPost(slug) {
    if (!slug) return null;
    const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]`);
    const url = CDN_URL + query;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

// We need a portable text renderer. Since we can't use npm, we'll implement a basic one or use a CDN.
// We'll use the UMD build of @portabletext/to-html from unpkg in the HTML file, 
// which exposes `portableTextToHtml` global.
// Usage: portableTextToHtml(blocks, { ...options })

async function renderPost(post) {
    if (!post) {
        document.querySelector('.page-title').textContent = 'Post Not Found';
        document.querySelector('.entry__content').innerHTML = '<p>The requested article could not be found.</p>';
        return;
    }

    // Update Title
    const titleEl = document.querySelector('.entry__title');
    if (titleEl) titleEl.textContent = post.title;

    // Update Meta (Optional: if we want to show date/category)
    // const dateEl = document.querySelector('.entry__meta-date'); 
    // if (dateEl && post.publishedAt) dateEl.textContent = new Date(post.publishedAt).toLocaleDateString();

    // Update Featured Image
    const featuredFig = document.querySelector('.featured-image');
    if (featuredFig && post.mainImage) {
        featuredFig.innerHTML = ''; // Clear static image
        const img = document.createElement('img');
        const imgUrl = urlFor(post.mainImage);
        img.src = imgUrl;
        img.alt = post.title;
        // Basic responsive handling using just the source url for now
        featuredFig.appendChild(img);
    } else if (featuredFig) {
        featuredFig.style.display = 'none'; // Hide if no image
    }

    // Update Content
    const contentContainer = document.querySelector('.entry__primary .column');
    if (contentContainer && post.body) {
        // Assume portableTextToHtml is loaded via script tag in HTML
        if (typeof portableTextToHtml !== 'undefined') {
            const html = portableTextToHtml.toHTML(post.body, {
                components: {
                    types: {
                        image: ({ value }) => {
                            return `<img src="${urlFor(value)}" alt="${value.alt || ''}" />`
                        }
                    }
                }
            });
            contentContainer.innerHTML = html;
        } else {
            console.error('Portable Text library not loaded');
            contentContainer.innerHTML = '<p>Error loading content visualization.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getSlug();
    if (slug) {
        const post = await fetchPost(slug);
        renderPost(post);
    } else {
        // No slug provided, maybe redirect or show error?
        // For now, let's just leave it (or show not found)
        console.log('No slug provided');
    }
});
