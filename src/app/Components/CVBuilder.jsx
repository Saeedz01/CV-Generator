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

function linkedinLabel(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.pathname.replace(/^\//, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "");
  }
}

function githubLabel(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname.replace("www.", "") + u.pathname;
  } catch {
    return url;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const LinkedInIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1a3a6a" className="inline align-middle mr-1 mb-px">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const GitHubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1a3a6a" className="inline align-middle mr-1 mb-px">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  </svg>
);
// ─── PDF Generation (unchanged logic, no styles involved) ─────────────────────

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

  if (cv.name) { centerLine(cv.name, 20, "helvetica", "bold", [17,17,17]); y += 7; }
  if (cv.subtitle) { centerLine(cv.subtitle, 9.5, "helvetica", "normal", [80,80,80]); y += 4.5; }

  const contactParts = [cv.email, cv.phone, cv.address].filter(Boolean);
  if (contactParts.length > 0) {
    const str = contactParts.join("  ,  ");
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(17,17,17);
    doc.splitTextToSize(str, contW).forEach((line) => {
      const lw = doc.getTextWidth(line);
      doc.text(line, (pageW - lw) / 2, y);
      y += 4;
    });
  }

  const liLabel = linkedinLabel(cv.linkedin);
  const ghLabel = githubLabel(cv.github);
  if (liLabel || ghLabel) {
    y += 0.5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const liText = liLabel ? "in/" + liLabel.replace(/^in\//, "") : null;
    const ghText = ghLabel ? ghLabel : null;
    const sep = "     ";
    const sepW = doc.getTextWidth(sep);
    const liW  = liText ? doc.getTextWidth(liText) : 0;
    const ghW  = ghText ? doc.getTextWidth(ghText) : 0;
    const totalW = liW + (liText && ghText ? sepW : 0) + ghW;
    let lx = (pageW - totalW) / 2;
    if (liText) {
      doc.setTextColor(26,58,106); doc.text(liText, lx, y);
      const href = cv.linkedin.startsWith("http") ? cv.linkedin : "https://" + cv.linkedin;
      doc.link(lx, y - 3.5, liW, 4.5, { url: href }); lx += liW;
    }
    if (liText && ghText) { doc.setTextColor(120,120,120); doc.text(sep, lx, y); lx += sepW; }
    if (ghText) {
      doc.setTextColor(26,58,106); doc.text(ghText, lx, y);
      const href = cv.github.startsWith("http") ? cv.github : "https://" + cv.github;
      doc.link(lx, y - 3.5, ghW, 4.5, { url: href });
    }
    y += 4;
  }

  y += 1.5;
  doc.setDrawColor(17,17,17); doc.setLineWidth(0.6);
  doc.line(mX, y, pageW - mX, y); y += 4;

  cv.sections.forEach((section, idx) => {
    const isLast = idx === cv.sections.length - 1;
    if (section.heading) {
      checkPage(9);
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(17,17,17);
      const headText = section.heading.toUpperCase();
      doc.text(headText, mX, y);
      const hw = doc.getTextWidth(headText);
      doc.setDrawColor(17,17,17); doc.setLineWidth(0.3);
      doc.line(mX, y + 0.8, mX + hw, y + 0.8); y += 5.5;
    }
    if (section.details.trim()) {
      if (section.useBullets) {
        section.details.split("\n").map(l => l.trim()).filter(Boolean).forEach((line) => {
          checkPage(5);
          doc.setFontSize(10); doc.setFont("times", "normal"); doc.setTextColor(17,17,17);
          doc.text("-", mX, y);
          const bx = mX + 4;
          doc.splitTextToSize(line, contW - 4).forEach((wl, wi) => {
            if (wi > 0) checkPage(4.5);
            doc.text(wl, bx, y); y += 4.5;
          });
        });
      } else {
        doc.setFontSize(10); doc.setFont("times", "normal"); doc.setTextColor(17,17,17);
        doc.splitTextToSize(section.details.trim(), contW).forEach((line) => {
          checkPage(4.5); doc.text(line, mX, y); y += 4.5;
        });
      }
    }
    if (!isLast) {
      y += 2.5; checkPage(4);
      doc.setDrawColor(180,180,180); doc.setLineWidth(0.2);
      doc.line(mX, y, pageW - mX, y); y += 3.5;
    }
  });

  doc.save(`${cv.name || "CV"}.pdf`);
}

