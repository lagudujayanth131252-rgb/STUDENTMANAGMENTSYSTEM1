const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./server');

const TEST_PORT = 3001;
let server;

function makeRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const responseTimeMs = Date.now() - startTime;
        let parsedBody;
        try {
          parsedBody = JSON.parse(data);
        } catch (e) {
          parsedBody = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          responseTimeMs
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (requestBody) {
      req.write(typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody));
    }
    req.end();
  });
}

const testCases = [
  // -------------------------------------------------------------------------
  // CATEGORY 1: VALID INPUT VALUES (CRUD POSITIVE TESTS)
  // -------------------------------------------------------------------------
  {
    id: "TC-01",
    category: "Valid Input",
    name: "Create New Student with Valid Data",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120999",
      name: "Rohit Sharma",
      department: "Computer Engineering",
      sem: 6,
      fees: 52000,
      isScholarship: false,
      email: "rohit.sharma@example.com"
    },
    expectedStatus: 201,
    validate: (res) => res.body.success === true && res.body.data.grno === "92400120999"
  },
  {
    id: "TC-02",
    category: "Valid Input",
    name: "Retrieve All Students List",
    method: "GET",
    path: "/api/students",
    headers: {},
    payload: null,
    expectedStatus: 200,
    validate: (res) => res.body.success === true && Array.isArray(res.body.data) && res.body.count >= 3
  },
  {
    id: "TC-03",
    category: "Valid Input",
    name: "Retrieve Single Student by Valid ID (ID: 1)",
    method: "GET",
    path: "/api/students/1",
    headers: {},
    payload: null,
    expectedStatus: 200,
    validate: (res) => res.body.success === true && res.body.data.id === 1 && res.body.data.name === "V Sridhar"
  },
  {
    id: "TC-04",
    category: "Valid Input",
    name: "Update Existing Student with Valid Details (ID: 1)",
    method: "PUT",
    path: "/api/students/1",
    headers: { "Content-Type": "application/json" },
    payload: {
      sem: 6,
      fees: 40000,
      email: "sridhar.updated@example.com"
    },
    expectedStatus: 200,
    validate: (res) => res.body.success === true && res.body.data.sem === 6 && res.body.data.email === "sridhar.updated@example.com"
  },
  {
    id: "TC-05",
    category: "Valid Input",
    name: "Delete Existing Student by Valid ID (ID: 3)",
    method: "DELETE",
    path: "/api/students/3",
    headers: {},
    payload: null,
    expectedStatus: 200,
    validate: (res) => res.body.success === true && res.body.data.id === 3
  },

  // -------------------------------------------------------------------------
  // CATEGORY 2: INVALID INPUT VALUES (NEGATIVE & CONSTRAINT TESTS)
  // -------------------------------------------------------------------------
  {
    id: "TC-06",
    category: "Invalid Input",
    name: "Create Student with Invalid Email Format",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120888",
      name: "Ananya Roy",
      department: "Mechanical Engineering",
      sem: 4,
      fees: 45000,
      isScholarship: false,
      email: "invalid-email-address"
    },
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.error === "Invalid Input Values"
  },
  {
    id: "TC-07",
    category: "Invalid Input",
    name: "Create Student with Negative Fees Value",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120777",
      name: "Sneha Rao",
      department: "Civil Engineering",
      sem: 3,
      fees: -15000,
      isScholarship: false,
      email: "sneha.rao@example.com"
    },
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.details.some(d => d.field === 'fees')
  },
  {
    id: "TC-08",
    category: "Invalid Input",
    name: "Create Student with Out of Range Semester (sem: 12)",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120666",
      name: "Rahul Verma",
      department: "Electrical Engineering",
      sem: 12,
      fees: 48000,
      isScholarship: false,
      email: "rahul.verma@example.com"
    },
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.details.some(d => d.field === 'sem')
  },
  {
    id: "TC-09",
    category: "Invalid Input",
    name: "Create Student with Duplicate GRNO (Conflict)",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120035", // Already exists
      name: "Duplicate User",
      department: "Computer Engineering",
      sem: 5,
      fees: 50000,
      isScholarship: false,
      email: "duplicate.user@example.com"
    },
    expectedStatus: 409,
    validate: (res) => res.body.success === false && res.body.error === "Conflict"
  },
  {
    id: "TC-10",
    category: "Invalid Input",
    name: "Retrieve Student with Non-Existent ID (ID: 9999)",
    method: "GET",
    path: "/api/students/9999",
    headers: {},
    payload: null,
    expectedStatus: 404,
    validate: (res) => res.body.success === false && res.body.error === "Resource Not Found"
  },
  {
    id: "TC-11",
    category: "Invalid Input",
    name: "Retrieve Student with Non-Numeric ID Format ('abc')",
    method: "GET",
    path: "/api/students/abc",
    headers: {},
    payload: null,
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.error === "Invalid ID format"
  },
  {
    id: "TC-12",
    category: "Invalid Input",
    name: "Update Non-Existent Student (ID: 9999)",
    method: "PUT",
    path: "/api/students/9999",
    headers: { "Content-Type": "application/json" },
    payload: { name: "Non Existent" },
    expectedStatus: 404,
    validate: (res) => res.body.success === false && res.body.error === "Resource Not Found"
  },
  {
    id: "TC-13",
    category: "Invalid Input",
    name: "Delete Student with Non-Numeric ID ('xyz')",
    method: "DELETE",
    path: "/api/students/xyz",
    headers: {},
    payload: null,
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.error === "Invalid ID format"
  },

  // -------------------------------------------------------------------------
  // CATEGORY 3: MISSING INPUT VALUES (VALIDATION TESTS)
  // -------------------------------------------------------------------------
  {
    id: "TC-14",
    category: "Missing Input",
    name: "Create Student with Missing Name Field",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      grno: "92400120555",
      // Missing name
      department: "Information Technology",
      sem: 3,
      fees: 45000,
      email: "noname@example.com"
    },
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.details.some(d => d.field === 'name')
  },
  {
    id: "TC-15",
    category: "Missing Input",
    name: "Create Student with Missing GRNO Field",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {
      // Missing grno
      name: "Pooja Mehta",
      department: "Computer Engineering",
      sem: 2,
      fees: 42000,
      email: "pooja.mehta@example.com"
    },
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.details.some(d => d.field === 'grno')
  },
  {
    id: "TC-16",
    category: "Missing Input",
    name: "Create Student with Empty Request Body ({})",
    method: "POST",
    path: "/api/students",
    headers: { "Content-Type": "application/json" },
    payload: {},
    expectedStatus: 400,
    validate: (res) => res.body.success === false && res.body.error === "Missing Request Body"
  }
];

