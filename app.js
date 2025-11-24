// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDnoQ_G35KpUKE2moejv6Z2rAjWR2tkgAM",
    authDomain: "cpe417-crud.firebaseapp.com",
    projectId: "cpe417-crud",
    storageBucket: "cpe417-crud.firebasestorage.app",
    messagingSenderId: "744121857010",
    appId: "1:744121857010:web:9b3c18a17d6d377974716b",
    measurementId: "G-M5RTNNFNGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection reference
const usersCollection = collection(db, 'users');

// Global variables
let editingId = null;

// DOM elements
const dataForm = document.getElementById('dataForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const dataList = document.getElementById('dataList');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

// CREATE: Add new data
async function addData(name, email) {
    try {
        const docRef = await addDoc(usersCollection, {
            name: name,
            email: email,
            createdAt: new Date()
        });
        console.log('Document written with ID: ', docRef.id);
        resetForm();
    } catch (error) {
        console.error('Error adding document: ', error);
        alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
}

// READ: Display data
function displayData(users) {
    if (users.length === 0) {
        dataList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>ยังไม่มีข้อมูล กรุณาเพิ่มข้อมูลใหม่</p>
            </div>
        `;
        return;
    }

    dataList.innerHTML = '<div class="data-list">' + 
        users.map(user => `
            <div class="data-item">
                <div class="data-info">
                    <h3>${escapeHtml(user.name)}</h3>
                    <p>📧 ${escapeHtml(user.email)}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editData('${user.id}', '${escapeHtml(user.name)}', '${escapeHtml(user.email)}')">
                        ✏️ แก้ไข
                    </button>
                    <button class="btn-delete" onclick="deleteData('${user.id}')">
                        🗑️ ลบ
                    </button>
                </div>
            </div>
        `).join('') +
    '</div>';
}

// UPDATE: Edit data
window.editData = function(id, name, email) {
    editingId = id;
    nameInput.value = name;
    emailInput.value = email;
    submitBtn.textContent = '💾 บันทึกการแก้ไข';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = '✏️ แก้ไขข้อมูล';
    nameInput.focus();
}

async function updateData(id, name, email) {
    try {
        const userDoc = doc(db, 'users', id);
        await updateDoc(userDoc, {
            name: name,
            email: email,
            updatedAt: new Date()
        });
        console.log('Document updated with ID: ', id);
        resetForm();
    } catch (error) {
        console.error('Error updating document: ', error);
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
}

// DELETE: Remove data
window.deleteData = async function(id) {
    if (confirm('คุณต้องการลบข้อมูลนี้หรือไม่?')) {
        try {
            await deleteDoc(doc(db, 'users', id));
            console.log('Document deleted with ID: ', id);
        } catch (error) {
            console.error('Error deleting document: ', error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }
}

// Reset form
function resetForm() {
    editingId = null;
    nameInput.value = '';
    emailInput.value = '';
    submitBtn.textContent = 'เพิ่มข้อมูล';
    cancelBtn.style.display = 'none';
    formTitle.textContent = '➕ เพิ่มข้อมูลใหม่';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Form submit handler
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!name || !email) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    if (editingId) {
        await updateData(editingId, name, email);
    } else {
        await addData(name, email);
    }
});

// Cancel button handler
cancelBtn.addEventListener('click', resetForm);

// Real-time listener for data changes
onSnapshot(usersCollection, (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
        users.push({
            id: doc.id,
            ...doc.data()
        });
    });
    
    // Sort by creation date (newest first)
    users.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    });
    
    displayData(users);
});

console.log('Firebase CRUD App initialized successfully!');