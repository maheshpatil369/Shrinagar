// Frontend1/src/components/ui/sidebar.tsx

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

  const handleCategoryChange = (categoryId: string, checked: boolean | string) => {
    const params = new URLSearchParams(searchParams);
    const newCategories = new Set(activeCategories);

    if (checked) newCategories.add(categoryId);
    else newCategories.delete(categoryId);

    const newCategoriesArray = Array.from(newCategories);
    if (newCategoriesArray.length > 0) {
      params.set('category', newCategoriesArray.join(','));
    } else {
      params.delete('category');
    }

    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    const params = new URLSearchParams();

    if (searchParams.get('search')) {
      params.set('search', searchParams.get('search')!);
    }
    if (searchParams.get('sort')) {
      params.set('sort', searchParams.get('sort')!);
    }

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

      <Accordion type="multiple" defaultValue={['category']} className="w-full">
        
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

        {/* Search Keyword (Input Example Updated) */}
        <AccordionItem value="search">
          <AccordionTrigger className="font-medium">Search Keyword</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="Search jewelry..."
              className="bg-[#0F172A] text-gray-200 placeholder:text-gray-400 border border-gray-700"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Seller Name Input */}
        <AccordionItem value="seller">
          <AccordionTrigger className="font-medium">Seller ID or Name</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="Enter Seller ID/Name..."
              className="bg-[#0F172A] text-gray-200 placeholder:text-gray-400 border border-gray-700"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Material Input */}
        <AccordionItem value="material">
          <AccordionTrigger className="font-medium">Material</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="Material..."
              className="bg-[#0F172A] text-gray-200 placeholder:text-gray-400 border border-gray-700"
            />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </aside>
  );
}
