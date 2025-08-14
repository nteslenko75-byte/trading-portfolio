import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function PostPage() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [post, setPost] = useState<any | null>(null);
  useEffect(() => { if (slug) fetch(`/api/posts?slug=${slug}`).then((r) => r.json()).then((j) => setPost(j.data?.[0] || null)); }, [slug]);
  if (!post) return null;
  return (
    <article className="prose prose-invert max-w-none">
      <h1>{post.title}</h1>
      <div className="text-neutral-400 text-sm mb-4">{new Date(post.published_at).toLocaleDateString()}</div>
      <ReactMarkdown>{post.content_md}</ReactMarkdown>
    </article>
  );
}
