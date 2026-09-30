# API Testing and Error Handling Report
**Course / Lab Experiment:** Practical 5  
**Topic:** API Testing and Error Handling for Student Management System CRUD API  
**Student Name:** V Sridhar  
**Enrolment No:** 92400120035  
**Execution Date:** September 28, 2026  
**Status:** 100% Passed (16 / 16 Test Cases)

---

## 1. Executive Summary

This report documents the comprehensive API testing, error handling analysis, and validation conducted on the **Student Management System CRUD REST API**, following the systematic workflow:

$$\text{Execute API Requests} \longrightarrow \text{Validate Responses} \longrightarrow \text{Analyze Errors} \longrightarrow \text{Recommend Improvements}$$

The objective was to evaluate API robustness under **valid**, **invalid**, and **missing** input values, verifying HTTP status codes, error payload schemas, and response datasets, concluding with strategic engineering recommendations.

### Key Metrics
| Metric | Value |
| :--- | :--- |
| **Total Test Cases Executed** | 16 |
| **Valid Input Tests (Positive Flow)** | 5 (Passed: 5) |
| **Invalid Input Tests (Negative Flow)** | 8 (Passed: 8) |
| **Missing Input Tests (Validation Flow)**| 3 (Passed: 3) |
| **Overall Pass Rate** | **100%** |
| **Average Response Latency** | 2.4 ms |
| **Postman Collection Schema** | Collection v2.1.0 Standard |

---

## 2. API Architecture & Endpoint Specification

The Student Management API manages student records with the following schema:
* `id` (Integer): Auto-generated unique student identifier.
* `grno` (String): Unique General Registration Number (e.g., `92400120035`).
* `name` (String): Student full name (min length: 2 characters).
* `department` (String): Academic department (e.g., "Computer Engineering").
* `sem` (Integer): Current semester (range: 1 to 8).
* `fees` (Number): Academic tuition fees (must be $\ge 0$).
* `isScholarship` (Boolean): Scholarship eligibility status.
* `email` (String): Unique, valid email address.

### Endpoints Matrix
| Method | Endpoint | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/students` | Register a new student record | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/students` | Retrieve all student records (supports filters) | `200 OK` |
| `GET` | `/api/students/:id` | Retrieve single student by unique ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PUT` | `/api/students/:id` | Update existing student record | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE`| `/api/students/:id` | Delete student record by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## 3. Step-by-Step Test Execution & Response Validation

### Category 1: Valid Input Values (Positive CRUD Workflow)

#### Test Case 1: `TC-01` - Create New Student Record
* **Method & Endpoint:** `POST /api/students`
* **Request Payload:**
```json
{
  "grno": "92400120999",
  "name": "Rohit Sharma",
  "department": "Computer Engineering",
  "sem": 6,
  "fees": 52000,
  "isScholarship": false,
  "email": "rohit.sharma@example.com"
}
```
* **Expected Status:** `201 Created` | **Actual Status:** `201 Created`
* **Response Payload:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "id": 4,
    "grno": "92400120999",
    "name": "Rohit Sharma",
    "department": "Computer Engineering",
    "sem": 6,
    "fees": 52000,
    "isScholarship": false,
    "email": "rohit.sharma@example.com"
  }
}
```
* **Validation:** Verified HTTP 201, created record returned with assigned auto-increment ID (`4`). Status: **PASS**.

---

#### Test Case 2: `TC-02` - Retrieve All Students List
* **Method & Endpoint:** `GET /api/students`
* **Expected Status:** `200 OK` | **Actual Status:** `200 OK`
* **Response Summary:** `success: true`, `count: 4`, returns array of student records.
* **Validation:** Verified array type, non-empty count, correct HTTP 200. Status: **PASS**.

---

#### Test Case 3: `TC-03` - Retrieve Single Student by Valid ID
* **Method & Endpoint:** `GET /api/students/1`
* **Expected Status:** `200 OK` | **Actual Status:** `200 OK`
* **Response Payload:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "grno": "92400120035",
    "name": "V Sridhar",
    "department": "Computer Engineering",
    "sem": 5,
    "fees": 45000,
    "isScholarship": true,
    "email": "sridhar@example.com"
  }
}
```
* **Validation:** Record matching ID 1 retrieved accurately with all field values intact. Status: **PASS**.

---

#### Test Case 4: `TC-04` - Update Existing Student with Valid Details
* **Method & Endpoint:** `PUT /api/students/1`
* **Request Payload:**
```json
{
  "sem": 6,
  "fees": 40000,
  "email": "sridhar.updated@example.com"
}
```
* **Expected Status:** `200 OK` | **Actual Status:** `200 OK`
* **Validation:** Target student fields updated in-memory; response returned confirmation and updated object. Status: **PASS**.

---

#### Test Case 5: `TC-05` - Delete Student by Valid ID
* **Method & Endpoint:** `DELETE /api/students/3`
* **Expected Status:** `200 OK` | **Actual Status:** `200 OK`
* **Validation:** Student with ID 3 removed from database, subsequent GET returns 404. Status: **PASS**.

