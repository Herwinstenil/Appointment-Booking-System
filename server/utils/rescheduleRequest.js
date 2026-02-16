const RESCHEDULE_MARKER = '[[RESCHEDULE_REQUEST]]';

const normalizeNotes = (notes) => {
  if (notes === undefined || notes === null) return null;
  const value = String(notes).trim();
  return value || null;
};

const parseRescheduleRequestFromNotes = (notes) => {
  const normalized = normalizeNotes(notes);
  if (!normalized) {
    return { cleanNotes: null, rescheduleRequest: null };
  }

  const markerIndex = normalized.indexOf(RESCHEDULE_MARKER);
  if (markerIndex === -1) {
    return { cleanNotes: normalized, rescheduleRequest: null };
  }

  const cleanNotes = normalizeNotes(normalized.slice(0, markerIndex));
  const payload = normalized.slice(markerIndex + RESCHEDULE_MARKER.length).trim();
  if (!payload) {
    return { cleanNotes, rescheduleRequest: null };
  }

  try {
    const parsed = JSON.parse(payload);
    if (!parsed || typeof parsed !== 'object') {
      return { cleanNotes, rescheduleRequest: null };
    }
    return { cleanNotes, rescheduleRequest: parsed };
  } catch (error) {
    return { cleanNotes: normalized, rescheduleRequest: null };
  }
};

const composeNotesWithRescheduleRequest = (cleanNotes, rescheduleRequest) => {
  const normalizedNotes = normalizeNotes(cleanNotes);
  if (!rescheduleRequest) {
    return normalizedNotes;
  }

  const serialized = JSON.stringify(rescheduleRequest);
  if (!normalizedNotes) {
    return `${RESCHEDULE_MARKER}${serialized}`;
  }
  return `${normalizedNotes}\n${RESCHEDULE_MARKER}${serialized}`;
};

module.exports = {
  parseRescheduleRequestFromNotes,
  composeNotesWithRescheduleRequest
};
