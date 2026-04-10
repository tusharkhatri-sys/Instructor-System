// ========== SUPABASE CONFIG ==========
const SUPABASE_URL = 'https://wqjtvgndhcktvcgjmryc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxanR2Z25kaGNrdHZjZ2ptcnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjA3NjIsImV4cCI6MjA5MTAzNjc2Mn0.xYcitwb5c8jJQ7I3tS_8-wiBr4b0DhOfvBUVYEn-ha8';

var db = null;
try {
    if (window.supabase && window.supabase.createClient) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error('Supabase CDN not loaded! Check internet connection or ad-blocker.');
    }
} catch (e) {
    console.error('Failed to initialize Supabase client:', e);
}

const HEAD_CREDS = { username: 'jaisalmeriti@gmail.com', password: '345001' };

// ========== LOADING ==========
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ========== DATA LAYER (Supabase) ==========
async function getInstructors() {
    const { data, error } = await db
        .from('instructors')
        .select('*')
        .order('registered_at', { ascending: false });
    if (error) {
        console.error('Fetch error:', error);
        showToast('Database error: ' + error.message, 'error');
        return [];
    }
    return data || [];
}

async function addInstructor(instructor) {
    const { data, error } = await db
        .from('instructors')
        .insert([instructor])
        .select();
    if (error) {
        console.error('Insert error:', error);
        throw error;
    }
    return data[0];
}

async function removeInstructor(id) {
    // Also delete photo from storage
    const { error: storageErr } = await db.storage
        .from('photos')
        .remove([id + '.jpg']);
    
    const { error } = await db
        .from('instructors')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

async function findInstructorByIdAndDob(empId, dob) {
    const { data, error } = await db
        .from('instructors')
        .select('*')
        .ilike('id', empId)
        .eq('dob', dob)
        .single();
    if (error) return null;
    return data;
}

// generateId removed - Emp ID is now entered manually by admin

// ========== PHOTO UPLOAD TO SUPABASE STORAGE ==========
async function uploadPhoto(file, instructorId) {
    const fileExt = file.name.split('.').pop();
    const fileName = instructorId + '.' + fileExt;
    
    const { data, error } = await db.storage
        .from('photos')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });
    
    if (error) {
        console.error('Photo upload error:', error);
        // Fallback: use base64
        return await fileToBase64(file);
    }
    
    // Get public URL
    const { data: urlData } = db.storage
        .from('photos')
        .getPublicUrl(fileName);
        
    return urlData.publicUrl + '?t=' + new Date().getTime();
}

