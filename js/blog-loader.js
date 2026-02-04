/**
 * blog-loader.js
 * Fetches JSON content/journal entries and displays them.
 * 
 * NOTE: On a static site without a directory listing API, we need an index of files.
 * This script attempts to fetch 'content/journal/index.json'. 
 * If that fails, it will attempt to simulate fetching assuming a standard naming convention 
 * if you configure it, or you must manually maintain the index.json file.
 */

async function loadJournalEntries() {
    const journalContainer = document.querySelector('.journal-grid') || document.getElementById('journal-entries');

    if (!journalContainer) {
        console.warn('Journal container not found');
        return;
    }

    try {
        // Attempt to fetch the index file
        const response = await fetch('content/journal/index.json');

        let posts = [];
        if (response.ok) {
            const indexData = await response.json();
            // indexData should be an array of filenames: ["2024-02-04-my-post.json", ...]

            // Fetch each post
            const postPromises = indexData.map(filename =>
                fetch(`content/journal/${filename}`).then(res => res.json())
            );
            posts = await Promise.all(postPromises);
        } else {
            console.warn('content/journal/index.json not found. Ensure you have an index file listing your posts.');
            // Fallback for demonstration: Try to fetch a sample post if it exists
            try {
                const sample = await fetch('content/journal/sample.json').then(res => {
                    if (res.ok) return res.json();
                    throw new Error('No sample');
                });
                posts = [sample];
            } catch (e) {
                // No posts found
                journalContainer.innerHTML = '<p>No journal entries found.</p>';
                return;
            }
        }

        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

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