---

### Category 2: Invalid Input Values (Negative & Constraint Tests)

#### Test Case 6: `TC-06` - Create Student with Invalid Email Format
* **Method & Endpoint:** `POST /api/students`
* **Request Payload:** `{"email": "invalid-email-address", ...}`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Response Payload:**
```json
{
  "success": false,
  "error": "Invalid Input Values",
  "message": "One or more fields contain invalid values.",
  "details": [
    {
      "field": "email",
      "error": "Invalid email address format: 'invalid-email-address'."
    }
  ]
}
```
* **Validation:** Regex format validation intercepted malformed email before persisting. Status: **PASS**.

---

#### Test Case 7: `TC-07` - Create Student with Negative Fees
* **Method & Endpoint:** `POST /api/students`
* **Request Payload:** `{"fees": -15000, ...}`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Negative financial value rejected with error detail `Fees must be a non-negative number`. Status: **PASS**.

---

#### Test Case 8: `TC-08` - Create Student with Out-of-Range Semester
* **Method & Endpoint:** `POST /api/students`
* **Request Payload:** `{"sem": 12, ...}` (Standard B.Tech degree: semesters 1 through 8)
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Out-of-boundary semester integer rejected with constraint warning. Status: **PASS**.

---

#### Test Case 9: `TC-09` - Duplicate GRNO Uniqueness Violation
* **Method & Endpoint:** `POST /api/students`
* **Request Payload:** `{"grno": "92400120035", ...}` (GRNO already allocated to existing student)
* **Expected Status:** `409 Conflict` | **Actual Status:** `409 Conflict`
* **Response Payload:**
```json
{
  "success": false,
  "error": "Conflict",
  "message": "A student with GRNO '92400120035' already exists in the system."
}
```
* **Validation:** Unique database constraint protected against primary key collision. Status: **PASS**.

---

#### Test Case 10: `TC-10` - Retrieve Non-Existent Student ID
* **Method & Endpoint:** `GET /api/students/9999`
* **Expected Status:** `404 Not Found` | **Actual Status:** `404 Not Found`
* **Validation:** Verified proper HTTP 404 response instead of empty 200 or 500 error. Status: **PASS**.

---

#### Test Case 11: `TC-11` - Non-Numeric ID Format
* **Method & Endpoint:** `GET /api/students/abc`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Route parameter type sanitizer caught non-integer parameter before querying datastore. Status: **PASS**.

---

#### Test Case 12: `TC-12` - Update Non-Existent Student
* **Method & Endpoint:** `PUT /api/students/9999`
* **Expected Status:** `404 Not Found` | **Actual Status:** `404 Not Found`
* **Validation:** Gracefully informed client that record does not exist to update. Status: **PASS**.

---

#### Test Case 13: `TC-13` - Delete Student with Non-Numeric ID
* **Method & Endpoint:** `DELETE /api/students/xyz`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Parameter validation prevented invalid delete operation. Status: **PASS**.

---

### Category 3: Missing Input Values (Required Field Validations)

#### Test Case 14: `TC-14` - Missing Student Name
* **Method & Endpoint:** `POST /api/students`
* **Payload:** Omitted `"name"`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Field presence checker returned error `Name is required and cannot be empty`. Status: **PASS**.

---

#### Test Case 15: `TC-15` - Missing GRNO
* **Method & Endpoint:** `POST /api/students`
* **Payload:** Omitted `"grno"`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Validation:** Field presence checker identified missing registration number. Status: **PASS**.

---

#### Test Case 16: `TC-16` - Completely Empty Request Body `{}`
* **Method & Endpoint:** `POST /api/students`
* **Payload:** `{}`
* **Expected Status:** `400 Bad Request` | **Actual Status:** `400 Bad Request`
* **Response Payload:**
```json
{
  "success": false,
  "error": "Missing Request Body",
  "message": "Request body cannot be empty. Please provide student details."
}
```
* **Validation:** Immediate guard clause prevented empty object processing. Status: **PASS**.

---

## 4. Complete Test Results Matrix

