// Frontend1/src/components/ui/sidebar.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'rings', name: 'Rings' },
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'bracelets', name: 'Bracelets' },
];

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategories = searchParams.get('category')?.split(',') || [];

  // Local state for price inputs to avoid updating URL on every keystroke
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Handle category checkbox changes
  const handleCategoryChange = (categoryId: string, checked: boolean | string) => {
    const params = new URLSearchParams(searchParams);
    const newCategories = new Set(activeCategories);

    if (checked) {
      newCategories.add(categoryId);
    } else {
      newCategories.delete(categoryId);
    }

    const newCategoriesArray = Array.from(newCategories);
    if (newCategoriesArray.length > 0) {
      params.set('category', newCategoriesArray.join(','));
    } else {
      params.delete('category');
    }
    setSearchParams(params, { replace: true });
  };

  // Handle applying price filter
  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams);
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    setSearchParams(params, { replace: true });
  };

  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams();
    // Preserve search term if it exists
    if (searchParams.get('search')) {
        params.set('search', searchParams.get('search')!);
    }
    // Preserve sort option if it exists
    if (searchParams.get('sort')) {
        params.set('sort', searchParams.get('sort')!);
    }
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(params, { replace: true });
  };

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
          Clear all
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={activeCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                  />
                  <Label
                    htmlFor={`cat-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full"
                aria-label="Minimum price"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full"
                aria-label="Maximum price"
              />
            </div>
            <Button onClick={handlePriceApply} className="w-full mt-4">
              Apply Price
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Add more filters (e.g., Rating, Material) here as new AccordionItem */}
      </Accordion>
    </aside>
  );
}