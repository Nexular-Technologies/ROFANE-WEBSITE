import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const blogStatusSchema = z.enum(["draft", "published"]);

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value ? value : undefined));

const publishedAtSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: "Invalid published_at value",
  });

const previewImageSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
    "preview_image_url must be an absolute URL or a relative path starting with /"
  );

const baseBlogPostSchema = z.object({
  title: z.string().trim().min(1).max(255),
  excerpt: z.string().trim().min(1).max(320),
  content: z.string().trim().min(1),
  preview_image_url: previewImageSchema,
  categories: z.string().trim().max(500).default(""),
  keywords: z.string().trim().min(1).max(500),
  author: z.string().trim().min(1).max(120),
  status: blogStatusSchema.default("draft"),
  reading_minutes: z.coerce.number().int().min(1).max(120),
  seo_title: optionalTrimmedString(255),
  seo_description: optionalTrimmedString(320),
  seo_keywords: optionalTrimmedString(500),
  canonical_url: z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export const blogPostCreateSchema = baseBlogPostSchema
  .extend({
    slug: z.string().trim().min(1).max(160).optional(),
    published_at: publishedAtSchema.optional(),
    reading_minutes: z.coerce.number().int().min(1).max(120).default(5),
  })
  .transform(({ slug, title, ...rest }) => ({
    ...rest,
    title,
    slug: toBlogSlug(slug || title),
  }));

export const blogPostUpdateSchema = baseBlogPostSchema
  .partial()
  .extend({
    slug: z.string().trim().min(1).max(160).optional(),
    published_at: publishedAtSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one field to update",
      });
    }
  })
  .transform((value) => ({
    ...value,
    ...(value.slug ? { slug: toBlogSlug(value.slug) } : {}),
  }));

export const blogPostListSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  preview_image_url: true,
  categories: true,
  keywords: true,
  author: true,
  reading_minutes: true,
  published_at: true,
} as const;

export const blogPostDetailSelect = {
  ...blogPostListSelect,
  content: true,
  seo_title: true,
  seo_description: true,
  seo_keywords: true,
  canonical_url: true,
} as const;

export const adminBlogPostSelect = {
  ...blogPostDetailSelect,
  status: true,
} as const;

export function toBlogSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** Constant-time comparison so the token can't be guessed by timing. */
function tokenMatches(candidate: string | undefined, expected: string) {
  if (!candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAdminAuthorized(request: Request) {
  const configuredToken = process.env.BLOG_ADMIN_TOKEN?.trim();
  // Fail closed: with no token configured, nobody is an admin.
  if (!configuredToken) {
    console.error("BLOG_ADMIN_TOKEN is not set - refusing all admin requests.");
    return false;
  }

  const auth = request.headers.get("authorization")?.trim();
  const xToken = request.headers.get("x-admin-token")?.trim();
  const bearerToken = auth?.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : undefined;

  return tokenMatches(bearerToken, configuredToken) || tokenMatches(xToken, configuredToken);
}

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
