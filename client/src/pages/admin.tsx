import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Package, Upload, Plus, MapPin, Calendar, Globe, FileSpreadsheet, X, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Distillery, Product } from "@shared/schema";

// CSV to JSON conversion utility
function convertCSVToJSON(csvText: string, type: 'distilleries' | 'products'): any[] {
  console.log('Converting CSV with', csvText.split('\n').length, 'lines');
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  console.log('CSV headers detected:', headers.length, 'columns');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 1}: has ${values.length} columns, expected ${headers.length}`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index].trim();
      
      // Convert common field types
      if (type === 'distilleries') {
        if (header === 'founded' && value) {
          row[header] = parseInt(value) || null;
        } else if (header === 'status') {
          row[header] = value || 'active';
        } else if (header === 'country') {
          row[header] = value || 'Scotland';
        } else if (header === 'region') {
          // Region is required, set a default if empty
          row[header] = value || 'Highland';
        } else {
          row[header] = value || null;
        }
      } else if (type === 'products') {
        if (header === 'age' && value) {
          row[header] = parseInt(value) || null;
        } else if (header === 'limitedEdition') {
          row[header] = value.toLowerCase() === 'true' || value === '1';
        } else if (header === 'availability') {
          row[header] = value || 'available';
        } else {
          row[header] = value || null;
        }
      }
    });

    data.push(row);
  }

  console.log(`Successfully converted ${data.length} rows from CSV`);
  return data;
}

// Parse CSV line respecting quoted fields
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      // Handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2; // Skip both quotes
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
      continue;
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  return result.map(field => {
    // Remove surrounding quotes
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
}

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("distilleries");

  // Fetch distilleries
  const { data: distilleries = [], isLoading: distilleriesLoading } = useQuery<Distillery[]>({
    queryKey: ["/api/distilleries"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cream to-warmwhite">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-500/20 p-2">
              <img 
                src="/logo.png" 
                alt="The Dram Journal Logo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-playfair text-4xl font-bold text-white mb-1">
                Database Management
              </h1>
              <p className="text-amber-200 text-lg">
                Manage distilleries and products for The Dram Journal
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="distilleries" className="flex items-center space-x-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Building2 className="h-4 w-4" />
              <span>Distilleries</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
          </TabsList>

          {/* Distilleries Tab */}
          <TabsContent value="distilleries" className="space-y-8">
            <DistilleriesManager distilleries={distilleries} isLoading={distilleriesLoading} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-8">
            <ProductsManager products={products} distilleries={distilleries} isLoading={productsLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DistilleriesManager({ distilleries, isLoading }: { distilleries: Distillery[], isLoading: boolean }) {
  const { toast } = useToast();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [importMethod, setImportMethod] = useState<"json" | "csv">("json");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter states
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Get unique values for filter options
  const uniqueRegions = Array.from(new Set(distilleries.map(d => d.region).filter(Boolean))).sort();
  const uniqueCountries = Array.from(new Set(distilleries.map(d => d.country).filter(Boolean))).sort();
  const uniqueStatuses = Array.from(new Set(distilleries.map(d => d.status).filter(Boolean))).sort();

  // Filter distilleries based on selected filters
  const filteredDistilleries = distilleries.filter(distillery => {
    if (filterRegion !== "all" && distillery.region !== filterRegion) return false;
    if (filterCountry !== "all" && distillery.country !== filterCountry) return false;
    if (filterStatus !== "all" && distillery.status !== filterStatus) return false;
    return true;
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return await apiRequest("/api/distilleries/bulk", {
        method: "POST",
        body: data
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkData("");
      setShowBulkImport(false);
      queryClient.invalidateQueries({ queryKey: ["/api/distilleries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import distilleries",
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(bulkData);
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }
      bulkImportMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please provide valid JSON data",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (file.name.endsWith('.csv')) {
          const jsonData = convertCSVToJSON(text, 'distilleries');
          setBulkData(JSON.stringify(jsonData, null, 2));
          setImportMethod("csv");
        } else if (file.name.endsWith('.json')) {
          setBulkData(text);
          setImportMethod("json");
        } else {
          throw new Error("Please upload a CSV or JSON file");
        }
        toast({
          title: "File uploaded successfully",
          description: `Converted ${file.name} to JSON format`,
        });
      } catch (error) {
        toast({
          title: "File conversion failed",
          description: error instanceof Error ? error.message : "Failed to process file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Distilleries</h2>
          <p className="text-slate-600">Manage the master list of Scottish distilleries ({distilleries.length} total)</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            data-testid="button-bulk-import-distilleries"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            data-testid="button-add-distillery"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Distillery
          </Button>
        </div>
      </div>

      {/* Bulk Import Form */}
      {showBulkImport && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle>Bulk Import Distilleries</CardTitle>
            <CardDescription>
              Upload a CSV file or paste JSON data. Required fields: name, region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Method Selection */}
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Import Method:</Label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="json-import"
                    name="import-method"
                    checked={importMethod === "json"}
                    onChange={() => setImportMethod("json")}
                    className="text-amber-600"
                  />
                  <Label htmlFor="json-import" className="text-sm">JSON Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="csv-import"
                    name="import-method"
                    checked={importMethod === "csv"}
                    onChange={() => setImportMethod("csv")}
                    className="text-amber-600"
                  />
                  <Label htmlFor="csv-import" className="text-sm">CSV File</Label>
                </div>
              </div>
            </div>

            {/* CSV Upload Section */}
            {importMethod === "csv" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50">
                  <FileSpreadsheet className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                  <p className="text-slate-700 mb-4">
                    Upload a CSV file with distillery data
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    CSV headers: name, region, country, founded, status, website, description
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  <Button
                    onClick={triggerFileUpload}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    data-testid="button-upload-file"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </Button>
                </div>
              </div>
            )}

            {/* JSON Text Area */}
            {importMethod === "json" && (
              <div className="space-y-2">
                <Label htmlFor="json-data">JSON Data</Label>
                <Textarea
                  id="json-data"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder='[{"name":"Macallan","region":"Speyside","country":"Scotland","founded":1824,"description":"Famous distillery"}]'
                  className="min-h-32 font-mono text-sm"
                  data-testid="textarea-bulk-import"
                />
              </div>
            )}

            {/* Preview converted data */}
            {bulkData && (
              <div className="space-y-2">
                <Label>Data Preview</Label>
                <div className="bg-slate-100 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(bulkData), null, 2).substring(0, 500)}
                    {JSON.stringify(JSON.parse(bulkData), null, 2).length > 500 && '...'}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleBulkImport}
                disabled={bulkImportMutation.isPending || !bulkData.trim()}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-execute-bulk-import"
              >
                {bulkImportMutation.isPending ? "Importing..." : "Import Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkData("");
                  setImportMethod("json");
                }}
                data-testid="button-cancel-bulk-import"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Form */}
      {showAddForm && (
        <AddDistilleryForm onSuccess={() => setShowAddForm(false)} />
      )}

      {/* Filter Controls */}
      <Card className="bg-white/90 backdrop-blur-sm border-amber-100 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg text-slate-800">Filter Distilleries</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="region-filter" className="text-sm font-medium text-slate-700 mb-2 block">
                Region
              </Label>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger data-testid="select-region-filter">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {uniqueRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country-filter" className="text-sm font-medium text-slate-700 mb-2 block">
                Country
              </Label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger data-testid="select-country-filter">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 mb-2 block">
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter Results Summary */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredDistilleries.length} of {distilleries.length} distilleries
            </div>
            {(filterRegion !== "all" || filterCountry !== "all" || filterStatus !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterRegion("all");
                  setFilterCountry("all");
                  setFilterStatus("all");
                }}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distilleries List */}
      <Card className="bg-white/90 backdrop-blur-sm border-amber-100">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 animate-pulse">
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    <div className="h-6 w-12 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDistilleries.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto">
              {filteredDistilleries
                .sort((a, b) => {
                  // First sort by region
                  if (a.region !== b.region) {
                    return a.region.localeCompare(b.region);
                  }
                  // Then sort by name within the same region
                  return a.name.localeCompare(b.name);
                })
                .map((distillery, index, sortedArray) => {
                  // Check if this is the first distillery in a new region
                  const isFirstInRegion = index === 0 || sortedArray[index - 1].region !== distillery.region;
                  
                  return (
                    <div key={distillery.id}>
                      {/* Region Header */}
                      {isFirstInRegion && (
                        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100">
                          <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">
                            {distillery.region}
                          </h4>
                        </div>
                      )}
                      
                      {/* Distillery Row */}
                      <div 
                        className={`flex items-center justify-between p-4 hover:bg-amber-50 transition-colors ${
                          index < sortedArray.length - 1 ? 'border-b border-slate-100' : ''
                        }`}
                        data-testid={`row-distillery-${distillery.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-800 truncate" data-testid={`text-distillery-name-${distillery.id}`}>
                                {distillery.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span data-testid={`text-distillery-region-${distillery.id}`}>{distillery.region}</span>
                                </div>
                                {distillery.founded && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{distillery.founded}</span>
                                  </div>
                                )}
                                {distillery.website && (
                                  <div className="flex items-center space-x-1">
                                    <Globe className="h-3 w-3" />
                                    <a href={distillery.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                              {distillery.description && (
                                <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed" data-testid={`text-distillery-description-${distillery.id}`}>
                                  {distillery.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {distillery.country}
                          </Badge>
                          <Badge 
                            variant={distillery.status === 'active' ? 'default' : 'secondary'}
                            className={distillery.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}
                          >
                            {distillery.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : distilleries.length > 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Matching Distilleries</h3>
              <p className="text-slate-500">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Distilleries Found</h3>
              <p className="text-slate-500">Add distilleries to start building your database</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsManager({ products, distilleries, isLoading }: { products: Product[], distilleries: Distillery[], isLoading: boolean }) {
  const { toast } = useToast();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [importMethod, setImportMethod] = useState<"json" | "csv">("json");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return await apiRequest("/api/products/bulk", {
        method: "POST",
        body: data
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result.message,
      });
      setBulkData("");
      setShowBulkImport(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products",
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(bulkData);
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }
      bulkImportMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please provide valid JSON data",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (file.name.endsWith('.csv')) {
          const jsonData = convertCSVToJSON(text, 'products');
          setBulkData(JSON.stringify(jsonData, null, 2));
          setImportMethod("csv");
        } else if (file.name.endsWith('.json')) {
          setBulkData(text);
          setImportMethod("json");
        } else {
          throw new Error("Please upload a CSV or JSON file");
        }
        toast({
          title: "File uploaded successfully",
          description: `Converted ${file.name} to JSON format`,
        });
      } catch (error) {
        toast({
          title: "File conversion failed",
          description: error instanceof Error ? error.message : "Failed to process file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Get distillery name by ID
  const getDistilleryName = (distilleryId: string) => {
    const distillery = distilleries.find(d => d.id === distilleryId);
    return distillery?.name || "Unknown Distillery";
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Products</h2>
          <p className="text-slate-600">Manage whisky products from all distilleries</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            data-testid="button-bulk-import-products"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            data-testid="button-add-product"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Import Form */}
      {showBulkImport && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle>Bulk Import Products</CardTitle>
            <CardDescription>
              Upload a CSV file or paste JSON data. Required fields: name, distilleryId, abv
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Method Selection */}
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Import Method:</Label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="json-import-products"
                    name="import-method-products"
                    checked={importMethod === "json"}
                    onChange={() => setImportMethod("json")}
                    className="text-amber-600"
                  />
                  <Label htmlFor="json-import-products" className="text-sm">JSON Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="csv-import-products"
                    name="import-method-products"
                    checked={importMethod === "csv"}
                    onChange={() => setImportMethod("csv")}
                    className="text-amber-600"
                  />
                  <Label htmlFor="csv-import-products" className="text-sm">CSV File</Label>
                </div>
              </div>
            </div>

            {/* CSV Upload Section */}
            {importMethod === "csv" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50">
                  <FileSpreadsheet className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                  <p className="text-slate-700 mb-4">
                    Upload a CSV file with product data
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    CSV headers: name, distilleryId, age, abv, caskType, price, description, availability
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload-products"
                  />
                  <Button
                    onClick={triggerFileUpload}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    data-testid="button-upload-file-products"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </Button>
                </div>

                {/* Distillery ID Helper */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Available Distillery IDs:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {distilleries.slice(0, 6).map((distillery) => (
                      <div key={distillery.id} className="text-blue-700">
                        <code className="bg-blue-100 px-1 rounded">{distillery.id.substring(0, 8)}...</code> = {distillery.name}
                      </div>
                    ))}
                    {distilleries.length > 6 && (
                      <div className="text-blue-600 text-xs col-span-2">
                        ... and {distilleries.length - 6} more. Check the Distilleries tab for full IDs.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* JSON Text Area */}
            {importMethod === "json" && (
              <div className="space-y-2">
                <Label htmlFor="json-data-products">JSON Data</Label>
                <Textarea
                  id="json-data-products"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder='[{"name":"Macallan 18","distilleryId":"distillery-id","age":18,"abv":"43.0","description":"Premium whisky"}]'
                  className="min-h-32 font-mono text-sm"
                  data-testid="textarea-bulk-import-products"
                />
              </div>
            )}

            {/* Preview converted data */}
            {bulkData && (
              <div className="space-y-2">
                <Label>Data Preview</Label>
                <div className="bg-slate-100 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(bulkData), null, 2).substring(0, 500)}
                    {JSON.stringify(JSON.parse(bulkData), null, 2).length > 500 && '...'}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleBulkImport}
                disabled={bulkImportMutation.isPending || !bulkData.trim()}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-execute-bulk-import-products"
              >
                {bulkImportMutation.isPending ? "Importing..." : "Import Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkData("");
                  setImportMethod("json");
                }}
                data-testid="button-cancel-bulk-import-products"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Form */}
      {showAddForm && (
        <AddProductForm distilleries={distilleries} onSuccess={() => setShowAddForm(false)} />
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-white/90">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-3 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-amber-100" data-testid={`card-product-${product.id}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-playfair font-bold text-xl text-slate-800 group-hover:text-amber-800 transition-colors" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    <p className="text-slate-600" data-testid={`text-product-distillery-${product.id}`}>
                      {getDistilleryName(product.distilleryId)}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {product.age && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {product.age} years
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-slate-200">
                      {product.abv}% ABV
                    </Badge>
                    {product.caskType && (
                      <Badge variant="outline" className="border-amber-200 text-amber-700">
                        {product.caskType}
                      </Badge>
                    )}
                    {product.limitedEdition && (
                      <Badge className="bg-red-100 text-red-800">
                        Limited Edition
                      </Badge>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-slate-600 text-sm line-clamp-3" data-testid={`text-product-description-${product.id}`}>
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>{product.availability}</span>
                    {product.price && (
                      <span className="font-semibold text-amber-600">
                        £{product.price}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Products Found</h3>
            <p className="text-slate-500">Add products to start building your catalog</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddDistilleryForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    country: "Scotland",
    founded: "",
    status: "active",
    website: "",
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/distilleries", {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Distillery created successfully",
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["/api/distilleries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create distillery",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      founded: formData.founded ? parseInt(formData.founded) : undefined,
    };
    createMutation.mutate(submitData);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle>Add New Distillery</CardTitle>
        <CardDescription>Create a new distillery entry</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-distillery-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="e.g., Speyside, Highland, Islay"
              required
              data-testid="input-distillery-region"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              data-testid="input-distillery-country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded">Founded Year</Label>
            <Input
              id="founded"
              type="number"
              value={formData.founded}
              onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
              placeholder="1824"
              data-testid="input-distillery-founded"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              data-testid="input-distillery-website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              data-testid="select-distillery-status"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="demolished">Demolished</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the distillery..."
              data-testid="textarea-distillery-description"
            />
          </div>

          <div className="md:col-span-2 flex space-x-3">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
              data-testid="button-submit-distillery"
            >
              {createMutation.isPending ? "Creating..." : "Create Distillery"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              data-testid="button-cancel-distillery"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AddProductForm({ distilleries, onSuccess }: { distilleries: Distillery[], onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    distilleryId: "",
    age: "",
    abv: "",
    caskType: "",
    description: "",
    price: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/products", {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
    };
    createMutation.mutate(submitData);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Create a new whisky product entry</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Macallan 18 Year Old"
              required
              data-testid="input-product-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distillery">Distillery *</Label>
            <select
              id="distillery"
              value={formData.distilleryId}
              onChange={(e) => setFormData({ ...formData, distilleryId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              data-testid="select-product-distillery"
            >
              <option value="">Select a distillery</option>
              {distilleries.map((distillery) => (
                <option key={distillery.id} value={distillery.id}>
                  {distillery.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="18"
              data-testid="input-product-age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abv">ABV % *</Label>
            <Input
              id="abv"
              value={formData.abv}
              onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
              placeholder="43.0"
              required
              data-testid="input-product-abv"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cask-type">Cask Type</Label>
            <Input
              id="cask-type"
              value={formData.caskType}
              onChange={(e) => setFormData({ ...formData, caskType: e.target.value })}
              placeholder="e.g., Sherry, Bourbon, Port"
              data-testid="input-product-cask-type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (£)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="299.99"
              data-testid="input-product-price"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tasting notes and description..."
              data-testid="textarea-product-description"
            />
          </div>

          <div className="md:col-span-2 flex space-x-3">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
              data-testid="button-submit-product"
            >
              {createMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              data-testid="button-cancel-product"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}