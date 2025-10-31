// DOM Elements (updated for resume tailor)
const elements = {
  // model status card
  modelStatus: document.getElementById("modelStatus"),
  modelStatusIcon: document.getElementById("modelStatusIcon"),
  modelStatusText: document.getElementById("modelStatusText"),
  modelStatusDetail: document.getElementById("modelStatusDetail"),
  modelProgressBar: document.getElementById("modelProgressBar"),
  modelProgressFill: document.getElementById("modelProgressFill"),
  refreshModelStatus: document.getElementById("refreshModelStatus"),
  // inputs
  jdInput: document.getElementById("jdInput"),
  captureJD: document.getElementById("captureJD"),
  resumeInput: document.getElementById("resumeInput"),
  uploadPdf: document.getElementById("uploadPdf"),
  toneSelect: document.getElementById("toneSelect"),
  bulletsLength: document.getElementById("bulletsLength"),
  letterLength: document.getElementById("letterLength"),
  preferMetrics: document.getElementById("preferMetrics"),
  // progress/errors
  progressContainer: document.getElementById("progressContainer"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  errorContainer: document.getElementById("errorContainer"),
  errorText: document.getElementById("errorText"),
  // outputs
  bulletsContainer: document.getElementById("bulletsContainer"),
  bulletsOutput: document.getElementById("bulletsOutput"),
  copyBullets: document.getElementById("copyBullets"),
  letterContainer: document.getElementById("letterContainer"),
  letterOutput: document.getElementById("letterOutput"),
  copyLetter: document.getElementById("copyLetter"),
  // actions
  tailorNow: document.getElementById("tailorNow"),
  regenBullets: document.getElementById("regenBullets"),
  regenLetter: document.getElementById("regenLetter"),
  // versions
  saveVersion: document.getElementById("saveVersion"),
  refreshVersions: document.getElementById("refreshVersions"),
  versionsList: document.getElementById("versionsList"),
};

let summarizer = null; // for JD key-points extraction
let writer = null; // for new content generation
let rewriter = null; // for rewriting existing bullets
let proofreader = null; // for grammar cleanup
let lastJdSummary = ""; // cache JD key points

// Initialize the extension
async function initialize() {
  try {
    console.log("=== Resume Tailor Initialization ===");
    console.log("Chrome version:", navigator.userAgent);

    // Check Summarizer availability and update model status
    await checkSummarizerAvailability();

    // Load saved preferences and versions
    await loadPreferences();
    await renderVersions();
  } catch (error) {
    console.error("Initialization error:", error);
    console.error("Error stack:", error.stack);
    showError(`Initialization failed: ${error.message}`);
    setActionsDisabled(true);
  }
}

// Check Summarizer availability
async function checkSummarizerAvailability() {
  if ("Summarizer" in self) {
    try {
      const availability = await self.Summarizer.availability({
        outputLanguage: "en",
      });
      console.log("Summarizer availability:", availability);
      updateModelStatus(availability);
    } catch (e) {
      console.warn("Summarizer availability check failed:", e);
      updateModelStatus("no");
    }
  } else {
    console.warn("Summarizer API not supported");
    updateModelStatus("no");
  }
}

// Update model download status
function updateModelStatus(status, progress = null) {
  if (!elements.modelStatus) return;

  elements.modelStatus.style.display = "block";
  elements.modelStatus.className = "model-status-box";

  switch (status) {
    case "readily":
      elements.modelStatus.classList.add("ready");
      if (elements.modelStatusIcon) elements.modelStatusIcon.textContent = "✅";
      if (elements.modelStatusText)
        elements.modelStatusText.textContent = "Model Ready";
      if (elements.modelStatusDetail)
        elements.modelStatusDetail.textContent =
          "Gemini Nano is downloaded and ready to use.";
      if (elements.modelProgressBar)
        elements.modelProgressBar.style.display = "none";
      break;

    case "downloading":
      elements.modelStatus.classList.add("downloading");
      if (elements.modelStatusIcon) elements.modelStatusIcon.textContent = "⬇️";
      if (elements.modelStatusText)
        elements.modelStatusText.textContent = "Downloading Model";
      if (elements.modelProgressBar)
        elements.modelProgressBar.style.display = "block";
      if (progress !== null) {
        const percent = Math.round(progress * 100);
        if (elements.modelProgressFill)
          elements.modelProgressFill.style.width = `${percent}%`;
        if (elements.modelStatusDetail)
          elements.modelStatusDetail.textContent = `Downloading Gemini Nano model: ${percent}%... This may take several minutes (~22GB).`;
      } else {
        if (elements.modelStatusDetail)
          elements.modelStatusDetail.textContent =
            "Model download in progress... This may take several minutes (~22GB).";
      }
      break;

    case "downloadable":
    case "after-download":
      elements.modelStatus.classList.add("needed");
      if (elements.modelStatusIcon) elements.modelStatusIcon.textContent = "📦";
      if (elements.modelStatusText)
        elements.modelStatusText.textContent = "Model Download Required";
      if (elements.modelStatusDetail)
        elements.modelStatusDetail.textContent =
          "The Gemini Nano model (~22GB) will download automatically when you first use the summarizer. Ensure you have sufficient storage and an unmetered connection.";
      if (elements.modelProgressBar)
        elements.modelProgressBar.style.display = "none";
      break;

    case "unavailable":
    case "no":
      elements.modelStatus.classList.add("error");
      if (elements.modelStatusIcon) elements.modelStatusIcon.textContent = "❌";
      if (elements.modelStatusText)
        elements.modelStatusText.textContent = "Model Unavailable";
      if (elements.modelStatusDetail)
        elements.modelStatusDetail.textContent =
          "Gemini Nano is not available on this device. Check system requirements: 22GB+ storage, GPU with 4GB+ VRAM (or 16GB+ RAM with 4+ CPU cores).";
      if (elements.modelProgressBar)
        elements.modelProgressBar.style.display = "none";
      break;

    default:
      if (elements.modelStatusIcon) elements.modelStatusIcon.textContent = "ℹ️";
      if (elements.modelStatusText)
        elements.modelStatusText.textContent = "Model Status Unknown";
      if (elements.modelStatusDetail)
        elements.modelStatusDetail.textContent = `Current status: ${status}`;
      if (elements.modelProgressBar)
        elements.modelProgressBar.style.display = "none";
  }
}

// Hide model status
function hideModelStatus() {
  if (elements.modelStatus) elements.modelStatus.style.display = "none";
}

// Load user preferences from storage
async function loadPreferences() {
  try {
    const result = await chrome.storage.local.get([
      "toneSelect",
      "bulletsLength",
      "letterLength",
      "preferMetrics",
    ]);
    if (result.toneSelect && elements.toneSelect)
      elements.toneSelect.value = result.toneSelect;
    if (result.bulletsLength && elements.bulletsLength)
      elements.bulletsLength.value = result.bulletsLength;
    if (result.letterLength && elements.letterLength)
      elements.letterLength.value = result.letterLength;
    if (typeof result.preferMetrics === "boolean" && elements.preferMetrics)
      elements.preferMetrics.checked = result.preferMetrics;
  } catch (error) {
    console.error("Failed to load preferences:", error);
  }
}

// Save user preferences
async function savePreferences() {
  try {
    const prefs = {};
    if (elements.toneSelect) prefs.toneSelect = elements.toneSelect.value;
    if (elements.bulletsLength)
      prefs.bulletsLength = elements.bulletsLength.value;
    if (elements.letterLength) prefs.letterLength = elements.letterLength.value;
    if (elements.preferMetrics)
      prefs.preferMetrics = elements.preferMetrics.checked;
    await chrome.storage.local.set(prefs);
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

// Create summarizer for JD key-points extraction
async function createSummarizer() {
  try {
    console.log("Creating summarizer...");
    showProgress("Creating summarizer...");

    const createOptions = {
      type: "key-points",
      length: "medium",
      format: "markdown",
      outputLanguage: "en", // Required: specify output language for safety attestation
      monitor(m) {
        try {
          m.addEventListener("downloadprogress", (e) => {
            const pct = Math.round((e.loaded || 0) * 100);
            console.log(`Model download progress: ${pct}%`);

            // Update both progress indicators
            elements.progressContainer.style.display = "block";
            elements.progressBar.style.width = `${pct}%`;
            elements.progressText.textContent = `Downloading model: ${pct}%`;

            // Update model status box
            updateModelStatus("downloading", e.loaded);
          });
        } catch (err) {
          console.warn("Monitor setup failed:", err);
        }
      },
    };

    console.log("Creating summarizer with options:", createOptions);

    // Provide monitor to reflect download progress in UI
    summarizer = await self.Summarizer.create(createOptions);
    console.log("Summarizer created successfully!");

    // Update model status to ready after successful creation
    updateModelStatus("readily");

    return summarizer;
  } catch (error) {
    console.error("Failed to create summarizer:", error);
    console.error("Error details:", error.stack);
    throw error;
  }
}

// Extract JD key points (used as sharedContext for tailoring)
async function extractJobKeyPoints(jdText) {
  if (!("Summarizer" in self)) {
    throw new Error("Summarizer API not available. Check flags/version.");
  }

  // Check availability - this call doesn't need user gesture
  const availability = await self.Summarizer.availability({
    outputLanguage: "en",
  });

  // If model isn't ready, throw clear error
  if (availability === "no") {
    throw new Error(
      "Summarizer is not available on this device. Check Chrome version and flags."
    );
  }

  // Only create session if we have user gesture AND model is ready
  // Note: .create() requires user gesture when availability is "downloadable" or "downloading"
  if (!summarizer) {
    if (availability === "readily" || availability === "after-download") {
      await createSummarizer();
    } else {
      // Model needs download - the create() call will trigger it
      await createSummarizer();
    }
  }

  const clean = (jdText || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length < 50) {
    throw new Error("Job description is too short. Paste more details.");
  }
  const summary = await summarizer.summarize(clean, {
    context:
      "Extract the key technical skills, required technologies, frameworks, and specific responsibilities from this job description. Focus on actionable requirements and technical competencies, not general descriptions or company overviews. List each as a concise bullet point.",
  });
  return summary; // markdown bullet list expected
}

// Tone & length mapping helpers
function mapToneToWriter(tone) {
  switch ((tone || "").toLowerCase()) {
    case "professional":
      return "formal";
    case "friendly":
      return "casual";
    case "neutral":
      return "neutral";
    case "confident":
      return "neutral"; // add confidence via context
    default:
      return "neutral";
  }
}

function mapToneToRewriter(tone) {
  switch ((tone || "").toLowerCase()) {
    case "professional":
      return "more-formal";
    case "friendly":
      return "more-casual";
    case "neutral":
      return "as-is";
    case "confident":
      return "as-is";
    default:
      return "as-is";
  }
}

function mapBulletsLengthToRewriter(len) {
  switch ((len || "").toLowerCase()) {
    case "short":
      return "shorter";
    case "medium":
      return "as-is";
    case "long":
      return "longer";
    default:
      return "as-is";
  }
}

function clampLetterWordCount(len) {
  return len === "short" ? 180 : 280;
}

// Create Writer session
async function createWriter() {
  if (!("Writer" in self))
    throw new Error("Writer API not available (origin trial/flags).");

  // Check availability first - must check before attempting create()
  const availability = await self.Writer.availability({
    outputLanguage: "en",
  });

  if (availability === "no") {
    throw new Error("Writer API is not available on this device.");
  }

  // If model needs download, throw clear error (requires user gesture)
  if (availability === "downloadable" || availability === "downloading") {
    throw new Error(
      `Writer model is ${availability}. Click "Tailor Now" again to initiate download.`
    );
  }

  const tone = mapToneToWriter(elements.toneSelect.value);
  const length = elements.letterLength.value || "medium";
  writer = await self.Writer.create({
    tone,
    length,
    format: "plain-text",
    outputLanguage: "en",
    expectedInputLanguages: ["en"],
    expectedContextLanguages: ["en"],
    monitor(m) {
      try {
        m.addEventListener("downloadprogress", (e) =>
          console.log(`[Writer] ${Math.round((e.loaded || 0) * 100)}%`)
        );
      } catch {}
    },
  });
  return writer;
}

// Create Rewriter session
async function createRewriter(sharedContext) {
  if (!("Rewriter" in self))
    throw new Error("Rewriter API not available (origin trial/flags).");

  // Check availability first - must check before attempting create()
  const availability = await self.Rewriter.availability({
    outputLanguage: "en",
  });

  if (availability === "no") {
    throw new Error("Rewriter API is not available on this device.");
  }

  // If model needs download, throw clear error (requires user gesture)
  if (availability === "downloadable" || availability === "downloading") {
    throw new Error(
      `Rewriter model is ${availability}. Click "Tailor Now" again to initiate download.`
    );
  }

  const tone = mapToneToRewriter(elements.toneSelect.value);
  const length = mapBulletsLengthToRewriter(elements.bulletsLength.value);
  rewriter = await self.Rewriter.create({
    sharedContext: sharedContext || "",
    tone,
    length,
    format: "plain-text",
    outputLanguage: "en",
    expectedInputLanguages: ["en"],
    expectedContextLanguages: ["en"],
    monitor(m) {
      try {
        m.addEventListener("downloadprogress", (e) =>
          console.log(`[Rewriter] ${Math.round((e.loaded || 0) * 100)}%`)
        );
      } catch {}
    },
  });
  return rewriter;
}

// Create Proofreader session
async function createProofreader() {
  if (!("Proofreader" in self))
    throw new Error("Proofreader API not available (origin trial/flags).");

  // Check availability first (Proofreader doesn't have availability() method in some versions)
  // Just try to create and handle errors gracefully

  proofreader = await self.Proofreader.create({
    expectedInputLanguages: ["en"],
    monitor(m) {
      try {
        m.addEventListener("downloadprogress", (e) =>
          console.log(`[Proofreader] ${Math.round((e.loaded || 0) * 100)}%`)
        );
      } catch {}
    },
  });
  return proofreader;
}

function splitLines(text) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Filter out obvious headers and contact info
  return lines.filter((l) => {
    if (l.length < 20) return false;
    if (
      /^(education|experience|skills|projects|contact|summary|objective)/i.test(
        l
      )
    )
      return false;
    if (/@|http|linkedin|github|portfolio|tel:|phone:/i.test(l)) return false;
    if (/^\d{4}.*\d{4}$/.test(l)) return false; // Date ranges
    if (/^[A-Z][a-z]+\s+\d{4}/.test(l)) return false; // "August 2021"
    if (/^[\+\d\(\)\-\s]{10,}$/.test(l)) return false; // Phone numbers
    return true;
  });
}

function normalizeBullets(text) {
  const lines = (text || "")
    .replace(/\r/g, "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = [];
  for (const l of lines) {
    if (bullets.length >= 10) break;

    // Skip very short or header-like lines
    if (l.length < 15) continue;

    // Remove bullet markers
    const clean = l
      .replace(/^[\u2022\-\*\+•·∙◦▪▫\d]+[\.\)]\s*/, "")
      .replace(/^[\u2022\-\*\+•·∙◦▪▫]+\s*/, "")
      .trim();

    if (clean.length >= 15) {
      bullets.push(clean);
    }
  }
  return bullets;
}
async function proofreadLines(lines) {
  if (!lines.length) return lines;
  if (!("Proofreader" in self)) return lines;
  try {
    if (!proofreader) await createProofreader();
    const corrected = [];
    for (const l of lines) {
      try {
        const res = await proofreader.proofread(l);
        corrected.push(res?.corrected || l);
      } catch {
        corrected.push(l);
      }
    }
    return corrected;
  } catch {
    return lines;
  }
}

async function tailorResumeBullets(jdSummary, resumeText, preferMetrics) {
  const targetCount = 5;
  const bullets = [];

  console.log("Tailoring resume bullets (simple mode - no AI generation)");

  // If resume text provided, extract bullets from it
  if (resumeText && resumeText.trim()) {
    const lines = splitLines(resumeText);
    console.log(`Found ${lines.length} lines from resume`);

    for (const line of lines) {
      if (bullets.length >= targetCount) break;
      if (line.length >= 30 && !/@|http|linkedin|github/.test(line)) {
        bullets.push(line);
      }
    }
  }

  // Fill remaining with JD requirements converted to achievement format
  if (bullets.length < targetCount) {
    console.log(
      `Need ${targetCount - bullets.length} more bullets, extracting from JD`
    );
    const jdBullets = normalizeBullets(jdSummary);

    for (const jdBullet of jdBullets) {
      if (bullets.length >= targetCount) break;

      // Skip if bullet looks like a description or overview (not a skill/requirement)
      if (
        /^(we are|this role|the role|you will|position|overview|responsibilities)/i.test(
          jdBullet
        )
      ) {
        continue;
      }

      // Convert requirement to past-tense achievement
      let achievement = jdBullet
        .replace(/^experience (with|in)/i, "Delivered projects using")
        .replace(
          /^hands-on experience with/i,
          "Built interactive features using"
        )
        .replace(/^proficiency in/i, "Leveraged")
        .replace(/^strong command of/i, "Applied expertise in")
        .replace(/^knowledge of/i, "Utilized")
        .replace(/^familiarity with/i, "Worked with")
        .replace(/^understanding of/i, "Applied concepts of")
        .replace(/^working knowledge of/i, "Implemented solutions using")
        .replace(/^(must have|should have|required):/i, "Demonstrated:")
        .replace(
          /\b(is required|are required|is preferred|are preferred|is a plus|is an advantage)\b/gi,
          ""
        )
        .replace(/\s+/g, " ")
        .trim();

      // Only add action verb if the sentence doesn't already start with one
      const hasActionVerb =
        /^(Led|Developed|Managed|Created|Built|Designed|Implemented|Optimized|Delivered|Applied|Utilized|Leveraged|Worked|Integrated|Maintained|Debugged|Collaborated|Ensured|Deployed|Profiled)/i.test(
          achievement
        );

      if (!hasActionVerb && achievement.length >= 20) {
        // Check if it's a technology list or skill description
        if (
          /^[A-Z][a-z]+(\s+(and|or|\/)\s+[A-Z]|\s*[,\/])/i.test(achievement)
        ) {
          // Technology list: prefix with appropriate verb
          achievement = "Developed solutions using " + achievement;
        } else {
          // Generic skill: add contextual verb
          achievement = "Applied " + achievement;
        }
      }

      if (achievement.length >= 20 && achievement.length <= 200) {
        bullets.push(achievement);
      }
    }
  }

  // Last resort: generic bullets
  if (bullets.length === 0) {
    bullets.push("Analyzed job requirements and prepared tailored application");
    bullets.push("Demonstrated relevant technical skills for the position");
    bullets.push("Reviewed and aligned qualifications with role requirements");
  }

  return bullets.slice(0, targetCount);
}

// Handle PDF upload and text extraction
async function handlePdfUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    showError("Please select a valid PDF file.");
    return;
  }

  showProgress("Reading PDF...");
  setActionsDisabled(true);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);

    // Dynamically import pdf.js
    const pdfjsLib = await import(chrome.runtime.getURL("lib/pdf.mjs"));

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      chrome.runtime.getURL("lib/pdf.worker.mjs");

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items with spaces
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ")
        .trim();

      if (pageText) {
        fullText += pageText + "\n\n";
      }
    }

    // Clean up the extracted text
    const cleanedText = fullText
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive newlines
      .trim();

    if (cleanedText.length < 50) {
      throw new Error(
        "PDF appears to be empty or text could not be extracted."
      );
    }

    // Populate the resume input
    if (elements.resumeInput) {
      elements.resumeInput.value = cleanedText;
      console.log(`✓ Extracted ${cleanedText.length} characters from PDF`);
    }

    hideProgress();
    hideError();

    // Clear the file input so the same file can be selected again if needed
    event.target.value = "";
  } catch (error) {
    console.error("PDF parsing failed:", error);
    hideProgress();
    showError(`Failed to parse PDF: ${error.message}`);
  } finally {
    setActionsDisabled(false);
  }
}

