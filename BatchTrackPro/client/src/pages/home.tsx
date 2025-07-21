import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BatchCard from "@/components/batch-card";
import { BatchGridSkeleton } from "@/components/loading-skeleton";
import Navigation from "@/components/navigation";
import type { Batch } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: batches, isLoading, error, refetch } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
    meta: { errorMessage: "Failed to load batches" }
  });

  const { mutate: initializeData, isPending: isInitializing } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/initialize");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to initialize data",
        variant: "destructive"
      });
    }
  });

  // Filter batches based on search and filters
  const filteredBatches = batches?.filter(batch => {
    const matchesSearch = batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.exam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExam = examFilter === "all" || batch.exam?.toLowerCase().includes(examFilter.toLowerCase());
    
    const batchStatus = getBatchStatus(batch);
    const matchesStatus = statusFilter === "all" || batchStatus === statusFilter;
    
    return matchesSearch && matchesExam && matchesStatus;
  }) || [];

  // Get unique exams for filter dropdown
  const uniqueExams = Array.from(new Set(batches?.map(batch => batch.exam).filter(Boolean) || []));

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 mb-4">
                <i className="fas fa-exclamation-circle text-4xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Batches</h2>
              <p className="text-slate-600 mb-4">
                Unable to connect to the database. Please check your connection and try again.
              </p>
              <div className="space-y-2">
                <Button onClick={() => refetch()} className="w-full">
                  Try Again
                </Button>
                <Button 
                  onClick={() => initializeData()} 
                  variant="outline"
                  disabled={isInitializing}
                  className="w-full"
                >
                  {isInitializing ? "Initializing..." : "Initialize Sample Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Batch Management</h1>
              <p className="mt-2 text-slate-600">Manage and view all educational batches</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button 
                onClick={() => initializeData()} 
                variant="outline"
                disabled={isInitializing}
              >
                {isInitializing ? "Initializing..." : "Load Sample Data"}
              </Button>
              <Button className="bg-primary text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </Button>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {uniqueExams.map(exam => (
                      <SelectItem key={exam} value={exam || ''}>{exam}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && <BatchGridSkeleton />}

        {/* Empty State */}
        {!isLoading && filteredBatches.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-slate-400 mb-4">
                <i className="fas fa-search text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No batches found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || examFilter !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by initializing sample data or adding a new batch"
                }
              </p>
              {!searchQuery && examFilter === "all" && statusFilter === "all" && (
                <Button 
                  onClick={() => initializeData()} 
                  disabled={isInitializing}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  {isInitializing ? "Loading..." : "Initialize Sample Data"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Batch Grid */}
        {!isLoading && filteredBatches.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>

            {/* Results Summary */}
            <div className="mt-8 text-center text-sm text-slate-600">
              Showing {filteredBatches.length} of {batches?.length || 0} batches
              {(searchQuery || examFilter !== "all" || statusFilter !== "all") && " (filtered)"}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function getBatchStatus(batch: Batch): 'active' | 'completed' | 'upcoming' {
  const now = new Date();
  const startsAt = batch.startsAt ? new Date(batch.startsAt) : null;
  const completedAt = batch.completedAt ? new Date(batch.completedAt) : null;
  
  if (completedAt && completedAt < now) {
    return 'completed';
  } else if (startsAt && startsAt > now) {
    return 'upcoming';
  } else {
    return 'active';
  }
}
