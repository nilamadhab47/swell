export async function transcribeAudio(_audioKey: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return '[stub transcript — set ELEVENLABS_API_KEY]';
  }

  // TODO: fetch audio from R2 and call ElevenLabs Scribe
  return '[transcription pending — wire ElevenLabs Scribe]';
}