async function draftCoverLetter(jdSummary, resumeText) {
  // Simple template-based cover letter
  const tone = elements.toneSelect.value || "professional";
  const toneGreeting =
    {
      professional: "Dear Hiring Manager,",
      confident: "Hello,",
      friendly: "Hi there,",
      neutral: "Dear Hiring Manager,",
    }[tone] || "Dear Hiring Manager,";

  const intro = `I am writing to express my strong interest in this position. After reviewing the job requirements, I am confident that my background aligns well with your needs.`;

  // Extract key requirements from JD
  const requirements = normalizeBullets(jdSummary).slice(0, 3);
  const body =
    requirements.length > 0
      ? `The role requires:\n${requirements
          .map((r) => `• ${r}`)
          .join(
            "\n"
          )}\n\nI bring relevant experience in these areas and am eager to contribute to your team's success.`
      : `I have carefully reviewed the job requirements and believe my skills and experience make me a strong candidate for this role.`;

  const closing = `Thank you for considering my application. I look forward to discussing how I can contribute to your organization.`;

  const signature = `Best regards,\n[Your Name]`;

  return `${toneGreeting}\n\n${intro}\n\n${body}\n\n${closing}\n\n${signature}`;
}

// Show/Hide UI elements
function showProgress(message) {
  if (elements.progressContainer)
    elements.progressContainer.style.display = "block";
  if (elements.progressText) elements.progressText.textContent = message;
  if (elements.progressBar) elements.progressBar.style.width = "50%";
}

