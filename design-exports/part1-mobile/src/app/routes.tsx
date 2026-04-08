import { createBrowserRouter } from "react-router";
import { Dashboard } from "./screens/Dashboard";
import { Products } from "./screens/Products";
import { ProductDetail } from "./screens/ProductDetail";
import { NewProduct } from "./screens/NewProduct";
import { Orders } from "./screens/Orders";
import { OrderDetail } from "./screens/OrderDetail";
import { Finances } from "./screens/Finances";
import { Support } from "./screens/Support";
import { Plus } from "./screens/Plus";
import { Account } from "./screens/Account";
import { Store } from "./screens/Store";
import { Settings } from "./screens/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "dashboard/produits", Component: Products },
      { path: "dashboard/produits/:id", Component: ProductDetail },
      { path: "dashboard/produits/nouveau", Component: NewProduct },
      { path: "dashboard/commandes", Component: Orders },
      { path: "dashboard/commandes/:id", Component: OrderDetail },
      { path: "dashboard/finances", Component: Finances },
      { path: "dashboard/support", Component: Support },
      { path: "dashboard/plus", Component: Plus },
      { path: "dashboard/compte", Component: Account },
      { path: "dashboard/boutique", Component: Store },
      { path: "dashboard/parametres", Component: Settings },
    ],
  },
]);
