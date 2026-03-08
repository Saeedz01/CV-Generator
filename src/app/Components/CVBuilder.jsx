"use client";

import { useState, useRef } from "react";

// ─── Unique ID helper ────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `id_${++_id}_${Date.now()}`;

// ─── Default / Empty State ───────────────────────────────────────────────────
const defaultSection = () => ({ id: uid(), heading: "", details: "" });

const initialState = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  sections: [defaultSection()],
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Styles (inline, no Tailwind dependency) ─────────────────────────────────
const S = {
  // Layout
  page: {
    minHeight: "100vh",
    background: "#f0ede8",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    display: "flex",
    gap: "0",
  },
  // Left editor panel
  editor: {
    width: "420px",
    minWidth: "420px",
    background: "#1a1a1a",
    color: "#e8e0d4",
    padding: "32px 28px",
    overflowY: "auto",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  editorTitle: {
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#8a7f72",
    marginBottom: "28px",
    borderBottom: "1px solid #333",
    paddingBottom: "16px",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#8a7f72",
    fontFamily: "'Courier New', monospace",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    background: "#262626",
    border: "1px solid #333",
    borderRadius: "3px",
    padding: "9px 12px",
    color: "#e8e0d4",
    fontSize: "13px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    background: "#262626",
    border: "1px solid #333",
    borderRadius: "3px",
    padding: "9px 12px",
    color: "#e8e0d4",
    fontSize: "13px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "80px",
    transition: "border-color 0.2s",
  },
  sectionDivider: {
    height: "1px",
    background: "#333",
    margin: "20px 0",
  },
  sectionCard: {
    background: "#222",
    border: "1px solid #2e2e2e",
    borderRadius: "4px",
    padding: "16px",
    marginBottom: "12px",
    position: "relative",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  sectionLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#6b6055",
    fontFamily: "'Courier New', monospace",
  },
  deleteBtn: {
    background: "none",
    border: "1px solid #3a2a2a",
    borderRadius: "3px",
    color: "#7a4040",
    cursor: "pointer",
    padding: "4px 8px",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "all 0.2s",
  },
  addBtn: {
    width: "100%",
    background: "none",
    border: "1px dashed #444",
    borderRadius: "3px",
    color: "#8a7f72",
    cursor: "pointer",
    padding: "10px",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "2px",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    transition: "all 0.2s",
  },
  downloadBtn: {
    width: "100%",
    background: "#c8b99a",
    border: "none",
    borderRadius: "3px",
    color: "#1a1a1a",
    cursor: "pointer",
    padding: "12px",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "3px",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "24px",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
  // Right preview panel
  preview: {
    flex: 1,
    padding: "48px 56px",
    background: "#f0ede8",
    overflowY: "auto",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  cvSheet: {
    background: "#ffffff",
    maxWidth: "740px",
    margin: "0 auto",
    padding: "52px 56px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
    minHeight: "1040px",
    boxSizing: "border-box",
  },
  cvName: {
    fontSize: "32px",
    fontWeight: "400",
    color: "#1a1a1a",
    letterSpacing: "1px",
    marginBottom: "4px",
    fontFamily: "'Georgia', serif",
  },
  cvContact: {
    fontSize: "12px",
    color: "#555",
    marginBottom: "4px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.5px",
  },
  cvLink: {
    color: "#2a4a7a",
    textDecoration: "none",
    fontSize: "12px",
    fontFamily: "'Courier New', monospace",
  },
  cvHeaderDivider: {
    height: "2px",
    background: "#1a1a1a",
    margin: "18px 0",
  },
  cvSectionHeading: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#1a1a1a",
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
    marginBottom: "8px",
    marginTop: "0",
  },
  cvSectionDetails: {
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.7",
    fontFamily: "'Georgia', serif",
    whiteSpace: "pre-wrap",
    marginBottom: "0",
  },
  cvSectionDivider: {
    height: "1px",
    background: "#ddd",
    margin: "18px 0",
  },
  cvPlaceholder: {
    color: "#bbb",
    fontStyle: "italic",
  },
  previewLabel: {
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#999",
    fontFamily: "'Courier New', monospace",
    textAlign: "center",
    marginBottom: "16px",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CVBuilder() {
  const [cv, setCv] = useState(initialState);
  const cvRef = useRef(null);

  // Field updater
  const updateField = (field, value) => setCv((prev) => ({ ...prev, [field]: value }));

  // Section updater
  const updateSection = (id, field, value) =>
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));

  // Add section
  const addSection = () =>
    setCv((prev) => ({ ...prev, sections: [...prev.sections, defaultSection()] }));

  // Delete section
  const deleteSection = (id) =>
    setCv((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));

  // ── PDF Download via html2pdf (CDN loaded dynamically) ──────────────────────
  const downloadPDF = async () => {
    if (typeof window === "undefined") return;

    // Dynamically load html2pdf if not already loaded
    if (!window.html2pdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const element = cvRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${cv.name || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    window.html2pdf().set(opt).from(element).save();
  };

  // ─── Input focus style handler ────────────────────────────────────────────
  const focusStyle = (e) => (e.target.style.borderColor = "#c8b99a");
  const blurStyle = (e) => (e.target.style.borderColor = "#333");

  return (
    <div style={S.page}>
      {/* ── LEFT: EDITOR ── */}
      <aside style={S.editor}>
        <p style={S.editorTitle}>✦ CV Builder</p>

        {/* Personal Info */}
        {[
          { field: "name", label: "Full Name", placeholder: "e.g. Saeed Zafar" },
          { field: "email", label: "Email Address", placeholder: "email@example.com" },
          { field: "phone", label: "Phone Number", placeholder: "+92 300 0000000" },
          { field: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
          { field: "github", label: "GitHub URL", placeholder: "https://github.com/..." },
        ].map(({ field, label, placeholder }) => (
          <div key={field} style={S.fieldGroup}>
            <label style={S.label}>{label}</label>
            <input
              style={S.input}
              type="text"
              placeholder={placeholder}
              value={cv[field]}
              onChange={(e) => updateField(field, e.target.value)}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        ))}

        <div style={S.sectionDivider} />

        {/* Sections */}
        <p style={{ ...S.label, marginBottom: "14px" }}>CV Sections</p>

        {cv.sections.map((section, idx) => (
          <div key={section.id} style={S.sectionCard}>
            <div style={S.sectionHeader}>
              <span style={S.sectionLabel}>Section {idx + 1}</span>
              <button
                style={S.deleteBtn}
                onClick={() => deleteSection(section.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#3a1a1a";
                  e.currentTarget.style.color = "#e05555";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "#7a4040";
                }}
              >
                <TrashIcon /> Delete
              </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={S.label}>Section Heading</label>
              <input
                style={S.input}
                type="text"
                placeholder="e.g. EXPERIENCE, SKILLS, EDUCATION..."
                value={section.heading}
                onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label style={S.label}>Details</label>
              <textarea
                style={S.textarea}
                placeholder="Describe your experience, skills, or achievements..."
                value={section.details}
                onChange={(e) => updateSection(section.id, "details", e.target.value)}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
        ))}

        <button
          style={S.addBtn}
          onClick={addSection}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#c8b99a";
            e.currentTarget.style.color = "#c8b99a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#444";
            e.currentTarget.style.color = "#8a7f72";
          }}
        >
          <PlusIcon /> Add Section
        </button>

        <button
          style={S.downloadBtn}
          onClick={downloadPDF}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b8a98a")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#c8b99a")}
        >
          <DownloadIcon /> Download PDF
        </button>
      </aside>

      {/* ── RIGHT: PREVIEW ── */}
      <main style={S.preview}>
        <p style={S.previewLabel}>Live Preview</p>

        <div ref={cvRef} style={S.cvSheet}>
          {/* Header */}
          <div>
            <h1 style={S.cvName}>
              {cv.name || <span style={S.cvPlaceholder}>Your Name</span>}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "6px" }}>
              {cv.email && <span style={S.cvContact}>{cv.email}</span>}
              {cv.phone && <span style={S.cvContact}>{cv.phone}</span>}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "6px" }}>
              {cv.linkedin && (
                <a href={cv.linkedin} style={S.cvLink} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              )}
              {cv.github && (
                <a href={cv.github} style={S.cvLink} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              )}
            </div>

            {!cv.email && !cv.phone && !cv.linkedin && !cv.github && (
              <p style={{ ...S.cvContact, ...S.cvPlaceholder }}>
                email · phone · linkedin · github
              </p>
            )}
          </div>

          {/* Header divider */}
          <div style={S.cvHeaderDivider} />

          {/* Sections */}
          {cv.sections.length === 0 ? (
            <p style={{ ...S.cvSectionDetails, ...S.cvPlaceholder }}>
              Add sections using the editor on the left.
            </p>
          ) : (
            cv.sections.map((section, idx) => (
              <div key={section.id}>
                {section.heading && (
                  <h2 style={S.cvSectionHeading}>{section.heading}</h2>
                )}
                {!section.heading && !section.details ? (
                  <p style={{ ...S.cvSectionDetails, ...S.cvPlaceholder }}>
                    — empty section —
                  </p>
                ) : (
                  <p style={S.cvSectionDetails}>{section.details}</p>
                )}

                {/* Divider between sections (not after last) */}
                {idx < cv.sections.length - 1 && (
                  <div style={S.cvSectionDivider} />
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}