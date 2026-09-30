import { useEffect, useState } from 'react';

export default function ManagementNotes({ payeeId, onSave }: {
  payeeId: string; onSave: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  useEffect(() => { setNote(''); }, [payeeId]);

  return (
    <section className="notes">
      <label htmlFor="management-notes">MANANGEMENT NOTES</label>
      <textarea
        id="management-notes"
        value={note}
        onChange={event => setNote(event.target.value)}
        placeholder="Enter operational notes or clearance rationale..."
      />
      <button type="button" onClick={() => onSave(note)}>SAVE NOTE</button>
    </section>
  );
}
