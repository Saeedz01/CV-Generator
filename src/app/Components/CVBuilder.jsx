"use client";

import { useState } from "react";

let _id = 0;
const uid = () => `id_${++_id}_${Date.now()}`;

const defaultSection = () => ({ id: uid(), heading: "", details: "", useBullets: false });

const initialState = {
  name: "", subtitle: "", email: "", phone: "", address: "",
  linkedin: "", github: "",
  sections: [defaultSection()],
};

// ─── Helper: extract short display label from LinkedIn URL ────────────────────
// e.g. "https://linkedin.com/in/saeed-zafar-123" → "in/saeed-zafar-123"
function linkedinLabel(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.pathname.replace(/^\//, ""); // e.g. "in/saeed-zafar"
  } catch {
    return url.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "");
  }
}

// ─── Helper: extract short display label from GitHub URL ─────────────────────
function githubLabel(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname.replace("www.", "") + u.pathname;
  } catch {
    return url;
  }
}

// ─── Icons (editor UI) ────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── LinkedIn icon (SVG, inline) ──────────────────────────────────────────────
const LinkedInIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1a3a6a" style={{ display: "inline", verticalAlign: "middle", marginRight: "3px", marginBottom: "1px" }}>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

// ─── GitHub icon (SVG, inline) ────────────────────────────────────────────────
const GitHubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1a3a6a" style={{ display: "inline", verticalAlign: "middle", marginRight: "3px", marginBottom: "1px" }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
  </svg>
);

