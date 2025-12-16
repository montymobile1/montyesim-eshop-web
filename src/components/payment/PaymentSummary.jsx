import { Skeleton } from "@mui/material";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const PaymentSummary = ({ data, orderDetail, loadingData }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state;

  return (
    <div
      className={
        "bg-primary-50 p-4 rounded-2xl flex flex-col gap-8 w-full sm:basis-[50%] shadow-sm grow-0 min-w-0"
      }
    >
      <h1 className={"font-bold text-2xl"}>{t("checkout.summary")}</h1>
      <div className={"flex flex-col gap-2 min-w-0"}>
        <div
          className={
            "flex flex-row justify-between items-start gap-[1rem] min-w-0"
          }
        >
          <label className={"flex-1 font-semibold"}>
            {t("checkout.bundleName")}
          </label>
          <p
            dir={"ltr"}
            className={`flex-1 font-bold truncate ${
              localStorage.getItem("i18nextLng") === "ar"
                ? "text-left"
                : "text-right"
            }`}
          >
            {data?.display_title || t("common.notAvailable")}
          </p>
        </div>
        <div className={"flex flex-row justify-between items-start gap-[1rem]"}>
          <label className={"flex-1 font-semibold"}>
            {t("checkout.subtotal")}
          </label>
          {loadingData ? (
            <Skeleton width={100} />
          ) : (
            <p
              dir={"ltr"}
              className={clsx(`flex-1 font-bold text-right`, {
                "!text-left": localStorage.getItem("i18nextLng") === "ar",
              })}
            >
              {orderDetail?.has_tax
                ? orderDetail?.subtotal_price_display
                : state?.new_price_display || data?.price_display}
            </p>
          )}
        </div>
        <div className={"flex flex-row justify-between items-start gap-[1rem]"}>
          <label className={"flex-1 font-semibold"}>
            {t("checkout.estimatedTax")}
          </label>
          {loadingData ? (
            <Skeleton width={100} />
          ) : (
            <p
              dir={"ltr"}
              className={clsx(`flex-1 font-bold text-right`, {
                "!text-left": localStorage.getItem("i18nextLng") === "ar",
              })}
            >
              {orderDetail?.has_tax ? orderDetail?.tax_price_display : "N/A"}
            </p>
          )}
        </div>
      </div>

      <hr />
      <div className={"flex flex-row justify-between items-start gap-[1rem]"}>
        <label className={"font-semibold"}>{t("checkout.total")}</label>
        {loadingData ? (
          <Skeleton width={100} />
        ) : (
          <p
            dir={"ltr"}
            className={clsx(`text-2xl font-bold text-right`, {
              "!text-left": localStorage.getItem("i18nextLng") === "ar",
            })}
          >
            {orderDetail?.has_tax
              ? orderDetail?.total_price_display
              : state?.new_price_display || data?.price_display}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
