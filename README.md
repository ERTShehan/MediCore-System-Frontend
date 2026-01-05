# MediCore - Clinic Management System (Frontend)

## 📌 Project Overview
The client-side application for **MediCore**, built with modern web technologies to provide a fast and interactive experience for clinic staff. It features distinct dashboards for Doctors and Counter Staff, ensuring a streamlined workflow from patient registration to billing.

## 🚀 Technologies & Tools
* **Core Framework:** React.js (powered by Vite)
* **Language:** TypeScript
* **State Management:** Redux Toolkit (RTK)
* **Styling:** Tailwind CSS, Custom CSS
* **HTTP Client:** Axios (with Interceptors for automatic token refresh)
* **Routing:** React Router DOM

## ✨ Key Features

### 1. Dynamic Dashboards
* **Intelligent Routing:** Automatically redirects users to the **Doctor Dashboard** or **Counter Dashboard** based on their login credentials.
* **Protected Routes:** Ensures unauthorized users cannot access internal system pages.

### 2. Doctor Interface
* **Invite System:** A dedicated button to call the next patient by Appointment Number.
* **Patient Details:** Displays the current patient's Name and Age immediately after inviting.
* **Prescription Form:** Interactive text fields to enter medicine details.
* **Staff Admin Panel:** UI for creating and managing Counter Staff accounts.
* **History View:** Visual representation of daily patient counts and past records.

### 3. Counter Staff Interface
* **Registration Form:** Simple interface to enter Patient Name, Age, and Phone Number.
* **Appointment Generation:** Automatically displays the assigned Appointment Number upon registration.
* **Billing View:** Real-time view of prescriptions sent by the Doctor.
* **Print Support:** Ability to print the final Medical Bill/Report for the patient.

### 4. User Experience (UX)
* **Real-time Feedback:** Toast notifications for success/error messages (e.g., "No Registered Patients", "Invitation Sent").
* **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.

## 📂 Installation & Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📸 Application Flow

1.  **Login:** Users enter credentials.
2.  **Counter Action:** Staff registers a new patient -> System assigns Appointment ID.
3.  **Doctor Action:** Doctor clicks "Invite Patient" -> System shows Patient Info.
4.  **Consultation:** Doctor enters medicine -> Clicks Submit.
5.  **Completion:** Counter sees the bill -> Collects payment -> Prints Report.

## 🔗 Deployed URL
* **Live Site:** [Insert Deployed Link Here]