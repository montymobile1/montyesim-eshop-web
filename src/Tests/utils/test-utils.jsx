import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "@mui/material";
import { AuthProvider } from "../../core/context/AuthContext";
import { NotificationProvider } from "../../core/context/NotificationContext";
import { queryClient } from "../../core/apis/ReactQueryInstance";
import { store } from "../../redux/store";
import { appTheme } from "../../assets/theme";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });
// Custom render function that includes providers
const customRender = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <ThemeProvider theme={appTheme}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NotificationProvider>
                <BrowserRouter>{children}</BrowserRouter>
              </NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
