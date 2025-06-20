import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { useSelector } from "react-redux";

const OrderReceipt = ({ order, onClose, isLoading }) => {
  const { t } = useTranslation();

  const orderDisplay = useMemo(() => {
    if (!order) return {};

    return {
      [t("orders.companyName")]: order.company_name,
      ...(order.payment_type === "Card" && {
        [t("orders.address")]: order.payment_details?.address,
        [t("orders.email")]: order.payment_details?.receipt_email,
      }),
      [t("orders.orderId")]: order.order_number,
      [t("orders.orderType")]: order.order_type,
    };
  }, [order, t]);

  return (
    <Dialog fullWidth open={true} maxWidth={"md"} onClose={onClose}>
      <DialogContent className={"flex flex-col gap-[1rem]"}>
        <div className={"flex flex-row justify-end"}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "black",
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "black",
                  }
            }
          >
            <Close />
          </IconButton>
        </div>
        <div>
          <img src={"/logo/logo.png"} className={"mt-2 h-16"} />
        </div>
        {isLoading || (!isLoading && order) ? (
          <>
            {Object.keys(orderDisplay)?.map((orderElement, index) => (
              <div key={index} className={"flex flex-col gap-[1rem]"}>
                <div className={"flex flex-col gap-[0.5rem]"}>
                  <label className={"text-title"}>{orderElement}</label>
                  <p className={"text-primary font-bold break-words"}>
                    {isLoading ? (
                      <Skeleton width={100} />
                    ) : (
                      orderDisplay?.[orderElement] || t("common.notAvailable")
                    )}
                  </p>
                </div>

                <hr />
              </div>
            ))}
            <label className={"text-title"}>{t("checkout.summary")}</label>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: "none", minHeight: "110px" }}
            >
              <Table sx={{ border: "1px solid black" }} dir="ltr">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.qty")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.product")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.unitPrice")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.amount")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? <Skeleton width={50} /> : order?.quantity}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.bundle_details?.display_title
                      )}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.bundle_details?.price_display
                      )}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.order_display_price
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <div
              className={
                "flex flex-col gap-[0.5rem] font-bold items-end text-primary"
              }
            >
              <p>
                {t("orders.totalPrice")}{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  order?.order_display_price
                )}
              </p>
              <p>
                {t("orders.finalPrice")}{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  order?.order_display_price
                )}
              </p>
            </div>
          </>
        ) : (
          <NoDataFound text={t("orders.failedToLoadOrderReceiptDetails")} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