async function uploadSignature(file, instructorId) {
    const fileExt = file.name.split('.').pop();
    const fileName = instructorId + '_sig.' + fileExt;
    
    const { data, error } = await db.storage
        .from('photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
    
    if (error) return await fileToBase64(file);
    const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
    return urlData.publicUrl + '?t=' + new Date().getTime();
}

async function uploadAdminSignature(file) {
    const fileName = 'admin_signature.png';
    const { data, error } = await db.storage
        .from('photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
    return urlData.publicUrl + '?t=' + new Date().getTime();
}

// Convert file to base64 (fallback)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========== UTILITY ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function closeModal(e) {
    if (e.target === e.currentTarget) {
        document.getElementById('idCardModal').style.display = 'none';
    }
}

// Map DB fields (snake_case) to display-friendly object
function mapInstructor(row) {
    return {
        id: row.id,
        name: row.name,
        fatherName: row.father_name,
        trade: row.trade,
        designation: row.designation,
        phone: row.phone,
        email: row.email,
        dob: row.dob,
        joinDate: row.join_date,
        bloodGroup: row.blood_group,
        aadharNo: row.aadhar_no,
        panNo: row.pan_no,
        cpfGpf: row.cpf_gpf,
        siNo: row.si_no,
        address: row.address,
        address: row.address,
        password: row.password,
        photo: row.photo,
        signature: row.signature,
        itiName: row.iti_name,
        itiAddress: row.iti_address,
        registeredAt: row.registered_at
    };
}

// ========== SCREEN MANAGEMENT ==========
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

let currentUser = null;
let currentRole = null;

window.logout = function() {
    currentUser = null;
    currentRole = null;
    showScreen('loginScreen');
    document.getElementById('instructorLoginForm').reset();
    document.getElementById('headLoginForm').reset();
    document.getElementById('instrError').textContent = '';
    document.getElementById('headError').textContent = '';
};

// ========== INIT ==========
function initApp() {
    try {
        // Make utility functions available globally
        window.showLoading = showLoading;
        window.hideLoading = hideLoading;
        window.showToast = showToast;
        window.filterInstructors = filterInstructors;
        window.viewIdCardModal = viewIdCardModal;
        window.deleteInstructor = deleteInstructor;
        window.showSelectedIdCard = showSelectedIdCard;
        window.downloadIdCard = downloadIdCard;

        // ========== HEAD LOGIN SUCCESS HANDLER ==========
        window._headLoginSuccess = async function() {
            try {
                showLoading();
                await loadHeadDashboard();
                hideLoading();
            } catch (err) {
                hideLoading();
                console.error('Dashboard load error:', err);
            }
        };

        // ========== INSTRUCTOR LOGIN HANDLER ==========
        window._instrLoginHandler = async function(id, dob, errEl) {
            showLoading();
            try {
                if (!db) throw new Error('Database client not initialized');
                var found = await findInstructorByIdAndDob(id, dob);
                if (found) {
                    var inst = mapInstructor(found);
                    currentUser = inst;
                    currentRole = 'instructor';
                    errEl.textContent = '';
                    loadInstructorDashboard(inst);
                    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
                    document.getElementById('instructorDashboard').classList.add('active');
                    showToast('Welcome, ' + inst.name + '!');
                } else {
                    errEl.textContent = 'Invalid Emp. ID or Date of Birth';
                }
            } catch (err) {
                errEl.textContent = 'Login failed: ' + err.message;
            }
            hideLoading();
        };

        // ========== SIDEBAR NAV ==========
        document.querySelectorAll('.sidebar-btn').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                document.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var section = btn.dataset.section;
                document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
                document.getElementById(section).classList.add('active');
                if (section === 'viewSection') {
                    showLoading();
                    await refreshInstructorsList();
                    hideLoading();
                }
                if (section === 'idcardSection') {
                    showLoading();
                    await refreshIdCardDropdown();
                    hideLoading();
                }
            });
        });

        // ========== PHOTO/SIG PREVIEW ==========
        var photoInput = document.getElementById('regPhoto');
        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        document.getElementById('previewImg').src = ev.target.result;
                        document.getElementById('photoPreview').classList.add('show');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        var sigInput = document.getElementById('regSignature');
        if (sigInput) {
            sigInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        document.getElementById('previewSigImg').src = ev.target.result;
                        document.getElementById('signaturePreview').classList.add('show');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        var adminSigInput = document.getElementById('adminSignatureUpload');
        if (adminSigInput) {
            adminSigInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        document.getElementById('previewAdminSigImg').src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // ========== REGISTER FORM ==========
        var regForm = document.getElementById('registerForm');
        if (regForm) {
            regForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                var errEl = document.getElementById('regError');
                var successEl = document.getElementById('regSuccess');
                errEl.textContent = '';
                successEl.textContent = '';

                var photoFile = document.getElementById('regPhoto').files[0];
                var sigFile = document.getElementById('regSignature').files[0];
                if (!photoFile || !sigFile) {
                    errEl.textContent = 'Photo and Signature are required';
                    return;
                }

                showLoading();
                try {
                    var empId = document.getElementById('regEmpId').value.trim();
                    var photoUrl = await uploadPhoto(photoFile, empId);
                    var sigUrl = await uploadSignature(sigFile, empId);

                    var instructor = {
                        id: empId,
                        name: document.getElementById('regName').value.trim(),
                        father_name: document.getElementById('regFather').value.trim(),
                        trade: document.getElementById('regTrade').value,
                        designation: document.getElementById('regDesig').value,
                        phone: document.getElementById('regPhone').value.trim(),
                        email: document.getElementById('regEmail').value.trim() || null,
                        dob: document.getElementById('regDob').value || null,
                        join_date: document.getElementById('regJoin').value || null,
                        blood_group: document.getElementById('regBlood').value || null,
                        aadhar_no: document.getElementById('regAadhar').value.trim() || null,
                        pan_no: document.getElementById('regPan').value.trim() || null,
                        cpf_gpf: document.getElementById('regCpf').value.trim() || null,
                        si_no: document.getElementById('regSi').value.trim() || null,
                        address: document.getElementById('regAddress').value.trim(),
                        photo: photoUrl,
                        signature: sigUrl,
                        iti_name: document.getElementById('regItiName').value.trim(),
                        iti_address: document.getElementById('regItiAddress').value.trim() || null
                    };

                    await addInstructor(instructor);
                    successEl.textContent = '✅ Instructor registered! Emp. ID: ' + empId;
                    showToast('Instructor registered: ' + empId, 'success');
                    regForm.reset();
                    document.getElementById('photoPreview').classList.remove('show');
                    document.getElementById('signaturePreview').classList.remove('show');
                    await refreshInstructorsList();
                    await refreshIdCardDropdown();
                } catch (err) {
                    errEl.textContent = 'Registration failed: ' + err.message;
                    showToast('Error: ' + err.message, 'error');
                }
                hideLoading();
            });
        }

        // ========== ADMIN SETTINGS FORM ==========
        var settingsForm = document.getElementById('adminSettingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                var sigFile = document.getElementById('adminSignatureUpload').files[0];
                var errEl = document.getElementById('settingsError');
                var successEl = document.getElementById('settingsSuccess');
                errEl.textContent = ''; successEl.textContent = '';
                
                if (!sigFile) {
                    errEl.textContent = 'Please select a signature image first.';
                    return;
                }
                showLoading();
                try {
                    var sigUrl = await uploadAdminSignature(sigFile);
                    successEl.textContent = 'Admin signature updated targetting all ID cards.';
                    document.getElementById('previewAdminSigImg').src = sigUrl;
                    showToast('Settings saved successfully', 'success');
                } catch (err) {
                    errEl.textContent = 'Upload failed: ' + err.message;
                }
                hideLoading();
            });
        }

        console.log('✅ ITI Instructor System (app.js) initialized successfully');
    } catch (err) {
        console.error('❌ initApp failed:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ========== INSTRUCTOR DASHBOARD ==========
function loadInstructorDashboard(inst) {
    document.getElementById('instrWelcome').textContent = 'Welcome, ' + inst.name;
    document.getElementById('instrProfilePhoto').src = inst.photo;
    document.getElementById('instrProfileName').textContent = inst.name;
    document.getElementById('instrProfileDesig').textContent = inst.designation + ' — ' + inst.itiName;
    document.getElementById('instrProfileId').textContent = inst.id;
    document.getElementById('instrProfileTrade').textContent = inst.trade;
    document.getElementById('instrProfileFather').textContent = inst.fatherName || '—';
    document.getElementById('instrProfilePhone').textContent = inst.phone;
    document.getElementById('instrProfileEmail').textContent = inst.email || '—';
    document.getElementById('instrProfileDob').textContent = formatDate(inst.dob);
    document.getElementById('instrProfileJoin').textContent = formatDate(inst.joinDate);
    document.getElementById('instrProfileBlood').textContent = inst.bloodGroup || '—';
    document.getElementById('instrProfileAddress').textContent = inst.address || '—';

    renderIdCardFront('instrIdCardFront', inst);
    renderIdCardBack('instrIdCardBack', inst);
}

// ========== HEAD DASHBOARD ==========
async function loadHeadDashboard() {
    await refreshInstructorsList();
    await refreshIdCardDropdown();
}



// ========== REFRESH INSTRUCTORS LIST ==========
async function refreshInstructorsList() {
    const rows = await getInstructors();
    const instructors = rows.map(mapInstructor);
    const container = document.getElementById('instructorsList');
    const noMsg = document.getElementById('noInstructors');
    const totalEl = document.getElementById('totalInstructors');
    const totalIdEl = document.getElementById('totalIdCards');

    totalEl.textContent = instructors.length;
    totalIdEl.textContent = instructors.length;

    if (instructors.length === 0) {
        container.innerHTML = '';
        noMsg.style.display = 'flex';
        return;
    }

    noMsg.style.display = 'none';
    container.innerHTML = instructors.map((inst) => `
        <div class="instructor-card" data-name="${inst.name.toLowerCase()}" data-id="${inst.id.toLowerCase()}" data-trade="${inst.trade.toLowerCase()}">
            <div class="instructor-card-photo">
                <img src="${inst.photo}" alt="${inst.name}">
            </div>
            <div class="instructor-card-info">
                <h4>${inst.name}</h4>
                <span class="trade-tag">${inst.trade}</span>
                <p class="card-id">${inst.id}</p>
            </div>
            <div class="instructor-card-actions">
                <button class="btn-sm view-btn" onclick="viewIdCardModal('${inst.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="9" cy="10" r="3"/></svg>
                    ID Card
                </button>
                <button class="btn-sm delete-btn" onclick="deleteInstructor('${inst.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function filterInstructors() {
    const query = document.getElementById('searchInstructor').value.toLowerCase();
    const cards = document.querySelectorAll('.instructor-card');
    cards.forEach(card => {
        const name = card.dataset.name;
        const id = card.dataset.id;
        const trade = card.dataset.trade;
        card.style.display = (name.includes(query) || id.includes(query) || trade.includes(query)) ? 'flex' : 'none';
    });
}

async function deleteInstructor(id) {
    if (!confirm('Are you sure you want to delete this instructor?')) return;
    showLoading();
    try {
        await removeInstructor(id);
        await refreshInstructorsList();
        await refreshIdCardDropdown();
        showToast('Instructor deleted', 'error');
    } catch (err) {
        showToast('Delete failed: ' + err.message, 'error');
    }
    hideLoading();
}

// ========== ID CARD RENDERING — FRONT ==========
function renderIdCardFront(containerId, inst) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <svg class="idc-bg-svg" viewBox="0 0 350 490" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;">
            <defs>
                <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#d4eaf7"/>
                    <stop offset="30%" stop-color="#e8f4fd"/>
                    <stop offset="100%" stop-color="#ffffff"/>
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="350" height="490" fill="url(#cardBg)"/>
            <rect x="0" y="0" width="350" height="6" fill="#1a73a7"/>
            <rect x="0" y="484" width="350" height="6" fill="#1a73a7"/>
        </svg>
        <div class="idc-content">
            <div class="idc-front-logos">
                <div class="idc-fl-left">
                    <img src="assets/iti_logo.png" alt="ITI" crossorigin="anonymous">
                </div>
                <div class="idc-fl-center">
                    <img src="assets/ashok_emblem.png" alt="Emblem" crossorigin="anonymous">
                </div>
                <div class="idc-fl-right">
                    <img src="assets/skill_india_logo.png" alt="Skill India" crossorigin="anonymous">
                </div>
            </div>
            <div class="idc-front-dept">
                <div class="idc-fd-1">SKILL, EMPLOYMENT & ENTREPRENEURSHIP DEPARTMENT</div>
                <div class="idc-fd-2">DIRECTORATE OF TECHNICAL EDUCATION (TRAINING)</div>
                <div class="idc-fd-3">${inst.itiAddress || 'W-6, RESIDENCY ROAD, GAURAV PATH, JODHPUR'}</div>
            </div>
            <div class="idc-front-title">EMPLOYEE IDENTITY CARD</div>
            <div class="idc-front-photo">
                <img src="${inst.photo}" crossorigin="anonymous">
            </div>
            <div class="idc-front-name">${inst.name}</div>
            <div class="idc-front-desig">${inst.designation} ${inst.itiName ? inst.itiName : ''}</div>
            <div class="idc-front-info">
                <div class="idc-fi-row"><span class="idc-fi-lbl">Emp. ID</span><span class="idc-fi-sep">:</span><span class="idc-fi-val">${inst.id}</span></div>
                <div class="idc-fi-row"><span class="idc-fi-lbl">Date of Birth</span><span class="idc-fi-sep">:</span><span class="idc-fi-val">${formatDate(inst.dob)}</span></div>
                <div class="idc-fi-row"><span class="idc-fi-lbl">Father Name</span><span class="idc-fi-sep">:</span><span class="idc-fi-val">${inst.fatherName || '—'}</span></div>
            </div>
            <div class="idc-front-sigs">
                <div class="idc-fs-item">
                    ${inst.signature ? 
                        `<img src="${inst.signature}" class="idc-sig-img" crossorigin="anonymous">` 
                        : `<svg class="idc-fs-svg" viewBox="0 0 100 30"><path d="M10 20 C20 8,30 25,40 12 S60 25,70 15 S85 22,95 10" fill="none" stroke="#333" stroke-width="1.2"/></svg>`
                    }
                    <div class="idc-fs-label">Emp. Sign.</div>
                </div>
                <div class="idc-fs-item">
                    <!-- Admin Signature Fallback to SVG if image not found -->
                    <img src="https://wqjtvgndhcktvcgjmryc.supabase.co/storage/v1/object/public/photos/admin_signature.png" class="idc-sig-img" crossorigin="anonymous" onerror="this.onerror=null; this.outerHTML='<svg class=\\\'idc-fs-svg\\\' viewBox=\\\'0 0 100 30\\\'><path d=\\\'M10 15 Q25 5,40 20 T65 12 T90 18\\\' fill=\\\'none\\\' stroke=\\\'#333\\\' stroke-width=\\\'1.2\\\'/></svg>'">
                    <div class="idc-fs-label">Director Training</div>
                </div>
            </div>
        </div>
    `;
}

// ========== ID CARD RENDERING — BACK ==========
function renderIdCardBack(containerId, inst) {
    const container = document.getElementById(containerId);
    const issueDate = new Date(inst.registeredAt || Date.now());
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    container.innerHTML = `
        <svg class="idc-bg-svg" viewBox="0 0 350 490" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;">
            <rect x="0" y="0" width="350" height="490" fill="#ffffff"/>
            <polygon points="0,0 350,0 350,100 175,20 0,100" fill="#b7e3f2" opacity="0.8"/>
            <polygon points="0,390 175,470 350,390 350,490 0,490" fill="#b7e3f2" opacity="0.8"/>
        </svg>
        <div class="idc-content">
            <div class="idc-back-header">
                <div class="idc-lanyard-slot"></div>
                <div class="idc-back-logo">
                    <div class="idc-back-logo-img">
                        <img src="assets/iti_logo.png" alt="ITI" crossorigin="anonymous">
                    </div>
                    <div class="idc-back-logo-txt">Industrial Training Institute</div>
                </div>
            </div>
            
            <div class="idc-back-details">
                <div class="idc-b-row"><div class="idc-b-lbl">Address</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.address || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">Contact No.</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.phone}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">Aadhar No.</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.aadharNo || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">Pan Card No.</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.panNo || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">SI No.</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.siNo || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">CPF/GPF No.</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.cpfGpf || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">Blood Group</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.bloodGroup || '—'}</div></div>
                <div class="idc-b-row"><div class="idc-b-lbl">E-mail</div><div class="idc-b-col">:</div><div class="idc-b-val">${inst.email || '—'}</div></div>
            </div>
            
            <div class="idc-back-footer">
                <div class="idc-bf-title">ISSUE YEAR DATE</div>
                <div class="idc-bf-val">TRG/${months[issueDate.getMonth()].toUpperCase()} ${issueDate.getFullYear()}</div>
            </div>
        </div>
    `;
}

// ========== VIEW ID CARD MODAL ==========
async function viewIdCardModal(id) {
    showLoading();
    const rows = await getInstructors();
    const row = rows.find(r => r.id === id);
    hideLoading();
    if (!row) return;

    const inst = mapInstructor(row);
    renderIdCardFront('modalIdCardFront', inst);
    renderIdCardBack('modalIdCardBack', inst);
    document.getElementById('modalCardFlipper').classList.remove('flipped');
    document.getElementById('idCardModal').style.display = 'flex';
}

// ========== REFRESH ID CARD DROPDOWN ==========
async function refreshIdCardDropdown() {
    const rows = await getInstructors();
    const select = document.getElementById('selectInstructor');
    select.innerHTML = '<option value="">-- Choose Instructor --</option>';
    rows.forEach(row => {
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name + ' (' + row.id + ')';
        select.appendChild(opt);
    });
}

async function showSelectedIdCard() {
    const id = document.getElementById('selectInstructor').value;
    const wrap = document.getElementById('headIdCardWrap');
    if (!id) {
        wrap.style.display = 'none';
        return;
    }
    showLoading();
    const rows = await getInstructors();
    const row = rows.find(r => r.id === id);
    hideLoading();
    if (row) {
        const inst = mapInstructor(row);
        renderIdCardFront('headIdCardFront', inst);
        renderIdCardBack('headIdCardBack', inst);
        document.getElementById('headCardFlipper').classList.remove('flipped');
        wrap.style.display = 'block';
    }
}

// ========== DOWNLOAD ID CARD ==========
function downloadIdCard(frontId, backId) {
    const frontEl = document.getElementById(frontId);
    const backEl = document.getElementById(backId);
    const nameEl = frontEl.querySelector('.idc-name');
    const name = nameEl ? nameEl.textContent.replace(/\s+/g, '_') : 'IDCard';

    showToast('Generating ID Card images...', 'success');
    showLoading();

    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = 'position:fixed; left:-9999px; top:0; z-index:-1;';
    document.body.appendChild(tempContainer);

    // Clone front card
    const frontClone = frontEl.cloneNode(true);
    frontClone.style.cssText = 'position:relative; width:350px; height:490px; border-radius:6px; overflow:hidden; background:#fff; font-family:Arial,sans-serif; box-shadow:none;';
    frontClone.style.backfaceVisibility = 'visible';
    frontClone.style.transform = 'none';

    // Clone back card
    const backClone = backEl.cloneNode(true);
    backClone.style.cssText = 'position:relative; width:350px; height:490px; border-radius:6px; overflow:hidden; background:#fff; font-family:Arial,sans-serif; box-shadow:none; margin-top:30px;';
    backClone.style.backfaceVisibility = 'visible';
    backClone.style.transform = 'none';

    tempContainer.appendChild(frontClone);
    tempContainer.appendChild(backClone);

    // Wait for images to load in clones
    const allImages = tempContainer.querySelectorAll('img');
    const imagePromises = Array.from(allImages).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });

    Promise.all(imagePromises).then(() => {
        // Capture front
        return html2canvas(frontClone, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true,
            width: 350,
            height: 490
        });
    }).then(frontCanvas => {
        // Capture back
        return html2canvas(backClone, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true,
            width: 350,
            height: 490
        }).then(backCanvas => ({ frontCanvas, backCanvas }));
    }).then(({ frontCanvas, backCanvas }) => {
        // Combine both cards into one image
        const gap = 60; // gap between cards
        const padding = 40;
        const totalWidth = (padding * 2) + frontCanvas.width;
        const totalHeight = (padding * 2) + frontCanvas.height + gap + backCanvas.height;

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = totalWidth;
        combinedCanvas.height = totalHeight;
        const ctx = combinedCanvas.getContext('2d');

        // White background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw labels
        ctx.fillStyle = '#555';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';

        // Draw front card
        const frontY = padding;
        ctx.drawImage(frontCanvas, padding, frontY);

        // Draw back card
        const backY = padding + frontCanvas.height + gap;
        ctx.drawImage(backCanvas, padding, backY);

        // Add subtle card shadows
        // (Already rendered by html2canvas)

        // Download
        const link = document.createElement('a');
        link.download = `IDCard_${name}.png`;
        link.href = combinedCanvas.toDataURL('image/png', 1.0);
        link.click();

        showToast('ID Card downloaded! (Front + Back)', 'success');
    }).catch(err => {
        console.error('Download error:', err);
        showToast('Download failed: ' + err.message, 'error');
    }).finally(() => {
        document.body.removeChild(tempContainer);
        hideLoading();
    });
}

