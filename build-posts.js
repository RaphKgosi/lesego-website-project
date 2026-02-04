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
                // Add filename or slug if not present (Decap CMS sets slug in data if configured, but filename is useful)
                // We'll rely on the data 'date' for sorting
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
