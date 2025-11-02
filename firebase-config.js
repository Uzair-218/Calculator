// Firebase Configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
let app;

// Function to initialize Firebase
function initializeFirebase() {
    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded. Please check your internet connection.');
            return false;
        }

        // Initialize Firebase App
        app = firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = firebase.firestore();
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Sample doctors data - This will be used if Firebase is not configured
const sampleDoctors = [
    {
        id: 'doc1',
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        experience: '15 years',
        qualification: 'MD, DM (Cardiology)',
        availability: 'Mon-Fri: 9 AM - 5 PM',
        rating: 4.8,
        consultationFee: '$100',
        image: '👩‍⚕️'
    },
    {
        id: 'doc2',
        name: 'Dr. Michael Chen',
        specialization: 'Neurology',
        experience: '12 years',
        qualification: 'MD, DM (Neurology)',
        availability: 'Mon-Sat: 10 AM - 6 PM',
        rating: 4.9,
        consultationFee: '$120',
        image: '👨‍⚕️'
    },
    {
        id: 'doc3',
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        experience: '10 years',
        qualification: 'MD (Pediatrics)',
        availability: 'Mon-Fri: 8 AM - 4 PM',
        rating: 4.7,
        consultationFee: '$80',
        image: '👩‍⚕️'
    },
    {
        id: 'doc4',
        name: 'Dr. James Wilson',
        specialization: 'Orthopedics',
        experience: '18 years',
        qualification: 'MS (Orthopedics)',
        availability: 'Tue-Sat: 9 AM - 5 PM',
        rating: 4.9,
        consultationFee: '$110',
        image: '👨‍⚕️'
    },
    {
        id: 'doc5',
        name: 'Dr. Priya Sharma',
        specialization: 'Dermatology',
        experience: '8 years',
        qualification: 'MD (Dermatology)',
        availability: 'Mon-Fri: 10 AM - 6 PM',
        rating: 4.6,
        consultationFee: '$90',
        image: '👩‍⚕️'
    },
    {
        id: 'doc6',
        name: 'Dr. Robert Brown',
        specialization: 'General Medicine',
        experience: '20 years',
        qualification: 'MBBS, MD',
        availability: 'Mon-Sun: 9 AM - 9 PM',
        rating: 4.8,
        consultationFee: '$70',
        image: '👨‍⚕️'
    }
];

// Function to get all doctors
async function getDoctors() {
    try {
        if (db) {
            const doctorsSnapshot = await db.collection('doctors').get();
            if (!doctorsSnapshot.empty) {
                return doctorsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
        }
        // Return sample data if Firebase is not configured or no data exists
        return sampleDoctors;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return sampleDoctors;
    }
}

// Function to save appointment to Firebase
async function saveAppointment(appointmentData) {
    try {
        if (db) {
            const docRef = await db.collection('appointments').add({
                ...appointmentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            console.log('Appointment saved with ID:', docRef.id);
            return { success: true, id: docRef.id };
        } else {
            // Fallback to localStorage if Firebase is not configured
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const newAppointment = {
                id: 'apt_' + Date.now(),
                ...appointmentData,
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            appointments.push(newAppointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            console.log('Appointment saved to localStorage');
            return { success: true, id: newAppointment.id };
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
        return { success: false, error: error.message };
    }
}

// Function to get appointments for a specific doctor
async function getAppointmentsByDoctor(doctorId) {
    try {
        if (db) {
            const appointmentsSnapshot = await db.collection('appointments')
                .where('doctorId', '==', doctorId)
                .orderBy('appointmentDate', 'desc')
                .get();
            
            return appointmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            // Fallback to localStorage
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            return appointments.filter(apt => apt.doctorId === doctorId);
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
        // Fallback to localStorage on error
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        return appointments.filter(apt => apt.doctorId === doctorId);
    }
}

// Function to update appointment status
async function updateAppointmentStatus(appointmentId, newStatus) {
    try {
        if (db) {
            await db.collection('appointments').doc(appointmentId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Appointment status updated');
            return { success: true };
        } else {
            // Fallback to localStorage
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const index = appointments.findIndex(apt => apt.id === appointmentId);
            if (index !== -1) {
                appointments[index].status = newStatus;
                appointments[index].updatedAt = new Date().toISOString();
                localStorage.setItem('appointments', JSON.stringify(appointments));
                console.log('Appointment status updated in localStorage');
                return { success: true };
            }
            return { success: false, error: 'Appointment not found' };
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, error: error.message };
    }
}

// Function to initialize sample doctors in Firebase (run once)
async function initializeSampleDoctors() {
    try {
        if (db) {
            const doctorsSnapshot = await db.collection('doctors').get();
            if (doctorsSnapshot.empty) {
                console.log('Initializing sample doctors...');
                for (const doctor of sampleDoctors) {
                    await db.collection('doctors').doc(doctor.id).set(doctor);
                }
                console.log('Sample doctors initialized successfully');
            }
        }
    } catch (error) {
        console.error('Error initializing sample doctors:', error);
    }
}
