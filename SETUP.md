# 🧵 Jobweave - Setup Guide

## Quick Start

Follow these steps to get Jobweave running and start tailoring your resume:

### Step 1: Enable Chrome AI Features

1. Open Chrome and type `chrome://flags` in the address bar
2. Search for and enable these flags:

   - **Optimization Guide On Device Model** (`#optimization-guide-on-device-model`) - Set to "Enabled"
   - **Text Safety Classifier** (`#text-safety-classifier`) - Set to "Enabled"
   - **Summarizer API** (if available, search "summarizer") - Set to "Enabled"

3. Click "Relaunch" to restart Chrome

**Note**: The Summarizer API is the core requirement. Writer/Rewriter/Proofreader APIs are optional and in origin trial.

### Step 2: Verify Chrome Version

1. Go to `chrome://settings/help`
2. Ensure you have Chrome 138 or higher
3. If not, update Chrome to the latest version

### Step 3: Download PDF.js Library (Required for PDF Upload)

The extension needs the pdf.js library to parse PDF resumes:

1. Open PowerShell in the extension directory
2. Run: `.\download-pdfjs.ps1`
3. This downloads pdf.js (~2.4 MB) to the `lib/` folder
4. Required for the PDF resume upload feature

**Note**: If icons are missing, run the `create-icons.ps1` script in the `icons/` folder.

### Step 4: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `Resume Editor` directory (or wherever you cloned the repo)
5. Click "Select Folder"

You should see "Jobweave" appear in your extensions list with a 🧵 icon.

### Step 5: First Time Setup - Model Download

When you first use the extension:

1. Click the Jobweave (🧵) icon in Chrome's toolbar
2. The extension will check if Gemini Nano is available
3. You'll see one of these statuses:

   - **Model Ready** ✅ - You're good to go!
   - **Model Download Required** 📦 - Click "Tailor Now" to start download
   - **Model Unavailable** ❌ - Check system requirements

4. If download is needed:

   - Requires ~22GB of free storage
   - Takes 10-30 minutes (depends on internet speed)
   - Progress shown in the Model Status card
   - **Must use unmetered internet connection**

5. Monitor download at `chrome://on-device-internals`

**Important**:

- First "Tailor Now" click initiates download (user gesture required)
- Keep Chrome open during download
- Extension will work offline after model is downloaded

### Step 6: Test the Extension

**Basic Test:**

1. Click the Jobweave icon
2. Paste a job description (or click "Capture from current page" on a job posting)
3. Optionally: Upload a PDF resume or paste some bullets
4. Click "🎯 Tailor Now"
5. Wait for AI to generate tailored bullets and cover letter
6. Click copy buttons to use the results

**PDF Upload Test:**

1. Click "📄 Upload Resume (PDF)"
2. Select your resume PDF
3. Text should appear in the resume text area
4. Use it for tailoring

**Side Panel Test:**

1. Right-click the Jobweave icon → "Options" or use Chrome menu
2. Select "Open Side Panel"
3. Work with larger input areas while browsing jobs

## Troubleshooting

### "Model Status Unknown" or Stuck on "Checking..."

- Ensure Chrome flags are enabled (Step 1)
- Restart Chrome after enabling flags
- Check Chrome version is 138+
- Click "🔄 Refresh" button in Model Status card
- Some regions may not have API access yet

### "Model needs to be downloaded" Message

- This is **normal on first use**
- Ensure you have 22GB+ free storage
- Use unmetered (unlimited) internet connection
- Click "🎯 Tailor Now" to start download (requires user click)
- Check progress at `chrome://on-device-internals`
- Download may take 10-30 minutes

### "Failed to parse PDF"

- Only text-based PDFs supported (not scanned images)
- Remove password protection from PDF
- Try exporting resume as fresh PDF
- Check that `lib/pdf.mjs` and `lib/pdf.worker.mjs` exist
- Re-run `download-pdfjs.ps1` if files missing

### Extension Won't Load

- Verify all files are present, especially:
  - `manifest.json`
  - `popup.js`, `popup.html`, `sidepanel.html`
  - `lib/pdf.mjs` and `lib/pdf.worker.mjs`
- Check DevTools console for errors: `chrome://extensions/` → Details → Inspect views
- Try removing and re-loading the extension

### "No output language was specified" Warning

- Should be fixed in v1.3.0
- If persists, reload extension
- Check you're using latest version
- Warning doesn't affect functionality

### Generation Produces Poor Results

- Provide more detailed job description (100+ characters minimum)
- Add your resume bullets for better context
- Try different tone settings
- Click "Regenerate" for variations
- More context = better results

