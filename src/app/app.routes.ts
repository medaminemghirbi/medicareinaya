import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ──── Public Layout ────
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/public/products/product-list/product-list.component').then(m => m.ProductListComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/public/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
          },
        ],
      },
      {
        path: 'blog',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/public/blog/blog-list/blog-list.component').then(m => m.BlogListComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/public/blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
          },
        ],
      },
      {
        path: 'wiki',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/public/wiki/wiki-home/wiki-home.component').then(m => m.WikiHomeComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/public/wiki/wiki-detail/wiki-detail.component').then(m => m.WikiDetailComponent),
          },
        ],
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/public/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/public/wishlist/wishlist.component').then(m => m.WishlistComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/public/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'client',
        children: [
          {
            path: 'orders',
            loadComponent: () => import('./features/client/orders/client-orders.component').then(m => m.ClientOrdersComponent),
          },
        ],
      },
    ],
  },

  // ──── Auth (standalone, no public layout) ────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/public/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/public/auth/register/register.component').then(m => m.RegisterComponent),
      },
    ],
  },

  // ──── Admin Layout ────
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/products/product-list/admin-product-list.component').then(m => m.AdminProductListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
          },
        ],
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/categories/category-list/admin-category-list.component').then(m => m.AdminCategoryListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
          },
        ],
      },
      {
        path: 'blog',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/blog/blog-list/admin-blog-list.component').then(m => m.AdminBlogListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/blog/blog-form/blog-form.component').then(m => m.BlogFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/blog/blog-form/blog-form.component').then(m => m.BlogFormComponent),
          },
        ],
      },
      {
        path: 'wiki',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/wiki/wiki-list/admin-wiki-list.component').then(m => m.AdminWikiListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/wiki/wiki-form/wiki-form.component').then(m => m.WikiFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/admin/wiki/wiki-form/wiki-form.component').then(m => m.WikiFormComponent),
          },
        ],
      },
      {
        path: 'contacts',
        loadComponent: () => import('./features/admin/contacts/admin-contacts.component').then(m => m.AdminContactsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
