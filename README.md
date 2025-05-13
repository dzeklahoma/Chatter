# Secure Chat Application

A real-time chat application built with React, Node.js, and MongoDB that supports private messaging, group chats, and end-to-end encryption.

## Features

- User Registration and Login
- Private Messaging
- Group Chat Support
- Media Sharing (images, documents)
- End-to-End Encryption
- Message Status Indicators
- Real-time Updates

## Prerequisites

Before running this application, you need:

- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Replace `your_mongodb_connection_string` with your MongoDB Atlas connection string. It should look like:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

4. Start the development server:

```bash
npm run dev
```

## MongoDB Setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your values in the `.env` file

## Environment Variables

The following environment variables are required:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure string for JWT token generation

## Security Note

Never commit the `.env` file to version control. It contains sensitive information that should be kept private.
