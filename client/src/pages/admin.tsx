import { useState } from "react";
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
import { Building2, Package, Upload, Plus, MapPin, Calendar, Globe } from "lucide-react";
import type { Distillery, Product } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("distilleries");

  // Fetch distilleries
  const { data: distilleries = [], isLoading: distilleriesLoading } = useQuery({
    queryKey: ["/api/distilleries"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Distilleries</h2>
          <p className="text-slate-600">Manage the master list of Scottish distilleries</p>
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
              Paste JSON array of distillery objects. Required fields: name, region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder='[{"name":"Macallan","region":"Speyside","country":"Scotland","founded":1824,"description":"Famous distillery"}]'
              className="min-h-32"
              data-testid="textarea-bulk-import"
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleBulkImport}
                disabled={bulkImportMutation.isPending || !bulkData.trim()}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-execute-bulk-import"
              >
                {bulkImportMutation.isPending ? "Importing..." : "Import"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkImport(false)}
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

      {/* Distilleries List */}
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
        ) : distilleries.length > 0 ? (
          distilleries.map((distillery) => (
            <Card key={distillery.id} className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-amber-100" data-testid={`card-distillery-${distillery.id}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-playfair font-bold text-xl text-slate-800 group-hover:text-amber-800 transition-colors" data-testid={`text-distillery-name-${distillery.id}`}>
                      {distillery.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-slate-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span data-testid={`text-distillery-region-${distillery.id}`}>{distillery.region}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {distillery.country}
                    </Badge>
                    {distillery.founded && (
                      <Badge variant="outline" className="border-slate-200">
                        <Calendar className="h-3 w-3 mr-1" />
                        {distillery.founded}
                      </Badge>
                    )}
                    <Badge 
                      variant={distillery.status === 'active' ? 'default' : 'secondary'}
                      className={distillery.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {distillery.status}
                    </Badge>
                  </div>

                  {distillery.description && (
                    <p className="text-slate-600 text-sm line-clamp-3" data-testid={`text-distillery-description-${distillery.id}`}>
                      {distillery.description}
                    </p>
                  )}

                  {distillery.website && (
                    <div className="flex items-center space-x-1 text-amber-600 text-sm">
                      <Globe className="h-4 w-4" />
                      <a href={distillery.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Distilleries Found</h3>
            <p className="text-slate-500">Add distilleries to start building your database</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsManager({ products, distilleries, isLoading }: { products: Product[], distilleries: Distillery[], isLoading: boolean }) {
  const { toast } = useToast();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkData, setBulkData] = useState("");

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
              Paste JSON array of product objects. Required fields: name, distilleryId, abv
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder='[{"name":"Macallan 18","distilleryId":"distillery-id","age":18,"abv":"43.0","description":"Premium whisky"}]'
              className="min-h-32"
              data-testid="textarea-bulk-import-products"
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleBulkImport}
                disabled={bulkImportMutation.isPending || !bulkData.trim()}
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-execute-bulk-import-products"
              >
                {bulkImportMutation.isPending ? "Importing..." : "Import"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkImport(false)}
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