function hideProgress() {
  if (elements.progressContainer)
    elements.progressContainer.style.display = "none";
  if (elements.progressBar) elements.progressBar.style.width = "0%";
}

function showBullets(text) {
  if (elements.bulletsContainer)
    elements.bulletsContainer.style.display = "block";
  if (elements.bulletsOutput) elements.bulletsOutput.textContent = text;
}

function clearBullets() {
  if (elements.bulletsContainer)
    elements.bulletsContainer.style.display = "none";
  if (elements.bulletsOutput) elements.bulletsOutput.textContent = "";
}

function showLetter(text) {
  if (elements.letterContainer)
    elements.letterContainer.style.display = "block";
  if (elements.letterOutput) elements.letterOutput.textContent = text;
}

function clearLetter() {
  if (elements.letterContainer) elements.letterContainer.style.display = "none";
  if (elements.letterOutput) elements.letterOutput.textContent = "";
}

function showError(message) {
  if (elements.errorContainer) elements.errorContainer.style.display = "block";
  if (elements.errorText) elements.errorText.textContent = message;
}

function hideError() {
  if (elements.errorContainer) elements.errorContainer.style.display = "none";
  if (elements.errorText) elements.errorText.textContent = "";
}

function showInfo(message) {
  // Could display an info message
  console.info(message);
}

