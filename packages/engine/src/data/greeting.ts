/** Time-of-day home greeting. Name is optional so Home never looks empty. */
export function homeGreeting(firstName?: string, now: Date = new Date()): string {
  const hour = now.getHours();
  const hello =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = firstName?.trim();
  return name ? `${hello}, ${name}.` : `${hello}.`;
}
