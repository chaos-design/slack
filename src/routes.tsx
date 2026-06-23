import type { RouteObject } from "react-router-dom";

import { RootLayout } from "./components/layout/root-layout";
import { AboutPage } from "./pages/about";
import { HomePage } from "./pages/home";
import { LearnPage } from "./pages/learn";
import { NotFoundPage } from "./pages/not-found";
import { SlidesPage } from "./pages/slides";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  // 全屏页面：无统一 header / footer / 菜单
  { path: "/learn", element: <LearnPage /> },
  { path: "/learn/:id", element: <LearnPage /> },
  { path: "/slides/:id", element: <SlidesPage /> },
  { path: "/slides/:id/:slug", element: <SlidesPage /> },
];
