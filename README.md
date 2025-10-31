# Jobweave - AI Resume & Cover Letter Tailor

A privacy-first Chrome extension that uses Chrome's built-in AI (Gemini Nano) to tailor your resume bullets and generate targeted cover letters based on job descriptions. All processing happens locally on your device - no data ever leaves your computer.

## ✨ Features

- **Job Description Analysis**

  - Paste or capture job descriptions from current page
  - AI extracts key requirements and technical skills
  - Identifies what employers are looking for

- **Resume Tailoring**

  - Generates 5 targeted resume bullets matching the job
  - Uses your existing experience or JD requirements
  - Converts requirements into achievement statements
  - Automatic action verb and metric suggestions

- **PDF Resume Upload** 📄

  - Upload your resume as PDF (100% client-side parsing)
  - Automatic text extraction using Mozilla's pdf.js
  - No server uploads - complete privacy
  - Works with standard text-based PDFs

- **Cover Letter Generation**

  - Creates targeted cover letters based on JD
  - Multiple tone options (Professional, Confident, Friendly, Neutral)
  - Customizable length (Short, Medium)
  - Template-based with JD requirements integration

- **Customization Options**

  - Tone control for cover letters
  - Bullet length preferences
  - Metric emphasis toggle
  - Persistent user preferences

- **Version Management**

  - Save multiple tailored versions
  - Track different applications
  - Quick refresh and review

- **Side Panel Support**

  - Full-featured side panel view
  - Larger input areas for easier editing
  - Works alongside your job hunting tabs

- **Privacy First**
  - 100% on-device processing
  - No data sent to servers
  - No tracking or analytics
  - Works offline after initial setup

## Requirements

### System Requirements

- **Chrome Version**: 138 or higher
- **Operating Systems**:
  - Windows 10/11
  - macOS 13+ (Ventura and onwards)
  - Linux
  - ChromeOS (Platform 16389.0.0+) on Chromebook Plus devices

### Hardware Requirements

- **Storage**: At least 22 GB of free space (for Gemini Nano model)
- **GPU**: More than 4 GB of VRAM (or 16GB+ RAM with 4+ CPU cores)
- **Network**: Unlimited data or unmetered connection (for initial model download)

### Enable Chrome AI Features

1. Open Chrome and go to `chrome://flags`
2. Search for and enable the following flags:
   - `#optimization-guide-on-device-model` - Enable
   - `#summarizer-api` - Enable (if available)
   - `#text-safety-classifier` - Enable (for safety checks)
3. Restart Chrome

**Note**: The Summarizer API is currently the only stable API used. Writer/Rewriter/Proofreader APIs are in origin trial and not required for core functionality.

## Installation

### Development Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory (the folder containing `manifest.json`)

### First Run

On first use, the extension will download the Gemini Nano model (~22GB). This is a one-time process and may take several minutes depending on your connection speed.

## Usage

### Quick Start Workflow

1. **Open the Extension**

   - Click the Jobweave icon in Chrome toolbar
   - Or open the side panel for more space

2. **Add Job Description**

   - Paste the job description into the first text area
   - OR click "Capture from current page" if viewing a job posting
   - The AI will analyze key requirements and skills

3. **Add Your Resume** (Optional)

   - Paste 3-10 bullets about your experience
   - OR click "Process Resume (PDF)" to upload your PDF resume
   - Text will be extracted automatically (client-side only)

4. **Customize Settings**

   - Choose tone (Professional, Confident, Friendly, Neutral)
   - Select bullet length (Short, Medium, Long)
   - Toggle metric preferences

5. **Generate**

   - Click "Tailor Now"
   - Get 5 tailored resume bullets
   - Get a targeted cover letter draft

6. **Use Results**
   - Click "Copy All Bullets" or "Copy Letter"
   - Click "Regenerate" for variations
   - Click "Save Version" to keep track of applications

### Side Panel Usage

1. Right-click the Jobweave icon → "Open Side Panel"
2. Work with larger input areas while browsing job postings
3. All features available in both popup and side panel

## Customization

The extension saves your preferences automatically:

- **Tone**: Professional, Confident, Friendly, or Neutral
- **Bullets Length**: Short, Medium, or Long
- **Cover Letter Length**: Short or Medium
- **Metric Preferences**: Emphasize numbers, percentages, and dollar amounts

Your preferences persist across sessions and apply to all future generations.

## Technical Details

### Architecture

