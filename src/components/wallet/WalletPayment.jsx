import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Button } from "@mui/material";
const WalletPayment = ({ bundle, recallAssign, loading }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const user_info = useSelector((state) => state.authentication?.user_info);

  const priceToPay = useMemo(() => {
    return location?.state?.new_price || bundle?.price;
  }, [bundle, location]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-6 mx-auto">
      {user_info?.balance < priceToPay ? (
        <div className={"flex flex-row items-start gap-2"}>
          <ErrorOutlineIcon />
          <h2 className="text-sm font-semibold text-primary">
            {t("checkout.low_wallet_balance", {
              balance: user_info?.balance,
            })}
          </h2>
        </div>
      ) : (
        <div className={"flex flex-col gap-2"}>
          <h2 className="text-lg md:text-xl font-bold text-primary">
            {t("checkout.confirmTitle", {
              amount:
                location?.state?.new_price_display || bundle?.price_display,
            })}
          </h2>
          <p className="text-sm  text-content-800">
            {t("checkout.confirmMessage", {
              amount:
                location?.state?.new_price_display || bundle?.price_display,
            })}{" "}
            <br />
            {t("checkout.confirmHint")}
          </p>
          <Button
            variant={"contained"}
            color="secondary"
            sx={{ width: "50%" }}
            disabled={loading}
            onClick={() => recallAssign("wallet")}
          >
            {t("checkout.confirmButton")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletPayment;
