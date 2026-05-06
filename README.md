# 🚀 AI Image Upscaler

[![CI](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github)](https://github.com/your-repo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-blue?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

<div align="center">
  <img src="https://img.shields.io/badge/AI%20Powered-✨-ff6b6b?style=for-the-badge&labelColor=333&logo=ai&logoColor=white" alt="AI Powered" />
  <br />
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&pause=1000&color=61dafb&center=true&vCenter=true&width=600&lines=Upload+your+image+and+watch+it+transform!;Powered+by+Real-ESRGAN+models;Fast,+high-quality+upscaling" alt="Typing Animation" />
</div>

## ✨ Features

- **AI-Powered Upscaling**: Utilizes advanced Real-ESRGAN models for high-quality image enhancement
- **Real-time Preview**: See your original image before processing
- **Instant Results**: Get upscaled images in seconds
- **Multiple Formats**: Supports JPEG, PNG, and WebP input formats
- **PNG Output**: Always delivers crisp PNG results
- **Responsive UI**: Beautiful, modern interface built with React and Tailwind CSS
- **TypeScript**: Fully typed for better development experience

<div align="center">
  <img src="https://user-images.githubusercontent.com/animations/example.gif" width="600" alt="Demo Animation" />
  <p><em>Watch the magic happen! Upload → Preview → Upscale → Download</em></p>
</div>

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Upscayl Binary** - AI upscaling engine

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-image-upscaler.git
   cd ai-image-upscaler
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:3000`

2. **Start the frontend dev server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` and start upscaling!

## 📖 Usage

1. **Upload an Image**: Click "Choose an image" and select a JPEG, PNG, or WebP file
2. **Preview**: See your selected image in the preview panel
3. **Upscale**: Click "Upscale image" to process your image
4. **Download**: Once complete, download your high-quality PNG result

<div align="center">
  <img src="https://img.shields.io/badge/Step%201-Upload-4CAF50?style=for-the-badge&logo=upload&logoColor=white" />
  <img src="https://img.shields.io/badge/Step%202-Preview-2196F3?style=for-the-badge&logo=eye&logoColor=white" />
  <img src="https://img.shields.io/badge/Step%203-Upscale-FF9800?style=for-the-badge&logo=zap&logoColor=white" />
  <img src="https://img.shields.io/badge/Step%204-Download-9C27B0?style=for-the-badge&logo=download&logoColor=white" />
</div>

## 🔧 API Reference

### POST /upscale

Upload an image for upscaling.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
- Content-Type: `image/png`
- Body: Upscaled PNG image

**Example:**
```bash
curl -X POST -F "image=@your-image.jpg" http://localhost:3000/upscale > upscaled.png
```

## 🏗️ Project Structure

```
ai-image-upscaler/
├── backend/
│   ├── bin/
│   │   └── upscayl-bin          # AI upscaling binary
│   ├── model/
│   │   ├── .bin/                # Model binaries
│   │   └── .param/              # Model parameters
│   ├── outputs/                 # Generated upscaled images
│   ├── public/                  # Static assets
│   ├── uploads/                 # Temporary uploads
│   ├── package.json
│   └── server.js                # Express server
├── client/
│   ├── src/
│   │   ├── App.tsx              # Main React component
│   │   ├── index.css            # Global styles
│   │   └── main.tsx             # App entry point
│   ├── package.json
│   ├── vite.config.ts           # Vite configuration
│   └── index.html               # HTML template
├── .gitignore
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Upscayl](https://github.com/upscayl/upscayl) - The amazing AI upscaling tool
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) - The underlying AI model
- [React](https://reactjs.org/) - For the awesome UI framework
- [Tailwind CSS](https://tailwindcss.com/) - For the beautiful styling

---

<div align="center">
  <p>Created by Promise Shedrack Powered by REAL-ESGRAN</p>
  <img src="https://img.shields.io/badge/Made%20with-React-61dafb?style=flat-square&logo=react" alt="Made with React" />
  <img src="https://img.shields.io/badge/Powered%20by-AI-ff6b6b?style=flat-square&logo=ai&logoColor=white" alt="Powered by AI" />
</div>
