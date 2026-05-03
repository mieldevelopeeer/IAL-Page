(function () {
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    window.location.replace('admin.html');
    return;
  }

  const form = document.getElementById('login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const msg = document.getElementById('login-error');

    if (window.IALAdminAuth.checkAdminCredentials(u, p)) {
      localStorage.setItem('adminLoggedIn', 'true');
      window.location.replace('admin.html');
      return;
    }

    if (msg) {
      msg.className = 'flash-msg error';
      msg.textContent = 'Invalid username or password.';
      setTimeout(() => {
        msg.className = '';
        msg.textContent = '';
      }, 4000);
    }
  });
})();
