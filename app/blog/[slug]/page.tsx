import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getAllPosts, getPostBySlug } from "@/lib/articles";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { CodeGroup } from "@/components/mdx/code-group"; // adjust path as needed
import { CodeBlock } from "@/components/mdx/code-block"; // adjust path as needed
import { CodeSandpack } from "@/components/mdx/code-sandpack"; // adjust path as needed
import { ConicGradient } from "@/components/raycast/conic-gradient/conic-gradient";
import { ConicStatic } from "@/components/raycast/conic-static/conic-static";
import { RaycastButton } from "@/components/raycast/button/raycast-button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LearningGoals from "@/components/mdx/learning-goals";
import IpLookup from "@/components/understanding-how-the-web-works/ip-lookup";
import UrlVisualizer from "@/components/understanding-how-the-web-works/url-visualizer";
import CurrentVisitorIp from "@/components/understanding-how-the-web-works/current-visitor-ip";
import CdnImage from "@/components/understanding-how-the-web-works/cdn-image";
import IncludesDemo from "@/components/array-cheatsheet/includes";
import PushDemo from "@/components/array-cheatsheet/push";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | mwd`,
    description: post.description,
    tags: post.tags,
  };
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const AllClientComponents = {
    CodeGroup,
    CodeBlock,
    CodeSandpack,
    ConicGradient,
    ConicStatic,
    RaycastButton,
    LearningGoals,
    IpLookup,
    UrlVisualizer,
    CurrentVisitorIp,
    CdnImage,
    IncludesDemo,
    PushDemo
  };

  type ComponentName = keyof typeof AllClientComponents;

  const usedComponentNames = post.components as ComponentName[];

  const ClientComponents = Object.fromEntries(
    usedComponentNames.map((name) => [name, AllClientComponents[name]])
  );

  // const supabase = createServerSupabaseClient();
  // const [{ data: viewsData }, { count: likes }] = await Promise.all([
  //   supabase.from("posts").select("views").eq("slug", params.slug).single(),
  //   supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_slug", params.slug),
  // ]);

  // post.views = viewsData?.views || 0;
  // post.likes = likes || 0;

  // Evaluate MDX string to a component
  const { default: MDXContent, ...exports } = await evaluate(post.content, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl py-6 lg:py-12">
        <div className="flex w-full justify-between items-center">
          <Link href="/" className="text-sm flex gap-1 items-center">
            <ChevronLeft className="size-4" />
            Back
          </Link>
          <Badge variant="secondary">
            <div className="flex items-center gap-1.5">
              <Image
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>{post.author.name}</span>
            </div>
          </Badge>
        </div>

        <h1 className="text-3xl font-bold mt-2 mb-8 tracking-tight text-center md:text-left sm:text-3xl">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="relative w-full h-[300px] md:h-[500px] lg:h-[700px] mb-4 rounded-xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt="Cover Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex mb-8 flex-wrap justify-between w-full  gap-y-2 gap-x-4 text-sm text-slate-800">
          <Badge variant="secondary">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </Badge>
          <div className="space-x-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mb-8 sticky right-0 flex items-center justify-between">
      
        </div>

        <article className="prose prose-stone dark:prose-invert mx-auto max-w-3xl">
          <MDXContent components={ClientComponents} />
        </article>
      </main>
    </div>
  );
}
