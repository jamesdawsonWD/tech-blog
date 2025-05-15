"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConsoleWrapper from "../console-wrapper";
import UrlVisualizer from "./url-visualizer";

const formSchema = z.object({
  url: z
    .string()
    .url({ message: "Please enter a valid URL (including https://)" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function IpLookup() {
  const [ip, setIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedUrl, setParsedUrl] = useState<{
    protocol: string;
    host: string;
    path: string;
    search: string;
    url: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setIp(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: values.url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIp(data.ip);

      const url = new URL(values.url);
      setParsedUrl({
        protocol: url.protocol.replace(":", ""),
        host: url.hostname,
        path: url.pathname || "/",
        search: url.search,
        url: url.toString(),
      });
    } catch (err: any) {
      setError(err.message);
      setParsedUrl(null);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-6 my-12">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="items-center justify-center flex gap-2"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="min-w-80"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="soft" className="min-w-40">
              Get details
            </Button>
          </form>
        </Form>
      </div>

      {(ip || form.formState.isSubmitting) && (
        <ConsoleWrapper className="px-6">
          {form.formState.isSubmitting && (
            <div className="font-mono  text-white animate-pulse">
              <p>Fetching IP address...</p>
            </div>
          )}
          {ip && (
            <div className="font-mono  text-green-400 animate-fade-in-up">
              <p>
                {parsedUrl?.host} → <strong>{ip}</strong>
              </p>
            </div>
          )}

          {error && (
            <div className="font-mono  text-red-400 animate-fade-in-up">
              <p>❌ Error: {error}</p>
            </div>
          )}
        </ConsoleWrapper>
      )}
    </>
  );
}