- **Manifest Version**: 3
- **Version**: 1.3.0
- **Permissions**: activeTab, contextMenus, scripting, storage, sidePanel
- **APIs Used**:
  - Chrome's built-in Summarizer API (Gemini Nano) - Primary
  - Mozilla's pdf.js (v4.0.379) - For PDF parsing
- **Processing**: 100% client-side, no server communication

### Privacy & Security

- **Zero Data Collection**: No analytics, no tracking, no telemetry
- **Local Processing**: All AI operations run on your device
- **No Uploads**: Resume and JD data never leaves your browser
- **No External Servers**: Extension works completely offline after setup

### Files Structure

```
jobweave/
├── manifest.json       # Extension configuration
├── popup.html          # Popup UI
├── sidepanel.html      # Side panel UI
├── popup.js            # Main logic (shared by popup & sidepanel)
├── styles.css          # Styling
├── background.js       # Service worker (context menus, side panel)
├── content.js          # Content script for page capture
├── lib/
│   ├── pdf.mjs         # PDF.js library (576 KB)
│   └── pdf.worker.mjs  # PDF.js worker (1831 KB)
├── icons/              # Extension icons
├── download-pdfjs.ps1  # Script to download pdf.js library
└── docs/               # Documentation files
```

## Troubleshooting

### "Model Status Unknown" or "Model Unavailable"

- Ensure you're using Chrome 138 or higher
- Check that the required flags are enabled in `chrome://flags`
- Verify your system meets the hardware requirements (22GB storage, 4GB+ VRAM)
- Visit `chrome://on-device-internals` to check model status

### "Model needs to be downloaded"

- Click "Tailor Now" to initiate the download (requires user gesture)
- First download requires ~22GB storage and may take 10-30 minutes
- Ensure you have an unmetered (unlimited) internet connection
- Check download progress in the Model Status card

### "Failed to parse PDF"

- Only text-based PDFs are supported (not scanned images)
- Password-protected PDFs cannot be parsed
- Try exporting your resume as a fresh PDF
- Very complex layouts may have text extraction issues

### "No output language was specified" Warning

- This should be resolved in v1.3.0
- If you still see it, try reloading the extension
- Check that you're using the latest version

### Generation Produces Poor Results

- Ensure JD has at least 100 characters
- Provide resume bullets for better context
- Try different tone settings
- Click "Regenerate" for variations
- More detailed JDs produce better results

### Extension Won't Load

- Check that all files are present (especially `lib/pdf.mjs` and `lib/pdf.worker.mjs`)
- Run `download-pdfjs.ps1` if pdf.js files are missing
- Check Chrome DevTools console for errors
- Try reloading the extension from `chrome://extensions/`

## Resources

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai)
- [Summarizer API Guide](https://developer.chrome.com/docs/ai/summarizer-api)
- [Gemini Nano Information](https://developer.chrome.com/docs/ai/built-in)

## Current Features in Development

Potential enhancements for future versions:

- **AI Improvements**: Integration with Writer/Rewriter APIs when they reach stable
- **Smart Matching**: Score your resume against JD requirements
- **Multi-Resume Support**: Manage multiple resume versions
- **ATS Optimization**: Keyword density and formatting suggestions
- **Interview Prep**: Generate likely interview questions from JD
- **Application Tracking**: Track which versions sent to which companies
- **LinkedIn Integration**: Auto-format bullets for LinkedIn profile
- **Export Options**: PDF generation, Word format export
- **Batch Processing**: Tailor resume for multiple jobs at once
- **Custom Templates**: User-defined cover letter templates

## License

This project is provided as-is for educational and personal use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Important Notes

- **Privacy**: All processing happens on your device - no data sent to servers
- **Experimental API**: Requires Chrome's experimental AI features
- **AI Generated Content**: Results may vary - always review and edit output
- **Storage**: First use requires ~22GB for Gemini Nano model download
- **Review Content**: Always customize generated bullets and letters before sending
- **Regional Availability**: API availability may vary by region and device
- **Use Policy**: Review Google's [Generative AI Prohibited Uses Policy](https://policies.google.com/terms/generative-ai/use-policy)

## Privacy Commitment

**Your data never leaves your device:**

- Resume text stays in your browser
- Job descriptions processed locally
- No analytics or tracking
- No external API calls
- No data collection whatsoever

## Acknowledgments

Built with:

- Chrome's Built-in AI (Gemini Nano) - On-device language model
- Mozilla's pdf.js - Client-side PDF parsing
- Part of the Google Chrome Built-in AI initiative

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

**Open Source with Attribution**: Use, modify, and distribute freely for personal or commercial projects. Requires attribution and notice of changes.

---
