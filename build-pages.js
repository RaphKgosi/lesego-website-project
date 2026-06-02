const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { marked } = require('marked');

const templatesDir = path.join(__dirname, 'templates');
const contentDir = path.join(__dirname, 'content', 'pages');
const outputDir = __dirname; // root directory

// Get all templates
if (!fs.existsSync(templatesDir)) {
    console.error("Templates directory not found.");
    process.exit(1);
}

const templates = fs.readdirSync(templatesDir).filter(file => file.endsWith('.html'));

templates.forEach(templateFile => {
    // Determine the page name (e.g., 'about' from 'about.html')
    // Special handling for index.html which maps to home.json
    const pageName = templateFile === 'index.html' ? 'home' : path.basename(templateFile, '.html');
    const jsonPath = path.join(contentDir, `${pageName}.json`);

    if (!fs.existsSync(jsonPath)) {
        console.warn(`Skipping ${templateFile}: No JSON data found at ${jsonPath}`);
        // We might still want to copy the file over if no JSON data exists
        const templateHtml = fs.readFileSync(path.join(templatesDir, templateFile), 'utf-8');
        fs.writeFileSync(path.join(outputDir, templateFile), templateHtml);
        return;
    }

    // Read the HTML template
    const templatePath = path.join(templatesDir, templateFile);
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const $ = cheerio.load(templateHtml);

    // Read the JSON data
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Inject the data
    $('[data-cms-field]').each((index, element) => {
        const fieldName = $(element).attr('data-cms-field');
        const content = jsonData[fieldName];

        if (content !== undefined && content !== null) {
            if (element.tagName === 'img') {
                $(element).attr('src', content.startsWith('/') ? content : '/' + content);
            } else if ($(element).attr('data-cms-markdown') !== undefined) {
                $(element).html(marked.parse(content));
            } else {
                $(element).html(content); // using html() to allow simple things like <br> which user has in hero title
            }
        }
    });

    // Remove the client-side hydration scripts if they exist
    $('script[src="js/page-loader.js"]').remove();
    $('script[src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"]').remove();

    // Write the output HTML to the root directory
    const outputPath = path.join(outputDir, templateFile);
    fs.writeFileSync(outputPath, $.html());
    console.log(`Successfully compiled: ${templateFile} -> ${outputPath}`);
});
