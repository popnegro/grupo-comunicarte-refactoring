import { fixedLocations, mobileRoutes } from './src/data/inventory';
const allItems = [...fixedLocations, ...mobileRoutes];
const featuredItems = allItems.filter(item => item.isFeatured);
console.log('Total items:', allItems.length);
console.log('Featured items:', featuredItems.length);
