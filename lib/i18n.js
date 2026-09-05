export const bn = {
  nav: { shop: 'সব পণ্য', offers: 'অফার', account: 'অ্যাকাউন্ট', wishlist: 'উইশলিস্ট', cart: 'কার্ট' },
  search: 'প্রয়োজনীয় পণ্য খুঁজুন...',
  formatNumber(value) { return Number(value || 0).toLocaleString('en-BD'); },
  formatPrice(value) { return `৳ ${Number(value || 0).toLocaleString('en-BD')}`; },
  stock: { available: 'স্টকে আছে · পাঠানোর জন্য প্রস্তুত', unavailable: 'স্টকে নেই' },
  actions: { addToCart: 'কার্টে যোগ করুন', buyNow: 'এখনই কিনুন', viewAll: 'সব দেখুন', continueShopping: 'কেনাকাটা চালিয়ে যান' },
};

export const orderStatus = {
  PENDING: 'অর্ডার গ্রহণ করা হয়েছে', PROCESSING: 'প্রস্তুত করা হচ্ছে', SHIPPED: 'কুরিয়ারে দেওয়া হয়েছে',
  DELIVERED: 'ডেলিভারি সম্পন্ন', CANCELLED: 'বাতিল করা হয়েছে',
};