function setActionsDisabled(disabled) {
  if (elements.tailorNow) elements.tailorNow.disabled = disabled;
  if (elements.regenBullets) elements.regenBullets.disabled = disabled;
  if (elements.regenLetter) elements.regenLetter.disabled = disabled;
}

// Tailor action: full pipeline
async function handleTailorNow() {
  hideError();
  clearBullets();
  clearLetter();
  setActionsDisabled(true);
  showProgress("Analyzing job description…");

  const jd = elements.jdInput.value || "";
  if (!jd.trim()) {
    hideProgress();
    setActionsDisabled(false);
    return showError(
      "Please paste a job description or capture it from the page."
    );
  }

  try {
    lastJdSummary = await extractJobKeyPoints(jd);
    showProgress("Tailoring resume bullets…");
    const bullets = await tailorResumeBullets(
      lastJdSummary,
      elements.resumeInput.value || "",
      elements.preferMetrics.checked
    );
    showBullets(bullets.map((b) => `• ${b}`).join("\n"));
    elements.regenBullets.disabled = false;

    showProgress("Drafting cover letter…");
    const letter = await draftCoverLetter(
      lastJdSummary,
      elements.resumeInput.value || ""
    );
    showLetter(letter);
    elements.regenLetter.disabled = false;

    hideProgress();
  } catch (e) {
    hideProgress();
    showError(`Failed to analyze JD: ${e.message}`);
  } finally {
    setActionsDisabled(false);
  }
}

