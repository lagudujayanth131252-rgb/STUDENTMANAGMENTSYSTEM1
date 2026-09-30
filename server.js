const express = require('express');
const cors = require('cors');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// In-memory data store with initial seed records
let students = [
  {
    id: 1,
    grno: "92400120035",
    name: "V Sridhar",
    department: "Computer Engineering",
    sem: 5,
    fees: 45000,
    isScholarship: true,
    email: "sridhar@example.com"
  },
  {
    id: 2,
    grno: "92400120619",
    name: "Darshan N",
    department: "Computer Engineering",
    sem: 5,
    fees: 50000,
    isScholarship: false,
    email: "darshan@example.com"
  },
  {
    id: 3,
    grno: "92400120015",
    name: "Amit Patel",
    department: "Information Technology",
    sem: 4,
    fees: 48000,
    isScholarship: false,
    email: "amit.patel@example.com"
  }
];

let nextId = 4;

// Helper: Email validation regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Root endpoint: API Status & Documentation link
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Management System CRUD API is running',
    version: '1.0.0',
    endpoints: {
      getAllStudents: 'GET /api/students',
      getStudentById: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id'
    }
  });
});

// 1. GET ALL STUDENTS (Supports optional query filtering)
app.get('/api/students', (req, res) => {
  const { department, sem, search } = req.query;
  let results = [...students];

  if (department) {
    results = results.filter(s => s.department.toLowerCase() === department.toLowerCase());
  }
  if (sem) {
    results = results.filter(s => s.sem === parseInt(sem, 10));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q) || s.grno.toLowerCase().includes(q));
  }

  return res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

// 2. GET STUDENT BY ID
app.get('/api/students/:id', (req, res) => {
  const rawId = req.params.id;
  const studentId = parseInt(rawId, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: `The student ID '${rawId}' must be a valid integer.`
    });
  }

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Resource Not Found',
      message: `Student with ID ${studentId} was not found.`
    });
  }

  return res.status(200).json({
    success: true,
    data: student
  });
});

// 3. CREATE STUDENT (POST)
app.post('/api/students', (req, res) => {
  const body = req.body;
  const errors = [];

  // Check empty request body
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing Request Body',
      message: 'Request body cannot be empty. Please provide student details.'
    });
  }

  // Validate missing fields
  if (!body.grno || String(body.grno).trim() === '') {
    errors.push({ field: 'grno', error: 'GRNO is required and cannot be empty.' });
  }
  if (!body.name || String(body.name).trim() === '') {
    errors.push({ field: 'name', error: 'Name is required and cannot be empty.' });
  }
  if (!body.department || String(body.department).trim() === '') {
    errors.push({ field: 'department', error: 'Department is required and cannot be empty.' });
  }
  if (body.sem === undefined || body.sem === null || body.sem === '') {
    errors.push({ field: 'sem', error: 'Semester (sem) is required.' });
  }
  if (body.fees === undefined || body.fees === null || body.fees === '') {
    errors.push({ field: 'fees', error: 'Fees is required.' });
  }
  if (!body.email || String(body.email).trim() === '') {
    errors.push({ field: 'email', error: 'Email is required and cannot be empty.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      message: 'One or more required fields are missing or empty.',
      details: errors
    });
  }

  // Value format & constraint validations (Invalid input tests)
  if (typeof body.name === 'string' && body.name.trim().length < 2) {
    errors.push({ field: 'name', error: 'Name must be at least 2 characters long.' });
  }

  if (!isValidEmail(body.email)) {
    errors.push({ field: 'email', error: `Invalid email address format: '${body.email}'.` });
  }

  const semNum = Number(body.sem);
  if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
    errors.push({ field: 'sem', error: 'Semester must be an integer between 1 and 8.' });
  }

  const feesNum = Number(body.fees);
  if (isNaN(feesNum) || feesNum < 0) {
    errors.push({ field: 'fees', error: 'Fees must be a non-negative number.' });
  }

  // Check unique constraints (GRNO and Email)
  const existingGrno = students.find(s => String(s.grno).trim() === String(body.grno).trim());
  if (existingGrno) {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: `A student with GRNO '${body.grno}' already exists in the system.`
    });
  }

  const existingEmail = students.find(s => s.email.toLowerCase() === String(body.email).trim().toLowerCase());
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: `A student with email '${body.email}' already exists in the system.`
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Input Values',
      message: 'One or more fields contain invalid values.',
      details: errors
    });
  }

  // Create new record
  const newStudent = {
    id: nextId++,
    grno: String(body.grno).trim(),
    name: String(body.name).trim(),
    department: String(body.department).trim(),
    sem: semNum,
    fees: feesNum,
    isScholarship: Boolean(body.isScholarship),
    email: String(body.email).trim()
  };

  students.push(newStudent);

  return res.status(201).json({
    success: true,
    message: 'Student registered successfully',
    data: newStudent
  });
});

// 4. UPDATE STUDENT (PUT)
app.put('/api/students/:id', (req, res) => {
  const rawId = req.params.id;
  const studentId = parseInt(rawId, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: `The student ID '${rawId}' must be a valid integer.`
    });
  }

  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Resource Not Found',
      message: `Cannot update. Student with ID ${studentId} does not exist.`
    });
  }

  const body = req.body;
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing Request Body',
      message: 'Request body cannot be empty for update.'
    });
  }

  const errors = [];

  if (body.email && !isValidEmail(body.email)) {
    errors.push({ field: 'email', error: `Invalid email address format: '${body.email}'.` });
  }

  if (body.sem !== undefined) {
    const semNum = Number(body.sem);
    if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
      errors.push({ field: 'sem', error: 'Semester must be an integer between 1 and 8.' });
    }
  }

  if (body.fees !== undefined) {
    const feesNum = Number(body.fees);
    if (isNaN(feesNum) || feesNum < 0) {
      errors.push({ field: 'fees', error: 'Fees must be a non-negative number.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Input Values',
      message: 'Update failed due to invalid field values.',
      details: errors
    });
  }

  // Update existing record
  const current = students[index];
  const updatedStudent = {
    ...current,
    grno: body.grno ? String(body.grno).trim() : current.grno,
    name: body.name ? String(body.name).trim() : current.name,
    department: body.department ? String(body.department).trim() : current.department,
    sem: body.sem !== undefined ? Number(body.sem) : current.sem,
    fees: body.fees !== undefined ? Number(body.fees) : current.fees,
    isScholarship: body.isScholarship !== undefined ? Boolean(body.isScholarship) : current.isScholarship,
    email: body.email ? String(body.email).trim() : current.email
  };

  students[index] = updatedStudent;

  return res.status(200).json({
    success: true,
    message: `Student with ID ${studentId} updated successfully`,
    data: updatedStudent
  });
});

// 5. DELETE STUDENT (DELETE)
app.delete('/api/students/:id', (req, res) => {
  const rawId = req.params.id;
  const studentId = parseInt(rawId, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: `The student ID '${rawId}' must be a valid integer.`
    });
  }

  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Resource Not Found',
      message: `Cannot delete. Student with ID ${studentId} does not exist.`
    });
  }

  const deletedStudent = students.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: `Student with ID ${studentId} deleted successfully`,
    data: deletedStudent
  });
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Please verify endpoint URL.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON',
      message: 'The request payload contains malformed JSON syntax.'
    });
  }

  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred on the server.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Student Management API Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
