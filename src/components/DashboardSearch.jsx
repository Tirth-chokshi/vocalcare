import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardSearch = ({ onSearch, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const handleSearch = () => {
    onSearch(searchTerm, searchCategory);
  };

  const searchCategories = {
    admin: ['all', 'patients', 'therapists', 'supervisors', 'therapy plans'],
    supervisor: ['all', 'patients', 'therapists', 'therapy plans'],
    therapist: ['all', 'patients', 'therapy plans'],
    patient: ['all', 'therapy plans', 'sessions']
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[120px]">
            {searchCategory.charAt(0).toUpperCase() + searchCategory.slice(1)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {searchCategories[userRole].map((category) => (
            <DropdownMenuItem 
              key={category}
              onSelect={() => setSearchCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-[200px]"
      />
      <Button onClick={handleSearch} size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DashboardSearch;