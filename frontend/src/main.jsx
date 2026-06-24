import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-beautiful-color/dist/react-beautiful-color.css";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />

    {/* 👇 Esto es lo que te abre el panel de requests */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);