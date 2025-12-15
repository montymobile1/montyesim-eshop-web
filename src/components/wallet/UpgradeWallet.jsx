import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { FormInput } from "../shared/form-components/FormComponents";
import { topupWallet } from "../../core/apis/walletAPI";
import { StripePayment } from "../stripe-payment/StripePayment";
import { Button, CircularProgress, Dialog, DialogContent } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function UpgradeWallet() {
  const { t } = useTranslation();
  const [openStripe, setOpenStripe] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userInfo = useSelector(
    (state) => state.authentication?.user_info || null
  );
  const schema = yup.object().shape({
    amount: Yup.number()
      .nullable()
      .typeError(t("myWallet.amountMustBeNumber"))
      .positive(t("myWallet.amountMustBeGreaterThanZero"))
      .required(t("myWallet.amountRequiredMessage") || "Required"),
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      amount: null,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleUpgrade = (payload) => {
    setIsSubmitting(true);
    topupWallet(payload)
      .then((res) => {
        if (res?.data?.status === "success") {
          setClientSecret(res?.data?.data?.payment_intent_client_secret);
          setStripePromise(loadStripe(res?.data?.data?.publishable_key));
          setOpenStripe(true);
        }
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col h-full">
      <form
        className=" bg-white rounded-[20px] shadow-sm p-6 w-full flex flex-col h-full gap-2"
        onSubmit={handleSubmit(handleUpgrade)}
      >
        <h2 className="text-xl font-bold">{t("myWallet.upgradeWallet")}</h2>
        <p className="text-gray-700">{t("myWallet.enterAmountToAddFunds")}</p>
        <div>
          <label className="block text-sm font-medium">
            {t("myWallet.amountNumber")}
          </label>

          <Controller
            name="amount"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormInput
                placeholder={t("myWallet.enterAmount")}
                value={value ?? ""}
                type="number"
                helperText={error?.message}
                onChange={(value) => onChange(value !== "" ? value : null)}
                endAdornment={
                  sessionStorage.getItem("user_currency") ||
                  userInfo?.currency_code
                }
              />
            )}
          />
        </div>
        <div className="mt-auto">
          <Button
            type={"submit"}
            variant={"contained"}
            color="secondary"
            sx={{ width: "fit-content" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              t("myWallet.upgrade")
            )}
          </Button>
        </div>
      </form>

      {openStripe && (
        <Dialog open={true} maxWidth="md">
          <DialogContent>
            <h1>{t("myWallet.upgradeWallet")}</h1>
            <StripePayment
              clientSecret={clientSecret}
              stripePromise={stripePromise}
              fromUpgradeWallet={true}
              onClose={() => {
                setOpenStripe(false);
                setClientSecret(null);
                setStripePromise(null);
                reset();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
