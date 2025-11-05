import React, { useMemo, useState, useEffect } from "react";
import { getUserRewards } from "../../core/apis/promotionsAPI";
import { useInView } from "react-intersection-observer";
import { Grid, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  CustomToggleButton,
  CustomToggleGroup,
} from "../../assets/CustomComponents";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "react-query";
import useQueryParams from "../../core/custom-hook/useQueryParams";
import CashbackCard from "./CashbackCard.jsx";
import NoDataFound from "../shared/no-data-found/NoDataFound.jsx";
import { NoDataFoundSVG } from "../../assets/icons/Common.jsx";

const Rewards = () => {
  const { ref, inView } = useInView();
  const { t } = useTranslation();

  const fetchData = async ({ pageParam = 1 }) => {
    const { data } = await getUserRewards({
      page_index: pageParam,
      page_size: 20,
    });
    return {
      data: data?.data || [],
      totalCount: data?.totalCount,
      page: pageParam,
    };
  };

  const {
    data: rewards,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user-rewards"],
    queryFn: fetchData,
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.length === 20 ? lastPage?.page + 1 : undefined;
    },
    select: (data) => data?.pages?.flatMap((page) => page.data),
    cacheTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  return (
    <div className={" flex flex-col gap-2"}>
      <h2 className="text-xl font-bold text-gray-900">
        {t("myWallet.rewardHistory")}
      </h2>

      <div className={"flex flex-col gap-2"}>
        {isLoading ? (
          Array(4)
            .fill()
            ?.map((el) => <Skeleton variant={"rectangular"} height={"50px"} />)
        ) : rewards?.length > 0 ? (
          rewards?.map((row, index) => <CashbackCard {...row} />)
        ) : (
          <NoDataFound
            image={<NoDataFoundSVG />}
            text={t("noDataFound.no_rewards_history", {
              type: t("myWallet.rewards"),
            })}
          />
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} />
    </div>
  );
};

export default Rewards;
