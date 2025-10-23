import React from "react";
import { useTranslation } from "react-i18next";
import ReferCard from "../../components/wallet/ReferCard";
import VoucherCodeCard from "../../components/wallet/VoucherCodeCard";
import Wallet1 from "../../assets/images/wallet/wallet-icon-1.svg";
import Wallet2 from "../../assets/images/wallet/wallet-icon-2.svg";
import UpgradeWallet from "../../components/wallet/UpgradeWallet";
import Rewards from "../../components/wallet/Rewards";
import { useSelector } from "react-redux";

export default function MyWallet() {
  const { t } = useTranslation();
  const userInfo = useSelector((state) => state.authentication.user_info);

  return (
    <div className="pt-0 pb-6 flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-gray-900">
        {t("myWallet.wallet")}
      </h1>
      <div className="w-full mx-auto">
        <div className="relative bg-bgLight rounded-[30px] p-8 overflow-hidden shadow-sm">
          <div className="absolute -bottom-0 -left-8 opacity-20">
            <img src={Wallet1} alt="" className="w-[210px] h-[86px]" />
          </div>

          <div className="absolute -top-0 -right-8 opacity-20">
            <img src={Wallet2} alt="" className="w-[254px] h-[65px]" />
          </div>

          <div className="relative z-10">
            <div className="text-sm font-medium text-primary">
              {t("myWallet.availableBalance")}
            </div>
            <div className="text-4xl font-bold text-primary">
              {userInfo?.balance} {userInfo?.currency_code}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              <path
                d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z"
                fill="#f5fbfe"
                opacity="0.1"
              />
              <path
                d="M0,60 Q100,30 200,60 T400,60 L400,100 L0,100 Z"
                fill="#f5fbfe"
                opacity="0.05"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-0">
        <VoucherCodeCard />
        <ReferCard />
        <UpgradeWallet />
      </div>

      <Rewards />
    </div>
  );
}
