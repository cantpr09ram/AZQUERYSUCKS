/// <reference types="vite/client" />

import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { createQueryClient } from "@/lib/query-client";
import appCss from "@/styles/app.css?url";

const BASE_URL = import.meta.env.BASE_URL;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AZQUERYSUCKS" },
      { name: "description", content: "AZQUERYSUCKS" },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://tkuitocc.github.io/AZQUERYSUCKS/",
      },
      { property: "og:title", content: "AZQUERYSUCKS" },
      { property: "og:description", content: "so I made one" },
      { property: "og:site_name", content: "AZQUERYSUCKS" },
      { property: "og:image", content: `${BASE_URL}og.svg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: `${BASE_URL}manifest.webmanifest` },
      { rel: "icon", href: `${BASE_URL}favicon.ico` },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
