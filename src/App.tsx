import { ThemeProvider } from "./stores/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
	return (
		<ThemeProvider>
			<AppRoutes />
		</ThemeProvider>
	);
}

export default App;
