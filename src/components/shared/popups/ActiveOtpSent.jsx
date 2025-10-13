//UTILITIES
import React, { useEffect } from "react";

//COMPONENT
import { Close, ErrorOutline } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";

const ActiveOtpSent = ({ onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      slotProps={{ paper: { sx: { maxWidth: 400 } } }}
    >
      <DialogContent className="flex flex-col gap-6">

        <div className="flex flex-row justify-end">
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? { position: "absolute", left: 8, top: 8, color: "black" }
                : { position: "absolute", right: 8, top: 8, color: "black" }
            }
          >
            <Close />
          </IconButton>
        </div>

        <div className="flex flex-col gap-4 justify-center items-center text-center">
          <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorOutline className="text-red-600" fontSize="small" />
          </div>
          <h4 className="font-bold text-red-700">
            {t("auth.activeOtpExists", "Active OTP already exists")}
          </h4>
          <p className="text-gray-700 font-medium">
            {t(
              "auth.useExistingOtp",
              "Please use the OTP you already received to continue."
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveOtpSent;
