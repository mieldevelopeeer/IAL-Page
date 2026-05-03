window.IALAdminAuth = {
  checkAdminCredentials(username, password) {
    return username === 'admin' && password === 'admin123';
  },
};
