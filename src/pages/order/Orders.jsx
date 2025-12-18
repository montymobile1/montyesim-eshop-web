//UTILITIES
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
//COMPONENT
import { Skeleton } from "@mui/material";
import { getOrdersHistory } from "../../core/apis/userAPI";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { NoDataFoundSVG } from "../../assets/icons/Common";
import OrderCard from "../../components/order/OrderCard";

const Orders = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  const fetchOrders = async ({ pageParam = 1 }) => {
    const { data } = await getOrdersHistory({
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
    data: orders,
    error,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["orders-history"],
    queryFn: fetchOrders,
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.length == 20 ? lastPage?.page + 1 : undefined;
    },

    select: (data) => data.pages.flatMap((page) => page.data),
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="flex flex-col gap-[2rem]">
      <div className="flex items-center justify-between gap-[2rem]">
        <h1 className="font-bold">{t("orders.orders_history")}</h1>
      </div>

      <div className={"flex flex-col gap-[1rem]"}>
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => ({ id: i })).map((item) => (
            <Skeleton
              key={`order-skeleton-${item?.id}`}
              variant="rectangle"
              height={100}
              className={"rounded-md"}
            />
          ))
        ) : error || !orders || orders?.length === 0 ? (
          <NoDataFound
            text={
              error ? t("orders.failedToLoadOrders") : t("orders.noOrdersYet")
            }
            image={<NoDataFoundSVG />}
          />
        ) : (
          <>
            {orders?.map((order) => (
              <OrderCard order={order} key={order?.order_number} />
            ))}
            <div ref={ref}></div>
            {isFetchingNextPage &&
              !isLoading &&
              Array.from({ length: 4 }, (_, i) => ({ id: i })).map((item) => (
                <Skeleton
                  key={`skeleton-${item?.id}`}
                  variant="rectangle"
                  height={100}
                  className="rounded-md"
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
