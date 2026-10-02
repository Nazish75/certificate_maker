// ==========================================
// CERTIFICATEMAKER
// Supabase + Certificate Templates + PDF
// ==========================================

const SUPABASE_URL = "https://zaqkvjvljzjdfqyejvgu.supabase.co";
const SUPABASE_KEY = "sb_publishable_-8GJyHK4SHu7-Axz6h7gjg_HCco4QGL";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

const $ = (id) => document.getElementById(id);

const loginGate = $("loginGate");
const appShell = $("appShell");
const loginForm = $("loginForm");
const gateEmail = $("gateEmail");
const gatePassword = $("gatePassword");
const gateLoginBtn = $("gateLoginBtn");
const gateSignupBtn = $("gateSignupBtn");
const gateMessage = $("gateMessage");
const userEmail = $("userEmail");
const logoutBtn = $("logoutBtn");

const recipientInput = $("recipient");
const achievementInput = $("achievement");
const descriptionInput = $("description");
const dateInput = $("date");
const instructorInput = $("instructor");
const organizationInput = $("organization");

const certificate = $("certificate");
const previewRecipient = $("previewRecipient");
const previewAchievement = $("previewAchievement");
const previewDescription = $("previewDescription");
const previewDate = $("previewDate");
const previewInstructor = $("previewInstructor");
const previewOrganization = $("previewOrganization");

const saveBtn = $("saveBtn");
const downloadBtn = $("downloadBtn");
const newBtn = $("newBtn");
const savedList = $("savedList");
const creatorMessage = $("creatorMessage");

const templateNames = [
  "classic",
  "modern",
  "elegant",
  "minimal",
  "executive",
  "academic",
  "royal",
  "corporate"
];

let selectedTemplate = "classic";
let currentUser = null;

function setLoginMessage(text, success = false) {
  gateMessage.textContent = text;
  gateMessage.style.color = success ? "#087443" : "#b42318";
}

function setCreatorMessage(text, success = false) {
  creatorMessage.textContent = text;
  creatorMessage.style.color = success ? "#087443" : "#b42318";
}

function showLogin() {
  loginGate.style.display = "flex";
  appShell.style.display = "none";
}

function showApp(user) {
  currentUser = user;
  loginGate.style.display = "none";
  appShell.style.display = "block";
  userEmail.textContent = user.email || "";
  loadSavedCertificates();
}

function getData() {
  return {
    recipient: recipientInput.value.trim(),
    achievement: achievementInput.value.trim(),
    description: descriptionInput.value.trim(),
    date: dateInput.value || null,
    instructor: instructorInput.value.trim(),
    organization: organizationInput.value.trim(),
    template: selectedTemplate
  };
}

function updatePreview() {
  const data = getData();

  previewRecipient.textContent = data.recipient || "Recipient Name";
  previewAchievement.textContent = data.achievement || "Course Completion";
  previewDescription.textContent =
    data.description ||
    "Successfully completed the required course and demonstrated the required skills.";
  previewDate.textContent = data.date || "Date";
  previewInstructor.textContent = data.instructor || "Instructor";
  previewOrganization.textContent = data.organization || "Organization";

  certificate.classList.remove(...templateNames);
  certificate.classList.add(data.template);
}

