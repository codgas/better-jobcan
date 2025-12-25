# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create icons** (required for extension):

   You need to create three icon files in the project root:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

   You can:
   - Use any image editor to create simple icons
   - Use online tools like [Favicon Generator](https://favicon.io/)
   - Create simple colored squares with text for testing
   - See `create-icons.md` for ImageMagick commands

3. **Build the extension:**
   ```bash
   npm run build
   ```

   This creates the `dist` folder with all necessary files.

4. **Load in browser:**

   **Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

   **Edge:**
   - Go to `edge://extensions/`
   - Enable "Developer mode" (bottom left)
   - Click "Load unpacked"
   - Select the `dist` folder

5. **Test:**
   - Navigate to `https://ssl.jobcan.jp/employee/attendance`
   - You should see the Better JOBCAN metrics overlay at the top of the page

## Development

- `npm run dev` - Build in watch mode (rebuilds on file changes)
- `npm run type-check` - Check TypeScript types without building

## Troubleshooting

- **Extension not loading:** Make sure you selected the `dist` folder, not the project root
- **No overlay showing:** Check browser console (F12) for errors. Make sure you're on the attendance page
- **Data not showing:** The extension extracts data from the table. If the page structure changed, the selectors may need updating

