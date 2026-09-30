"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { useApp } from "../state";

const ISSUE_CATEGORIES = ["Time Window", "Pickup", "Vehicle Incident", "Pre-12", "Others"] as const;

type Attachment = { src: string; file: File };

const readAsDataUrl = (file: File) =>
  new Promise<Attachment>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: String(reader.result), file });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * The body of both driver report screens: an optional category, what happened, and any
 * photos the driver takes. Starts with nothing attached — the screen used to seed two
 * sample images, which would have been submitted as if they were evidence.
 */
export function ReportForm({ kind }: { kind: "accident" | "issue" }) {
  const { submit, navigate } = useApp();
  const [category, setCategory] = useState<string>(ISSUE_CATEGORIES[1]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      setError("Tell us what happened before sending this report.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submit({
        kind,
        category: kind === "issue" ? category : undefined,
        description,
        photos: photos.map((photo) => photo.file),
      });
      navigate("overview");
    } catch {
      setError("The report did not send. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const addFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    const added = await Promise.all(files.map(readAsDataUrl));
    setPhotos((current) => [...current, ...added]);
    event.target.value = "";
  };

  return (
    <form className={`report-form ${kind}`} onSubmit={handleSubmit}>
      {kind === "issue" && (
        <fieldset>
          <legend>Category</legend>
          <div className="category-chips">
            {ISSUE_CATEGORIES.map((option) => (
              <button
                type="button"
                key={option}
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <label className="description-label">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what happened"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "report-error" : undefined}
        />
      </label>

      <div className="photo-section">
        <span className="field-label">Photos (optional)</span>
        <div className="photo-list">
          {photos.map((photo, index) => (
            <div className="photo-card" key={photo.src}>
              <img className="photo" src={photo.src} alt={photo.file.name} />
              <button
                type="button"
                className="remove-photo"
                aria-label={`Remove ${photo.file.name}`}
                onClick={() => setPhotos(photos.filter((_, position) => position !== index))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <input ref={fileInput} hidden type="file" accept="image/*" multiple onChange={addFiles} />
        <button className="attach" type="button" onClick={() => fileInput.current?.click()}>
          <Paperclip size={15} />
          Attach photos
        </button>
      </div>

      {error && <p id="report-error" role="alert">{error}</p>}

      <button className="submit" disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
    </form>
  );
}
