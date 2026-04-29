import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Rofane Website</h1>
      <p>Blog engine is available now.</p>
      <p>
        <Link href="/blog">Open public blog</Link>
      </p>
      <p>
        <Link href="/admin/blog">Open admin blog</Link>
      </p>
    </main>
  );
}
