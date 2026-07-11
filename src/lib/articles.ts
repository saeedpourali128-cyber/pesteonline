import { supabase } from "@/lib/supabase";

export type ArticleContentType = "article" | "news" | "analysis";
export type ArticleStatus = "draft" | "published";

export interface ArticleRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  content_type: ArticleContentType;
  status: ArticleStatus;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  is_indexable: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ARTICLE_SELECT =
  "id,title,slug,excerpt,content,cover_image,content_type,status,meta_title,meta_description,canonical_url,is_indexable,published_at,created_at,updated_at";

export async function getPublishedArticles(
  contentTypes: ArticleContentType[],
): Promise<ArticleRecord[]> {
  const { data, error } = await supabase
    .from("admin_articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .in("content_type", contentTypes)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ArticleRecord[];
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<ArticleRecord | null> {
  const { data, error } = await supabase
    .from("admin_articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return (data as ArticleRecord | null) ?? null;
}

export function formatPersianDate(value?: string | null) {
  if (!value) return "تاریخ انتشار ثبت نشده";

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function articleTypeLabel(type: ArticleContentType) {
  if (type === "news") return "خبر";
  if (type === "analysis") return "تحلیل بازار";
  return "مقاله";
}
