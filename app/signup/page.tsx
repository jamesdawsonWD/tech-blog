"use client";

import Image from "next/image";
import avatarImg from "@/public/avatar.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
  email: z.string().email({ message: "Please enter a valid email" }),
});

async function subscribeToEmailList({
  email,
  firstName,
  lastName = "",
}: {
  email: string;
  firstName: string;
  lastName?: string;
}) {
  const res = await fetch("/api/email/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, lastName }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Unknown error");
  }

  return data;
}

export default function SignupPage() {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(null);

    try {
      await subscribeToEmailList({
        email: values.email,
        firstName: values.name,
      });
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      console.error("Subscription error:", error);
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 md:py-12">
        <div className="flex flex-col items-center gap-4 md:gap-8">
          <div className="flex flex-col items-center max-w-[900px]">
            <h1 className="relative text-center text-5xl font-bold leading-[1.05] tracking-tight delay-50 sm:text-8xl sm:leading-none text-foreground">
              Build <i>beautiful</i> websites{" "}
              <span className="relative inline-block font-extrabold before:content-[''] before:absolute before:inset-x-0 before:-bottom-0 before:h-8 before:w-full before:bg-lime-300 before:-z-10 z-10">
                today
              </span>
              .
            </h1>

            <p className="mt-20 text-center max-w-md">
              Hey! James here{" "}
              <span className="inline-block align-middle">
                <Image
                  src={avatarImg}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                  aria-hidden
                />
              </span>
              . Join our <strong>free newsletter</strong> and get access to our
              free <strong>tutorials every Monday</strong> morning. Just in time
              for coffee ☕.
            </p>

            {/* ✅ Shadcn Form starts here */}
            {success ? (
              <div
                role="status"
                aria-live="polite"
                className="pt-10 w-full max-w-md text-center"
              >
                <p className="text-xl font-semibold text-foreground">
                  You&apos;re in! 🎉
                </p>
                <p className="mt-2 text-muted-foreground">
                  Check your inbox to confirm your subscription. See you Monday
                  morning ☕.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="pt-10 w-full max-w-md flex flex-col space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" autoFocus {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex flex-col items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative transition-all min-w-96"
                    >
                      <AnimatePresence initial={false}>
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Spinner />
                          </motion.div>
                        ) : (
                          <motion.span
                            key="text"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            Join the newsletter
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>

                    <div role="status" aria-live="polite">
                      {isLoading && (
                        <p className="text-sm text-muted-foreground">
                          Signing you up…
                        </p>
                      )}
                      {errorMessage && (
                        <p className="text-sm text-destructive">
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            )}
            {/* ✅ Shadcn Form ends here */}
          </div>
        </div>
      </main>
    </div>
  );
}

const Spinner = () => (
  <motion.div
    key="spinner"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin"
  />
);
