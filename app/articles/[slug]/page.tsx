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
    PushDemo
  };

  type ComponentName = keyof typeof AllClientComponents;

  const usedComponentNames = post.components as ComponentName[];

  const ClientComponents = Object.fromEntries(
    usedComponentNames.map((name) => [name, AllClientComponents[name]])
  );

  const contentWithTitle = `# ${post.title}\n\n${post.content}`;

  const { default: MDXContent } = await evaluate(contentWithTitle, {
    ...runtime,
    baseUrl: import.meta.url,
    rehypePlugins: [rehypeSectionize],
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-5xl py-6 lg:py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm flex gap-1 items-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </div>

        {post.coverImage && (
          <div className="relative w-full h-[300px] md:h-[450px] lg:h-[560px] mb-12 rounded-xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt="Cover Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <article>
          <MDXContent
            components={{
              ...ClientComponents,
              h1: ({ children }: { children: React.ReactNode }) => (
                <div>
                  <h1>{children}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.tags.length > 0 && (
                      <>
                        <span className="text-border">·</span>
                        {post.tags.map((tag) => (
                          <span key={tag} className="capitalize">{tag}</span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ),
            }}
          />
        </article>
      </main>
    </div>
  );
}
