document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('app-content');

    // routes
    const routes = {
        '#home': 'pages/home.html',
        '#projects': 'pages/projects.html',
        '#hobbies': 'pages/hobbies.html',
        '#contact': 'pages/contact.html'
    };

    // fetching content
    async function loadContent() {
        const hash = window.location.hash || '#home';
        const path = routes[hash];
        if (path) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error('Page not found');
                const html = await response.text();
                content.innerHTML = html;
            } catch (error) {
                console.error('Error loading page:', error);
                content.innerHTML = '<p>Error: Could not load page.</p>';
            }
        } else {
            // Handle 404
            content.innerHTML = '<p>Page not found. Please check the URL.</p>';
        }
    }
    
    // Listen for routing changes
    window.addEventListener('hashchange', loadContent);

    loadContent();
});