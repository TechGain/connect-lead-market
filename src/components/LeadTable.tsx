
import React from 'react';
import { Lead } from '@/types/lead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import LeadFilters from './LeadFilters';

interface LeadTableProps {
  leads: Lead[];
}

const LeadTable = ({ leads }: LeadTableProps) => {
  const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>(leads);
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof Lead;
    direction: 'asc' | 'desc';
  } | null>(null);

  React.useEffect(() => {
    setFilteredLeads(leads);
  }, [leads]);

  const handleFilterChange = (filters: {
    search: string;
    type: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => {
    const filtered = leads.filter(lead => {
      // Apply search filter
      if (filters.search && !Object.values(lead).some(value => 
        value && typeof value === 'string' && value.toLowerCase().includes(filters.search.toLowerCase())
      )) {
        return false;
      }
      
      // Apply type filter
      if (filters.type && filters.type !== 'all' && lead.type !== filters.type) {
        return false;
      }
      
      // Apply location filter
      if (filters.location && filters.location !== 'all' && 
          !lead.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Apply price range filter
      if (lead.price < filters.minPrice || lead.price > filters.maxPrice) {
        return false;
      }
      
      // Apply rating filter
      if ((lead.qualityRating || 0) < filters.minRating) {
        return false;
      }
      
      return true;
    });
    
    setFilteredLeads(filtered);
  };

  const sortLeads = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    const sorted = [...filteredLeads].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return direction === 'asc' 
          ? (a[key] as string).localeCompare(b[key] as string)
          : (b[key] as string).localeCompare(a[key] as string);
      }
      
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return direction === 'asc' 
          ? (a[key] as number) - (b[key] as number)
          : (b[key] as number) - (a[key] as number);
      }
      
      return 0;
    });
    
    setFilteredLeads(sorted);
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'sold':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format the lead type for display (convert from kebab-case to Title Case)
  const formatLeadType = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <LeadFilters onFilterChange={handleFilterChange} />
      
      {filteredLeads.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No leads found matching your filters.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('type')}
                >
                  Type {renderSortIcon('type')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('location')}
                >
                  Location {renderSortIcon('location')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('price')}
                >
                  Price {renderSortIcon('price')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('sellerName')}
                >
                  Seller {renderSortIcon('sellerName')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('buyerName')}
                >
                  Buyer {renderSortIcon('buyerName')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('qualityRating')}
                >
                  Quality {renderSortIcon('qualityRating')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('status')}
                >
                  Status {renderSortIcon('status')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortLeads('createdAt')}
                >
                  Created {renderSortIcon('createdAt')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{formatLeadType(lead.type)}</TableCell>
                  <TableCell>{lead.location}</TableCell>
                  <TableCell>${lead.price.toFixed(2)}</TableCell>
                  <TableCell>{lead.sellerName || 'Unknown'}</TableCell>
                  <TableCell>{lead.buyerName || '-'}</TableCell>
                  <TableCell>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < (lead.qualityRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>
                        ★
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(lead.status)} text-white`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
