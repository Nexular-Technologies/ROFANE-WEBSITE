"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("../../../components/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", minHeight: "260px" }} /> }
);

type BlogStatus = "draft" | "published";

type AdminPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  preview_image_url: string;
  categories: string;
  keywords: string;
  author: string;
  status: BlogStatus;
  reading_minutes: number;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  canonical_url: string | null;
};

type BlogFormState = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  preview_image_url: string;
  categories: string;
  keywords: string;
  author: string;
  status: BlogStatus;
  reading_minutes: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
};

const EMPTY_FORM: BlogFormState = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  preview_image_url: "",
  categories: "",
  keywords: "",
  author: "",
  status: "draft",
  reading_minutes: "5",
  published_at: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
};

function getAdminHeaders(token: string, includeJson = true) {
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token.trim() ? { "x-admin-token": token.trim() } : {}),
  };
}

export default function AdminBlogPage() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [formState, setFormState] = useState<BlogFormState>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.slug === selectedSlug) ?? null,
    [posts, selectedSlug]
  );

  const loadPosts = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/blog/posts", {
        headers: getAdminHeaders(token, false),
        cache: "no-store",
      });

      if (!response.ok) {
        setPosts([]);
        setSelectedSlug(null);
        setMessage(response.status === 401 ? "Unauthorized" : "Failed to load posts");
        return;
      }

      const data = (await response.json()) as { posts: AdminPost[] };
      setPosts(data.posts);
      if (data.posts.length && !selectedSlug) {
        setSelectedSlug(data.posts[0].slug);
      }
    } catch {
      setMessage("Network error while loading posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  useEffect(() => {
    if (!selectedPost) return;

    setFormState({
      slug: selectedPost.slug,
      title: selectedPost.title,
      excerpt: selectedPost.excerpt,
      content: selectedPost.content,
      preview_image_url: selectedPost.preview_image_url,
      categories: selectedPost.categories,
      keywords: selectedPost.keywords,
      author: selectedPost.author,
      status: selectedPost.status,
      reading_minutes: String(selectedPost.reading_minutes),
      published_at: selectedPost.published_at.slice(0, 16),
      seo_title: selectedPost.seo_title ?? "",
      seo_description: selectedPost.seo_description ?? "",
      seo_keywords: selectedPost.seo_keywords ?? "",
      canonical_url: selectedPost.canonical_url ?? "",
    });
  }, [selectedPost]);

  const onFieldChange =
    (field: keyof BlogFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const onContentChange = (html: string) => {
    setFormState((prev) => ({ ...prev, content: html }));
  };

  const serializePayload = () => ({
    ...(formState.slug.trim() ? { slug: formState.slug.trim() } : {}),
    title: formState.title,
    excerpt: formState.excerpt,
    content: formState.content,
    preview_image_url: formState.preview_image_url.trim(),
    categories: formState.categories,
    keywords: formState.keywords,
    author: formState.author,
    status: formState.status,
    reading_minutes: Number(formState.reading_minutes),
    published_at: formState.published_at ? new Date(formState.published_at).toISOString() : undefined,
    seo_title: formState.seo_title,
    seo_description: formState.seo_description,
    seo_keywords: formState.seo_keywords,
    canonical_url: formState.canonical_url,
  });

  const createPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: getAdminHeaders(token),
        body: JSON.stringify(serializePayload()),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          issues?: Array<{ path?: string; message: string }>;
        };
        const firstIssue = data.issues?.[0];
        setMessage(firstIssue?.message ?? data.error ?? "Create failed");
        return;
      }

      setFormState(EMPTY_FORM);
      await loadPosts();
      setMessage("Post created");
    } catch {
      setMessage("Network error while creating post");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePost = async () => {
    if (!selectedSlug) {
      setMessage("Select a post first");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/blog/posts/${selectedSlug}`, {
        method: "PUT",
        headers: getAdminHeaders(token),
        body: JSON.stringify(serializePayload()),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          issues?: Array<{ path?: string; message: string }>;
        };
        const firstIssue = data.issues?.[0];
        setMessage(firstIssue?.message ?? data.error ?? "Update failed");
        return;
      }

      await loadPosts();
      setMessage("Post updated");
    } catch {
      setMessage("Network error while updating post");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async () => {
    if (!selectedSlug) {
      setMessage("Select a post first");
      return;
    }

    const confirmed = window.confirm(`Delete post ${selectedSlug}?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/blog/posts/${selectedSlug}`, {
        method: "DELETE",
        headers: getAdminHeaders(token, false),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error ?? "Delete failed");
        return;
      }

      setSelectedSlug(null);
      setFormState(EMPTY_FORM);
      await loadPosts();
      setMessage("Post deleted");
    } catch {
      setMessage("Network error while deleting post");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async () => {
    if (!uploadFile) {
      setMessage("Select an image file first");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const body = new FormData();
      body.append("file", uploadFile);

      const response = await fetch("/api/admin/blog/upload", {
        method: "POST",
        headers: getAdminHeaders(token, false),
        body,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setMessage(data.error ?? "Upload failed");
        return;
      }

      setFormState((prev) => ({ ...prev, preview_image_url: data.url ?? prev.preview_image_url }));
      setMessage("Image uploaded");
    } catch {
      setMessage("Network error while uploading image");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main>
      <h1>Admin Blog</h1>
      <p>Use the token from BLOG_ADMIN_TOKEN to manage posts.</p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="row">
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Admin token"
          />
          <button type="button" onClick={() => void loadPosts()} disabled={isLoading}>
            {isLoading ? "Loading..." : "Reload posts"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2>Existing posts</h2>
        <div className="row">
          <select
            value={selectedSlug ?? ""}
            onChange={(event) => setSelectedSlug(event.target.value || null)}
          >
            <option value="">Select post</option>
            {posts.map((post) => (
              <option key={post.id} value={post.slug}>
                {post.slug} ({post.status})
              </option>
            ))}
          </select>
          <button type="button" className="secondary" onClick={updatePost} disabled={isSaving}>
            Update selected
          </button>
          <button type="button" className="danger" onClick={deletePost} disabled={isSaving}>
            Delete selected
          </button>
        </div>
      </div>

      <form className="card grid" onSubmit={createPost}>
        <h2>Create or edit</h2>
        <input placeholder="Slug (optional on create)" value={formState.slug} onChange={onFieldChange("slug")} />
        <input placeholder="Title" value={formState.title} onChange={onFieldChange("title")} required />
        <input placeholder="Excerpt" value={formState.excerpt} onChange={onFieldChange("excerpt")} required />
        <RichTextEditor value={formState.content} onChange={onContentChange} />
        <input
          placeholder="Preview image URL"
          value={formState.preview_image_url}
          onChange={onFieldChange("preview_image_url")}
          required
        />
        <div className="row">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
          />
          <button type="button" className="secondary" onClick={uploadImage} disabled={isSaving}>
            Upload image
          </button>
        </div>
        <input placeholder="Categories (comma separated)" value={formState.categories} onChange={onFieldChange("categories")} />
        <input placeholder="Keywords (comma separated)" value={formState.keywords} onChange={onFieldChange("keywords")} required />
        <input placeholder="Author" value={formState.author} onChange={onFieldChange("author")} required />
        <div className="row">
          <select value={formState.status} onChange={onFieldChange("status")}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
          <input
            type="number"
            min={1}
            max={120}
            placeholder="Reading minutes"
            value={formState.reading_minutes}
            onChange={onFieldChange("reading_minutes")}
          />
          <input
            type="datetime-local"
            value={formState.published_at}
            onChange={onFieldChange("published_at")}
          />
        </div>
        <input placeholder="SEO title" value={formState.seo_title} onChange={onFieldChange("seo_title")} />
        <input
          placeholder="SEO description"
          value={formState.seo_description}
          onChange={onFieldChange("seo_description")}
        />
        <input placeholder="SEO keywords" value={formState.seo_keywords} onChange={onFieldChange("seo_keywords")} />
        <input
          placeholder="Canonical URL"
          value={formState.canonical_url}
          onChange={onFieldChange("canonical_url")}
        />
        <div className="row">
          <button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Create new post"}
          </button>
        </div>
      </form>

      {message ? <p>{message}</p> : null}
    </main>
  );
}
