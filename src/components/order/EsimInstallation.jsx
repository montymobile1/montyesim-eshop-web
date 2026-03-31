import { Button, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

const EsimInstallation = ({ data, orderData, isLoading }) => {
  const { t } = useTranslation();

  const smdpAddress = data?.smdp_address || orderData?.smdp_address;
  const activationCode = orderData?.activation_code || data?.activation_code;
  const lpaLink = `LPA:1$${smdpAddress}$${activationCode}`;
  const isArabic = localStorage.getItem("i18nextLng") === "ar";

  const installationOptions = [
    {
      label: t("orders.iosDirectInstallation"),
      url: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${lpaLink}`,
      buttonText: t("orders.installNowLinkonIOS"),
    },
    {
      label: t("orders.LPALink"),
      url: `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${lpaLink}`,
      buttonText: t("orders.installNowLinkonAndroid"),
    },
  ];

  return (
    <>
      {installationOptions?.map((item, index) => (
        <div key={index} className="flex flex-col gap-[0.5rem]">
          <label
            className={`font-semibold ${isArabic ? "text-right" : "text-left"}`}
          >
            {item.label}
          </label>

          {isLoading ? (
            <Skeleton variant="rectangular" height={50} className="rounded" />
          ) : (
            <Button
              sx={{ padding: "1rem" }}
              variant="outlined"
              href={item.url}
              target="_blank"
            >
              {item.buttonText}
            </Button>
          )}
        </div>
      ))}
    </>
  );
};

export default EsimInstallation;
