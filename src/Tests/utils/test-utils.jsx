import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "../../core/context/AuthContext";
import { NotificationProvider } from "../../core/context/NotificationContext";
import { queryClient } from "../../core/apis/ReactQueryInstance";
import { store } from "../../redux/store";

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
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
