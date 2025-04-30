"use client"

import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "content/posts")

export interface Author {
  name: string
  avatar: string
}

export interface Comment {
  id: string
  author: Author
  content: string
  createdAt: string
}

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  content: string
  author: Author
  coverImage?: string
  views: number
  likes: number
  comments: number
  commentData?: Comment[]
}

export async function getAllPosts(): Promise<Omit<Post, "content" | "commentData">[]> {
  try {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      return getSamplePosts()
    }

    const fileNames = fs.readdirSync(postsDirectory)

    const posts = fileNames.map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "")
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")

      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        coverImage: data.coverImage,
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
      }
    })

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    return getSamplePosts()
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return getSamplePost(slug)
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")

    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      content,
      author: data.author,
      coverImage: data.coverImage,
      views: data.views || 0,
      likes: data.likes || 0,
      comments: data.comments || 0,
      commentData: data.commentData || [],
    }
  } catch (error) {
    return getSamplePost(slug)
  }
}

function getSamplePosts() {
  return [
    {
      slug: "getting-started-with-react",
      title: "Getting Started with React",
      description: "Learn the basics of React and how to build your first component.",
      date: "2023-04-18",
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      views: 1243,
      likes: 89,
      comments: 12,
    },
    {
      slug: "using-hooks-in-react",
      title: "Using Hooks in React",
      description: "Learn how to use React Hooks to manage state and side effects in functional components.",
      date: "2023-04-25",
      author: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      views: 982,
      likes: 67,
      comments: 8,
    },
    {
      slug: "building-a-blog-with-nextjs",
      title: "Building a Blog with Next.js",
      description: "Learn how to build a blog using Next.js, MDX, and Tailwind CSS.",
      date: "2023-05-02",
      author: {
        name: "Alex Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      views: 756,
      likes: 45,
      comments: 5,
    },
  ]
}

function getSamplePost(slug: string): Post | null {
  if (slug === "getting-started-with-react") {
    return {
      slug,
      title: "Getting Started with React",
      description: "Learn the basics of React and how to build your first component.",
      date: "2023-04-18",
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      content: `
# Getting Started with React

React is a JavaScript library for building user interfaces. It's declarative, efficient, and flexible.

## Creating Your First Component

Let's create a simple React component:

\`\`\`jsx
import React from 'react';

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

export default function App() {
  return (
    <div className="App">
      <HelloWorld />
    </div>
  );
}
\`\`\`

## Using Props

Props allow you to pass data to components:

\`\`\`jsx
import React from 'react';

function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

export default function App() {
  return (
    <div className="App">
      <Greeting name="React Developer" />
    </div>
  );
}
\`\`\`

## Managing State

State allows components to manage their own data:

\`\`\`jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}
\`\`\`
      `,
      views: 1243,
      likes: 89,
      comments: 12,
      commentData: [
        {
          id: "1",
          author: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "This was really helpful for getting started with React. Thanks for the clear explanations!",
          createdAt: "2023-04-19T14:23:00Z",
        },
        {
          id: "2",
          author: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "I've been struggling with understanding React components, but this made it so much clearer.",
          createdAt: "2023-04-20T09:15:00Z",
        },
      ],
    }
  }

  if (slug === "using-hooks-in-react") {
    return {
      slug,
      title: "Using Hooks in React",
      description: "Learn how to use React Hooks to manage state and side effects in functional components.",
      date: "2023-04-25",
      author: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      content: `
# Using Hooks in React

React Hooks let you use state and other React features without writing a class.

## useState Hook

The useState hook lets you add state to functional components:

\`\`\`jsx
import React, { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Hello, {name || 'stranger'}!</p>
    </div>
  );
}
\`\`\`

## useEffect Hook

The useEffect hook lets you perform side effects in functional components:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useContext Hook

The useContext hook lets you subscribe to React context without introducing nesting:

\`\`\`jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#333' }}>
      I am styled by theme context!
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <div>
        <ThemedButton />
        <br />
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Toggle theme
        </button>
      </div>
    </ThemeContext.Provider>
  );
}
\`\`\`
      `,
      views: 982,
      likes: 67,
      comments: 8,
      commentData: [
        {
          id: "1",
          author: {
            name: "Alex Thompson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "The useContext example really helped me understand how to implement theming in my app!",
          createdAt: "2023-04-26T10:45:00Z",
        },
        {
          id: "2",
          author: {
            name: "Samantha Lee",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content:
            "I've been using class components for years, but this article convinced me to try hooks. So much cleaner!",
          createdAt: "2023-04-27T15:30:00Z",
        },
      ],
    }
  }

  if (slug === "building-a-blog-with-nextjs") {
    return {
      slug,
      title: "Building a Blog with Next.js",
      description: "Learn how to build a blog using Next.js, MDX, and Tailwind CSS.",
      date: "2023-05-02",
      author: {
        name: "Alex Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      coverImage: "/placeholder.svg?height=600&width=1200",
      content: `
# Building a Blog with Next.js

Next.js is a React framework that enables server-side rendering and static site generation.

## Setting Up a Next.js Project

First, let's create a new Next.js project:

\`\`\`bash
npx create-next-app my-blog
cd my-blog
\`\`\`

## Adding MDX Support

MDX allows you to use JSX in your markdown content. First, install the required packages:

\`\`\`bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
\`\`\`

Then, update your \`next.config.js\` file:

\`\`\`javascript
const withMDX = require('@next/mdx')({
  extension: /\\.mdx?$/,
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
});
\`\`\`

## Styling with Tailwind CSS

Tailwind CSS is a utility-first CSS framework. Let's add it to our project:

\`\`\`bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`
      `,
      views: 756,
      likes: 45,
      comments: 5,
      commentData: [
        {
          id: "1",
          author: {
            name: "Emily Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "I followed this tutorial and got my blog up and running in just a few hours. Thanks!",
          createdAt: "2023-05-03T11:20:00Z",
        },
        {
          id: "2",
          author: {
            name: "David Wilson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "The Tailwind integration part was especially helpful. I was struggling with that before.",
          createdAt: "2023-05-04T09:15:00Z",
        },
      ],
    }
  }

  return null
}
