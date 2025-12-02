# Smart Studio 🎨

AI-powered design studio that generates professional graphic design concepts using Google's Gemini AI.

## Features

- 🔐 **Secure Authentication** (Google, Facebook, Microsoft)
- 🤖 AI-powered concept generation (4 unique concepts per brief)
- 🎨 Professional design sketches with Imagen 3
- ✏️ Built-in editor for refinements
- 📱 Multiple aspect ratios (1:1, 9:16, 16:9, 3:4)
- 📥 Export to PNG, JPG, PDF
- 🌐 Hebrew-first interface

## Tech Stack

- React 19 + TypeScript
- Vite + React Router
- Tailwind CSS
- **Firebase Authentication**
- Google Gemini API (gemini-2.5-flash + imagen-3.0)
- Vercel Serverless Functions

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/aihenryai/smart-designer.git
cd smart-designer
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Firebase (see FIREBASE_SETUP.md for full guide)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Setup Firebase Authentication

📖 **Follow the complete guide:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

Quick steps:
1. Create Firebase project
2. Enable Google, Facebook, Microsoft sign-in methods
3. Copy config to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel Dashboard
3. Deploy!

**Important**: Update Firebase Authorized Domains and OAuth Redirect URIs with your Vercel domain.

## Project Structure

```
smart-designer/
├── src/
│   ├── components/       # React components
│   ├── contexts/         # AuthContext
│   ├── pages/           # SignIn page
│   ├── config/          # Firebase config
│   ├── services/        # Gemini API service
│   └── types.ts         # TypeScript types
├── api/                 # Vercel serverless functions
├── App.tsx             # Main app with routes
└── index.tsx           # Entry point
```

## Authentication

The app uses **Firebase Authentication** with:
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Microsoft OAuth

All routes are protected - users must sign in to access the design studio.

## Features in Detail

### AI-Powered Design Generation
- Analyze brief and generate 4 unique design concepts
- Professional design mockups with Imagen 3
- Smart color palette suggestions
- Typography recommendations

### Built-in Editor
- Refine generated designs
- Adjust essential information
- Real-time regeneration
- Export in multiple formats

### User Experience
- Hebrew RTL interface
- Responsive design
- Loading states with animations
- Error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues or questions:
- 📧 Email: Henrystauber22@gmail.com
- 📱 WhatsApp: 0585005171
- 🔗 [taplink.cc/henry.ai](https://taplink.cc/henry.ai)

---

**Built with ❤️ by Henry Stauber**