function setTemplate(template) {
  if (!templateNames.includes(template)) template = "classic";

  selectedTemplate = template;

  document.querySelectorAll(".template-choice").forEach((button) => {
    const active = button.dataset.template === template;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  updatePreview();
}

async function loginUser() {
  const email = gateEmail.value.trim();
  const password = gatePassword.value;

  if (!email || !password) {
    setLoginMessage("Please enter email and password.");
    return;
  }

  gateLoginBtn.disabled = true;
  gateLoginBtn.textContent = "Logging in...";
  setLoginMessage("");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  gateLoginBtn.disabled = false;
  gateLoginBtn.textContent = "Login";

  if (error) {
    setLoginMessage(error.message);
    return;
  }

  setLoginMessage("Login successful!", true);

  // Keep the successful message visible briefly.
  await new Promise((resolve) => setTimeout(resolve, 900));

  showApp(data.user);
}

async function signupUser() {
  const email = gateEmail.value.trim();
  const password = gatePassword.value;

  if (!email || !password) {
    setLoginMessage("Please enter email and password.");
    return;
  }

  if (password.length < 6) {
    setLoginMessage("Password must be at least 6 characters.");
    return;
  }

  gateSignupBtn.disabled = true;
  gateSignupBtn.textContent = "Creating...";
  setLoginMessage("");

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  gateSignupBtn.disabled = false;
  gateSignupBtn.textContent = "Create Account";

  if (error) {
    setLoginMessage(error.message);
    return;
  }

  if (data.session && data.user) {
    setLoginMessage("Account created successfully!", true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    showApp(data.user);
  } else {
    setLoginMessage(
      "Account created. Please verify your email, then login.",
      true
    );
  }
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  showLogin();
}

async function getUser() {
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) return null;
  return user;
}

async function saveCertificate(showSuccess = true, uploadPdf = true) {
  const user = currentUser || await getUser();

  if (!user) {
    showLogin();
    setLoginMessage("Please login first.");
    return null;
  }

  const data = getData();

  if (!data.recipient) {
    setCreatorMessage("Please enter the recipient name.");
    recipientInput.focus();
    return null;
  }

  if (!data.achievement) {
    setCreatorMessage("Please enter the course or achievement.");
    achievementInput.focus();
    return null;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = uploadPdf ? "Saving..." : "Saving...";
  setCreatorMessage("");

  // First save certificate information so we have its database ID.
  const { data: saved, error } = await supabaseClient
    .from("certificates")
    .insert([{
      user_id: user.id,
      recipient: data.recipient,
      achievement: data.achievement,
      description: data.description,
      date: data.date,
      instructor: data.instructor,
      organization: data.organization,
      template: data.template,
      certificate_file_url: null
    }])
    .select()
    .single();

  if (error) {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Draft";
    console.error(error);
    setCreatorMessage("Save failed: " + error.message);
    return null;
  }

  // Create a real PDF and upload it to Supabase Storage.
  if (uploadPdf) {
    try {
      const pdfBlob = await createPdfBlob(certificate);

      const filePath = `${user.id}/${saved.id}.pdf`;

      const { error: uploadError } = await supabaseClient.storage
        .from("certificates")
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true
        });

      if (uploadError) {
        // Keep the certificate data, but tell the user the file upload failed.
        console.error(uploadError);
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Draft";
        setCreatorMessage(
          "Certificate data saved, but PDF upload failed: " +
          uploadError.message
        );
        await loadSavedCertificates();
        return saved;
      }

      const { data: publicData } = supabaseClient.storage
        .from("certificates")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabaseClient
        .from("certificates")
        .update({
          certificate_file_url: publicUrl
        })
        .eq("id", saved.id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error(updateError);
        setCreatorMessage(
          "Certificate saved, but its share link could not be saved: " +
          updateError.message
        );
      }
    } catch (pdfError) {
      console.error(pdfError);
      setCreatorMessage(
        "Certificate data saved, but PDF could not be created."
      );
    }
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "Save Draft";

  if (showSuccess && !creatorMessage.textContent) {
    setCreatorMessage(
      "✓ Certificate saved successfully! Your shareable certificate is ready.",
      true
    );
  }

  await loadSavedCertificates();
  return saved;
}

async function createPdfBlob(element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 297;
  const pageHeight = 210;

  const ratio = Math.min(
    (pageWidth - 16) / canvas.width,
    (pageHeight - 16) / canvas.height
  );

  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  pdf.addImage(imageData, "PNG", x, y, width, height);

  return pdf.output("blob");
}

function openCertificateLink(url) {
  if (!url) {
    alert("This certificate does not have a share link yet.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function copyCertificateLink(url) {
  if (!url) {
    alert("This certificate does not have a share link yet.");
    return;
  }

  navigator.clipboard.writeText(url)
    .then(() => {
      setCreatorMessage("✓ Certificate link copied. You can send it on WhatsApp or email.", true);
    })
    .catch(() => {
      window.prompt("Copy this certificate link:", url);
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createSavedPreview(item) {
  const template = templateNames.includes(item.template)
    ? item.template
    : "classic";

  return `
    <div class="saved-certificate-preview ${template}">
      <div class="saved-preview-border">
        <div class="saved-preview-content">
          <div class="saved-preview-small">CERTIFICATE OF COMPLETION</div>
          <h2>Certificate</h2>
          <p class="saved-preview-label">This certificate is proudly presented to</p>
          <div class="saved-preview-recipient">${escapeHtml(item.recipient || "Recipient Name")}</div>
          <div class="saved-preview-line"></div>
          <div class="saved-preview-achievement">${escapeHtml(item.achievement || "Course Completion")}</div>
          <p class="saved-preview-description">${escapeHtml(item.description || "Successfully completed the required course.")}</p>

          <div class="saved-preview-details">
            <div>
              <span>Date</span>
              <strong>${escapeHtml(item.date || "Date")}</strong>
            </div>
            <div>
              <span>Instructor</span>
              <strong>${escapeHtml(item.instructor || "Instructor")}</strong>
            </div>
            <div>
              <span>Organization</span>
              <strong>${escapeHtml(item.organization || "Organization")}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadSavedCertificates() {
  if (!currentUser) {
    savedList.innerHTML = "";
    return;
  }

  savedList.innerHTML = `
    <div class="empty-state">
      <h3>Loading...</h3>
      <p>Loading your certificates.</p>
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("certificates")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error(error);
    savedList.innerHTML = `
      <div class="empty-state">
        <h3>Could not load certificates</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    savedList.innerHTML = `
      <div class="empty-state">
        <h3>No certificates yet</h3>
        <p>Create and save your first certificate.</p>
      </div>
    `;
    return;
  }

  savedList.innerHTML = data.map((item) => `
    <article class="saved-certificate-card">
      ${createSavedPreview(item)}

      <div class="saved-certificate-info">
        <h3>${escapeHtml(item.achievement || "Certificate of Completion")}</h3>
        <p>Certificate for: <strong>${escapeHtml(item.recipient)}</strong></p>
      </div>

      <div class="saved-certificate-actions">
        <button class="view-certificate-btn" type="button" data-id="${item.id}">
          View Certificate
        </button>

        <button class="open-link-btn" type="button" data-url="${escapeHtml(item.certificate_file_url || "")}">
          Open Certificate
        </button>

        <button class="share-link-btn" type="button" data-url="${escapeHtml(item.certificate_file_url || "")}">
          Copy Share Link
        </button>

        <button class="download-saved-btn" type="button" data-id="${item.id}">
          Download PDF
        </button>

        <button class="delete-certificate-btn" type="button" data-id="${item.id}">
          Delete
        </button>
      </div>
    </article>
  `).join("");
}

async function viewSavedCertificate(id) {
  const { data, error } = await supabaseClient
    .from("certificates")
    .select("*")
    .eq("id", id)
    .eq("user_id", currentUser.id)
    .single();

  if (error || !data) {
    setCreatorMessage("Certificate could not be opened.");
    return;
  }

  recipientInput.value = data.recipient || "";
  achievementInput.value = data.achievement || "";
  descriptionInput.value = data.description || "";
  dateInput.value = data.date || "";
  instructorInput.value = data.instructor || "";
  organizationInput.value = data.organization || "";

  setTemplate(data.template || "classic");
  updatePreview();

  document.getElementById("creator").scrollIntoView({
    behavior: "smooth"
  });
}

async function deleteCertificate(id) {
  if (!confirm("Are you sure you want to delete this certificate?")) return;

  const { error } = await supabaseClient
    .from("certificates")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }

  await loadSavedCertificates();
  setCreatorMessage("Certificate deleted.", true);
}

async function downloadCurrentCertificate() {
  // Download also saves the certificate and uploads the PDF to Supabase.
  const saved = await saveCertificate(true, true);

  if (!saved) return;

  // Find the latest saved row to get the share URL.
  const { data, error } = await supabaseClient
    .from("certificates")
    .select("certificate_file_url, recipient")
    .eq("id", saved.id)
    .eq("user_id", currentUser.id)
    .single();

  if (error || !data?.certificate_file_url) {
    setCreatorMessage(
      "Certificate was saved, but the PDF share link is not available yet."
    );
    return;
  }

  // Download the public PDF URL.
  const link = document.createElement("a");
  link.href = data.certificate_file_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open Certificate PDF";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setCreatorMessage(
    "✓ Certificate saved. The PDF certificate is opening now.",
    true
  );
}

function resetCertificate() {
  recipientInput.value = "";
  achievementInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";
  instructorInput.value = "";
  organizationInput.value = "";
  setTemplate("classic");
  setCreatorMessage("");
}

document.querySelectorAll(".template-choice").forEach((button) => {
  button.addEventListener("click", () => {
    setTemplate(button.dataset.template);
  });
});

[
  recipientInput,
  achievementInput,
  descriptionInput,
  dateInput,
  instructorInput,
  organizationInput
].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loginUser();
});

gateSignupBtn.addEventListener("click", signupUser);
logoutBtn.addEventListener("click", logoutUser);
saveBtn.addEventListener("click", () => saveCertificate(true));
downloadBtn.addEventListener("click", downloadCurrentCertificate);
newBtn.addEventListener("click", resetCertificate);

savedList.addEventListener("click", async (event) => {
  const viewBtn = event.target.closest(".view-certificate-btn");
  const openBtn = event.target.closest(".open-link-btn");
  const shareBtn = event.target.closest(".share-link-btn");
  const downloadBtnSaved = event.target.closest(".download-saved-btn");
  const deleteBtn = event.target.closest(".delete-certificate-btn");

  if (viewBtn) {
    await viewSavedCertificate(viewBtn.dataset.id);
  }

  if (openBtn) {
    openCertificateLink(openBtn.dataset.url);
  }

  if (shareBtn) {
    copyCertificateLink(shareBtn.dataset.url);
  }

  if (downloadBtnSaved) {
    const id = downloadBtnSaved.dataset.id;

    const { data, error } = await supabaseClient
      .from("certificates")
      .select("*")
      .eq("id", id)
      .eq("user_id", currentUser.id)
      .single();

    if (error || !data) {
      alert("Certificate could not be opened.");
      return;
    }

    const temporary = document.createElement("div");
    temporary.style.position = "fixed";
    temporary.style.left = "-10000px";
    temporary.style.top = "0";
    temporary.style.width = "1100px";
    temporary.innerHTML = createSavedPreview(data);
    document.body.appendChild(temporary);

    try {
      const target = temporary.firstElementChild;
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: null
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const ratio = Math.min(
        (pageWidth - 16) / canvas.width,
        (pageHeight - 16) / canvas.height
      );

      const width = canvas.width * ratio;
      const height = canvas.height * ratio;
      const x = (pageWidth - width) / 2;
      const y = (pageHeight - height) / 2;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, width, height);

      const safeName = (data.recipient || "certificate")
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_|_$/g, "");

      pdf.save(`${safeName || "certificate"}_certificate.pdf`);
    } finally {
      temporary.remove();
    }
  }

  if (deleteBtn) {
    await deleteCertificate(deleteBtn.dataset.id);
  }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth event:", event);

  if (session?.user) {
    showApp(session.user);
  } else {
    showLogin();
  }
});

async function initializeApp() {
  updatePreview();

  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    showLogin();
    return;
  }

  if (session?.user) {
    showApp(session.user);
  } else {
    showLogin();
  }
}

initializeApp();
