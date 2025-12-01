import React from "react";

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title: string;
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("../App").then((m) => ({ default: m.default })),
    title: "Statstify",
  },
  {
    path: "/callback",
    component: () =>
      import("../pages/CallbackPage").then((m) => ({ default: m.default })),
    title: "Authenticating",
  },
];

export const getCurrentRoute = (pathname: string): RouteConfig | null => {
  return routes.find((route) => route.path === pathname) || null;
};
