import React from "react";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AirplanemodeActiveOutlinedIcon from "@mui/icons-material/AirplanemodeActiveOutlined";

const isSupportPromo = import.meta.env.VITE_SUPPORT_PROMO == "true";

export const menuItems = [
  { path: "/plans", label: "plans" },
  { path: "/how-it-works", label: "howItWorks" },
  { path: "/about-us", label: "aboutUs" },
  { path: "/contact-us", label: "contactUs" },
];

export const authMenuItems = [
  { path: "/esim", label: "myEsim", visible: true },
  { path: "/orders", label: "ordersHistory", visible: true },
  { path: "/my-wallet", label: "myWallet", visible: isSupportPromo },
];

export const authResponsiveMenuItems = [
  { path: "/profile", label: "accountInfo", visible: true },
  { path: "/esim", label: "myEsim", visible: true },
  { path: "/orders", label: "ordersHistory", visible: true },
  { path: "/my-wallet", label: "myWallet", visible: isSupportPromo },
];

export const benefits = [
  {
    icon: <CheckCircleOutlineOutlinedIcon sx={{ color: "white" }} />,
    bg: "bg-warning",
    title: "easyToAcquire",
    description: "easyToAcquireDesc",
  },
  {
    icon: <AirplanemodeActiveOutlinedIcon sx={{ color: "white" }} />,
    bg: "bg-secondary",
    title: "travelHassleFree",
    description: "travelHassleFreeDesc",
  },
  {
    icon: <MonetizationOnOutlinedIcon sx={{ color: "white" }} />,
    bg: "bg-primary-300",
    title: "aMoneySaver",
    description: "aMoneySaverDesc",
  },
  {
    icon: <PublicOutlinedIcon sx={{ color: "white" }} />,
    bg: "bg-primary-900",
    title: "saveThePlanet",
    description: "saveThePlanetDesc",
  },
];
export const iOSSteps = [
  {
    description: "goto_settings",
  },
  {
    description: "select_mobile_settings",
  },
  {
    description: "select_add_esim",
  },
  {
    description: "select_use_qr_code",
  },
  {
    description: "place_qr_code",
  },
  {
    description: "go_mobile_data",
  },
  {
    description: "toggle_data_roaming",
  },
  {
    description: "good_to_go",
  },
];

export const androidSteps = [
  {
    description: "slide_two_fingers",
  },
  {
    description: "select_settings_icon",
  },
  {
    description: "select_connections",
  },
  {
    description: "select_sim_manager",
  },
  {
    description: "select_add_esim",
  },
  {
    description: "select_qr_code",
  },
  {
    description: "go_back_connections",
  },
  {
    description: "toggle_roaming",
  },
  {
    description: "good_to_go",
  },
];

export const notifications = [
  {
    id: 1,
    message:
      "Dear marrielle.aboujaoude@montymobile.com, you have reached a significant level of consumption, please check available top-ups",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    message: "Your EuroTurkLink plan is now active and valid until 2023-08-13.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const bundles = [
  {
    order_number: "d583c77d-ebb7-4837-a796-bc0a50cdee0d",
    order_status: "success",
    order_amount: 50279500,
    order_currency: "EUR",
    order_display_price: "502795.0 EUR",
    order_date: "1741938699",
    order_type: "Assign",
    quantity: 1,
    company_name: "Esim Reseller",
    payment_details: null,
    bundle_details: {
      display_title: "new one",
      display_subtitle: "fghfgh",
      bundle_code: "c817a5fe-a8ec-42fa-90f8-198ef2575a4b",
      bundle_category: {
        type: "CRUISE",
        title: "Cruise",
        code: "b32ce4a6-a347-4b7f-8c70-d92bfa81664c",
      },
      bundle_region: [],
      bundle_marketing_name: "new one",
      bundle_name: "new one",
      count_countries: 4,
      currency_code: "EUR",
      gprs_limit_display: "1 GB",
      price: 502795,
      price_display: "502795 EUR",
      unlimited: false,
      validity: 1,
      plan_type: "Data only",
      activity_policy:
        "The validity period starts when the eSIM connects to any supported networks.",
      validity_display: "1 Day",
      countries: [
        {
          id: "b88ef430-9279-433c-bba6-fc5093c6a116",
          alternative_country: "Georgia",
          country: "Abkhazia",
          country_code: "Unknown",
          iso3_code: "KAZ",
          zone_name: "Unknown",
          icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/kaz.png",
          operator_list: null,
        },
        {
          id: "575a304a-7464-4a65-b1c2-6c9d106ed837",
          alternative_country: null,
          country: "American Samoa",
          country_code: "Unknown",
          iso3_code: "CAN",
          zone_name: "Unknown",
          icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/can.png",
          operator_list: null,
        },
        {
          id: "f6e09b39-1c27-40ef-a857-c5f87eaf22e7",
          alternative_country: "Angola",
          country: "Angola",
          country_code: "Unknown",
          iso3_code: "AGO",
          zone_name: "Unknown",
          icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/ago.png",
          operator_list: null,
        },
        {
          id: "bd2de457-1e02-43ab-a77a-d2f590f5a261",
          alternative_country: "South Africa",
          country: "South Africa",
          country_code: "Unknown",
          iso3_code: "ZAF",
          zone_name: "Unknown",
          icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/zaf.png",
          operator_list: null,
        },
      ],
      icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/kaz.png",
      label: null,
    },
  },
];
