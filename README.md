# Chayse Wright | Mechanical Engineering PhD Portfolio
### BYU Neuromechanics Research Group · Brain-Computer Interfaces (BCI)

A high-performance, modern portfolio website engineered specifically for an academic and industry R&D profile in Mechanical Engineering, Neuromechanics, and Brain-Computer Interfaces.

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Three.js** with an interactive 3D biomechatronic neural prosthesis digital twin.

---

## 🚀 Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to Cloudflare Pages (Free & Fast)

Cloudflare Pages provides unlimited free bandwidth, global Anycast edge CDN, free automatic SSL, and instant continuous deployment directly from your GitHub repository.

### Direct GitHub Integration (Recommended — 2 Minutes)

1. **Push this repo to your GitHub account (`ChayseWright`)**:
   ```bash
   git add .
   git commit -m "Initial commit: Chayse Wright MechE PhD Portfolio"
   git remote add origin https://github.com/ChayseWright/portfolio.git
   git branch -M main
   git push -u origin main
   ```

2. **Log into Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) and select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.

3. **Select your GitHub repository**:
   - Authorize Cloudflare to access your `ChayseWright/portfolio` repository.

4. **Configure Build Settings**:
   - **Project name**: `chayse-wright` (gives you `chayse-wright.pages.dev` for free!)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave default)

5. **Deploy**:
   - Click **Save and Deploy**. Cloudflare will build your site in ~30 seconds and provide an active, production HTTPS link!
   - Every time you run `git push`, Cloudflare Pages will automatically rebuild and deploy your updates.
   - You can also bind your own custom domain (e.g. `chaysonspackman.com` or `chayson.me`) for free under **Custom domains** in the Cloudflare Pages dashboard.

---

## ✏️ How to Customize Your Portfolio

All website data is centralized in **one single, clean configuration file**:
👉 [`src/data/portfolioData.ts`](./src/data/portfolioData.ts)

You can customize everything without touching UI code:
- **Personal Information**: Name, title, BYU lab affiliation, email, Google Scholar / LinkedIn / GitHub links.
- **Publications**: Add new journal articles or conference papers with title, authors, DOI, PDF link, abstract, and BibTeX.
- **Hardware & Software Projects**: Add experimental testbenches, CAD models, robotics specs, and links to source code.
- **Research Thrusts**: Update dissertation focus areas, scientific breakthroughs, methodologies, and quantitative metrics.
- **Skills Matrix**: Adjust toolchain proficiency percentages (SolidWorks, OpenSim, EEG/EMG, Python, C++, etc.).
- **Academic Timeline**: Update degrees, fellowships, research appointments, and teaching positions.
- **News**: Post paper acceptances, awards, and conference travel announcements.

---

## 🧩 Architectural Highlights

- **Interactive 3D Biomechatronic Twin**: Interactive Three.js model featuring real-time wireframe CAD toggling, exploded mechanical view, dynamic joint articulation, and live BCI telemetry.
- **Filterable Publications & BibTeX**: Instant live search and category filters (Journals, Conferences, Preprints) with one-click BibTeX copy modal.
- **Curriculum Vitae Modal**: Integrated, formatted academic CV with in-browser print / PDF export.
- **Single-Page Application SPA Routing**: Includes `public/_redirects` configured for Cloudflare Pages edge routing.
- **Zero-Error Production Build**: Strict TypeScript checks and optimized code-splitting chunks (`vendor`, `three`, `app`).

---

## 📄 License
MIT License. Feel free to use and adapt for your academic journey.
