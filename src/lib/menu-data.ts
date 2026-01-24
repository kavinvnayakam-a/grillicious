import type { MenuItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const menuItems: MenuItem[] = [
  // Lebanese Grill
  {
    id: 28,
    name: 'Half Grill',
    category: 'Lebanese Grill',
    description: '1 Rumali Roti + Half Grill + Garlic Sauce',
    price: 249,
    image: getImage('half-grill')?.imageUrl || '',
    imageHint: getImage('half-grill')?.imageHint || ''
  },
  {
    id: 29,
    name: 'Half Grill Combo',
    category: 'Lebanese Grill',
    description: '1 Rumali Roti + Half Grill + Garlic Sauce+Fries+Softdrink',
    price: 299,
    image: getImage('half-grill-combo')?.imageUrl || '',
    imageHint: getImage('half-grill-combo')?.imageHint || ''
  },
  {
    id: 30,
    name: 'Full Grill',
    category: 'Lebanese Grill',
    description: '2 Rumali Roti + Full Grill + Garlic Sauce',
    price: 449,
    image: getImage('full-grill')?.imageUrl || '',
    imageHint: getImage('full-grill')?.imageHint || ''
  },
  {
    id: 31,
    name: 'Full Grill Combo',
    category: 'Lebanese Grill',
    description: '2 Rumali Roti + Full Grill + Garlic Sauce+Fries+Softdrink',
    price: 499,
    image: getImage('full-grill-combo')?.imageUrl || '',
    imageHint: getImage('full-grill-combo')?.imageHint || ''
  },
  // Broasted Chicken
  {
    id: 32,
    name: 'Chicken Broast (8pcs)',
    category: 'Broasted Chicken',
    description: 'Crispy and juicy broasted chicken, 8 pieces.',
    price: 549,
    image: getImage('chicken-broast-8')?.imageUrl || '',
    imageHint: getImage('chicken-broast-8')?.imageHint || ''
  },
  {
    id: 33,
    name: 'Chicken Broast (4pcs)',
    category: 'Broasted Chicken',
    description: 'Crispy and juicy broasted chicken, 4 pieces.',
    price: 299,
    image: getImage('chicken-broast-4')?.imageUrl || '',
    imageHint: getImage('chicken-broast-4')?.imageHint || ''
  },
  {
    id: 34,
    name: 'Chicken Broast (2pcs)',
    category: 'Broasted Chicken',
    description: 'Crispy and juicy broasted chicken, 2 pieces.',
    price: 159,
    image: getImage('chicken-broast-2')?.imageUrl || '',
    imageHint: getImage('chicken-broast-2')?.imageHint || ''
  },
  {
    id: 35,
    name: 'Chicken Twister',
    category: 'Broasted Chicken',
    description: 'A delicious wrap with crispy chicken strips.',
    price: 119,
    image: getImage('chicken-twister')?.imageUrl || '',
    imageHint: getImage('chicken-twister')?.imageHint || ''
  },
  {
    id: 36,
    name: 'Chicken Popcorn (12pcs)',
    category: 'Broasted Chicken',
    description: 'Bite-sized pieces of chicken, fried to a golden crisp.',
    price: 119,
    image: getImage('chicken-popcorn')?.imageUrl || '',
    imageHint: getImage('chicken-popcorn')?.imageHint || ''
  },
  {
    id: 37,
    name: 'Fish & Chips',
    category: 'Broasted Chicken',
    description: 'Classic battered fish served with crispy chips.',
    price: 269,
    image: getImage('fish-chips')?.imageUrl || '',
    imageHint: getImage('fish-chips')?.imageHint || ''
  },
  {
    id: 38,
    name: 'Chicken Nuggets (8pcs)',
    category: 'Broasted Chicken',
    description: 'Golden-fried chicken nuggets, perfect for dipping.',
    price: 129,
    image: getImage('chicken-nuggets')?.imageUrl || '',
    imageHint: getImage('chicken-nuggets')?.imageHint || ''
  },
  // Burgers
  {
    id: 1,
    name: 'Veg Tikki Burger',
    category: 'Burgers',
    description: 'Classic Indian street food flavors in a burger.',
    price: 149,
    image: getImage('veg-tikki-burger')?.imageUrl || '',
    imageHint: getImage('veg-tikki-burger')?.imageHint || ''
  },
  {
    id: 2,
    name: 'Paneer Burger',
    category: 'Burgers',
    description: 'A succulent paneer patty grilled to perfection.',
    price: 179,
    image: getImage('paneer-burger')?.imageUrl || '',
    imageHint: getImage('paneer-burger')?.imageHint || ''
  },
  {
    id: 3,
    name: 'Chicken Zinger Burger',
    category: 'Burgers',
    description: 'Crispy, spicy chicken fillet that packs a punch.',
    price: 179,
    image: getImage('chicken-zinger-burger')?.imageUrl || '',
    imageHint: getImage('chicken-zinger-burger')?.imageHint || ''
  },
  {
    id: 4,
    name: 'Chicken Crispy Burger',
    category: 'Burgers',
    description: 'Golden-fried crispy chicken patty with a satisfying crunch.',
    price: 179,
    image: getImage('chicken-crispy-burger')?.imageUrl || '',
    imageHint: getImage('chicken-crispy-burger')?.imageHint || ''
  },
  {
    id: 5,
    name: 'Chicken Smash Grill Burger',
    category: 'Burgers',
    description: 'Juicy smashed and grilled chicken for max flavor.',
    price: 179,
    image: getImage('chicken-smash-grill-burger')?.imageUrl || '',
    imageHint: getImage('chicken-smash-grill-burger')?.imageHint || ''
  },
  {
    id: 6,
    name: 'Cheese Chicken Burger',
    category: 'Burgers',
    description: 'A delicious chicken burger with a slice of melted cheese.',
    price: 179,
    image: getImage('cheese-chicken-burger')?.imageUrl || '',
    imageHint: getImage('cheese-chicken-burger')?.imageHint || ''
  },
  {
    id: 7,
    name: 'Chicken Peri Peri Burger',
    category: 'Burgers',
    description: 'Spicy and tangy peri peri marinated chicken burger.',
    price: 179,
    image: getImage('chicken-peri-peri-burger')?.imageUrl || '',
    imageHint: getImage('chicken-peri-peri-burger')?.imageHint || ''
  },
  // Broast Platters
  {
    id: 18,
    name: 'Chicken Broast Platter',
    category: 'Broast Platters',
    description: '4 Crispy Fried Chicken + 3 Crispy strips + Fries',
    price: 479,
    image: getImage('chicken-broast-platter-1')?.imageUrl || '',
    imageHint: getImage('chicken-broast-platter-1')?.imageHint || ''
  },
  {
    id: 19,
    name: 'Chicken Broast Platter',
    category: 'Broast Platters',
    description: '8 Crispy Fried Chicken + 2 Crispy Fried Fish + Fries',
    price: 729,
    image: getImage('chicken-broast-platter-2')?.imageUrl || '',
    imageHint: getImage('chicken-broast-platter-2')?.imageHint || ''
  },
  {
    id: 20,
    name: 'Chicken Broast Platter',
    category: 'Broast Platters',
    description: '4pc Crispy Fried Chicken + 12pc Crispy PopCorn + 6pc Chicken Nuggets + Fries + 2 softdrinks',
    price: 679,
    image: getImage('chicken-broast-platter-3')?.imageUrl || '',
    imageHint: getImage('chicken-broast-platter-3')?.imageHint || ''
  },
  // Platters
  {
    id: 21,
    name: 'Falafel Platter',
    category: 'Platters',
    description: '4 pcs falafel + French Fries + Salad + Sauces + Bread',
    price: 169,
    image: getImage('falafel-platter')?.imageUrl || '',
    imageHint: getImage('falafel-platter')?.imageHint || ''
  },
  {
    id: 22,
    name: 'Kebab Platter',
    category: 'Platters',
    description: 'Chicken + French Fries + Salad + Sauces + Bread',
    price: 219,
    image: getImage('kebab-platter')?.imageUrl || '',
    imageHint: getImage('kebab-platter')?.imageHint || ''
  },
  {
    id: 23,
    name: 'Istanbul Special Platter',
    category: 'Platters',
    description: 'Chicken + French Fries / Rice + falafel + Salad + Sauces + Bread + Soft Drink',
    price: 269,
    image: getImage('istanbul-special-platter')?.imageUrl || '',
    imageHint: getImage('istanbul-special-platter')?.imageHint || ''
  },
  // Salads
  {
    id: 24,
    name: 'Veg Salad',
    category: 'Salads',
    description: 'Lettuce + Carrot + Cucumber + Tomato + Onion + Capsicum + Sauces',
    price: 119,
    image: getImage('veg-salad')?.imageUrl || '',
    imageHint: getImage('veg-salad')?.imageHint || ''
  },
  {
    id: 25,
    name: 'Paneer Salad',
    category: 'Salads',
    description: 'Paneer + Lettuce + Carrot + Cucumber + Tomato + Onion + Capsicum + Sauces',
    price: 159,
    image: getImage('paneer-salad')?.imageUrl || '',
    imageHint: getImage('paneer-salad')?.imageHint || ''
  },
  {
    id: 26,
    name: 'Falafel Salad',
    category: 'Salads',
    description: '6 pcs falafel + Lettuce + Carrot + Cucumber + Tomato + Onion + Capsicum + Sauces',
    price: 169,
    image: getImage('falafel-salad')?.imageUrl || '',
    imageHint: getImage('falafel-salad')?.imageHint || ''
  },
  {
    id: 27,
    name: 'Chicken Salad',
    category: 'Salads',
    description: 'Chicken + Lettuce + Carrot + Cucumber + Tomato + Onion + Capsicum + Sauces',
    price: 189,
    image: getImage('chicken-salad')?.imageUrl || '',
    imageHint: getImage('chicken-salad')?.imageHint || ''
  },
  // Fries
  {
    id: 8,
    name: 'Classic Fries',
    category: 'Fries',
    description: 'Perfectly salted, golden and crispy french fries.',
    price: 79,
    image: getImage('classic-fries')?.imageUrl || '',
    imageHint: getImage('classic-fries')?.imageHint || ''
  },
  {
    id: 9,
    name: 'Peri Peri Fries',
    category: 'Fries',
    description: 'Classic fries tossed in a spicy peri peri seasoning.',
    price: 99,
    image: getImage('peri-peri-fries')?.imageUrl || '',
    imageHint: getImage('peri-peri-fries')?.imageHint || ''
  },
  {
    id: 10,
    name: 'Cheesy Fries',
    category: 'Fries',
    description: 'Golden fries smothered in rich, melted cheese.',
    price: 129,
    image: getImage('cheesy-fries')?.imageUrl || '',
    imageHint: getImage('cheesy-fries')?.imageHint || ''
  },
  {
    id: 11,
    name: 'Saucy Fries',
    category: 'Fries',
    description: 'Crispy fries drizzled with our special house sauces.',
    price: 149,
    image: getImage('saucy-fries')?.imageUrl || '',
    imageHint: getImage('saucy-fries')?.imageHint || ''
  },
  // Drinks
  {
    id: 12,
    name: 'Water (500ml)',
    category: 'Drinks',
    description: 'A refreshing bottle of chilled mineral water.',
    price: 10,
    image: getImage('water-bottle')?.imageUrl || '',
    imageHint: getImage('water-bottle')?.imageHint || ''
  },
  {
    id: 13,
    name: 'Soft Drinks (200ml)',
    category: 'Drinks',
    description: 'Choose from a selection of popular sodas.',
    price: 20,
    image: getImage('soft-drink')?.imageUrl || '',
    imageHint: getImage('soft-drink')?.imageHint || ''
  },
  {
    id: 14,
    name: 'Mojito',
    category: 'Drinks',
    description: 'A classic and refreshing mix of mint and lime.',
    price: 80,
    image: getImage('mojito')?.imageUrl || '',
    imageHint: getImage('mojito')?.imageHint || ''
  },
  // Sides
  {
    id: 15,
    name: 'Bread',
    category: 'Sides',
    description: 'A side of warm, soft bread.',
    price: 25,
    image: getImage('bread')?.imageUrl || '',
    imageHint: getImage('bread')?.imageHint || ''
  },
  {
    id: 16,
    name: 'Falafel',
    category: 'Sides',
    description: 'Crispy, flavorful chickpea fritters.',
    price: 79,
    image: getImage('falafel')?.imageUrl || '',
    imageHint: getImage('falafel')?.imageHint || ''
  },
  {
    id: 17,
    name: 'Extra Chicken',
    category: 'Sides',
    description: 'Add a side of our juicy grilled chicken.',
    price: 99,
    image: getImage('extra-chicken')?.imageUrl || '',
    imageHint: getImage('extra-chicken')?.imageHint || ''
  }
];
