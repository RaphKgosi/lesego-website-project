/**
 * page-loader.js
 * Automatically hydrates static pages using Decap-managed JSON configuration files.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Determine the page identity from the body element
    const cmsPage = document.body.getAttribute('data-cms-page');
    if (!cmsPage) return; 

    try {
        const response = await fetch(`/content/pages/${cmsPage}.json`);
        if (!response.ok) {
            console.warn(`No CMS configuration data found for page: ${cmsPage}. Using fallback HTML.`);
            return;
        }

        const data = await response.json();

        // Dynamically find and swap content fields
        document.querySelectorAll('[data-cms-field]').forEach(element => {
            const fieldName = element.getAttribute('data-cms-field');
            const content = data[fieldName];

            if (content !== undefined && content !== null) {
                // Handle image replacements
                if (element.tagName === 'IMG') {
                    element.src = content;
                } 
                // Handle rich-text rendering via markdown if Marked library is available
                else if (element.hasAttribute('data-cms-markdown')) {
                    if (typeof marked !== 'undefined') {
                        element.innerHTML = marked.parse(content);
                    } else {
                        element.textContent = content;
                    }
                } 
                // Handle regular string or text blocks
                else {
                    element.textContent = content;
                }
            }
        });

    } catch (error) {
        console.error('Error hydrating CMS page content:', error);
    }
});
