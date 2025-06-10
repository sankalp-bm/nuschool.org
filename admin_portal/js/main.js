// ===============================
// ADMIN PORTAL MAIN JS
// ===============================

// --- LOGIN LOGIC ---
if (window.location.pathname.endsWith('/admin_portal/') || window.location.pathname.endsWith('/admin_portal/index.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('admin-login-form');
    const errorBox = document.getElementById('admin-login-error');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        if (username === '1234' && password === '1234') {
          localStorage.setItem('admin_logged_in', '1');
          window.location.href = '/admin_portal/dashboard.html';
        } else {
          errorBox.textContent = 'Invalid username or password';
        }
      });
    }
  });
}

// --- DASHBOARD LOGIC ---
if (window.location.pathname.endsWith('/admin_portal/dashboard.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login if not logged in
    if (localStorage.getItem('admin_logged_in') !== '1') {
      window.location.href = '/admin_portal/';
      return;
    }
    // Sidebar toggle (future)
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const main = document.querySelector('.admin-dashboard-main');
    if (toggleBtn && sidebar && main) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
          main.style.marginLeft = '60px';
        } else {
          main.style.marginLeft = '220px';
        }
      });
    }
    // Tab navigation
    const menuLinks = document.querySelectorAll('.admin-menu a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        menuLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const tab = link.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab').forEach(tabDiv => {
          tabDiv.style.display = (tabDiv.id === tab) ? 'block' : 'none';
        });
      });
    });
    // Default tab
    const firstTab = document.querySelector('.admin-menu a');
    if (firstTab) firstTab.click();

    // Category management
    const form = document.getElementById('category-form');
    const nameInput = document.getElementById('category-name');
    const iconInput = document.getElementById('category-icon');
    const list = document.getElementById('category-list');
    let editIndex = null;
    function getCategories() {
      return JSON.parse(localStorage.getItem('admin_categories') || '[]');
    }
    function setCategories(cats) {
      localStorage.setItem('admin_categories', JSON.stringify(cats));
    }
    function renderCategories() {
      const cats = getCategories();
      list.innerHTML = '';
      cats.forEach((cat, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="material-icons" style="vertical-align:middle;">${cat.icon}</span> <b>${cat.name}</b> ` +
          `<button data-edit="${idx}">Edit</button> <button data-delete="${idx}">Delete</button>`;
        list.appendChild(li);
      });
    }
    if (form && nameInput && iconInput && list) {
      renderCategories();
      form.onsubmit = function(e) {
        e.preventDefault();
        const cats = getCategories();
        if (editIndex !== null) {
          cats[editIndex] = { name: nameInput.value, icon: iconInput.value };
          editIndex = null;
        } else {
          cats.push({ name: nameInput.value, icon: iconInput.value });
        }
        setCategories(cats);
        nameInput.value = '';
        iconInput.value = '';
        renderCategories();
      };
      list.onclick = function(e) {
        if (e.target.dataset.edit) {
          const idx = +e.target.dataset.edit;
          const cats = getCategories();
          nameInput.value = cats[idx].name;
          iconInput.value = cats[idx].icon;
          editIndex = idx;
        } else if (e.target.dataset.delete) {
          const idx = +e.target.dataset.delete;
          const cats = getCategories();
          cats.splice(idx, 1);
          setCategories(cats);
          renderCategories();
        }
      };
    }
  });
} 