// ─── CV Preview ───────────────────────────────────────────────────────────────
function CVPreview({ cv }) {
  const linesOf    = (text) => text.split("\n").map(l => l.trim()).filter(Boolean);
  const liLabel    = linkedinLabel(cv.linkedin);
  const ghLabel    = githubLabel(cv.github);
  const contactParts = [cv.email, cv.phone, cv.address].filter(Boolean);

  return ( 
    <div className="w-full bg-white px-14 pt-11 pb-12 box-border font-serif">

      {/* ── HEADER ── */}
      <div className="text-center leading-none">

        {/* Name */}
        <div className="text-2xl font-black text-[#111] tracking-wide font-sans mb-1.5">
          {cv.name || <span className="text-gray-300 italic font-normal text-xl">Your Name</span>}
        </div>

        {/* Subtitle */}
        {cv.subtitle && (
          <div className="text-xs text-[#555] font-sans font-normal mb-1.5">
            {cv.subtitle}
          </div>
        )}

        {/* Email · Phone · Address */}
        {contactParts.length > 0 && (
          <div className="text-[11.5px] text-[#111] font-sans font-normal mb-1.5">
            {contactParts.join("  ,  ")}
          </div>
        )}

        {/* LinkedIn + GitHub */}
        {(liLabel || ghLabel) && (
          <div className="flex justify-center items-center gap-5 mt-1 mb-0.5">
            {liLabel && (
              <a
                href={cv.linkedin.startsWith("http") ? cv.linkedin : "https://" + cv.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#1a3a6a] text-[11.5px] font-sans underline"
              >
                <LinkedInIcon size={13} />
                {"in/" + liLabel.replace(/^in\//, "")}
              </a>
            )}
            {ghLabel && (
              <a
                href={cv.github.startsWith("http") ? cv.github : "https://" + cv.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#1a3a6a] text-[11.5px] font-sans underline"
              >
                <GitHubIcon size={13} />
                {ghLabel}
              </a>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!cv.name && !cv.email && !cv.phone && !cv.address && !cv.linkedin && !cv.github && (
          <p className="text-gray-300 italic text-[13px] mt-1">Fill in your details on the left...</p>
        )}
      </div>

      {/* ── HEADER RULE ── */}
      <div className="w-full h-0.5 bg-[#111] my-3" />

      {/* ── SECTIONS ── */}
      {cv.sections.map((section, idx) => (
        <div key={section.id}>
          {section.heading && (
            <div className="text-xs font-black text-[#111] font-sans tracking-widest uppercase border-b border-b-[1.5px] border-[#111] pb-0.5 mb-2 inline-block">
              {section.heading}
            </div>
          )}
          <div className="clear-both mb-1.5">
            {section.useBullets ? (
              <ul className="m-0 pl-5 list-disc">
                {linesOf(section.details).map((line, i) => (
                  <li key={i} className="text-[13px] text-[#111] font-serif leading-7 mb-0.5">{line}</li>
                ))}
                {linesOf(section.details).length === 0 && (
                  <li className="text-gray-300 italic text-[13px]">Each line becomes a bullet...</li>
                )}
              </ul>
            ) : (
              <div className="text-[13px] text-[#111] font-serif leading-7 whitespace-pre-wrap">
                {section.details || <span className="text-gray-300 italic">Details appear here...</span>}
              </div>
            )}
          </div>
          {idx < cv.sections.length - 1 && (
            <div className="w-full h-px bg-gray-300 my-3" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CVBuilder() {
  const [cv, setCv]               = useState(initialState);
  const [downloading, setDownloading] = useState(false);

  const updateField   = (f, value) => setCv(prev => ({ ...prev, [f]: value }));
  const updateSection = (id, f, value) =>
    setCv(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, [f]: value } : s) }));
  const addSection    = () => setCv(prev => ({ ...prev, sections: [...prev.sections, defaultSection()] }));
  const deleteSection = (id) => setCv(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));

  const handleDownload = async () => {
    setDownloading(true);
    try { await generatePDF(cv); }
    catch (e) { console.error(e); alert("Error: " + e.message); }
    finally { setDownloading(false); }
  };

  const inputCls = "w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm px-3 py-2 text-[#d8d0c4] text-[13px] font-serif outline-none box-border transition-colors duration-200 focus:border-[#c8b99a]";
  const labelCls = "block text-[9px] tracking-[2.5px] uppercase text-white font-mono mb-1.5";

  return (
    <div className="flex min-h-screen font-serif">

      {/* ── EDITOR ── */}
      <aside className="w-[400px] min-w-[400px] bg-[#111111] text-[#d8d0c4] px-6 pt-7 pb-12 overflow-y-auto h-screen sticky top-0 box-border">

        <p className="text-xl font-mono tracking-[3px] uppercase text-white mb-6 border-b border-[#222] pb-3.5">
          ✦ CV Builder
        </p>

        {/* Personal info fields */}
        {[
          { field: "name",     label: "Full Name",        placeholder: "e.g. Saeed Zafar" },
          { field: "subtitle", label: "Subtitle / Title", placeholder: "e.g. Fresh Graduate, MERN Stack Developer" },
          { field: "email",    label: "Email",             placeholder: "you@example.com" },
          { field: "phone",    label: "Phone",             placeholder: "+92 300 0000000" },
          { field: "address",  label: "Address",           placeholder: "e.g. Canal Road, Lahore, Pakistan" },
          { field: "linkedin", label: "LinkedIn URL",      placeholder: "https://linkedin.com/in/your-name" },
          { field: "github",   label: "GitHub URL",        placeholder: "https://github.com/yourname" },
        ].map((x) => (
          <div key={x.field} className="mb-3.5">
            <label className={labelCls}>{x.label}</label>
            <input
              className={inputCls}
              type="text"
              placeholder={x.placeholder}
              value={cv[x.field]}
              onChange={(e) => updateField(x.field, e.target.value)}
            />
          </div>
        ))}

        <div className="h-px bg-[#222] my-4" />
        <p className={`${labelCls} mb-3`}>CV Sections</p>

        {/* Section cards */}
        {cv.sections.map((section, idx) => (
          <div key={section.id} className="bg-[#181818] border border-[#252525] rounded px-3.5 py-3.5 mb-2.5">

            {/* Card header */}
            <div className="flex justify-between items-center mb-2.5">
              <span className={`${labelCls} mb-0`}>Section {idx + 1}</span>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-transparent border border-[#3a2020] rounded-sm text-[#7a3535] cursor-pointer px-2 py-0.5 text-[10px] font-mono flex items-center gap-1 hover:bg-[#3a1a1a] hover:text-[#e05050] transition-colors"
              >
                <TrashIcon /> Delete
              </button>
            </div>

            {/* Section heading input */}
            <div className="mb-2.5">
              <label className={labelCls}>Section Heading</label>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. SUMMARY, SKILLS, PROJECTS..."
                value={section.heading}
                onChange={(e) => updateSection(section.id, "heading", e.target.value)}
              />
            </div>

            {/* Details textarea */}
            <div className="mb-2.5">
              <label className={labelCls}>
                Details — {section.useBullets ? "one bullet per line" : "paragraph / summary"}
              </label>
              <textarea
                className={`${inputCls} resize-y min-h-[82px] leading-relaxed`}
                placeholder={section.useBullets ? "Each line becomes a bullet point..." : "Write a summary or paragraph..."}
                value={section.details}
                onChange={(e) => updateSection(section.id, "details", e.target.value)}
              />
            </div>

            {/* Bullet toggle */}
            <label className={`flex items-center gap-2 cursor-pointer text-[10px] tracking-[1.5px] uppercase font-mono select-none transition-colors ${section.useBullets ? "text-[#c8b99a]" : "text-white"}`}>
              <input
                type="checkbox"
                checked={section.useBullets}
                onChange={(e) => updateSection(section.id, "useBullets", e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer accent-[#c8b99a]"
              />
              Use bullet points
            </label>
          </div>
        ))}

        {/* Add Section */}
        <button
          onClick={addSection}
          className="w-full bg-transparent border border-dashed border-[#333] rounded-sm text-[#555] cursor-pointer py-2.5 text-[10px] font-mono tracking-[2px] uppercase flex items-center justify-center gap-2 mt-1 hover:border-[#c8b99a] hover:text-[#c8b99a] transition-colors"
        >
          <PlusIcon /> Add Section
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full border-none rounded-sm text-[#111] py-3 text-[10px] font-mono tracking-[3px] uppercase flex items-center justify-center gap-2 mt-4 font-bold transition-colors ${downloading ? "bg-[#666] cursor-not-allowed" : "bg-[#c8b99a] cursor-pointer hover:bg-[#b5a68a]"}`}
        >
          <DownloadIcon /> {downloading ? "Generating..." : "Download PDF"}
        </button>
      </aside>

      {/* ── PREVIEW ── */}
      <main className="flex-1 px-12 py-10 bg-[#e8e4de] overflow-y-auto box-border">
        <p className="text-[9px] tracking-[3px] uppercase text-[#999] font-mono text-center mb-4">
          Live Preview
        </p>
        <div className="max-w-[740px] mx-auto shadow-[0_6px_40px_rgba(0,0,0,0.14)]">
          <CVPreview cv={cv} />
        </div>
      </main>
    </div>
  );
}