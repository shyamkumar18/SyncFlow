import { Category } from '../models/Category';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../utils/constants';

export async function seedDefaultCategories(): Promise<void> {
  const existingDefaults = await Category.countDocuments({ isDefault: true });
  if (existingDefaults > 0) {
    return;
  }

  const defaultCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      name: cat.name,
      type: 'expense' as const,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
      sortOrder: 0,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      name: cat.name,
      type: 'income' as const,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
      sortOrder: 0,
    })),
  ];

  await Category.insertMany(defaultCategories);
  console.log(`Seeded ${defaultCategories.length} default categories`);
}
