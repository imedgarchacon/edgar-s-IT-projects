// Authentication System
class AuthSystem {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Wait for Firebase to be available
    while (!window.auth) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.auth = window.auth;
    this.setupEventListeners();
    this.setupAuthStateListener();
  }

  setupEventListeners() {
    // Modal buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (loginBtn) loginBtn.addEventListener('click', () => this.showModal('loginModal'));
    if (registerBtn) registerBtn.addEventListener('click', () => this.showModal('registerModal'));
    
    // Close buttons
    if (closeLoginModal) closeLoginModal.addEventListener('click', () => this.hideModal('loginModal'));
    if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => this.hideModal('registerModal'));
    
    // Switch between modals
    if (showRegister) {
      showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('loginModal');
        this.showModal('registerModal');
      });
    }
    
    if (showLogin) {
      showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('registerModal');
        this.showModal('loginModal');
      });
    }
    
    // Form submissions
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    
    // Logout button
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
    
    // Close modals when clicking outside
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') this.hideModal('loginModal');
      });
    }
    
    if (registerModal) {
      registerModal.addEventListener('click', (e) => {
        if (e.target.id === 'registerModal') this.hideModal('registerModal');
      });
    }
  }

  setupAuthStateListener() {
    window.onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.updateUI();
    });
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    this.clearMessages(modalId);
    this.clearForms(modalId);
  }

  clearMessages(modalId) {
    const modal = document.getElementById(modalId);
    const errorMsg = modal.querySelector('.error__message');
    const successMsg = modal.querySelector('.success__message');
    
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();
  }

  clearForms(modalId) {
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) form.reset();
  }

  showMessage(modalId, message, type = 'error') {
    this.clearMessages(modalId);
    
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}__message`;
    messageDiv.textContent = message;
    
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      await window.signInWithEmailAndPassword(this.auth, email, password);
      this.hideModal('loginModal');
      this.showMessage('loginModal', '¡Inicio de sesión exitoso!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Error al iniciar sesión.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        default:
          errorMessage = error.message;
      }
      
      this.showMessage('loginModal', errorMessage, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const role = document.getElementById('registerRole').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      this.showMessage('registerModal', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      this.showMessage('registerModal', 'La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    
    try {
      const cred = await window.createUserWithEmailAndPassword(this.auth, email, password);
      if (cred && cred.user) {
        try {
          await window.updateProfile(cred.user, { displayName: name });
        } catch (_) {}
        try {
          const key = `user_meta_${cred.user.uid}`;
          const meta = { role, name, email };
          localStorage.setItem(key, JSON.stringify(meta));
        } catch (_) {}
      }
      this.hideModal('registerModal');
      this.showMessage('registerModal', '¡Registro exitoso! Bienvenido.', 'success');
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = 'Error al registrarse.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este correo electrónico.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil.';
          break;
        default:
          errorMessage = error.message;
      }
      
      this.showMessage('registerModal', errorMessage, 'error');
    }
  }

  async handleLogout() {
    try {
      await window.signOut(this.auth);
      this.showMessage('loginModal', 'Sesión cerrada exitosamente.', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error al cerrar sesión. Intenta de nuevo.');
    }
  }

  updateUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const profileButton = document.getElementById('profileButton');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (this.currentUser && authButtons && userMenu) {
      // User is logged in
      authButtons.style.display = 'none';
      userMenu.style.display = 'flex';
      const displayName = this.currentUser.displayName || (()=>{
        try {
          const raw = localStorage.getItem(`user_meta_${this.currentUser.uid}`);
          return raw ? (JSON.parse(raw).name || '') : '';
        } catch (_) { return ''; }
      })();
      const fallback = this.currentUser.email || 'Usuario';
      const label = displayName || fallback;
      const initials = label
        .split(' ')
        .filter(Boolean)
        .map(word => word[0])
        .join('')
        .slice(0,2)
        .toUpperCase();

      if (profileButton) profileButton.style.display = 'flex';
      if (profileName) profileName.textContent = label;
      if (profileAvatar) profileAvatar.textContent = initials || 'CC';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';

    } else {
      // User is not logged in
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
      if (profileButton) profileButton.style.display = 'none';
      if (logoutBtn) logoutBtn && (logoutBtn.style.display = 'none');
    }
  }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthSystem();
});
