# Better JOBCAN - Enhanced Attendance Helper

An enhanced browser extension for JOBCAN attendance tracking that displays useful work metrics including overwork time, remaining hours for the day, start time, working days remaining, and monthly quota progress.

> **⚠️ Status**: This project is still under development. Features may change and bugs may exist.

> **Note**: This project is inspired by [jobkan-helper](https://github.com/exoego/jobkan-helper) by exoego.

## Features

- 📊 **Overwork Time**: Shows total off-shift working hours
- ⏰ **Hours Remaining Today**: Calculates how many hours you still need to work today based on your shift
- 🕐 **Start Time Today**: Displays when you clocked in today
- 📅 **Working Days Remaining**: Counts remaining working days in the current month
- 🎯 **Monthly Quota Progress**: Shows progress towards monthly working hours quota
- 💡 **Real-time Updates**: Automatically updates every minute

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

## Usage

1. Navigate to `https://ssl.jobcan.jp/employee/attendance`
2. The extension will automatically display a metrics overlay at the top of the page
3. The overlay shows:
   - Overwork time (in yellow if positive)
   - Hours remaining today (in red if still needed, green if complete)
   - Start time today
   - Working days remaining this month
   - Hours remaining for monthly quota
   - Monthly progress bar

**Note**: The extension only works on `https://ssl.jobcan.jp/employee/attendance`. The overlay updates automatically every minute while on the page. Click the × button to close the overlay.

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