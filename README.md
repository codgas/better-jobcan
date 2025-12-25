[English](README.md) | [日本語](README.ja.md)

# Better JOBCAN - Enhanced Attendance Helper

An enhanced browser extension for JOBCAN attendance tracking that displays useful work metrics including overwork time, remaining hours for the day, start time, working days remaining, and monthly quota progress.

<img src="assets/screenshot.png" alt="Better JOBCAN Status Panel" width="350" align="right" />

> **⚠️ Status**: This project is still under development. Features may change and bugs may exist.
> **Note**: This project is inspired by [jobkan-helper](https://github.com/exoego/jobkan-helper) by exoego.

## Features

- 📊 **Overwork Time**: Shows total off-shift working hours
- ⏰ **Hours Remaining Today**: Calculates how many hours you still need to work today based on your shift
- 🕐 **Start Time Today**: Displays when you clocked in today
- 📅 **Working Days Remaining**: Counts remaining working days in the current month
- 🎯 **Monthly Quota Progress**: Shows progress towards monthly working hours quota
- 💡 **Real-time Updates**: Automatically updates every minute
- 🌐 **Language Toggle**: Switch between English and Japanese interface

## Installation

### Step 1: Build the Extension

1. Clone this repository:

```bash
git clone <repository-url>
cd better-jobcan
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

The built extension will be in the `dist` folder.

### Step 2: Load in Browser

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **"Developer mode"** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `dist` folder from this project

## Updating

After pulling the latest changes from GitHub:

1. Pull the latest changes:

```bash
git pull
```

2. Rebuild the extension:

```bash
npm run build
```

3. Go to `chrome://extensions/` (or `edge://extensions/`)
4. Find the Better JOBCAN extension and click the **reload button** (↻) near the extension icon

<img src="assets/reload-extension.png" alt="Click reload button to update extension" width="400" />

## Usage

1. Navigate to `https://ssl.jobcan.jp/employee/attendance`
2. The extension will automatically display a metrics panel on the **right side** of the page
3. The panel shows:
   - **Overwork Today**: Total overwork hours for today (displayed in white)
   - **Total Overwork This Month**: Cumulative overwork hours (displayed in yellow if positive)
   - **Hours Remaining Today**: Hours still needed to complete your shift (displayed in red if still needed, green if complete)
   - **Start Time Today**: When you clocked in today
   - **Working Days Remaining**: Number of working days left in the current month
   - **Hours Remaining for Monthly Quota**: Hours needed to meet monthly quota (displayed in red if still needed)
   - **Monthly Progress**: Visual progress bar showing current month total vs monthly quota (e.g., "158:02 / 168:00")

4. **Language Toggle**: Use the language selector in the panel header to switch between English and Japanese interface

**Note**: The extension only works on `https://ssl.jobcan.jp/employee/attendance`. The panel updates automatically every minute while on the page. Click the × button in the top-right corner to close the panel.

## Contributing

If you'd like to contribute to this project:

1. Fork the repository
2. Install dependencies: `npm install`
3. Make your changes in the `src/` directory
4. For development with auto-reload:

   ```bash
   npm run dev
   ```

   This builds in watch mode - reload the JOBCAN page after making changes.

5. Type check your code:

   ```bash
   npm run type-check
   ```

6. Build for production:

   ```bash
   npm run build
   ```

7. Submit a pull request

### Project Structure

```text
├── src/
│   ├── content.ts          # Main content script
│   ├── data-extractor.ts   # Extracts data from JOBCAN page
│   ├── utils.ts            # Calculation utilities
│   ├── ui.ts               # UI overlay component
│   ├── types.ts            # TypeScript type definitions
│   └── styles.css          # Styles for the overlay
├── dist/                   # Built extension (generated)
├── manifest.json           # Extension manifest
├── webpack.config.js       # Webpack configuration
├── tsconfig.json           # TypeScript configuration
└── package.json           # Dependencies
```

## License

MIT