// Versions
async function saveCurrentVersion() {
  try {
    const version = {
      ts: Date.now(),
      jd: elements.jdInput.value || "",
      resume: elements.resumeInput.value || "",
      tone: elements.toneSelect.value,
      bulletsLength: elements.bulletsLength.value,
      letterLength: elements.letterLength.value,
      preferMetrics: elements.preferMetrics.checked,
      bullets: elements.bulletsOutput.textContent || "",
      letter: elements.letterOutput.textContent || "",
    };
    const key = `versions`;
    const { versions = [] } = await chrome.storage.local.get([key]);
    versions.unshift(version);
    await chrome.storage.local.set({ [key]: versions.slice(0, 20) }); // keep last 20
    await renderVersions();
  } catch (e) {
    console.error("Save version failed", e);
  }
}

async function renderVersions() {
  const { versions = [] } = await chrome.storage.local.get(["versions"]);
  if (!versions.length) {
    elements.versionsList.textContent = "No versions saved yet.";
    return;
  }
  const lines = versions.map((v, i) => {
    const d = new Date(v.ts);
    return `${i + 1}. ${d.toLocaleString()} – tone: ${v.tone}, bullets: ${
      v.bulletsLength
    }, letter: ${v.letterLength}`;
  });
  elements.versionsList.textContent = lines.join("\n");
}

