import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Layout } from "antd";
import { getMenuItemInMenuListByProperty } from "@/utils";
import routeList from "@/config/routeMap";
import menuList from "@/config/menuConfig";

const { Content } = Layout;

const getPageTitle = (menuList, pathname) => {
  let title = "Ant Design Pro";
  let item = getMenuItemInMenuListByProperty(menuList, "path", pathname);
  if (item) {
    title = `${item.title} - Ant Design Pro`;
  }
  return title;
};

const LayoutContent = (props) => {
  const { role } = props;
  const location = useLocation(); // useLocation untuk mendapatkan pathname
  const { pathname } = location;

  const handleFilter = (route) => {
    return role === "admin" || !route.roles || route.roles.includes(role);
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle(menuList, pathname)}</title>
      </Helmet>
      <Content style={{ height: "calc(100% - 100px)" }}>
        <TransitionGroup>
          <CSSTransition
            key={pathname}
            timeout={500}
            classNames="fade"
            exit={false}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              {routeList.map((route) =>
                handleFilter(route) ? (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.component />}
                  />
                ) : null
              )}
              <Route path="*" element={<Navigate to="/error/404" />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Content>
    </>
  );
};

export default connect((state) => state.user)(LayoutContent);
