import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./interface/globals.css";
import App from "./interface/App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
