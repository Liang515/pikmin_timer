[English Version](./README.en.md) | [繁體中文版](./README.md)

# 🍄 Pikmin Offline Mushroom Timer

Welcome to **Pikmin Offline Mushroom Timer**! This is an **ultra-lightweight, privacy-first, and fully local-storage based mushroom countdown tracker** designed specifically for solo players of *Pikmin Bloom*.

This project uses a pure frontend Next.js architecture. All mushroom battle logs and area names are stored entirely in your browser's local storage (`localStorage`). No registration, no cloud database configuration needed. Ready to use, extremely battery-friendly, and 100% guarantee for your location and battle data privacy!

---

## ✨ Core Features & Highlights

### 👤 Offline-First
- **100% Local Data**: All data is stored in your personal browser cache. Even in subways, mountain areas, or other places with weak or no internet connection, you can still open and record times smoothly.
- **Instant Loading**: Zero external API requests. The home page loads in milliseconds, providing a lightning-fast experience just like a native app.

### 🏷️ Zero-Popup Inline Area/Tab Management
- **Quick Area Classification**: Create different area tabs for your daily mushroom routes (e.g., Home, Office, Park, Metro Station).
- **Minimalist Inline Editing**:
  - Click `+ Area` to create a tab by typing its name directly inline.
  - **Double-click a tab button** to modify the area name directly inline.
  - Click the trash icon to directly delete the area and all its mushrooms, with no annoying popups throughout the process.
- **Tab Bottom Edges Alignment Fix**: Completely resolved the layout defect where unselected tabs had their bottom edges clipped. The bottom edge of the tab bar renders fully whether hovering on desktop or tapping on mobile.
- **Adaptive Expandable Grid**: An arrow-down button on the right expands a "Quick Area Selector" grid, displaying the count of tracked mushrooms in each area in real-time. Tapping any area switches to it instantly!

### 📱 Premium Mobile Optimization (iOS Auto-Zoom Fix)
- **Viewport Lock**: Locks the viewport scale so that the page width never wobbles or shakes when pinch-zooming or tapping inputs.
- **iOS Focus Zoom Preventative Style**: Upgraded the font size of all text input boxes (area names, modifying mushroom names) to `16px (text-base)`. **Completely eliminates the classic iOS Safari / Chrome bug where tapping an input automatically zooms in on the webpage, forcing you to manually zoom out after the keyboard collapses!**
- **Bottom Anti-Occlusion Safe Padding**: Automatically renders safe padding space at the bottom of the mushroom list, resolving the click conflict where the bottom-most mushroom card was blocked by the floating action button (FAB).

### 🎨 Stunning Premium Pikmin Aesthetics
- **Sunset Golden Pink Gradient**: The 5-minute respawn state after a battle ends features a warm and bright sunset gradient (`from-[#f8a532] to-[#e75a24]`).
- **Gentle Sprout Sage Green**: The active battle state uses a soft sage green (`from-[#809b7b] to-[#5d7c58]`), which is eye-friendly and matches the nature-inspired atmosphere of Pikmin Bloom.
- **Elegant Glassmorphism Cards**: Completed mushroom cards that have finished respawning transition into a sophisticated, semi-transparent white glassmorphism design (`bg-white/70 backdrop-blur-md`), removing any distracting breathing animations for a calm visual experience.
- **Precise Time Input Fix**: Solved the React controlled component bug where entering `0` or leading zeros (like `05` minutes) in numerical time input fields would cause them to disappear. Now the time entry experience is perfectly smooth.

---

## 🚀 Deploying to Vercel (100% Free)

This project is completely compatible with Vercel's free Next.js static deployment service. You can easily deploy it using either of the following methods to add it to your phone's home screen:

### Method 1: Deploy in One Minute via Vercel CLI (No GitHub required)
1. Run the following command in the project directory:
   ```bash
   npx vercel
   ```
2. Follow the on-screen prompts and press **Enter** to accept all default values to complete the deployment!

### Method 2: Deploy automatically via GitHub (Recommended, CI/CD)
1. Push this project to your personal GitHub repository.
2. Go to the [Vercel Website](https://vercel.com/) and import your GitHub repository.
3. Click **Deploy** to finish! From now on, whenever you `git push` updates, your website will automatically update in the background.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start testing.

Happy mushroom battling! 🍄⚔️
