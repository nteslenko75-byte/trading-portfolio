import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function BlogIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => { fetch("/api/posts").then((r) => r.json()).then((j) => setPosts(j.data || [])); }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Блог</h2>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="card p-4">
            <Link href={`/blog/${p.slug}`} className="text-base font-medium hover:underline">{p.title}</Link>
            <div className="text-neutral-400 text-sm">{new Date(p.published_at).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```tsx
import Link from "next/link";

export default function BlogIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => { fetch("/api/posts").then((r) => r.json()).then((j) => setPosts(j.data || [])); }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Блог</h2>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="card p-4">
            <Link href={`/blog/${p.slug}`} className="text-base font-medium hover:underline">{p.title}</Link>
            <div className="text-neutral-400 text-sm">{new Date(p.published_at).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