// Event Listeners
if (elements.captureJD) {
  elements.captureJD.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selectors = [
            "article",
            "main",
            "#jobDescriptionText",
            "[data-testid='jobDescriptionText']",
            "body",
          ];
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim().length > 200)
              return el.innerText;
          }
          return document.body.innerText;
        },
      });
      const text = results?.[0]?.result || "";
      elements.jdInput.value = text.trim();
    } catch (error) {
      console.error("Capture JD failed", error);
      showError(`Failed to capture from page: ${error.message}`);
    }
  });
}

if (elements.uploadPdf) {
  elements.uploadPdf.addEventListener("change", handlePdfUpload);
}

if (elements.tailorNow) {
  elements.tailorNow.addEventListener("click", handleTailorNow);
}

if (elements.copyBullets) {
  elements.copyBullets.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        elements.bulletsOutput.textContent || ""
      );
      const btn = elements.copyBullets;
      const t = btn.textContent;
      btn.textContent = "✓ Copied!";
      setTimeout(() => (btn.textContent = t), 1500);
    } catch (e) {
      console.error("Copy bullets failed", e);
    }
  });
}

if (elements.copyLetter) {
  elements.copyLetter.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        elements.letterOutput.textContent || ""
      );
      const btn = elements.copyLetter;
      const t = btn.textContent;
      btn.textContent = "✓ Copied!";
      setTimeout(() => (btn.textContent = t), 1500);
    } catch (e) {
      console.error("Copy letter failed", e);
    }
  });
}

