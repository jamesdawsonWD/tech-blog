import { notFound } from "next/navigation";
import ReactDOM from "react-dom";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getAllPosts, getPostBySlug, shouldShowDrafts } from "@/lib/articles";
import Image from "next/image";
import dynamic from "next/dynamic";
import { formatDate, readingTime } from "@/lib/utils";
import { CodeGroup } from "@/components/mdx/code-group";
import { CodeBlock } from "@/components/mdx/code-block";
import { DictionaryCard } from "@/components/mdx/dictionary-card";
import { Quote, Definition } from "@/components/mdx/quote";
import Link from "next/link";
import { Clock } from "lucide-react";
import rehypeSectionize from "@/lib/rehype-sectionize";
import rehypeAssetHash from "@/lib/rehype-asset-hash";
import CoverMedia from "@/components/blog/cover-media";
import { Separator } from "@/components/ui/separator";
import avatarImg from "@/public/avatar.jpg";

const CodeSandpack = dynamic(() =>
  import("@/components/mdx/code-sandpack").then((m) => m.CodeSandpack),
);
const ConicGradient = dynamic(() =>
  import("@/components/raycast/conic-gradient/conic-gradient").then((m) => m.ConicGradient),
);
const ConicStatic = dynamic(() =>
  import("@/components/raycast/conic-static/conic-static").then((m) => m.ConicStatic),
);
const RaycastButton = dynamic(() =>
  import("@/components/raycast/button/raycast-button").then((m) => m.RaycastButton),
);
const LearningGoals = dynamic(() => import("@/components/mdx/learning-goals"));
const IpLookup = dynamic(() => import("@/components/understanding-how-the-web-works/ip-lookup"));
const UrlVisualizer = dynamic(() => import("@/components/understanding-how-the-web-works/url-visualizer"));
const CurrentVisitorIp = dynamic(() => import("@/components/understanding-how-the-web-works/current-visitor-ip"));
const CdnImage = dynamic(() => import("@/components/understanding-how-the-web-works/cdn-image"));
const IncludesDemo = dynamic(() => import("@/components/array-cheatsheet/includes"));
const PushDemo = dynamic(() => import("@/components/array-cheatsheet/push"));
const Captcha = dynamic(() => import("@/components/captcha/captcha"));
const RadialButtonDemo = dynamic(() => import("@/components/radial-button/radial-button-demo"));
const DemoFrame = dynamic(() => import("@/components/perf-tabs/demo-frame"));
const CmdKDemo = dynamic(() => import("@/components/cmd-k/cmd-k-demo"));
const TypeaheadDemo = dynamic(() => import("@/components/typeahead/typeahead-demo"));
const ScrollPong = dynamic(() => import("@/components/scroll-pong/scroll-pong"));

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts
    .filter((post) => shouldShowDrafts() || !post.draft)
    .map((post) => ({ slug: post.slug }));
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
  if (post.draft && !shouldShowDrafts()) notFound();

  if (post.coverImage) {
    ReactDOM.preload(post.coverImage, { as: "image", fetchPriority: "high" });
  }
  if (post.videoPoster) {
    ReactDOM.preload(post.videoPoster, { as: "image", fetchPriority: "high" });
  }
  if (post.videoImage) {
    ReactDOM.preload(post.videoImage, { as: "video", fetchPriority: "high" });
  }

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
    Captcha,
    RadialButtonDemo,
    DemoFrame,
    CmdKDemo,
    TypeaheadDemo,
    ScrollPong,
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
    rehypePlugins: [rehypeSectionize, rehypeAssetHash],
  });

  return (
    <div className="min-h-screen container max-w-3xl py-6 lg:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Articles
          </Link>
          <span aria-hidden className="text-muted-foreground/50">
            /
          </span>
          <span className="text-foreground/80">{post.title}</span>
        </nav>

        {/* Title */}
        <header className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {post.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-2">
            <span className="relative h-6 w-6 overflow-hidden rounded-full border border-border">
              <Image
                src={avatarImg}
                alt={post.author?.name || "Author avatar"}
                fill
                priority
                fetchPriority="high"
                unoptimized
                className="object-cover"
                sizes="24px"
              />
            </span>
            {post.author?.name && (
              <span className="text-sm font-medium text-foreground">
                {post.author.name}
              </span>
            )}
          </div>
        </header>

        {/* Meta */}
        <div className="mt-10 flex items-center justify-between py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {readingTime(post.content)} min read
          </span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <Separator className="mb-12" />

        {/* Cover */}
        {post.coverComponent && AllClientComponents[post.coverComponent as ComponentName]
          ? (() => {
              const CoverComponent = AllClientComponents[post.coverComponent as ComponentName];
              return (
                <div className="mb-12">
                  <CoverComponent />
                </div>
              );
            })()
          : (post.coverImage || post.videoImage) && (
              // Cover breaks out wider than the max-w-3xl reading column,
              // staying centred on the page; text keeps its width.
              <div className="relative left-1/2 -translate-x-1/2 w-[min(100vw-2rem,64rem)]">
                <CoverMedia
                  src={post.coverImage}
                  videoSrc={post.videoImage}
                  videoPoster={post.videoPoster}
                  alt={post.title}
                  slug={slug}
                />
              </div>
            )}

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent
            components={{
              ...ClientComponents,
              DictionaryCard,
              Quote,
              Definition,
              h1: () => null,
            }}
          />
        </article>

        {post.tags?.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-sm capitalize text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
    </div>
  );
}