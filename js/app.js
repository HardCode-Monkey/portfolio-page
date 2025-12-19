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
                // initialize dynamic UI (skill progress bars, etc.) after new content is injected
                initSkillAnimations();
                initHobbiesInteractions();
                initContactForm();
            } catch (error) {
                console.error('Error loading page:', error);
                content.innerHTML = '<p>Error: Could not load page.</p>';
            }
        } else {
            // Handle 404
            content.innerHTML = '<p>Page not found. Please check the URL.</p>';
        }
    }

    function initHobbiesInteractions() {
        // ensure only one audio preview plays at a time
        const audios = document.querySelectorAll('.audio-preview');
        if (audios.length) {
            audios.forEach(a => {
                a.addEventListener('play', () => {
                    audios.forEach(other => { if (other !== a) other.pause(); });
                });
                // graceful fallback if file missing: show muted and disabled control
                a.addEventListener('error', () => { a.setAttribute('aria-hidden', 'true'); a.style.opacity = 0.6; });
            });
        }


    }

    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.getElementById('main-nav');
        if (!toggle || !nav) return;

        // create overlay
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }

        function openNav() {
            nav.classList.add('open');
            overlay.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close navigation');
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            nav.classList.remove('open');
            overlay.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open navigation');
            document.body.style.overflow = '';
        }

        toggle.addEventListener('click', () => {
            if (nav.classList.contains('open')) closeNav(); else openNav();
        });

        overlay.addEventListener('click', closeNav);

        // close when a navigation link is clicked (SPA nav)
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') closeNav();
        });

        // close on Escape
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const status = form.querySelector('.form-status');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.textContent = '';
            status.className = 'form-status';

            const subject = form.querySelector('[name="subject"]').value.trim();
            const email = form.querySelector('[name="reply_to"]').value.trim();
            const message = form.querySelector('[name="message"]').value.trim();

            if (!subject || !email || !message) {
                status.textContent = 'Bitte fülle alle Felder aus.';
                status.classList.add('error');
                return;
            }

            // If a form action is set (e.g., Formspree), POST to it
            if (form.action) {
                try {
                    const fd = new FormData(form);
                    const res = await fetch(form.action, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
                    if (res.ok) {
                        status.textContent = 'Danke — deine Nachricht wurde gesendet.';
                        status.classList.add('success');
                        form.reset();
                    } else {
                        const json = await res.json().catch(()=>null);
                        status.textContent = json && json.error ? json.error : 'Fehler: Versand fehlgeschlagen.';
                        status.classList.add('error');
                    }
                } catch (err) {
                    status.textContent = 'Fehler beim Senden. Bitte versuche es später.';
                    status.classList.add('error');
                }
                return;
            }

            // mailto fallback: requires data-recipient on form
            const recipient = form.dataset.recipient;
            if (recipient) {
                const bodyText = `From: ${email}\n\n${message}`;
                const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                window.location.href = mailto;
                return;
            }

            status.textContent = 'Formular nicht konfiguriert. Trage eine Formspree‑Endpoint URL in das Formular‑action ein oder setze data-recipient="you@domain.tld".';
            status.classList.add('error');
        });
    }

    function initSkillAnimations() {
        const skills = document.querySelectorAll('.skill');
        if (!skills.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const bar = el.querySelector('.skill-bar span');
                    const level = el.querySelector('.skill-bar').dataset.level || '0';
                    // set width to trigger CSS transition
                    bar.style.width = level + '%';
                    el.classList.add('show');
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        skills.forEach(s => observer.observe(s));
    }
    
    // Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
    const token = 'BQAssocf8wPhDVfLYHRCBrqyxLgLwkn_zx3qIuW2Pn07_FAx_rQruPJRv7wDgDl3K7Yjtja_6A2wpXlDozxR6xYzvdnDP2IIEubqk1zcdqnnNBG-DDhU4Bj6PozBBSnYGBS7vIrpTpt5DDeQAviRKpL3uqZZEfDVdhzabFYW148Ae805CPyGDbZONQ51VRgve9Oav8yzj1U5yUx9HBZv9kDdK_aOqwzCxbwW95Q1XwHvExqxiFlL05cGyGs2QsadL2B3y2rEb84X8EL2maMSCQMI6Ljw92Cg_wVePZMJubhwJJiv';
    async function fetchWebApi(endpoint, method, body) {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method,
        body:JSON.stringify(body)
      });
      return await res.json();
    }

    const tracksUri = [
      'spotify:track:4gD1qMyIjDyz7Te8nlQEji','spotify:track:51EpFns3CG9taCMQz6XDom','spotify:track:1eMUGMEWrvTXYWrPobq2dH','spotify:track:6TkeafUCCwwZWiTsEIFZFf','spotify:track:0TZmEWmZTyF74bgEK6R84c'
    ];

    async function createPlaylist(tracksUri){
      const { id: user_id } = await fetchWebApi('v1/me', 'GET')

      const playlist = await fetchWebApi(
        `v1/users/${user_id}/playlists`, 'POST', {
          "name": "My top tracks playlist",
          "description": "Playlist created by the tutorial on developer.spotify.com",
          "public": false
      })

      await fetchWebApi(
        `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
        'POST'
      );

      return playlist;
    }

    (async () => {
      const createdPlaylist = await createPlaylist(tracksUri);
      console.log(createdPlaylist.name, createdPlaylist.id);
    })();

    // Listen for routing changes
    window.addEventListener('hashchange', loadContent);

    loadContent();
    initMobileNav();
});

