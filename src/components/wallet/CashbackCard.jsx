import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const CashbackCard = ({ is_referral, amount, name, promotion_name, date }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-4  rounded-xl shadow-sm bg-white space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-primary font-medium text-lg">{name}</div>
        <div className="text-primary text-xl font-bold">{amount}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-secondary text-sm">
          {date ? dayjs(date * 1000).format("DD-MM-YYYY") : "N/A"}
        </div>
        <div className="text-secondary text-sm">{promotion_name}</div>
      </div>
    </div>
  );
};

export default CashbackCard;
