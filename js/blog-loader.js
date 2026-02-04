/**
 * blog-loader.js
 * Fetches the generated js/posts.json index and displays posts.
 */

async function loadJournalEntries() {
    const journalContainer = document.querySelector('.journal-grid') || document.getElementById('journal-entries');

    if (!journalContainer) {
        console.warn('Journal container not found');
        return;
    }

    try {
        // Fetch the generated index
        const response = await fetch('js/posts.json');

        let posts = [];
        if (response.ok) {
            posts = await response.json();
        } else {
            console.warn('js/posts.json not found. Run "npm run build" to generate it.');
            journalContainer.innerHTML = '<p>No journal entries found (index missing).</p>';
            return;
        }

        if (posts.length === 0) {
            journalContainer.innerHTML = '<p>No journal entries found.</p>';
            return;
        }

        // Render posts
        journalContainer.innerHTML = posts.map(post => `
            <article class="journal-card">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="journal-image">` : ''}
                <div class="journal-content">
                    <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
                    <h3>${post.title}</h3>
                    <div class="journal-excerpt">
                         ${post.body ? post.body.substring(0, 100) + '...' : ''}
                    </div>
                </div>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error loading journal entries:', error);
        journalContainer.innerHTML = '<p>Error loading content.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadJournalEntries);
