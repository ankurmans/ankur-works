export function createVoiceTurnDetector({ speechLevel = 0.022, quietLevel = 0.014, minSpeechMs = 220, pauseMs = 1500 } = {}) {
  let startedAt = null;
  let lastSpeechAt = null;
  let heardSpeech = false;

  return {
    heardSpeech: () => heardSpeech,
    update(level, now) {
      if (level >= speechLevel) {
        if (startedAt === null) startedAt = now;
        lastSpeechAt = now;
        if (now - startedAt >= minSpeechMs) heardSpeech = true;
        return false;
      }
      if (!heardSpeech && level < quietLevel) startedAt = null;
      return heardSpeech && level < quietLevel && now - lastSpeechAt >= pauseMs;
    },
  };
}
