import { createBrowserRouter, Navigate } from "react-router";
import StoreHome from "./screens/StoreHome";
import ProductDetail from "./screens/ProductDetail";
import Checkout from "./screens/Checkout";
import OTPVerification from "./screens/OTPVerification";
import Confirmation from "./screens/Confirmation";
import OrderStatus from "./screens/OrderStatus";
import TrackOrder from "./screens/TrackOrder";
import NotFound from "./screens/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/store/zara-maroc" replace />,
  },
  {
    path: "/track",
    Component: TrackOrder,
  },
  {
    path: "/store/:slug",
    Component: StoreHome,
  },
  {
    path: "/store/:slug/produit/:id",
    Component: ProductDetail,
  },
  {
    path: "/store/:slug/commande",
    Component: Checkout,
  },
  {
    path: "/store/:slug/verification",
    Component: OTPVerification,
  },
  {
    path: "/store/:slug/confirmation",
    Component: Confirmation,
  },
  {
    path: "/store/:slug/commande/:id",
    Component: OrderStatus,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
