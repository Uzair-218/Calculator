// Patient Portal JavaScript

let allDoctors = [];
let selectedDoctor = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load Firebase script
    await loadFirebaseScript();
    
    // Initialize Firebase
    initializeFirebase();
    
    // Initialize sample doctors if needed
    await initializeSampleDoctors();
    
    // Load doctors
    await loadDoctors();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set minimum date for appointment to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
});

// Load Firebase SDK
function loadFirebaseScript() {
    return new Promise((resolve, reject) => {
        // Check if Firebase is already loaded
        if (typeof firebase !== 'undefined') {
            resolve();
            return;
        }

        // Load Firebase App
        const script1 = document.createElement('script');
        script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
        script1.onload = () => {
            // Load Firestore
            const script2 = document.createElement('script');
            script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
            script2.onload = () => {
                // Load config
                const script3 = document.createElement('script');
                script3.src = 'firebase-config.js';
                script3.onload = resolve;
                script3.onerror = reject;
                document.head.appendChild(script3);
            };
            script2.onerror = reject;
            document.head.appendChild(script2);
        };
        script1.onerror = reject;
        document.head.appendChild(script1);
    });
}

// Load doctors from Firebase or sample data
async function loadDoctors() {
    try {
        allDoctors = await getDoctors();
        displayDoctors(allDoctors);
    } catch (error) {
        console.error('Error loading doctors:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-xl text-red-600">Error loading doctors</p>
                <p class="text-gray-600 mt-2">Please refresh the page</p>
            </div>
        `;
    }
}

// Display doctors in grid
function displayDoctors(doctors) {
    const grid = document.getElementById('doctorsGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    loadingState.classList.add('hidden');
    
    if (doctors.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    grid.innerHTML = doctors.map(doctor => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden doctor-card">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
                <div class="text-6xl mb-2">${doctor.image}</div>
                <h3 class="text-xl font-bold text-white">${doctor.name}</h3>
                <p class="text-purple-100">${doctor.specialization}</p>
            </div>
            <div class="p-6">
                <div class="space-y-3 mb-4">
                    <div class="flex items-center text-gray-700">
                        <span class="font-semibold mr-2">📚 Qualification:</span>
                        <span class="text-sm">${doctor.qualification}</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <span class="font-semibold mr-2">⏱️ Experience:</span>
                        <span class="text-sm">${doctor.experience}</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <span class="font-semibold mr-2">🕐 Available:</span>
                        <span class="text-sm">${doctor.availability}</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <span class="font-semibold mr-2">⭐ Rating:</span>
                        <span class="text-sm font-bold text-yellow-600">${doctor.rating}/5.0</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <span class="font-semibold mr-2">💰 Fee:</span>
                        <span class="text-sm font-bold text-green-600">${doctor.consultationFee}</span>
                    </div>
                </div>
                <button onclick="openAppointmentModal('${doctor.id}')" 
                        class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition transform hover:scale-105">
                    Book Appointment
                </button>
            </div>
        </div>
    `).join('');
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchDoctor').addEventListener('input', filterDoctors);
    
    // Filter functionality
    document.getElementById('filterSpecialization').addEventListener('change', filterDoctors);
    document.getElementById('filterAvailability').addEventListener('change', filterDoctors);
    
    // Form submission
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);
}

// Filter doctors based on search and filters
function filterDoctors() {
    const searchTerm = document.getElementById('searchDoctor').value.toLowerCase();
    const specialization = document.getElementById('filterSpecialization').value;
    const availability = document.getElementById('filterAvailability').value;
    
    let filtered = allDoctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) || 
                            doctor.specialization.toLowerCase().includes(searchTerm);
        const matchesSpecialization = !specialization || doctor.specialization === specialization;
        const matchesAvailability = !availability || availability === 'available';
        
        return matchesSearch && matchesSpecialization && matchesAvailability;
    });
    
    displayDoctors(filtered);
}

// Open appointment modal
function openAppointmentModal(doctorId) {
    selectedDoctor = allDoctors.find(doc => doc.id === doctorId);
    
    if (!selectedDoctor) return;
    
    // Populate doctor info in modal
    document.getElementById('modalDoctorInfo').innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="text-5xl">${selectedDoctor.image}</div>
            <div>
                <h3 class="text-xl font-bold text-gray-800">${selectedDoctor.name}</h3>
                <p class="text-purple-600 font-semibold">${selectedDoctor.specialization}</p>
                <p class="text-sm text-gray-600">${selectedDoctor.qualification}</p>
                <p class="text-sm text-gray-600 mt-1">Consultation Fee: <span class="font-bold text-green-600">${selectedDoctor.consultationFee}</span></p>
            </div>
        </div>
    `;
    
    // Reset form
    document.getElementById('appointmentForm').reset();
    
    // Show modal
    document.getElementById('appointmentModal').classList.add('active');
}

// Close appointment modal
function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
    selectedDoctor = null;
}

// Handle appointment form submission
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    // Get form data
    const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        patientName: document.getElementById('patientName').value,
        patientAge: document.getElementById('patientAge').value,
        patientPhone: document.getElementById('patientPhone').value,
        patientEmail: document.getElementById('patientEmail').value || 'N/A',
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        reason: document.getElementById('appointmentReason').value
    };
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Booking...';
    submitButton.disabled = true;
    
    try {
        // Save to Firebase
        const result = await saveAppointment(appointmentData);
        
        if (result.success) {
            // Close appointment modal
            closeModal();
            
            // Show success modal
            document.getElementById('successModal').classList.add('active');
            
            // Reset form
            document.getElementById('appointmentForm').reset();
        } else {
            alert('Error booking appointment. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting appointment:', error);
        alert('Error booking appointment. Please try again.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const appointmentModal = document.getElementById('appointmentModal');
    const successModal = document.getElementById('successModal');
    
    if (e.target === appointmentModal) {
        closeModal();
    }
    if (e.target === successModal) {
        closeSuccessModal();
    }
});
