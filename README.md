# Smart Studio 🎨

AI-powered design studio that generates professional graphic design concepts using Google's Gemini AI.

## Features

- 🤖 AI-powered concept generation (4 unique concepts per brief)
- 🎨 Professional design sketches with Imagen 3
- ✏️ Built-in editor for refinements
- 📱 Multiple aspect ratios (1:1, 9:16, 16:9, 3:4)
- 📥 Export to PNG, JPG, PDF
- 🌐 Hebrew-first interface

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API (gemini-2.5-flash + imagen-3.0)
- Vercel Serverless Functions

## Deployment

1. Fork/clone this repository
2. Connect to Vercel
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy!

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` with:
```
GEMINI_API_KEY=your_api_key_here
```

## License

MIT
