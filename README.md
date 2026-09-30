# Student Management System - CRUD API Testing & Error Handling

**Course / Lab Experiment:** Practical 5  
**Topic:** API Testing and Error Handling for Student Management System CRUD API  
**Student Name:** V Sridhar  
**Enrolment Number:** 92400120035  
**Execution Status:** 100% Passed (16 / 16 Test Cases)

---

## 📌 Project Overview

This project implements a complete **Student Management System CRUD API** and a modern **Web Portal with an interactive API Testing Sandbox**, developed specifically to satisfy all criteria of **Practical 5: API Testing and Error Handling**:

$$\text{Execute API Requests} \longrightarrow \text{Validate Responses} \longrightarrow \text{Analyze Errors} \longrightarrow \text{Recommend Improvements}$$

The suite tests **valid**, **invalid**, and **missing** inputs against standard REST endpoints, verifying HTTP status codes, error payloads, and response data.

---

## 🚀 Quick Start Guide

### 1. Start the API & Web Server
```powershell
node server.js
```
The server will start at: **`http://localhost:3000`**

### 2. Open the Student Management Website
* **Live Website URL:** Open your browser and go to [http://localhost:3000](http://localhost:3000)
* **Direct File Link:** Open [`public/index.html`](./public/index.html) directly in any browser (operates with automatic local storage fallback when the server is offline).

### 3. Run the Automated Test Suite (16 Test Cases)
```powershell
node test-runner.js
```

### 4. Regenerate Visual Test Screenshots
```powershell
node generate-screenshots.js
```

---

## 📂 Deliverables & File Directory

| File / Folder | Purpose |
| :--- | :--- |
| **[`Practical_5_API_Testing_and_Error_Handling_92400120035.html`](./Practical_5_API_Testing_and_Error_Handling_92400120035.html)** | Formal academic report — open in browser and press Ctrl+P → Save as PDF for submission. |
| **[`Student_Management_System_API.postman_collection.json`](./Student_Management_System_API.postman_collection.json)** | Standard Postman v2.1.0 Collection with automated JavaScript assertions for every request. |
| **[`public/index.html`](./public/index.html)** | Interactive Student Management Portal & Practical 5 API Testing Sandbox. |
| **[`public/style.css`](./public/style.css)** | Modern responsive styling for the web portal. |
| **[`public/app.js`](./public/app.js)** | Dynamic frontend application with live CRUD and sandbox execution. |
| **[`API_Test_Report.html`](./API_Test_Report.html)** | Printable browser HTML report. |
| **[`API_Test_Report.md`](./API_Test_Report.md)** | Full Markdown test report documentation. |
| **[`test-results.json`](./test-results.json)** | Machine-readable test execution log with latencies and headers. |
| **[`screenshots/`](./screenshots/)** | 17 high-resolution PNG screen captures for every test case and UI. |
| **[`server.js`](./server.js)** | Express REST CRUD API server with input validation and error handling. |
| **[`test-runner.js`](./test-runner.js)** | Automated test runner verifying status codes and error bodies. |

---

## 🧪 Practical 5 Test Execution Matrix

| Test ID | Category | Method & Endpoint | Scenario | Expected HTTP | Actual HTTP | Result |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **TC-01** | Valid Input | `POST /api/students` | Register student with valid payload | `201 Created` | `201 Created` | **PASS** |
| **TC-02** | Valid Input | `GET /api/students` | Retrieve all registered students | `200 OK` | `200 OK` | **PASS** |
| **TC-03** | Valid Input | `GET /api/students/1` | Retrieve single student by ID (1) | `200 OK` | `200 OK` | **PASS** |
| **TC-04** | Valid Input | `PUT /api/students/1` | Update semester, fees, and email | `200 OK` | `200 OK` | **PASS** |
| **TC-05** | Valid Input | `DELETE /api/students/3` | Delete student record by valid ID | `200 OK` | `200 OK` | **PASS** |
| **TC-06** | Invalid Input | `POST /api/students` | Invalid email format (`invalid-email-address`) | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-07** | Invalid Input | `POST /api/students` | Negative tuition fees (`-15000`) | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-08** | Invalid Input | `POST /api/students` | Semester out of range (`sem: 12`) | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-09** | Invalid Input | `POST /api/students` | Duplicate GRNO conflict (`92400120035`) | `409 Conflict` | `409 Conflict` | **PASS** |
| **TC-10** | Invalid Input | `GET /api/students/9999`| Lookup non-existent student ID | `404 Not Found` | `404 Not Found` | **PASS** |
| **TC-11** | Invalid Input | `GET /api/students/abc` | Non-numeric student ID format | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-12** | Invalid Input | `PUT /api/students/9999`| Update non-existent student | `404 Not Found` | `404 Not Found` | **PASS** |
| **TC-13** | Invalid Input | `DELETE /api/students/xyz`| Non-numeric ID in DELETE | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-14** | Missing Input | `POST /api/students` | Missing mandatory `name` field | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-15** | Missing Input | `POST /api/students` | Missing mandatory `grno` field | `400 Bad Request` | `400 Bad Request` | **PASS** |
| **TC-16** | Missing Input | `POST /api/students` | Completely empty body `{}` | `400 Bad Request` | `400 Bad Request` | **PASS** |

---

## 🛠️ Postman Collection Usage

1. Launch Postman.
2. Click **Import** (top-left) &rarr; Choose file &rarr; Select `Student_Management_System_API.postman_collection.json`.
3. Set the environment variable `baseUrl` to `http://localhost:3000`.
4. Run individual requests or use the **Collection Runner** to execute all 16 automated tests in sequence.
