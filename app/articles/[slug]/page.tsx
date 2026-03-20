import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getAllPosts, getPostBySlug } from "@/lib/articles";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { CodeGroup } from "@/components/mdx/code-group";
import { CodeBlock } from "@/components/mdx/code-block";
import { CodeSandpack } from "@/components/mdx/code-sandpack";
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
import rehypeSectionize from "@/lib/rehype-sectionize";
import CoverImageWithSkeleton from "@/components/blog/cover-image-with-skeleton";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
    PushDemo,
  };

  type ComponentName = keyof typeof AllClientComponents;

  const usedComponentNames = post.components as ComponentName[];

  const ClientComponents = Object.fromEntries(
    usedComponentNames.map((name) => [name, AllClientComponents[name]])
  );

  const contentWithTitle = `#\n\n${post.content}`;

  const { default: MDXContent } = await evaluate(contentWithTitle, {
    ...runtime,
    baseUrl: import.meta.url,
    rehypePlugins: [rehypeSectionize],
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-5xl py-6 lg:py-12">
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
                {post.author?.avatar && (
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border">
                    <Image
                      src={post.author.avatar}
                      alt={post.author?.name || "Author avatar"}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                )}

                <div className="flex flex-col">
                  {post.author?.name && (
                    <span className="text-sm font-medium text-foreground">
                      {post.author.name}
                    </span>
                  )}
                  <time
                    dateTime={post.date}
                    className="text-sm text-muted-foreground"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
              </div>
        </div>
                
        {(post.coverImage || post.videoImage) && (
          <CoverImageWithSkeleton
            src={post.coverImage}
            videoSrc={post.videoImage}
            alt={post.title}
          />
        )}

        <header className="mt-16 mb-8">
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="space-y-2 w-full flex flex-col items-center">
              <h1 className="text-3xl text-center font-semibold tracking-tight text-foreground sm:text-4xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="max-w-2xl text-base text-center leading-7 text-muted-foreground sm:text-lg">
                  {post.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center capitalize gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-sm text-foreground"
                      >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent
            components={{
              ...ClientComponents,
              h1: () => null,
            }}
          />
        </article>
      </main>
    </div>
  );
}