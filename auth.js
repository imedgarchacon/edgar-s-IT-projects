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
    document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
    document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
    
    // Close buttons
    document.getElementById('closeLoginModal').addEventListener('click', () => this.hideModal('loginModal'));
    document.getElementById('closeRegisterModal').addEventListener('click', () => this.hideModal('registerModal'));
    
    // Switch between modals
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.hideModal('loginModal');
      this.showModal('registerModal');
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.hideModal('registerModal');
      this.showModal('loginModal');
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    
    // Close modals when clicking outside
    document.getElementById('loginModal').addEventListener('click', (e) => {
      if (e.target.id === 'loginModal') this.hideModal('loginModal');
    });
    
    document.getElementById('registerModal').addEventListener('click', (e) => {
      if (e.target.id === 'registerModal') this.hideModal('registerModal');
    });
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
    const userEmail = document.getElementById('userEmail');
    
    if (this.currentUser) {
      // User is logged in
      authButtons.style.display = 'none';
      userMenu.style.display = 'flex';
      const displayName = this.currentUser.displayName || (()=>{
        try {
          const raw = localStorage.getItem(`user_meta_${this.currentUser.uid}`);
          return raw ? (JSON.parse(raw).name || '') : '';
        } catch (_) { return ''; }
      })();
      userEmail.textContent = displayName || this.currentUser.email;
      // Redirect link to dashboard
      const toDash = document.getElementById('toDashboard');
      if(!toDash){
        const link = document.createElement('a');
        link.href = 'dashboard.html';
        link.className = 'btn btn--ghost';
        link.id = 'toDashboard';
        link.textContent = 'Ir al Panel';
        document.querySelector('.header__actions').insertBefore(link, document.querySelector('.header__actions').lastElementChild);
      }
    } else {
      // User is not logged in
      authButtons.style.display = 'flex';
      userMenu.style.display = 'none';
      const toDash = document.getElementById('toDashboard');
      if(toDash) toDash.remove();
    }
  }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthSystem();
});
