# MentorLagbe — Find the Right Tutor, Achieve More

MentorLagbe is an online tuition and tutoring platform that connects students with qualified tutors. Students can explore tuition opportunities, apply for suitable tuition posts, and manage their learning journey. Tutors can create tuition posts, manage applications, and grow their tutoring opportunities.

## 🌐 Live Website

- **Frontend:** [Add your deployed frontend URL]
- **Backend API:** https://mentorlagbe-server-alpha.vercel.app

## ✨ Key Features

### Authentication
- Sign up and sign in using email and password.
- Google authentication.
- Role-based account access for Students and Tutors.
- Protected dashboard routes.
- Secure authentication with Better Auth.

### Student Features
- Browse and explore available tuition posts.
- Search and filter tuition opportunities.
- View detailed tuition information.
- Apply for suitable tuition opportunities.
- Bookmark favorite tuition posts.
- Manage applications and personal profile.
- Access Student Pro subscription features.

### Tutor Features
- Create and manage tuition posts.
- Submit tuition posts for admin approval.
- Manage student applications.
- View and update profile information.
- Access Tutor Pro subscription features.

### Admin Features
- Manage users and platform activities.
- Review submitted tuition posts.
- Approve or reject tuition applications/posts.
- Manage platform operations.

### Subscription & Payments
- Student Pro and Tutor Pro plans.
- Stripe-powered subscription checkout.
- Secure payment integration.
- Subscription-based premium features.

## 🛠️ Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide React
- Better Auth
- Stripe

### Backend & Database
- Node.js
- Express.js
- TypeScript
- MongoDB

### Authentication & Payment
- Better Auth
- Google OAuth
- Stripe

### Deployment
- Vercel

## 📁 Project Structure

```text
mentor-lagbe/
├── public/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── google/
│   │   │       └── callback/
│   │   │           └── page.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── browse/
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── home/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   └── services/
├── .env.local
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd mentor-lagbe
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

Use your deployed backend URL for production.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB image upload API key |

**Security Note:** Never add private API secrets, Google Client Secrets, Stripe Secret Keys, or other sensitive credentials to frontend environment variables. Never commit `.env.local` to GitHub.

## 💳 Subscription Plans

MentorLagbe offers premium subscription options for both students and tutors.

- Student Pro
- Tutor Pro

Payments are processed through Stripe Checkout.

## 🚀 Deployment

The frontend is deployed using Vercel.

To deploy your own version:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.

## 🎯 Project Goal

The goal of MentorLagbe is to make finding tuition and connecting with tutors easier, more accessible, and more organized through a user-friendly digital platform.

---

**Built with ❤️ for students and tutors.**

**MentorLagbe — Learn Better, Grow Together.**