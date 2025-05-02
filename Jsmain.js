// jsmain.js

/* ========== نظام التخزين ========== */
let properties = JSON.parse(localStorage.getItem('properties')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

/* ========== نظام المصادقة ========== */
function handleLogin(username, password) {
  if (username === 'admin' && password === 'admin123') {
    return { 
      username: 'admin',
      isAdmin: true,
      token: Date.now().toString(36)
    };
  }
  return {
    username,
    isAdmin: false,
    token: Date.now().toString(36)
  };
}

function checkLoginStatus() {
  const adminLink = document.getElementById('add-listing');
  const loginLink = document.getElementById('login-link');
  
  if (currentUser) {
    loginLink.textContent = 'تسجيل الخروج';
    if (currentUser.isAdmin) {
      adminLink.style.display = 'inline-block';
    }
  } else {
    loginLink.textContent = 'تسجيل دخول';
    adminLink.style.display = 'none';
  }
}

/* ========== إدارة العقارات ========== */
function addNewProperty(e) {
  e.preventDefault();
  
  if (!currentUser) {
    alert('يجب تسجيل الدخول أولاً!');
    return;
  }

  const newProp = {
    id: Date.now().toString(),
    owner: currentUser.username,
    title: document.getElementById('prop-title').value,
    location: document.getElementById('prop-location').value,
    stories: document.getElementById('prop-stories').value,
    type: document.getElementById('prop-type').value,
    date: new Date().toISOString()
  };

  properties.push(newProp);
  localStorage.setItem('properties', JSON.stringify(properties));
  
  hideModal();
  displayResults(properties);
  alert('تمت إضافة العقار بنجاح!');
}

function deleteProperty(id) {
  const property = properties.find(p => p.id === id);
  
  if (!property) return;
  
  if (
    currentUser &&
    (currentUser.isAdmin || property.owner === currentUser.username)
  ) {
    if (confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      properties = properties.filter(p => p.id !== id);
      localStorage.setItem('properties', JSON.stringify(properties));
      displayResults(properties);
    }
  } else {
    alert('عفواً، لا تملك الصلاحية لحذف هذا العقار!');
  }
}

/* ========== نظام البحث والعرض ========== */
function searchProperties(e) {
  e.preventDefault();
  
  const city = document.getElementById('city').value;
  const type = document.getElementById('type').value;
  
  const filtered = properties.filter(prop => {
    const matchCity = city ? prop.location.includes(city) : true;
    const matchType = type ? prop.type === type : true;
    return matchCity && matchType;
  });
  
  displayResults(filtered);
}

function displayResults(data) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  
  data.forEach(prop => {
    const canDelete = currentUser && 
      (currentUser.isAdmin || prop.owner === currentUser.username);
    
    const card = `
      <div class="property-card">
        <h3>${prop.title}</h3>
        <div class="property-details">
          <p>📍 ${prop.location}</p>
          <p>🏢 ${prop.type} (${prop.stories} طابق)</p>
          <p class="owner">المضيف: ${prop.owner}</p>
          ${canDelete ? `
            <div class="property-actions">
              <button 
                class="delete-btn"
                onclick="deleteProperty('${prop.id}')"
              >
                🗑️ حذف
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', card);
  });
}

/* ========== إدارة الحالة العامة ========== */
document.addEventListener('DOMContentLoaded', () => {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // توجيه غير المسجلين
  if(window.location.pathname.includes('admin.html') && !currentUser?.isAdmin) {
    window.location.href = 'login.html';
  }
  
  checkLoginStatus();
  displayResults(properties);
});

// تحديث حالة المستخدم عند التسجيل الخروج
function handleLogout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  checkLoginStatus();
  window.location.reload();
}