async function runTestSuite() {
  console.log("================================================================================");
  console.log("            STUDENT MANAGEMENT SYSTEM - CRUD API TEST SUITE                    ");
  console.log("================================================================================");
  console.log(`Starting mock server on port ${TEST_PORT}...\n`);

  server = app.listen(TEST_PORT);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: tc.path,
      method: tc.method,
      headers: tc.headers
    };

    try {
      const response = await makeRequest(options, tc.payload);
      const statusMatch = response.statusCode === tc.expectedStatus;
      const validationPassed = tc.validate(response);
      const isPassed = statusMatch && validationPassed;

      if (isPassed) {
        passedCount++;
      } else {
        failedCount++;
      }

      const resultItem = {
        ...tc,
        actualStatus: response.statusCode,
        statusPassed: statusMatch,
        validationPassed,
        overallResult: isPassed ? 'PASS' : 'FAIL',
        responseTimeMs: response.responseTimeMs,
        responseHeaders: response.headers,
        responseBody: response.body
      };

      results.push(resultItem);

      const statusBadge = isPassed ? "✓ PASS" : "✗ FAIL";
      console.log(`[${statusBadge}] ${tc.id}: ${tc.name}`);
      console.log(`       Method: ${tc.method} ${tc.path}`);
      console.log(`       Expected HTTP: ${tc.expectedStatus} | Actual HTTP: ${response.statusCode} | Latency: ${response.responseTimeMs}ms`);
      if (!isPassed) {
        console.log(`       Error Info:`, JSON.stringify(response.body));
      }
      console.log("--------------------------------------------------------------------------------");
    } catch (err) {
      failedCount++;
      console.error(`[✗ ERROR] ${tc.id}: ${tc.name} encountered error:`, err.message);
      results.push({
        ...tc,
        actualStatus: 0,
        overallResult: 'ERROR',
        error: err.message
      });
    }
  }

  server.close();
  console.log("\n================================================================================");
  console.log(`TEST EXECUTION SUMMARY: Total: ${testCases.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("================================================================================\n");

  const resultsFilePath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Detailed test execution log written to: ${resultsFilePath}`);
}

runTestSuite().catch(err => {
  console.error("Test runner failed:", err);
  if (server) server.close();
  process.exit(1);
});
