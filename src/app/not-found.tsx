import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="page-section">
      <span className="eyebrow">A SMALL WRONG TURN</span>
      <h1>
        This path leads
        <br />
        <em>back home.</em>
      </h1>
      <p>The village is waiting.</p>
      <Link href="/village/" className="gold-button">
        Return to the village →
      </Link>
    </main>
  );
}
