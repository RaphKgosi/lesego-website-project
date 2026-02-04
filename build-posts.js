const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content/journal');
const outputFile = path.join(__dirname, 'js/posts.json');

// Ensure output directory exists (though js/ usually exists)
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(contentDir, (err, files) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.log('No content directory found. Creating empty posts.json');
            fs.writeFileSync(outputFile, '[]');
            return;
        }
        return console.error('Unable to scan directory: ' + err);
    }

    const posts = [];

    files.forEach((file) => {
        if (path.extname(file) === '.json' && file !== 'index.json') {
            const rawData = fs.readFileSync(path.join(contentDir, file));
            try {
                const post = JSON.parse(rawData);
                // Add filename or slug if not present
                if (!post.slug) {
                    post.slug = path.basename(file, '.json');
                }

                // Ensure image path is absolute (starts with /) if it's not a URL
                if (post.image && !post.image.startsWith('/') && !post.image.startsWith('http')) {
                    post.image = '/' + post.image;
                }

                posts.push(post);
            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        }
    });

    // Sort by date descending (newest first)
    posts.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
    console.log(`Successfully indexed ${posts.length} posts to ${outputFile}`);
});
