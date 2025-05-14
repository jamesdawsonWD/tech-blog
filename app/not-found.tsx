// app/not-found.tsx
import Image from "next/image";
import { ArrowRightIcon, File, MailIcon, Scroll } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <main className="container relative py-6 md:py-12">
      <div className="absolute inset-0 top-0 justify-center items-end z-0 pointer-events-none">
        <h1 className="text-[40vw] lg:text-[30vw] text-center font-extrabold text-[#dfe2d9] leading-none opacity-20 select-none">
          404
        </h1>
      </div>
      <div className="flex flex-col items-center gap-4 md:gap-8">
        <div className="flex flex-col items-center max-w-[900px] relative">
          <h1 className="relative capitalize text-center text-5xl font-bold leading-[1.05] tracking-tight delay-50 sm:text-8xl sm:leading-none text-foreground">
            page not{" "}
            <span className="relative inline-block font-extrabold before:content-[''] before:absolute before:inset-x-0 before:-bottom-0 before:h-8 before:w-full before:bg-lime-300 before:-z-10 z-10">
              found
            </span>
          </h1>

          <p className="mt-20 text-center max-w-md">
            Hey there{" "}
            <span className="inline-block align-middle">
              <Image
                src="https://pbs.twimg.com/profile_images/1916819575359811584/l-_oX6su_400x400.jpg"
                alt="James's profile picture"
                width={24}
                height={24}
                className="rounded-full"
                aria-hidden
              />
            </span>
            . Looks like you took a wrong turn. But no worries —
            <strong> I’ll guide you back to good code</strong>.
          </p>

          <div className="pt-8 flex flex-col items-center justify-center space-y-6 delay-700 sm:flex-row sm:space-x-7 sm:space-y-0">
            <LinkButton href="/signup">
              <div className="ease absolute left-5 translate-x-0 opacity-100 transition duration-300 group-hover:-translate-x-full group-hover:scale-x-50 group-hover:opacity-0 group-hover:blur-sm">
                <File className="h-6 w-6 stroke-current text-background" />
              </div>
              <div className="ease translate-x-0 transition duration-300 group-hover:-translate-x-8">
                Latest article
              </div>
              <div className="ease absolute right-5 translate-x-full scale-x-50 opacity-0 blur-sm transition duration-300 group-hover:translate-x-0 group-hover:scale-x-100 group-hover:opacity-100 group-hover:blur-none">
                <ArrowRightIcon className="h-6 w-6 stroke-current text-background" />
              </div>
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}
