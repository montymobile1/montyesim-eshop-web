import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { controllerMap } from "../apis/axios";

export const useAbortOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    controllerMap.forEach((entry, key) => {
      const { controller, url, method } = entry;

      const shouldAbort =
        url?.toLowerCase() === "api/v1/user/bundle/assign" ||
        url?.toLowerCase() === "api/v1/user/bundle/assign-top-up";

      if (shouldAbort) {
        controller.abort();
        controllerMap.delete(key);
      }
    });
  }, [location.pathname]);
};
