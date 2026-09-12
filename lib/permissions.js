export const ALL_ADMIN_PERMISSIONS = [
  'dashboard.view',

  // Products
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'products.publish',
  'products.manage_stock',
  'products.manage_price',
  'products.manage_images',

  // Categories
  'categories.view',
  'categories.create',
  'categories.edit',
  'categories.delete',

  // Brands
  'brands.view',
  'brands.create',
  'brands.edit',
  'brands.delete',

  // Banners
  'banners.view',
  'banners.create',
  'banners.edit',
  'banners.delete',

  // Orders
  'orders.view',
  'orders.create',
  'orders.edit',
  'orders.cancel',
  'orders.refund',
  'orders.update_status',
  'orders.view_customer_data',

  // Customers
  'customers.view',
  'customers.create',
  'customers.edit',
  'customers.delete',
  'customers.view_orders',

  // Coupons
  'coupons.view',
  'coupons.create',
  'coupons.edit',
  'coupons.delete',
  'coupons.activate',

  // Inventory
  'inventory.view',
  'inventory.adjust',
  'inventory.manage_stock',

  // Reviews
  'reviews.view',
  'reviews.approve',
  'reviews.reject',
  'reviews.delete',

  // Marketing
  'marketing.view',
  'marketing.create',
  'marketing.edit',
  'marketing.delete',
  'marketing.publish',

  // Media
  'media.view',
  'media.upload',
  'media.edit',
  'media.delete',

  // SEO
  'seo.view',
  'seo.edit',
  'seo.publish',
  'seo.redirects',

  // Pages
  'pages.view',
  'pages.create',
  'pages.edit',
  'pages.delete',
  'pages.publish',

  // Analytics
  'analytics.view',

  // Reports
  'reports.view',
  'reports.export',

  // Support
  'support.view',
  'support.create',
  'support.reply',
  'support.close',

  // Activity
  'activity.view',

  // Settings
  'settings.view',
  'settings.edit',

  // Admin users
  'admin_users.view',
  'admin_users.create',
  'admin_users.edit',
  'admin_users.deactivate',
  'admin_users.manage_permissions',
];

export const ADMIN_ROLE_TEMPLATES = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description:
      'Full operational and security access across the admin system.',
    permissions: ALL_ADMIN_PERMISSIONS,
  },

  ADMINISTRATOR: {
    label: 'Administrator',
    description:
      'Operational access for most store management without sensitive security control.',
    permissions: ALL_ADMIN_PERMISSIONS.filter(
      permission =>
        ![
          'admin_users.manage_permissions',
          'admin_users.deactivate',
          'settings.edit',
        ].includes(permission)
    ),
  },

  MANAGER: {
    label: 'Manager',
    description:
      'Store operations, products, orders, customers, coupons, inventory, and banners.',

    permissions: [
      'dashboard.view',

      'products.view',
      'products.create',
      'products.edit',
      'products.publish',
      'products.manage_stock',
      'products.manage_price',

      'categories.view',
      'categories.create',
      'categories.edit',

      'brands.view',
      'brands.create',
      'brands.edit',

      // Banners
      'banners.view',
      'banners.create',
      'banners.edit',
      'banners.delete',

      'orders.view',
      'orders.edit',
      'orders.update_status',
      'orders.view_customer_data',

      'customers.view',
      'customers.create',
      'customers.edit',

      'coupons.view',
      'coupons.create',
      'coupons.edit',
      'coupons.activate',

      'inventory.view',
      'inventory.adjust',
      'inventory.manage_stock',

      'reviews.view',
      'reviews.approve',
      'reviews.reject',

      'reports.view',
      'reports.export',

      'analytics.view',
    ],
  },

  CONTENT_MANAGER: {
    label: 'Content Manager',
    description:
      'Products, banners, pages, media, SEO, and marketing content.',

    permissions: [
      'dashboard.view',

      'products.view',
      'products.create',
      'products.edit',
      'products.publish',

      'categories.view',
      'categories.create',
      'categories.edit',

      'brands.view',
      'brands.create',
      'brands.edit',

      // Banners
      'banners.view',
      'banners.create',
      'banners.edit',
      'banners.delete',

      'media.view',
      'media.upload',
      'media.edit',

      'marketing.view',
      'marketing.create',
      'marketing.edit',
      'marketing.publish',

      'seo.view',
      'seo.edit',
      'seo.publish',

      'pages.view',
      'pages.create',
      'pages.edit',
      'pages.publish',

      'reviews.view',
      'reviews.approve',
    ],
  },

  ORDER_MANAGER: {
    label: 'Order Manager',
    description:
      'Orders, customer visibility, and fulfillment operations.',

    permissions: [
      'dashboard.view',

      'orders.view',
      'orders.edit',
      'orders.update_status',
      'orders.view_customer_data',

      'customers.view',
      'customers.view_orders',

      'support.view',
      'support.reply',
    ],
  },
};

export function getRoleTemplate(roleKey) {
  return (
    ADMIN_ROLE_TEMPLATES[roleKey] || {
      label: 'Custom Role',
      description:
        'Custom permission set managed by the super admin.',
      permissions: [],
    }
  );
}

export function summarizePermissions(permissions = []) {
  return permissions.length
    ? `${permissions.length} permissions enabled`
    : 'No permissions assigned';
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return false;
}