import { Analytics } from "@vercel/analytics/react";
import { useLocation, useRoutes } from "react-router-dom";

import { AccentPicker } from "./components/accent-picker";
import { routes } from "./routes";

export default function App() {
  const element = useRoutes(routes);
  const location = useLocation();
  const showAccentPicker = !location.pathname.startsWith("/slides/");

  return (
    <>
      {element}
      {showAccentPicker && <AccentPicker />}
      {import.meta.env.PROD && <Analytics />}
    </>
  );
}
