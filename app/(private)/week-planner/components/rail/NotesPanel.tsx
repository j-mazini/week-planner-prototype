"use client";

import { useState } from "react";
import type { NoteModel } from "../../types";

interface NotesPanelProps {
  notes: NoteModel[];
  onAddNote: () => void;
  onAcknowledge: (noteId: string) => void;
}

export default function NotesPanel({ notes, onAddNote, onAcknowledge }: NotesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="notes">
      <div className="noteshd">
        <span style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--line-rail)", paddingRight: 9 }}>
          <span className="dot" />
          <span className="noteslbl">NOTES</span>
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button type="button" className="mini solid" onClick={onAddNote}>+ NOVA NOTA</button>
          <button type="button" className="mini" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "RECOLHER" : "EXPANDIR"}
          </button>
        </span>
      </div>
      {expanded && (
        <div className="noteslist">
          {notes.map((note) => (
            <article key={note.id} className={`note ${note.severity.toLowerCase()}`}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                <span className={`sev ${note.severity.toLowerCase()}`}>{note.severity}</span>
                <div style={{ minWidth: 0 }}>
                  <p className="notebody">{note.body}</p>
                  <span className="notemeta">{note.body.length} CHARS</span>
                </div>
              </div>
              <button type="button" className="mini" onClick={() => onAcknowledge(note.id)}>
                {note.acknowledged ? "SALVO" : "EDITAR"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
