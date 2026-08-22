# ZoomWebClone

ZoomWebClone is a **Zoom-inspired video conferencing web application** being built using the **MERN Stack**.

The goal of this project is to understand and implement real-world concepts such as authentication, REST APIs, database integration, routing, and eventually real-time communication.

## 🛠 Tech Stack

* **MongoDB** — Database
* **Express.js** — Backend framework
* **React.js** — Frontend
* **Node.js** — Backend runtime
* **Mongoose** — MongoDB ODM
* **bcrypt** — Password hashing
* **Thunder Client** — API testing

## 🚀 Current Features

* User Registration
* User Login
* Password Hashing using bcrypt
* MongoDB Integration
* Token Generation for Authentication
* REST API Routing
* API Versioning using `/api/v1`
* User-related routes separated using Express Router

## 📁 Backend API Structure

```text
/api/v1/users/register
/api/v1/users/login
```

Example:

```text
POST /api/v1/users/register
POST /api/v1/users/login
```

## 📂 Project Structure

```text
ZoomWebClone/
│
├── controllers/
│   └── user.controller.js
│
├── models/
│   └── user.model.js
│
├── routes/
│   └── users.routes.js
│
├── app.js
├── package.json
└── .env
```

## ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and add the required environment variables.

Run the development server:

```bash
npm run dev
```

## 📌 Project Status

🚧 **Currently under development**

More features such as meetings, real-time communication, video/audio calling, and activity management will be added as the project progresses.

## 🎯 Learning Goal

This project is being developed to gain practical experience with the **MERN stack** and understand how a production-style full-stack application is structured and developed.