// ─── PDF Generation ───────────────────────────────────────────────────────────
async function generatePDF(cv) {
  if (typeof window === "undefined") return;

  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mX    = 18;
  const mY    = 15;
  const contW = pageW - mX * 2;
  let y       = mY;

  const checkPage = (need = 6) => {
    if (y + need > pageH - mY) { doc.addPage(); y = mY; }
  };

  const centerLine = (text, fontSize, fontName, fontStyle, color) => {
    doc.setFontSize(fontSize);
    doc.setFont(fontName, fontStyle);
    doc.setTextColor(...color);
    const w = doc.getTextWidth(text);
    doc.text(text, (pageW - w) / 2, y);
    return w;
  };

  // ── NAME ─────────────────────────────────────────────────────────────────
  if (cv.name) {
    centerLine(cv.name, 20, "helvetica", "bold", [17,17,17]);
    y += 7;
  }

  // ── SUBTITLE ─────────────────────────────────────────────────────────────
  if (cv.subtitle) {
    centerLine(cv.subtitle, 9.5, "helvetica", "normal", [80,80,80]);
    y += 4.5;
  }

  // ── EMAIL · PHONE · ADDRESS ───────────────────────────────────────────────
  const contactParts = [cv.email, cv.phone, cv.address].filter(Boolean);
  if (contactParts.length > 0) {
    const str = contactParts.join("  ,  ");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17,17,17);
    const wrapped = doc.splitTextToSize(str, contW);
    wrapped.forEach((line) => {
      const lw = doc.getTextWidth(line);
      doc.text(line, (pageW - lw) / 2, y);
      y += 4;
    });
  }

  // ── LINKEDIN · GITHUB — plain text only, no icon characters ─────────────
  const liLabel = linkedinLabel(cv.linkedin);
  const ghLabel = githubLabel(cv.github);
  if (liLabel || ghLabel) {
    y += 0.5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const liText  = liLabel ? "in/" + liLabel.replace(/^in\//, "") : null;
    const ghText  = ghLabel ? ghLabel : null;
    const sep     = "     ";
    const sepW    = doc.getTextWidth(sep);
    const liW     = liText ? doc.getTextWidth(liText) : 0;
    const ghW     = ghText ? doc.getTextWidth(ghText) : 0;
    const totalW  = liW + (liText && ghText ? sepW : 0) + ghW;
    let   lx      = (pageW - totalW) / 2;

    if (liText) {
      doc.setTextColor(26,58,106);
      doc.text(liText, lx, y);
      const href = cv.linkedin.startsWith("http") ? cv.linkedin : "https://" + cv.linkedin;
      doc.link(lx, y - 3.5, liW, 4.5, { url: href });
      lx += liW;
    }
    if (liText && ghText) {
      doc.setTextColor(120,120,120);
      doc.text(sep, lx, y);
      lx += sepW;
    }
    if (ghText) {
      doc.setTextColor(26,58,106);
      doc.text(ghText, lx, y);
      const href = cv.github.startsWith("http") ? cv.github : "https://" + cv.github;
      doc.link(lx, y - 3.5, ghW, 4.5, { url: href });
    }
    y += 4;
  }

  y += 1.5;

  // ── HEADER RULE ───────────────────────────────────────────────────────────
  doc.setDrawColor(17,17,17);
  doc.setLineWidth(0.6);
  doc.line(mX, y, pageW - mX, y);
  y += 4;

  // ── SECTIONS ─────────────────────────────────────────────────────────────
  cv.sections.forEach((section, idx) => {
    const isLast = idx === cv.sections.length - 1;

    if (section.heading) {
      checkPage(9);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17,17,17);
      const headText = section.heading.toUpperCase();
      doc.text(headText, mX, y);
      const hw = doc.getTextWidth(headText);
      doc.setDrawColor(17,17,17);
      doc.setLineWidth(0.3);
      doc.line(mX, y + 0.8, mX + hw, y + 0.8);
      y += 5.5;
    }

    if (section.details.trim()) {
      if (section.useBullets) {
        section.details.split("\n").map(l => l.trim()).filter(Boolean).forEach((line) => {
          checkPage(5);
          doc.setFontSize(10);
          doc.setFont("times", "normal");
          doc.setTextColor(17,17,17);
          doc.text("-", mX, y);
          const bx = mX + 4;
          doc.splitTextToSize(line, contW - 4).forEach((wl, wi) => {
            if (wi > 0) checkPage(4.5);
            doc.text(wl, bx, y);
            y += 4.5;
          });
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.setTextColor(17,17,17);
        doc.splitTextToSize(section.details.trim(), contW).forEach((line) => {
          checkPage(4.5);
          doc.text(line, mX, y);
          y += 4.5;
        });
      }
    }

    if (!isLast) {
      y += 2.5;
      checkPage(4);
      doc.setDrawColor(180,180,180);
      doc.setLineWidth(0.2);
      doc.line(mX, y, pageW - mX, y);
      y += 3.5;
    }
  });

  doc.save(`${cv.name || "CV"}.pdf`);
}

// ─── CV Preview ───────────────────────────────────────────────────────────────
function CVPreview({ cv }) {
  const linesOf = (text) => text.split("\n").map(l => l.trim()).filter(Boolean);
  const liLabel = linkedinLabel(cv.linkedin);
  const ghLabel = githubLabel(cv.github);
  const contactParts = [cv.email, cv.phone, cv.address].filter(Boolean);

  return (
    <div style={{
      width: "100%", background: "#ffffff",
      padding: "44px 52px 48px", boxSizing: "border-box",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", lineHeight: "1" }}>

        {/* Name */}
        <div style={{
          fontSize: "26px", fontWeight: "900", color: "#111",
          letterSpacing: "0.5px", fontFamily: "'Arial', sans-serif",
          marginBottom: "5px",
        }}>
          {cv.name || <span style={{ color: "#ccc", fontStyle: "italic", fontWeight: 400, fontSize: "22px" }}>Your Name</span>}
        </div>

        {/* Subtitle */}
        {cv.subtitle && (
          <div style={{
            fontSize: "12px", color: "#555", fontFamily: "'Arial', sans-serif",
            marginBottom: "5px", fontWeight: "400",
          }}>
            {cv.subtitle}
          </div>
        )}

        {/* Email · Phone · Address */}
        {contactParts.length > 0 && (
          <div style={{
            fontSize: "11.5px", color: "#111", fontFamily: "'Arial', sans-serif",
            marginBottom: "5px", fontWeight: "400",
          }}>
            {contactParts.join("  ,  ")}
          </div>
        )}

        {/* LinkedIn + GitHub — icons + short labels, one line */}
        {(liLabel || ghLabel) && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "20px", marginTop: "4px", marginBottom: "2px",
          }}>
            {liLabel && (
              <a
                href={cv.linkedin.startsWith("http") ? cv.linkedin : "https://" + cv.linkedin}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "3px",
                  color: "#1a3a6a", fontSize: "11.5px",
                  fontFamily: "'Arial', sans-serif", textDecoration: "underline",
                }}
              >
                <LinkedInIcon size={13} />
                {"in/" + liLabel.replace(/^in\//, "")}
              </a>
            )}
            {ghLabel && (
              <a
                href={cv.github.startsWith("http") ? cv.github : "https://" + cv.github}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "3px",
                  color: "#1a3a6a", fontSize: "11.5px",
                  fontFamily: "'Arial', sans-serif", textDecoration: "underline",
                }}
              >
                <GitHubIcon size={13} />
                {ghLabel}
              </a>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!cv.name && !cv.email && !cv.phone && !cv.address && !cv.linkedin && !cv.github && (
          <p style={{ color: "#ccc", fontStyle: "italic", fontSize: "13px", margin: "4px 0 0" }}>
            Fill in your details on the left...
          </p>
        )}
      </div>

      {/* ── HEADER RULE ── */}
      <div style={{ width: "100%", height: "2px", background: "#111", margin: "12px 0 16px" }} />

      {/* ── SECTIONS ── */}
      {cv.sections.map((section, idx) => (
        <div key={section.id}>
          {section.heading && (
            <div style={{
              fontSize: "12px", fontWeight: "900", color: "#111",
              fontFamily: "'Arial', sans-serif", letterSpacing: "1.5px",
              textTransform: "uppercase", borderBottom: "1.5px solid #111",
              paddingBottom: "3px", marginBottom: "8px",
              display: "inline-block",
            }}>
              {section.heading}
            </div>
          )}
          <div style={{ clear: "both", marginBottom: "6px" }}>
            {section.useBullets ? (
              <ul style={{ margin: 0, paddingLeft: "18px", listStyleType: "disc" }}>
                {linesOf(section.details).map((line, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#111", fontFamily: "'Georgia', serif", lineHeight: "1.75", marginBottom: "2px" }}>
                    {line}
                  </li>
                ))}
                {linesOf(section.details).length === 0 && (
                  <li style={{ color: "#ccc", fontStyle: "italic", fontSize: "13px" }}>Each line becomes a bullet...</li>
                )}
              </ul>
            ) : (
              <div style={{ fontSize: "13px", color: "#111", fontFamily: "'Georgia', serif", lineHeight: "1.75", whiteSpace: "pre-wrap" }}>
                {section.details || <span style={{ color: "#ccc", fontStyle: "italic" }}>Details appear here...</span>}
              </div>
            )}
          </div>
          {idx < cv.sections.length - 1 && (
            <div style={{ width: "100%", height: "1px", background: "#ccc", margin: "12px 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CVBuilder() {
  const [cv, setCv] = useState(initialState);
  const [downloading, setDownloading] = useState(false);

  const updateField   = (f, v) => setCv(p => ({ ...p, [f]: v }));
  const updateSection = (id, f, v) =>
    setCv(p => ({ ...p, sections: p.sections.map(s => s.id === id ? { ...s, [f]: v } : s) }));
  const addSection    = () => setCv(p => ({ ...p, sections: [...p.sections, defaultSection()] }));
  const deleteSection = (id) => setCv(p => ({ ...p, sections: p.sections.filter(s => s.id !== id) }));

  const handleDownload = async () => {
    setDownloading(true);
    try { await generatePDF(cv); }
    catch (e) { console.error(e); alert("Error: " + e.message); }
    finally { setDownloading(false); }
  };

  const onFocus = (e) => (e.target.style.borderColor = "#c8b99a");
  const onBlur  = (e) => (e.target.style.borderColor = "#2e2e2e");
  const labelSt = {
    display: "block", fontSize: "9px", letterSpacing: "2.5px",
    textTransform: "uppercase", color: "#555",
    fontFamily: "'Courier New', monospace", marginBottom: "5px",
  };
  const inputSt = {
    width: "100%", background: "#1c1c1c", border: "1px solid #2e2e2e",
    borderRadius: "3px", padding: "8px 11px", color: "#d8d0c4",
    fontSize: "13px", fontFamily: "'Georgia', serif", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

      {/* ── EDITOR ── */}
      <aside style={{
        width: "400px", minWidth: "400px", background: "#111111",
        color: "#d8d0c4", padding: "28px 24px 48px",
        overflowY: "auto", height: "100vh", position: "sticky",
        top: 0, alignSelf: "flex-start", boxSizing: "border-box",
      }}>
        <p style={{
          fontSize: "10px", fontFamily: "'Courier New', monospace",
          letterSpacing: "4px", textTransform: "uppercase",
          color: "#555", margin: "0 0 24px 0",
          borderBottom: "1px solid #222", paddingBottom: "14px",
        }}>✦ CV Builder</p>

        {[
          { field: "name",     label: "Full Name",       placeholder: "e.g. Saeed Zafar" },
          { field: "subtitle", label: "Subtitle / Title", placeholder: "e.g. Fresh Graduate, MERN Stack Developer" },
          { field: "email",    label: "Email",            placeholder: "you@example.com" },
          { field: "phone",    label: "Phone",            placeholder: "+92 300 0000000" },
          { field: "address",  label: "Address",          placeholder: "e.g. Canal Road, Lahore, Pakistan" },
          { field: "linkedin", label: "LinkedIn URL",     placeholder: "https://linkedin.com/in/your-name" },
          { field: "github",   label: "GitHub URL",       placeholder: "https://github.com/yourname" },
        ].map(({ field, label, placeholder }) => (
          <div key={field} style={{ marginBottom: "13px" }}>
            <label style={labelSt}>{label}</label>
            <input style={inputSt} type="text" placeholder={placeholder} value={cv[field]}
              onChange={(e) => updateField(field, e.target.value)}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
        ))}

        <div style={{ height: "1px", background: "#222", margin: "18px 0" }} />
        <p style={{ ...labelSt, marginBottom: "12px" }}>CV Sections</p>

        {cv.sections.map((section, idx) => (
          <div key={section.id} style={{
            background: "#181818", border: "1px solid #252525",
            borderRadius: "4px", padding: "14px", marginBottom: "10px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
              <span style={{ ...labelSt, marginBottom: 0 }}>Section {idx + 1}</span>
              <button onClick={() => deleteSection(section.id)}
                style={{
                  background: "none", border: "1px solid #3a2020", borderRadius: "3px",
                  color: "#7a3535", cursor: "pointer", padding: "3px 8px",
                  fontSize: "10px", fontFamily: "'Courier New', monospace",
                  display: "flex", alignItems: "center", gap: "5px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#3a1a1a"; e.currentTarget.style.color = "#e05050"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#7a3535"; }}
              >
                <TrashIcon /> Delete
              </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelSt}>Section Heading</label>
              <input style={inputSt} type="text"
                placeholder="e.g. SUMMARY, SKILLS, PROJECTS..."
                value={section.heading}
                onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelSt}>
                Details — {section.useBullets ? "one bullet per line" : "paragraph / summary"}
              </label>
              <textarea
                style={{ ...inputSt, resize: "vertical", minHeight: "82px", lineHeight: "1.6" }}
                placeholder={section.useBullets ? "Each line becomes a bullet point..." : "Write a summary or paragraph..."}
                value={section.details}
                onChange={(e) => updateSection(section.id, "details", e.target.value)}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            <label style={{
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
              userSelect: "none", color: section.useBullets ? "#c8b99a" : "#555",
              fontFamily: "'Courier New', monospace",
            }}>
              <input type="checkbox" checked={section.useBullets}
                onChange={(e) => updateSection(section.id, "useBullets", e.target.checked)}
                style={{ accentColor: "#c8b99a", width: "13px", height: "13px", cursor: "pointer" }} />
              Use bullet points
            </label>
          </div>
        ))}

        <button onClick={addSection}
          style={{
            width: "100%", background: "none", border: "1px dashed #333",
            borderRadius: "3px", color: "#555", cursor: "pointer", padding: "9px",
            fontSize: "10px", fontFamily: "'Courier New', monospace",
            letterSpacing: "2px", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "7px", marginTop: "4px", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8b99a"; e.currentTarget.style.color = "#c8b99a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#555"; }}
        >
          <PlusIcon /> Add Section
        </button>

        <button onClick={handleDownload} disabled={downloading}
          style={{
            width: "100%", background: downloading ? "#666" : "#c8b99a",
            border: "none", borderRadius: "3px", color: "#111",
            cursor: downloading ? "not-allowed" : "pointer", padding: "11px",
            fontSize: "10px", fontFamily: "'Courier New', monospace",
            letterSpacing: "3px", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "7px", marginTop: "18px", fontWeight: "bold",
          }}
        >
          <DownloadIcon /> {downloading ? "Generating..." : "Download PDF"}
        </button>
      </aside>

      {/* ── PREVIEW ── */}
      <main style={{
        flex: 1, padding: "40px 48px", background: "#e8e4de",
        overflowY: "auto", boxSizing: "border-box",
      }}>
        <p style={{
          fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase",
          color: "#999", fontFamily: "'Courier New', monospace",
          textAlign: "center", marginBottom: "16px",
        }}>
          Live Preview
        </p>
        <div style={{ maxWidth: "740px", margin: "0 auto", boxShadow: "0 6px 40px rgba(0,0,0,0.14)" }}>
          <CVPreview cv={cv} />
        </div>
      </main>
    </div>
  );
}