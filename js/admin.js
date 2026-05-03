/* Admin sidebar - dynamic loading and active state management */
(function () {
  const root = document.getElementById('admin-sidebar-root');
  if (!root) {
    console.error('[admin-sidebar] Could not find #admin-sidebar-root element');
    return;
  }

  // Function to determine current page based on URL
  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'admin.html';
    
    // Map filenames to page identifiers
    if (path === 'admin.html' || path === 'admin-dashboard.html') {
      return 'dashboard';
    } else if (path.includes('organization')) {
      return 'organization';
    } else if (path.includes('team')) {
      return 'team';
    } else if (path.includes('collaborations')) {
      return 'collaborations';
    }
    
    // Default to dashboard
    return 'dashboard';
  }

  // Function to set active class on the correct nav item
  function setActiveNavItem() {
    const currentPage = getCurrentPage();
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    
    navItems.forEach((link) => {
      const isActive = link.dataset.page === currentPage;
      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Function to setup mobile menu toggle
  function setupMobileMenu() {
    // Check if we're on mobile (screen width <= 768px)
    const isMobile = () => window.innerWidth <= 768;
    
    // Create mobile menu button if it doesn't exist
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.querySelector('.mobile-menu-btn')) {
      const menuBtn = document.createElement('button');
      menuBtn.className = 'mobile-menu-btn';
      menuBtn.setAttribute('aria-label', 'Open menu');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      `;
      menuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        margin-right: 12px;
        color: var(--text);
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
      `;
      
      menuBtn.addEventListener('mouseenter', () => {
        menuBtn.style.background = 'var(--bg)';
      });
      menuBtn.addEventListener('mouseleave', () => {
        menuBtn.style.background = 'transparent';
      });
      
      topbar.insertBefore(menuBtn, topbar.firstChild);
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 45;
        display: none;
        opacity: 0;
        transition: opacity var(--transition-base);
      `;
      document.body.appendChild(overlay);
      
      // Toggle sidebar
      function toggleSidebar(show) {
        const sidebar = document.querySelector('.admin-sidebar.sidebar');
        if (!sidebar) return;
        
        if (show) {
          sidebar.classList.add('open');
          overlay.style.display = 'block';
          setTimeout(() => { overlay.style.opacity = '1'; }, 10);
          menuBtn.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        } else {
          sidebar.classList.remove('open');
          overlay.style.opacity = '0';
          setTimeout(() => { overlay.style.display = 'none'; }, 300);
          menuBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
      
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sidebar = document.querySelector('.admin-sidebar.sidebar');
        const isOpen = sidebar?.classList.contains('open');
        toggleSidebar(!isOpen);
      });
      
      overlay.addEventListener('click', () => {
        toggleSidebar(false);
      });
      
      // Handle window resize
      function handleResize() {
        if (window.innerWidth > 768) {
          const sidebar = document.querySelector('.admin-sidebar.sidebar');
          if (sidebar) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            overlay.style.opacity = '0';
            document.body.style.overflow = '';
          }
          menuBtn.style.display = 'none';
        } else {
          menuBtn.style.display = 'flex';
        }
      }
      
      window.addEventListener('resize', handleResize);
      handleResize();
    }
  }

  // Function to handle logout
  function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener-added')) {
      logoutBtn.setAttribute('data-listener-added', 'true');
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          localStorage.removeItem('adminLoggedIn');
          window.location.href = 'admin-login.html';
        }
      });
    }
  }

  // Function to inject sidebar HTML
  function injectSidebar(html) {
    root.outerHTML = html.trim();
    
    // Wait for DOM to update
    setTimeout(() => {
      setActiveNavItem();
      setupMobileMenu();
      setupLogout();
      
      // Dispatch event to notify that sidebar is ready
      document.dispatchEvent(new CustomEvent('admin:sidebar-loaded'));
    }, 0);
  }

  // Function to show error
  function showError(errorMessage) {
    root.innerHTML = `
      <div class="sidebar-load-error" style="
        margin: 0;
        padding: 24px 16px;
        text-align: center;
        color: #e87d6d;
        font-size: 13px;
        background: var(--surface);
        border-right: 1px solid var(--border);
        height: 100vh;
      ">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p><strong>Navigation Error</strong></p>
        <p style="font-size: 11px; margin-top: 8px;">${errorMessage}</p>
        <p style="font-size: 10px; margin-top: 12px; opacity: 0.7;">Please ensure you're running this on a web server.</p>
      </div>
    `;
    console.error('[admin-sidebar]', errorMessage);
  }

  // Load sidebar HTML
  fetch('partials/admin-sidebar.html', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.text();
    })
    .then((html) => {
      if (!html || html.trim() === '') {
        throw new Error('Sidebar HTML is empty');
      }
      injectSidebar(html);
    })
    .catch((err) => {
      console.error('[admin-sidebar] Fetch error:', err);
      showError('Could not load navigation. ' + err.message);
    });
})();