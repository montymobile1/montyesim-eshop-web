import React from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmailIcon from "@mui/icons-material/Email";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function ReferSocials() {
  const userInfo = useSelector((state) => state.authentication?.user_info);
  const { t } = useTranslation();
  const referralUrl = `${
    window.location.origin
  }/referral?referralCode=${encodeURIComponent(userInfo?.referral_code)}`;

  const message = `${t("common.referral_message")} ${referralUrl}`;

  const shareUrl = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      referralUrl
    )}`,
    email: `mailto:?subject=${encodeURIComponent(
      t("common.referral_message")
    )}&body=${encodeURIComponent(message)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      referralUrl
    )}&text=${encodeURIComponent(t("common.referral_message"))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      referralUrl
    )}`,
  };

  const handleShare = (platform) => {
    if (shareUrl[platform]) {
      window.open(shareUrl[platform], "_blank");
    } else {
      toast.error(t("errors.share_platform_not_supported"));
    }
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-6 justify-items-center">
      {/* WhatsApp */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("whatsapp")}
      >
        <div className="bg-[#25D366] p-4 rounded-full shadow-sm">
          <WhatsAppIcon className="text-white" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">Whatsapp</span>
      </div>

      {/* Facebook */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("facebook")}
      >
        <div className="bg-[#1877F2] p-4 rounded-full shadow-[0_0_32px_#2a6a980d]">
          <FacebookIcon className="text-white" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">Facebook</span>
      </div>

      {/* X (Twitter) */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("x")}
      >
        <div className="bg-black p-4 rounded-full shadow-[0_0_32px_#2a6a980d]">
          <XIcon className="text-white" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">X</span>
      </div>

      {/* LinkedIn */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("linkedin")}
      >
        <div className="bg-[#0077B5] p-4 rounded-full shadow-[0_0_32px_#2a6a980d]">
          <LinkedInIcon className="text-white" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">LinkedIn</span>
      </div>

      {/* Telegram */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("telegram")}
      >
        <div className="bg-[#54A9EB] p-4 rounded-full shadow-[0_0_32px_#2a6a980d]">
          <TelegramIcon className="text-white" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">Telegram</span>
      </div>

      {/* Email */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleShare("email")}
      >
        <div className="bg-white p-4 rounded-full shadow-[0_0_32px_#2a6a980d]">
          <EmailIcon className="text-black" />
        </div>
        <span className="mt-4 text-sm text-gray-600 font-medium">Email</span>
      </div>
    </div>
  );
}
