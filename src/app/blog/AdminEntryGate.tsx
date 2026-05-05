"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminEntryGate() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!keyword.trim()) {
      setError("Enter keyword");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        setError("Invalid keyword");
        return;
      }

      router.push("/admin/blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <form onSubmit={onSubmit} className="row">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search or admin keyword"
          aria-label="Admin entry keyword"
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Checking..." : "Go"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
