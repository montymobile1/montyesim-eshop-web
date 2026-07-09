import { Avatar, AvatarGroup, Skeleton } from "@mui/material";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import React from "react";
import { useTranslation } from "react-i18next";

const SupportedCard = ({ cruises, data, isLoading, count }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row justify-between gap-4 bg-bgLight rounded-lg p-4">
      <p className="text-primary font-semibold text-sm">
        {cruises
          ? t("bundles.supportedShips")
          : t("bundles.supportedCountries")}
      </p>
      <AvatarGroup
        max={4}
        total={count || 0}
        sx={{
          "& .MuiAvatar-root": {
            width: 20,
            height: 20,
            fontSize: "0.75rem",
          },
          "& .MuiAvatarGroup-avatar": {
            width: 20,
            height: 20,
            fontSize: "0.5rem",
          },
          "& .MuiAvatar-root:first-of-type": {
            zIndex: 1,
          },
        }}
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              variant="circular"
              width={20}
              height={20}
              key={`skeleton-${idx}`}
            />
          ))}
        {!isLoading && data?.length === 0 ? (
          <DoDisturbIcon color="primary" />
        ) : (
          data?.map((supportedCountries) => (
            <Avatar
              key={supportedCountries?.id}
              alt={supportedCountries?.country}
              src={supportedCountries?.icon}
            >
              <img
                src={"/media/cruises.png"}
                className={"bg-white"}
                alt={"Supported Ships" || ""}
              />
            </Avatar>
          ))
        )}
      </AvatarGroup>
    </div>
  );
};

export default SupportedCard;
