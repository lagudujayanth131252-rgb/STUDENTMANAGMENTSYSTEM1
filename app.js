// Student Management System - Frontend Client & Practical 5 API Sandbox
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api/students`
  : 'http://localhost:3000/api/students';

let allStudents = [];
let isApiOnline = true;

// Initial fallback seed data (if API server is offline)
const fallbackSeed = [
  { id: 1, grno: "92400120035", name: "V Sridhar", department: "Computer Engineering", sem: 5, fees: 45000, isScholarship: true, email: "sridhar@example.com" },
  { id: 2, grno: "92400120619", name: "Darshan N", department: "Computer Engineering", sem: 5, fees: 50000, isScholarship: false, email: "darshan@example.com" },
  { id: 3, grno: "92400120015", name: "Amit Patel", department: "Information Technology", sem: 4, fees: 48000, isScholarship: false, email: "amit.patel@example.com" }
];

// Document ready
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  loadScenario('valid_post');
});

// TAB SWITCHING
function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) activeTab.classList.add('active');

  const clickedBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick').includes(tabId));
  if (clickedBtn) clickedBtn.classList.add('active');
}

// FETCH STUDENTS FROM API
async function fetchStudents() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allStudents = data.data || [];
    setApiStatus(true);
  } catch (err) {
    console.warn("API offline or blocked, switching to localStorage fallback:", err);
    setApiStatus(false);
    const stored = localStorage.getItem('local_students');
    allStudents = stored ? JSON.parse(stored) : [...fallbackSeed];
  }
  updateStats();
  renderStudentTable();
}

function setApiStatus(online) {
  isApiOnline = online;
  const badge = document.getElementById('apiStatusBadge');
  if (online) {
    badge.innerHTML = '<span class="status-dot online"></span> API Connected';
    badge.style.background = '#dcfce7';
    badge.style.color = '#15803d';
  } else {
    badge.innerHTML = '<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 6px #f59e0b;"></span> Local Mode';
    badge.style.background = '#fef3c7';
    badge.style.color = '#92400e';
  }
}

// UPDATE DASHBOARD STATS
function updateStats() {
  document.getElementById('statTotalStudents').textContent = allStudents.length;

  const totalFees = allStudents.reduce((acc, s) => acc + (Number(s.fees) || 0), 0);
  document.getElementById('statTotalFees').innerHTML = `&#8377;${totalFees.toLocaleString('en-IN')}`;

  const scholarships = allStudents.filter(s => s.isScholarship).length;
  document.getElementById('statScholarships').textContent = scholarships;

  const depts = new Set(allStudents.map(s => s.department)).size;
  document.getElementById('statDepartments').textContent = depts;
}

// RENDER TABLE
function renderStudentTable(studentsToRender = allStudents) {
  const tbody = document.getElementById('studentsTableBody');
  const countEl = document.getElementById('visibleCount');

  tbody.innerHTML = '';
  countEl.textContent = studentsToRender.length;

  if (studentsToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:#888;">No student records found.</td></tr>`;
    return;
  }

  studentsToRender.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${student.id}</strong></td>
      <td><span class="grno-pill">${escapeHtml(student.grno)}</span></td>
      <td><strong>${escapeHtml(student.name)}</strong></td>
      <td>${escapeHtml(student.department)}</td>
      <td>Sem ${student.sem}</td>
      <td>&#8377;${Number(student.fees).toLocaleString('en-IN')}</td>
      <td>
        ${student.isScholarship 
          ? `<span class="scholarship-badge"><i class="fa-solid fa-check"></i> Yes (10% Off)</span>` 
          : `<span style="color:#94a3b8; font-size:12px;">Standard</span>`}
      </td>
      <td>${escapeHtml(student.email)}</td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="openEditStudentModal(${student.id})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteStudent(${student.id})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// SEARCH & FILTER
function handleSearch() {
  applyFilters();
}

function handleFilter() {
  applyFilters();
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const dept = document.getElementById('filterDepartment').value;
  const sem = document.getElementById('filterSem').value;

  const filtered = allStudents.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.grno.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept = !dept || s.department === dept;
    const matchSem = !sem || String(s.sem) === sem;
    return matchQ && matchDept && matchSem;
  });

  renderStudentTable(filtered);
}

function refreshStudentList() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterDepartment').value = '';
  document.getElementById('filterSem').value = '';
  fetchStudents();
  showToast('Student list refreshed', 'success');
}

// ADD & EDIT MODAL
function openAddStudentModal() {
  document.getElementById('modalTitle').textContent = 'Add New Student';
  document.getElementById('studentId').value = '';
  document.getElementById('studentForm').reset();
  clearFieldErrors();
  document.getElementById('studentModal').classList.add('active');
}