// Regeneration handlers
if (elements.regenBullets) {
  elements.regenBullets.addEventListener("click", async () => {
    try {
      setActionsDisabled(true);
      showProgress("Regenerating bullets…");
      clearBullets();
      const jdSummary =
        lastJdSummary ||
        (await extractJobKeyPoints(elements.jdInput.value || ""));
      const bullets = await tailorResumeBullets(
        jdSummary,
        elements.resumeInput.value || "",
        elements.preferMetrics.checked
      );
      showBullets(bullets.map((b) => `• ${b}`).join("\n"));
    } catch (e) {
      showError(`Failed to regenerate bullets: ${e.message}`);
    } finally {
      hideProgress();
      setActionsDisabled(false);
    }
  });
}

if (elements.regenLetter) {
  elements.regenLetter.addEventListener("click", async () => {
    try {
      setActionsDisabled(true);
      showProgress("Regenerating letter…");
      clearLetter();
      const jdSummary =
        lastJdSummary ||
        (await extractJobKeyPoints(elements.jdInput.value || ""));
      const letter = await draftCoverLetter(
        jdSummary,
        elements.resumeInput.value || ""
      );
      showLetter(letter);
    } catch (e) {
      showError(`Failed to regenerate letter: ${e.message}`);
    } finally {
      hideProgress();
      setActionsDisabled(false);
    }
  });
}

// Save preferences when changed
if (elements.toneSelect) {
  elements.toneSelect.addEventListener("change", savePreferences);
}
if (elements.bulletsLength) {
  elements.bulletsLength.addEventListener("change", savePreferences);
}
if (elements.letterLength) {
  elements.letterLength.addEventListener("change", savePreferences);
}
if (elements.preferMetrics) {
  elements.preferMetrics.addEventListener("change", savePreferences);
}

// Refresh model status
if (elements.refreshModelStatus) {
  elements.refreshModelStatus.addEventListener("click", async () => {
    try {
      console.log("Refreshing model status...");
      await checkSummarizerAvailability();
    } catch (error) {
      console.error("Failed to refresh model status:", error);
      showError(`Failed to check model status: ${error.message}`);
    }
  });
}

if (elements.saveVersion) {
  elements.saveVersion.addEventListener("click", saveCurrentVersion);
}
if (elements.refreshVersions) {
  elements.refreshVersions.addEventListener("click", renderVersions);
}

// Cleanup on unload
window.addEventListener("unload", () => {
  if (summarizer) {
    try {
      summarizer.destroy();
    } catch (error) {
      console.error("Failed to destroy summarizer:", error);
    }
  }
  try {
    writer?.destroy?.();
  } catch {}
  try {
    rewriter?.destroy?.();
  } catch {}
  try {
    proofreader?.destroy?.();
  } catch {}
});

// Initialize the extension
initialize();
