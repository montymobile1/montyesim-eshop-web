import React from "react";
import { Route, Routes } from "react-router-dom";
import RouteWrapper from "./RouteWrapper";
import { useAppRoutes } from "../custom-hook/useAppRoutes";

const AppRouter = () => {
  const allRoutes = useAppRoutes();
  return (
    <Routes>
      {allRoutes?.map((route) => {
        if (route.children) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RouteWrapper
                  {...route}
                  element={route.element}
                  layout={route.layout}
                />
              }
            >
              {route.children.map((child) => (
                <Route
                  key={child.path}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          );
        }
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteWrapper
                {...route}
                element={route.element}
                layout={route.layout}
              />
            }
          />
        );
      })}
    </Routes>
  );
};

export default AppRouter;