function openEditStudentModal(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;

  document.getElementById('modalTitle').textContent = `Edit Student #${id}`;
  document.getElementById('studentId').value = student.id;
  document.getElementById('grno').value = student.grno;
  document.getElementById('name').value = student.name;
  document.getElementById('department').value = student.department;
  document.getElementById('sem').value = student.sem;
  document.getElementById('fees').value = student.fees;
  document.getElementById('email').value = student.email;
  document.getElementById('isScholarship').checked = Boolean(student.isScholarship);

  clearFieldErrors();
  document.getElementById('studentModal').classList.add('active');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.remove('active');
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

async function handleStudentFormSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const id = document.getElementById('studentId').value;
  const payload = {
    grno: document.getElementById('grno').value.trim(),
    name: document.getElementById('name').value.trim(),
    department: document.getElementById('department').value,
    sem: parseInt(document.getElementById('sem').value, 10),
    fees: parseFloat(document.getElementById('fees').value),
    email: document.getElementById('email').value.trim(),
    isScholarship: document.getElementById('isScholarship').checked
  };

  try {
    let url = API_BASE;
    let method = 'POST';

    if (id) {
      url = `${API_BASE}/${id}`;
      method = 'PUT';
    }

    if (isApiOnline) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach(d => {
            const errEl = document.getElementById(`err-${d.field}`);
            if (errEl) errEl.textContent = d.error;
          });
        }
        showToast(data.message || 'Operation failed', 'error');
        return;
      }

      showToast(id ? 'Student updated successfully!' : 'Student registered successfully!', 'success');
    } else {
      // Local storage fallback
      if (id) {
        const idx = allStudents.findIndex(s => s.id === parseInt(id, 10));
        if (idx !== -1) allStudents[idx] = { ...allStudents[idx], ...payload };
      } else {
        const newId = (allStudents.length > 0 ? Math.max(...allStudents.map(s => s.id)) : 0) + 1;
        allStudents.push({ id: newId, ...payload });
      }
      localStorage.setItem('local_students', JSON.stringify(allStudents));
      showToast('Saved to local storage', 'success');
    }

    closeStudentModal();
    fetchStudents();
  } catch (err) {
    showToast('Network error while saving student', 'error');
  }
}

// DELETE STUDENT
async function confirmDeleteStudent(id) {
  const student = allStudents.find(s => s.id === id);
  if (!confirm(`Are you sure you want to delete student: "${student ? student.name : id}"?`)) {
    return;
  }

  try {
    if (isApiOnline) {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`Student #${id} deleted successfully`, 'success');
    } else {
      allStudents = allStudents.filter(s => s.id !== id);
      localStorage.setItem('local_students', JSON.stringify(allStudents));
      showToast(`Student #${id} deleted locally`, 'success');
    }
    fetchStudents();
  } catch (err) {
    showToast('Error deleting student', 'error');
  }
}

// -------------------------------------------------------------
// PRACTICAL 5: API TESTING & ERROR HANDLING SANDBOX
// -------------------------------------------------------------
const scenarios = {
  valid_post: {
    title: "POST - Create Student (Valid Data)",
    desc: "Submits a complete, well-formed student object. Expects HTTP 201 Created.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120999",
      name: "Rohit Sharma",
      department: "Computer Engineering",
      sem: 6,
      fees: 52000,
      isScholarship: false,
      email: "rohit.sharma@example.com"
    }
  },
  valid_get_all: {
    title: "GET - Retrieve All Students",
    desc: "Fetches full array of registered student records. Expects HTTP 200 OK.",
    method: "GET",
    url: API_BASE,
    payload: null
  },
  valid_get_one: {
    title: "GET - Retrieve Student by ID (1)",
    desc: "Fetches specific student record with ID 1. Expects HTTP 200 OK.",
    method: "GET",
    url: `${API_BASE}/1`,
    payload: null
  },
  valid_put: {
    title: "PUT - Update Student by ID (1)",
    desc: "Updates semester, tuition fees, and email for student ID 1. Expects HTTP 200 OK.",
    method: "PUT",
    url: `${API_BASE}/1`,
    payload: {
      sem: 6,
      fees: 40000,
      email: "sridhar.updated@example.com"
    }
  },
  valid_delete: {
    title: "DELETE - Delete Student by ID (3)",
    desc: "Deletes student record with ID 3. Expects HTTP 200 OK.",
    method: "DELETE",
    url: `${API_BASE}/3`,
    payload: null
  },
  invalid_email: {
    title: "POST - Malformed Email Format",
    desc: "Negative test submitting invalid email string without '@' or domain. Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120888",
      name: "Ananya Roy",
      department: "Mechanical Engineering",
      sem: 4,
      fees: 45000,
      isScholarship: false,
      email: "invalid-email-address"
    }
  },
  invalid_fees: {
    title: "POST - Negative Tuition Fees",
    desc: "Negative test submitting negative financial value (fees: -15000). Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120777",
      name: "Sneha Rao",
      department: "Civil Engineering",
      sem: 3,
      fees: -15000,
      isScholarship: false,
      email: "sneha.rao@example.com"
    }
  },
  invalid_sem: {
    title: "POST - Semester Out of Range",
    desc: "Negative test submitting semester 12 when standard is 1-8. Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120666",
      name: "Rahul Verma",
      department: "Electrical Engineering",
      sem: 12,
      fees: 48000,
      isScholarship: false,
      email: "rahul.verma@example.com"
    }
  },
  duplicate_grno: {
    title: "POST - Duplicate GRNO Conflict",
    desc: "Negative test attempting to register existing GRNO ('92400120035'). Expects HTTP 409 Conflict.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120035",
      name: "Duplicate User",
      department: "Computer Engineering",
      sem: 5,
      fees: 50000,
      isScholarship: false,
      email: "duplicate.user@example.com"
    }
  },
  not_found_id: {
    title: "GET - Non-Existent ID (9999)",
    desc: "Negative test querying student ID that does not exist in datastore. Expects HTTP 404 Not Found.",
    method: "GET",
    url: `${API_BASE}/9999`,
    payload: null
  },
  missing_name: {
    title: "POST - Missing Required Name Field",
    desc: "Validation test where mandatory 'name' key is omitted. Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {
      grno: "92400120555",
      department: "Information Technology",
      sem: 3,
      fees: 45000,
      email: "noname@example.com"
    }
  },
  missing_grno: {
    title: "POST - Missing Required GRNO Field",
    desc: "Validation test where mandatory 'grno' key is omitted. Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {
      name: "Pooja Mehta",
      department: "Computer Engineering",
      sem: 2,
      fees: 42000,
      email: "pooja.mehta@example.com"
    }
  },
  empty_body: {
    title: "POST - Completely Empty Payload {}",
    desc: "Validation test passing an empty JSON object. Expects HTTP 400 Bad Request.",
    method: "POST",
    url: API_BASE,
    payload: {}
  }
};

