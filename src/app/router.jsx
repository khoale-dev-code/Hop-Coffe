import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";

import MenuPage from "../pages/public/MenuPage";
import LoginPage from "../pages/admin/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import MenuItemsPage from "../pages/admin/MenuItemsPage";
import SettingsPage from "../pages/admin/SettingsPage";
import PromotionsPage from "../pages/admin/PromotionsPage";
import PostsPage from "../pages/admin/PostsPage";
import BlogPage from "../pages/public/BlogPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "menu",
        element: <MenuItemsPage />,
      },
      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      { 
        path: "posts", 
        element: <PostsPage /> 
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/:shopSlug",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <MenuPage />, // Truy cập: tenquan.com/slug
      },
      {
        path: "blog",
        element: <BlogPage />, // Truy cập: tenquan.com/slug/blog
      },
    ],
  },
]);