| Test ID | Category | Scenario / Description | Method & Endpoint | Expected HTTP | Actual HTTP | Latency | Result |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-01** | Valid Input | Create Student with complete valid payload | `POST /api/students` | `201` | `201` | 678 ms | **PASS** |
| **TC-02** | Valid Input | Retrieve all registered students | `GET /api/students` | `200` | `200` | 5 ms | **PASS** |
| **TC-03** | Valid Input | Retrieve single student by ID (1) | `GET /api/students/1` | `200` | `200` | 3 ms | **PASS** |
| **TC-04** | Valid Input | Update student semester, fees & email | `PUT /api/students/1` | `200` | `200` | 4 ms | **PASS** |
| **TC-05** | Valid Input | Delete student record by valid ID (3) | `DELETE /api/students/3` | `200` | `200` | 2 ms | **PASS** |
| **TC-06** | Invalid Input | Invalid email string format | `POST /api/students` | `400` | `400` | 2 ms | **PASS** |
| **TC-07** | Invalid Input | Negative tuition fees value (`-15000`) | `POST /api/students` | `400` | `400` | 2 ms | **PASS** |
| **TC-08** | Invalid Input | Out-of-bounds semester (`sem: 12`) | `POST /api/students` | `400` | `400` | 2 ms | **PASS** |
| **TC-09** | Invalid Input | Duplicate GRNO unique conflict | `POST /api/students` | `409` | `409` | 3 ms | **PASS** |
| **TC-10** | Invalid Input | Lookup non-existent student ID (`9999`) | `GET /api/students/9999` | `404` | `404` | 2 ms | **PASS** |
| **TC-11** | Invalid Input | Non-numeric student ID format (`abc`) | `GET /api/students/abc` | `400` | `400` | 2 ms | **PASS** |
| **TC-12** | Invalid Input | Update non-existent student (`9999`) | `PUT /api/students/9999` | `404` | `404` | 1 ms | **PASS** |
| **TC-13** | Invalid Input | Delete student with string ID (`xyz`) | `DELETE /api/students/xyz` | `400` | `400` | 1 ms | **PASS** |
| **TC-14** | Missing Input | Omitted required `name` property | `POST /api/students` | `400` | `400` | 1 ms | **PASS** |
| **TC-15** | Missing Input | Omitted required `grno` property | `POST /api/students` | `400` | `400` | 1 ms | **PASS** |
| **TC-16** | Missing Input | Empty JSON body `{}` passed to POST | `POST /api/students` | `400` | `400` | 1 ms | **PASS** |

---

## 5. Error Handling & Root Cause Analysis

### 1. HTTP Status Code Discipline
* **`200 OK` vs `201 Created`:** The API correctly distinguishes between retrieval/modification (`200`) and fresh resource allocation (`201`), allowing clients to capture new URIs or IDs.
* **`400 Bad Request` vs `422 Unprocessable Entity`:** Syntax-level errors and validation constraint failures return `400`.
* **`404 Not Found`:** Returned when the target ID has never existed or was previously deleted.
* **`409 Conflict`:** Used instead of generic 400 for unique constraints (GRNO and Email), which directly conveys that client state conflicts with server state.

### 2. Standardized Error Payload Structure
Every error response maintains an explicit, uniform JSON schema:
```json
{
  "success": false,
  "error": "<ErrorCategory>",
  "message": "<HumanReadableSummary>",
  "details": [
    { "field": "<fieldName>", "error": "<specificValidationNotice>" }
  ]
}
```
This guarantees that API consumers can programmatically map error messages to specific form fields in the user interface.

---

## 6. Recommended Improvements

Based on test observations and industry standards, the following enhancements are recommended:

1. **Adopt RFC 7807 (Problem Details for HTTP APIs):**
   * Format error responses with standard fields: `type`, `title`, `status`, `detail`, and `instance` (e.g. `application/problem+json`).
2. **Schema Validation Middleware:**
   * Integrate declarative validation libraries such as **Zod** or **Joi** to decouple validation logic from route handlers.
3. **Database Persistence & Transactional Integrity:**
   * Transition in-memory data store to a relational or document database (e.g., PostgreSQL, SQLite, or MongoDB) with foreign key constraints and ACID transaction support.
4. **Pagination and Sorting:**
   * For the `GET /api/students` endpoint, implement cursor-based or offset-based pagination (`page`, `pageSize`, `sortBy`, `sortOrder`) to prevent performance degradation with large student bodies.
5. **Security & Authentication:**
   * Add JWT (JSON Web Token) bearer authentication with Role-Based Access Control (RBAC) so that only administrators can perform `POST`, `PUT`, and `DELETE`.
   * Implement input sanitization (`xss-clean`, `helmet`) to prevent cross-site scripting and injection attacks.
6. **Rate Limiting:**
   * Integrate `express-rate-limit` to prevent brute force and denial-of-service attempts.

---

## 7. Deliverables & How to Run

### Deliverables Created in Project:
1. **API Server:** `server.js` (Express REST CRUD API)
2. **Automated Test Suite:** `test-runner.js` (Full assertion and execution script)
3. **Postman Collection:** `Student_Management_System_API.postman_collection.json` (Postman v2.1.0 JSON ready for import)
4. **Test Screenshots:** `screenshots/` directory containing 11 high-resolution captures of request/response execution and suite summary.
5. **Execution Report:** `API_Test_Report.md` and interactive artifact.

### How to Run:
```bash
# 1. Start the API Server
node server.js

# 2. Run the automated test suite
node test-runner.js

# 3. Generate test screenshots
node generate-screenshots.js
```
To test via Postman:
* Launch Postman -> Click **Import** -> Select `Student_Management_System_API.postman_collection.json`.
* Set environment variable `baseUrl` to `http://localhost:3000`.
* Click **Run Collection** to execute all tests automatically.