function loadScenario(scenarioKey) {
  const s = scenarios[scenarioKey];
  if (!s) return;

  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.scenario-btn')).find(b => b.getAttribute('onclick').includes(scenarioKey));
  if (activeBtn) activeBtn.classList.add('active');

  document.getElementById('sandboxTitle').textContent = s.title;
  document.getElementById('sandboxDesc').textContent = s.desc;
  document.getElementById('sandboxMethod').value = s.method;
  document.getElementById('sandboxUrl').value = s.url;
  document.getElementById('sandboxPayload').value = s.payload ? JSON.stringify(s.payload, null, 2) : '';

  document.getElementById('responseMeta').innerHTML = '<span class="status-pill status-ready">Ready to Send</span>';
  document.getElementById('sandboxResponse').textContent = '// Click "Send Request" to execute against the API';
}

async function executeSandboxRequest() {
  const method = document.getElementById('sandboxMethod').value;
  const url = document.getElementById('sandboxUrl').value;
  const rawPayload = document.getElementById('sandboxPayload').value.trim();

  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(method) && rawPayload) {
    try {
      body = rawPayload;
      JSON.parse(rawPayload); // Syntax verify
    } catch (e) {
      showToast('Invalid JSON syntax in request body!', 'error');
      return;
    }
  }

  const responseMeta = document.getElementById('responseMeta');
  const responseViewer = document.getElementById('sandboxResponse');

  responseViewer.textContent = '// Sending request...';
  responseMeta.innerHTML = '<span class="status-pill status-ready"><i class="fa-solid fa-spinner fa-spin"></i> Executing</span>';

  const startTime = performance.now();

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = body;

    const res = await fetch(url, options);
    const latency = Math.round(performance.now() - startTime);

    let resBody;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }

    const is2xx = res.status >= 200 && res.status < 300;
    const pillClass = is2xx ? 'status-2xx' : 'status-4xx';

    responseMeta.innerHTML = `
      <span class="status-pill ${pillClass}">HTTP ${res.status} ${res.statusText || (is2xx ? 'OK' : 'Error')}</span>
      <span style="font-size:11px; color:#94a3b8; font-weight:600;"><i class="fa-regular fa-clock"></i> ${latency} ms</span>
    `;

    responseViewer.textContent = typeof resBody === 'object' ? JSON.stringify(resBody, null, 2) : resBody;

    // Refresh table in background if state mutated
    if (['POST', 'PUT', 'DELETE'].includes(method) && is2xx) {
      fetchStudents();
    }
  } catch (err) {
    const latency = Math.round(performance.now() - startTime);
    responseMeta.innerHTML = `<span class="status-pill status-4xx">Request Failed</span>`;
    responseViewer.textContent = `// Error connecting to API: ${err.message}\n\nPlease verify that the server is running on http://localhost:3000\nCommand: node server.js`;
  }
}

// TOAST SYSTEM
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
