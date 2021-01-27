import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module')
          .then((m) => m.HomePageModule)
      },
      {
        path: 'process',
        loadChildren: () => import('../pages/process/process.module')
          .then((m) => m.ProcessPageModule)
      },
      {
        path: 'recipe',
        loadChildren: () => import('../pages/recipe/recipe.module')
          .then((m) => m.RecipePageModule)
      },
      {
        path: 'recipe/:masterId',
        loadChildren: () => import('../pages/recipe-detail/recipe-detail.module')
          .then((m) => m.RecipeDetailPageModule)
      },
      {
        path: 'extras',
        loadChildren: () => import('../pages/extras/extras.module')
          .then((m) => m.ExtrasPageModule)
      },
      {
        path: 'recipe-form',
        loadChildren: () => import('../pages/forms/recipe-form/recipe-form.module')
          .then((m) => m.RecipeFormPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
