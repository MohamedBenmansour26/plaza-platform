import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { EditProduct } from "./pages/EditProduct";
import { NewProduct } from "./pages/NewProduct";
import { Orders } from "./pages/Orders";
import { Finances } from "./pages/Finances";
import { Support } from "./pages/Support";
import { Account } from "./pages/Account";
import { Store } from "./pages/Store";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "dashboard/produits", Component: Products },
      { path: "dashboard/produits/:id", Component: EditProduct },
      { path: "dashboard/produits/nouveau", Component: NewProduct },
      { path: "dashboard/commandes", Component: Orders },
      { path: "dashboard/finances", Component: Finances },
      { path: "dashboard/support", Component: Support },
      { path: "dashboard/compte", Component: Account },
      { path: "dashboard/boutique", Component: Store },
      { path: "dashboard/parametres", Component: Settings },
    ],
  },
]);
