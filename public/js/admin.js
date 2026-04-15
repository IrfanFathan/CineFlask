/**
 * Admin Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check auth first
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }
  
  // Load data
  loadDashboardData();
  loadUsers();
  loadSystemInfo();
});

// Tab switching logic
function switchTab(tabId, event) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // Fallback: find the button by tabId
    document.querySelector(`[onclick*="switchTab('${tabId}'"]`)?.classList.add('active');
  }
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabId}-tab`).classList.add('active');
  
  // Load specific tab data if needed
  if (tabId === 'logs') {
    loadLogs();
  }
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      alert('You do not have admin access.');
      window.location.href = '/home.html';
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      renderStats(data.stats);
      renderRecentUploads(data.stats.recentActivity);
      renderStorage(data.stats.storage);
      renderCacheStats(data.stats.cache);
      
      // Hide loader
      document.getElementById('loading-overlay').style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Hide loader on error too
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.style.display = 'none';
    alert('Failed to load admin data. Check console for details.');
  }
}

async function loadUsers() {
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const tbody = document.getElementById('users-list');
      tbody.innerHTML = '';
      
      const currentUsername = localStorage.getItem('username');
      
      data.users.forEach(user => {
        const tr = document.createElement('tr');
        const isCurrent = user.username === currentUsername;
        
        tr.innerHTML = `
          <td>#${user.id}</td>
          <td>
            ${user.username} 
            ${isCurrent ? '<span style="background:var(--accent);font-size:10px;padding:2px 6px;border-radius:10px;margin-left:5px;">YOU</span>' : ''}
            ${user.id === 1 ? '<span style="background:#e74c3c;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:5px;">ADMIN</span>' : ''}
          </td>
          <td>${user.profile_count}</td>
          <td>${user.uploaded_movies} / ${user.uploaded_series}</td>
          <td>${new Date(user.created_at).toLocaleDateString()}</td>
          <td>
            ${!isCurrent && user.id !== 1 ? 
              `<button class="btn-danger" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>` 
              : '<span style="color:#888;font-size:12px;">No actions</span>'
            }
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

async function loadSystemInfo() {
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch('/api/admin/system', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const container = document.getElementById('system-info');
      const sys = data.system;
      
      container.innerHTML = `
        <div class="list-item"><span>Platform</span><span>${sys.platform} (${sys.arch})</span></div>
        <div class="list-item"><span>Node Version</span><span>${sys.nodeVersion}</span></div>
        <div class="list-item"><span>Uptime</span><span>${sys.uptime}</span></div>
        <div class="list-item" style="margin-top:15px; font-weight:bold;">Memory Usage</div>
        <div class="list-item"><span>RSS</span><span>${sys.memory.rss}</span></div>
        <div class="list-item"><span>Heap Total</span><span>${sys.memory.heapTotal}</span></div>
        <div class="list-item"><span>Heap Used</span><span>${sys.memory.heapUsed}</span></div>
      `;
    }
  } catch (error) {
    console.error('Failed to load system info:', error);
  }
}

async function loadLogs() {
  const lines = document.getElementById('log-lines').value;
  const viewer = document.getElementById('log-viewer');
  viewer.innerHTML = 'Loading...';
  
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch(`/api/admin/logs?lines=${lines}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.logs && data.logs.length > 0) {
        viewer.innerHTML = data.logs.join('\n');
        // Scroll to bottom
        viewer.scrollTop = viewer.scrollHeight;
      } else {
        viewer.innerHTML = data.message || 'No logs available.';
      }
    }
  } catch (error) {
    viewer.innerHTML = 'Error loading logs: ' + error.message;
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Are you SURE you want to delete user "${username}"? This will also delete all their profiles, uploads, and progress data. This cannot be undone.`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('User deleted successfully');
      loadUsers();
      loadDashboardData();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('An error occurred while deleting the user.');
  }
}

async function clearCache(type) {
  if (!confirm(`Are you sure you want to clear the ${type.toUpperCase()} cache?`)) return;
  
  try {
    const token = localStorage.getItem('cinelocal_token');
    const response = await fetch('/api/admin/cache/clear', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Cache cleared successfully!');
      loadDashboardData();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    alert('An error occurred.');
  }
}

function renderStats(stats) {
  const container = document.getElementById('main-stats');
  const db = stats.database;
  
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Total Users</div>
      <div class="stat-value">${db.users}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Active Profiles</div>
      <div class="stat-value">${db.profiles}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Total Movies</div>
      <div class="stat-value">${db.movies}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">TV Series (Episodes)</div>
      <div class="stat-value">${db.series} <span style="font-size:16px; color:#888;">(${db.episodes})</span></div>
    </div>
  `;
}

function renderRecentUploads(recent) {
  const container = document.getElementById('recent-uploads');
  let html = '<div style="margin-bottom:10px; font-weight:bold; color:var(--accent);">Movies</div>';
  
  if (recent.uploads.length === 0) {
    html += '<p style="color:#888;">No movies uploaded yet.</p>';
  } else {
    recent.uploads.forEach(m => {
      html += `
        <div class="list-item">
          <span>${m.title}</span>
          <span style="color:#888; font-size:12px;">${new Date(m.created_at).toLocaleDateString()}</span>
        </div>
      `;
    });
  }
  
  html += '<div style="margin:20px 0 10px; font-weight:bold; color:var(--accent);">TV Series</div>';
  
  if (recent.series.length === 0) {
    html += '<p style="color:#888;">No series uploaded yet.</p>';
  } else {
    recent.series.forEach(s => {
      html += `
        <div class="list-item">
          <span>${s.title}</span>
          <span style="color:#888; font-size:12px;">${new Date(s.uploaded_at).toLocaleDateString()}</span>
        </div>
      `;
    });
  }
  
  container.innerHTML = html;
}

function renderStorage(storage) {
  const container = document.getElementById('storage-stats');
  container.innerHTML = `
    <div class="list-item"><span>Total Media Size</span><span>${storage.totalMediaSize}</span></div>
    <div class="list-item"><span>Movies Size</span><span>${storage.moviesSize}</span></div>
    <div class="list-item"><span>Series Size</span><span>${storage.episodesSize}</span></div>
    <div class="list-item" style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
      <span>Disk Usage (Uploads dir)</span><span>${storage.diskUsage}</span>
    </div>
  `;
}

function renderCacheStats(cache) {
  const container = document.getElementById('cache-stats');
  container.innerHTML = `
    <div class="list-item" style="color:var(--accent); font-weight:bold;">Metadata Cache</div>
    <div class="list-item"><span>Items</span><span>${cache.metadata.keys}</span></div>
    <div class="list-item"><span>Hits</span><span>${cache.metadata.hits}</span></div>
    <div class="list-item"><span>Misses</span><span>${cache.metadata.misses}</span></div>
    
    <div class="list-item" style="color:var(--accent); font-weight:bold; margin-top:15px;">Movie List Cache</div>
    <div class="list-item"><span>Items</span><span>${cache.movieList.keys}</span></div>
    <div class="list-item"><span>Hits</span><span>${cache.movieList.hits}</span></div>
    <div class="list-item"><span>Misses</span><span>${cache.movieList.misses}</span></div>
  `;
}
