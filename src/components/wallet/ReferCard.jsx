import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ReferCard() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-[20px] shadow-sm p-6 min-h-[250px] flex flex-col h-full justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t("myWallet.referAndEarn")}
          </h2>
          <p className="text-gray-700">
            {t("myWallet.referAndEarnDescription")}
          </p>
        </div>

        <div className="mt-auto">
          <Button
            component={Link}
            to={"/refer-earn"}
            variant={"contained"}
            color="secondary"
            sx={{ width: "fit-content" }}
          >
            {t("myWallet.shareWithFriends")}
          </Button>
        </div>
      </div>
    </div>
  );
}
