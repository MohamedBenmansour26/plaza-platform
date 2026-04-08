import { createBrowserRouter } from 'react-router';
import { Login } from './screens/Login';
import { Livraisons } from './screens/Livraisons';
import { DeliveryDetail } from './screens/DeliveryDetail';
import { CollectionConfirmation } from './screens/CollectionConfirmation';
import { DeliveryConfirmation } from './screens/DeliveryConfirmation';
import { IssueReport } from './screens/IssueReport';
import { Success } from './screens/Success';
import { Historique } from './screens/Historique';
import { Profil } from './screens/Profil';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/livraisons',
    Component: Livraisons,
  },
  {
    path: '/livraison/:id',
    Component: DeliveryDetail,
  },
  {
    path: '/collecte/:id',
    Component: CollectionConfirmation,
  },
  {
    path: '/confirmation/:id',
    Component: DeliveryConfirmation,
  },
  {
    path: '/probleme/:id',
    Component: IssueReport,
  },
  {
    path: '/succes/:id',
    Component: Success,
  },
  {
    path: '/historique',
    Component: Historique,
  },
  {
    path: '/profil',
    Component: Profil,
  },
]);
