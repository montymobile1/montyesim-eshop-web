import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ReferrAndEarnSwiper from "../../components/swiper/ReferrAndEarnSwiper";
import ReferSocials from "./components/ReferSocials";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { getReferEarnContent } from "../../core/apis/homeAPI";

export default function ReferAndEarn() {
  const { t } = useTranslation();
  const userInfo = useSelector((state) => state.authentication.user_info);
  const systemSettings = useSelector((state) => state.currency || null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["refer-earn-phrase"],
    queryFn: () =>
      getReferEarnContent().then((res) => {
        return res?.data?.data;
      }),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(userInfo?.referral_code);
    toast.success(t("btn.copiedSuccessfully"));
  };
  return (
    <div className="px-6 pt-0 pb-6 flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-gray-900">
        {t("referAndEarn.referAndEarnTitle")}
      </h1>
      <div className="w-full mx-auto flex flex-col gap-4">
        <ReferrAndEarnSwiper />

        <div className={"flex flex-col gap-4"}>
          <h2 className="text-xl font-bold text-gray-900">
            {t("referAndEarn.shareYourReferralCode")}
          </h2>
          <p className="text-gray-600">
            {data?.message}{" "}
            <Link
              to="/terms"
              className="text-secondary font-semibold underline"
            >
              {t("footer.termsAndConditions")}
            </Link>
          </p>

          <label className="text-sm font-semibold text-primary block">
            {t("referAndEarn.yourReferralCode")}
          </label>

          <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
            <span className="text-gray-800 text-lg font-medium">
              {userInfo?.referral_code}
            </span>
            <button onClick={handleCopy} className="ml-auto transition">
              <ContentCopyIcon fontSize="small" />
            </button>
          </div>
          <ReferSocials />
        </div>
      </div>
    </div>
  );
}