## Checking AI Model Status

Visit `chrome://on-device-internals` to see:

- Model download status and progress
- Available storage on your device
- Current Gemini Nano model version
- API capabilities and availability
- Detailed download logs

You can also check status within Jobweave:

- Model Status card shows current state
- Click 🔄 refresh button to update status
- Progress bar shows download percentage

## System Requirements Checklist

Before using, ensure you have:

- [ ] Chrome 138 or higher
- [ ] Supported OS (Windows 10/11, macOS 13+, Linux, or ChromeOS)
- [ ] 22+ GB free storage
- [ ] GPU with 4+ GB VRAM
- [ ] Unmetered internet connection (for download)
- [ ] Chrome AI flags enabled

## Usage Tips

### For Best Results:

- **Detailed JDs**: Paste complete job descriptions (100+ words)
- **Include Context**: Add your resume bullets for better tailoring
- **Iterate**: Use "Regenerate" buttons for variations
- **Review & Edit**: Always customize generated content before using
- **Save Versions**: Use "Save Version" to track different applications

### Feature Tips:

- **PDF Upload**: Works with standard text PDFs (not scanned images)
- **Page Capture**: Use on job posting pages to auto-extract JD
- **Side Panel**: Better for longer job descriptions and resumes
- **Tone Selection**: Professional for corporate, Friendly for startups
- **Metric Toggle**: Enable for tech/data roles, disable for creative roles

### Workflow Optimization:

1. Open side panel while browsing jobs
2. Capture JD from current page
3. Upload your master resume PDF once
4. Tailor for each application
5. Save versions with company names
6. Copy bullets to your application

## Development & Customization

### File Structure:

```
jobweave/
├── manifest.json          # Extension configuration (v1.3.0)
├── popup.html             # Popup interface
├── sidepanel.html         # Side panel interface
├── popup.js               # Shared logic for both UIs
├── styles.css             # All styling
├── background.js          # Service worker (context menus, side panel)
├── content.js             # Content script for page capture
├── lib/
│   ├── pdf.mjs            # PDF parsing library
│   └── pdf.worker.mjs     # PDF worker thread
├── icons/                 # Extension icons
│   └── create-icons.ps1   # Icon generation script
├── download-pdfjs.ps1     # PDF.js download script
└── docs/                  # Documentation files
```

### Modifying the Extension:

1. Edit files as needed (popup.js, styles.css, etc.)
2. Go to `chrome://extensions/`
3. Click the reload icon (↻) on Jobweave
4. Test your changes in popup or side panel
5. Check console for any errors

### Debugging:

- **Popup DevTools**: Right-click Jobweave icon → Inspect popup
- **Side Panel DevTools**: Open side panel, then right-click → Inspect
- **Background Logs**: `chrome://extensions/` → Details → Inspect views: service worker
- **Console Errors**: Show detailed API and parsing issues
- **Model Status**: Check `chrome://on-device-internals` for AI issues

### Key Files to Modify:

- `popup.js` - Main logic (line ~1050 lines)
- `styles.css` - UI styling and colors
- `popup.html` / `sidepanel.html` - UI structure
- `manifest.json` - Permissions and configuration

## Support & Resources

### Official Documentation:

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai)
- [Summarizer API Reference](https://developer.chrome.com/docs/ai/summarizer-api)
- [Built-in AI Guide](https://developer.chrome.com/docs/ai/built-in)
- [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)

### Libraries Used:

- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) - Client-side PDF parsing
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) - Gemini Nano

### Project Files:

- `README.md` - Full feature documentation
- `PDF_FEATURE.md` - PDF upload feature details
- `QUICKSTART.md` - Quick reference guide

## Next Steps

Once Jobweave is running, try:

1. **First Application**: Find a job posting, capture JD, upload resume, tailor
2. **Experiment with Tones**: Try different tones for different companies
3. **Save Versions**: Keep track of tailored applications
4. **Iterate**: Use regenerate buttons for variations
5. **Customize**: Edit generated content to match your voice
6. **Track Success**: Save versions with notes about applications

## Privacy & Security Notes

**Your data stays on your device:**

- ✅ No server uploads
- ✅ No analytics or tracking
- ✅ No external API calls
- ✅ Works completely offline after setup
- ✅ Resume and JD data never leaves Chrome

This is a true privacy-first tool. Your job search data is yours alone.

---

**Happy job hunting with Jobweave!** 🧵✨

_Weave your perfect resume for every opportunity_
