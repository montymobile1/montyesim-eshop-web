import { Card, CardContent, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const Referral = () => {
  const { t } = useTranslation();
  const handleReferral = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const referralCode = searchParams.get("referralCode");

    if (referralCode) {
      localStorage.setItem("referral_code", referralCode);
      toast.success(t("referAndEarn.refferral_code_saved"));

      // Redirect after 2 seconds
    } else {
      toast.error(t("referAndEarn.invalid_referral_code"));
    }
    setTimeout(() => {
      window.location.href = "/plans";
    }, 1000);
  };

  useEffect(() => {
    handleReferral();
  }, []);

  return (
    <div className={"flex justify-center items-center "}>
      <CircularProgress />
    </div>
  );
};

export default Referral;
