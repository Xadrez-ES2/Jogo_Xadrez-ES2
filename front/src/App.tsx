import { ThemeProvider } from "./stores/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./stores/AuthContext";

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
