import { Button, Dialog, DialogContent } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AttentionSVG } from "../assets/icons/Payment";
import { cancelOrder } from "../core/apis/userAPI";

const TransactionExpired = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/plans");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog fullWidth open={true} maxWidth="sm">
      <DialogContent className="flex flex-col items-center justify-center gap-[1rem] text-center !py-10">
        <AttentionSVG color="primary" fontSize="large" />
        <div className={"flex flex-col gap-[1rem]"}>
          <h1 className="font-bold">{t("common.notice")}</h1>
          <p className="text-content-600 font-semibold">
            {t("orders.transaction_expired")}
          </p>
          <Button
            variant={"contained"}
            color="primary"
            onClick={() => navigate("/plans")}
          >
            {t("btn.ok")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionExpired;
