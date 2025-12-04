//utilities
import { ThemeProvider } from "@mui/material";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import "swiper/css";
import App from "./App";
import { appTheme } from "./assets/theme";
import { AuthProvider } from "./core/context/AuthContext";
import { NotificationProvider } from "./core/context/NotificationContext";
import "./i18n";
import "./index.css";
import SuspenseLoading from "./pages/SuspenseLoading";
import { persistor, store } from "./redux/store";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 180000, // 3 minutes
      cacheTime: 180000, // 3 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const root = createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ThemeProvider theme={appTheme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<SuspenseLoading />}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </AuthProvider>
            </QueryClientProvider>
          </Suspense>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
