import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { FormInput } from "../shared/form-components/FormComponents";
import { Button, CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchUserInfo } from "../../redux/reducers/authReducer";
import { toast } from "react-toastify";
import { redeemVoucher } from "../../core/apis/promotionsAPI";
import { queryClient } from "../../main";

export default function VoucherCodeCard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const schema = yup.object().shape({
    code: yup
      .string()
      .nullable()
      .label("Code")
      .transform((value, originalValue) =>
        originalValue?.trim() === "" ? null : value
      )
      .required(t("errors.fieldRequired", { field: t("label.code") })),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleRedeem = (payload) => {
    setIsSubmitting(true);
    redeemVoucher(payload)
      .then((res) => {
        if (res?.data?.status === "success") {
          dispatch(fetchUserInfo());
          queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
          reset();

          toast.success(t("myWallet.voucher_successfully_redeemed"));
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col h-full">
      <form
        onSubmit={handleSubmit(handleRedeem)}
        className="bg-white rounded-[20px] shadow-sm p-6 w-full flex flex-col h-full gap-2"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {t("myWallet.voucherCode")}
        </h2>
        <p className="text-gray-700">{t("myWallet.redeemInstruction")}</p>

        <div>
          <label className="block text-sm font-medium text-gray-800">
            {t("myWallet.voucherCode")}
          </label>

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormInput
                placeholder={
                  t("myWallet.enterVoucherCode") || "Enter your code"
                }
                value={value}
                helperText={error?.message}
                onChange={onChange}
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
              t("myWallet.redeem")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
