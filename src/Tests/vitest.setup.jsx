import { vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom";

// Set up DOM element for React's createRoot
if (typeof document !== "undefined") {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
}
// Mock i18n.js to prevent initialization during tests
vi.mock("./../i18n", () => ({
  default: {
    language: "en",
    changeLanguage: vi.fn(),
  },
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key, // Simple mock: return the key itself
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));
// Mock the queryClient import from main.jsx to prevent circular dependency
vi.mock("./../main", () => {
  return {
    queryClient: {
      clear: vi.fn(),
    },
  };
});

// Mock Firebase messaging
vi.mock("../../firebaseconfig", () => {
  return {
    messaging: null,
    onMessageListener: vi.fn(),
    auth: {},
    googleProvider: {},
    signInWithPopup: vi.fn(),
    requestPermission: vi.fn(),
  };
});

// Mock deleteToken from firebase/messaging
vi.mock("firebase/messaging", () => {
  return {
    getMessaging: vi.fn(),
    getToken: vi.fn(),
    isSupported: vi.fn().mockReturnValue(false),
    onMessage: vi.fn(),
    deleteToken: vi.fn(),
  };
});

// Mock authAPI.jsx
vi.mock("./../core/apis/authAPI", () => {
  return {
    userLimitedLogin: vi.fn(),
    userLogin: vi.fn(),
    resendOrderOTP: vi.fn(),
    verifyOTP: vi.fn(),
    userLogout: vi.fn(),
    getUserInfo: vi.fn(),
    isUserLoggedIn: vi.fn(),
    refreshToken: vi.fn(),
    updateUserInfo: vi.fn(),
    deleteAccount: vi.fn(),
    supabaseSignout: vi.fn(),
  };
});

// Mock configurationsAPI.jsx
vi.mock("./../core/apis/configurationsAPI", () => {
  return {
    getConfigurations: vi.fn(),
    getActiveCurrencies: vi.fn().mockResolvedValue({
      data: {
        data: [
          { currency: "USD", name: "US Dollar" },
          { currency: "EUR", name: "Euro" },
        ],
      },
    }),
  };
});

vi.mock("./../core/supabase/SupabaseClient.jsx", () => {
  const mockSupabaseClient = {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: "mockUser" } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { user: { id: "mockUser" } },
        error: null,
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
    })),
  };

  return {
    default: mockSupabaseClient,
    createClient: vi.fn().mockReturnValue(mockSupabaseClient),
  };
});

// Mock firebase/app
vi.mock("firebase/app", () => {
  return {
    initializeApp: vi.fn(),
    getApp: vi.fn().mockReturnValue({}),
    getApps: vi.fn().mockReturnValue([{}]),
  };
});

// Mock firebase/auth and GoogleAuthProvider
vi.mock("firebase/auth", () => {
  return {
    getAuth: vi.fn().mockReturnValue({}),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(() => ({ providerId: "google.com" })),
  };
});

// Optionally mock other Firebase services (e.g., messaging)
vi.mock("firebase/messaging", () => {
  return {
    getMessaging: vi.fn(),
    getToken: vi.fn().mockResolvedValue("mock-token"),
    onMessage: vi.fn(),
    isSupported: vi.fn().mockResolvedValue(true),
  };
});
// // Mock react-lazy-load-image-component
vi.mock("react-lazy-load-image-component", () => ({
  LazyLoadImage: ({ src, alt, className, ...props }) =>
    React.createElement("img", { src, alt, className, ...props }),
}));
// Mock Swiper components
vi.mock("swiper/react", () => {
  const mockSwiperInstance = {
    slideTo: vi.fn(),
    slideNext: vi.fn(),
    slidePrev: vi.fn(),
    isBeginning: true,
    isEnd: false,
    activeIndex: 0,
  };

  return {
    Swiper: React.forwardRef(({ children, ...props }, ref) => {
      React.useEffect(() => {
        if (ref) {
          if (typeof ref === "function") {
            ref({ swiper: mockSwiperInstance });
          } else if (ref.current) {
            ref.current.swiper = mockSwiperInstance;
          }
        }
      }, [ref]);

      return (
        <div data-testid="swiper" {...props}>
          {children}
        </div>
      );
    }),
    SwiperSlide: ({ children }) => (
      <div data-testid="swiper-slide">{children}</div>
    ),
  };
});

vi.mock("swiper/modules", () => {
  return {
    Navigation: {},
    Pagination: {},
  };
});
