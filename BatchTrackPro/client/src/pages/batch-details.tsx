import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, RefreshCw, Edit, Download, BarChart3, ExternalLink, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { BatchDetailsSkeleton, VideoListSkeleton } from "@/components/loading-skeleton";
import { getBatchStatus, formatDateRange, getExamIcon, getExamColor, getTeacherInitials } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VideoPlayer from "@/components/video-player";
import PDFReader from "@/components/pdf-reader";
import type { Batch, BatchItem } from "@shared/schema";

interface RouteParams {
  batchId: string;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-amber-100 text-amber-800", 
  upcoming: "bg-blue-100 text-blue-800"
};

const statusLabels = {
  active: "Active",
  completed: "Completed",
  upcoming: "Upcoming"
};

export default function BatchDetails() {
  const { batchId } = useParams<RouteParams>();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batch, isLoading: batchLoading, error: batchError } = useQuery<Batch>({
    queryKey: ["/api/batches", batchId],
    enabled: !!batchId,
  });

  const { data: batchItems, isLoading: itemsLoading } = useQuery<BatchItem[]>({
    queryKey: ["/api/batches", batchId, "items"],
    enabled: !!batchId,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/batches/${batchId}/sync`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Batch data synced successfully",
      });
      // Invalidate and refetch batch data
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId, "items"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync batch data",
        variant: "destructive"
      });
    }
  });

  if (batchError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 mb-4">
                <i className="fas fa-exclamation-circle text-4xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Batch Not Found</h2>
              <p className="text-slate-600 mb-4">
                The requested batch could not be found or there was an error loading it.
              </p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (batchLoading || !batch) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BatchDetailsSkeleton />
        </main>
      </div>
    );
  }

  const status = getBatchStatus(batch);
  const examIcon = getExamIcon(batch.exam || '');
  const examColor = getExamColor(batch.exam || '');
  const dateRange = formatDateRange(
    batch.startsAt ? (typeof batch.startsAt === 'string' ? batch.startsAt : batch.startsAt.toISOString()) : null,
    batch.completedAt ? (typeof batch.completedAt === 'string' ? batch.completedAt : batch.completedAt.toISOString()) : null
  );
  
  // Extract teachers from teacherData
  const teachers = (batch.teacherData as any)?.teachers || [];
  const leadTeacher = teachers[0];
  
  // Filter videos from batch items
  const videos = batchItems?.filter(item => item.itemType === "video") || [];
  const recentVideos = videos.slice(0, 5);

  // Calculate stats
  const stats = {
    totalVideos: videos.length,
    totalHours: Math.round(videos.length * 1.5), // Estimate 1.5 hours per video
    enrolledStudents: Math.floor(Math.random() * 5000) + 1000, // Mock data
    completionRate: Math.floor(Math.random() * 40) + 60, // Mock data
  };

  const lastSyncTime = (batch.metadata as any)?.lastSyncAt 
    ? new Date((batch.metadata as any).lastSyncAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Never';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentBatch={{ batchName: batch.batchName, batchId: batch.batchId }} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-primary hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
        </Link>
        
        {/* Batch Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${examColor}`}>
                  <i className={`${examIcon} text-xl`}></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {batch.batchName}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center">
                      <i className="fas fa-tag mr-1"></i>
                      {batch.exam}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-calendar mr-1"></i>
                      {dateRange}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-users mr-1"></i>
                      {batch.totalTeachers} Teachers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${statusColors[status]} border-0`}>
                      {statusLabels[status]}
                    </Badge>
                    <Badge variant="outline">
                      ID: {batch.batchId}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 flex space-x-3">
                <Button 
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  {syncMutation.isPending ? 'Syncing...' : 'Sync Data'}
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos & Content</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Batch Statistics */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Batch Statistics</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.totalVideos}</div>
                        <div className="text-sm text-slate-600">Total Videos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.totalHours}</div>
                        <div className="text-sm text-slate-600">Total Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.enrolledStudents.toLocaleString()}</div>
                        <div className="text-sm text-slate-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
                        <div className="text-sm text-slate-600">Completion</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Videos */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Recent Videos</h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("videos")}>
                        View All
                      </Button>
                    </div>
                    
                    {itemsLoading ? (
                      <VideoListSkeleton />
                    ) : recentVideos.length > 0 ? (
                      <div className="space-y-4">
                        {recentVideos.map((video, index) => {
                          const videoData = video.itemData as any;
                          const liveDate = video.liveAt ? new Date(video.liveAt) : null;
                          
                          return (
                            <div key={video.id} className="flex items-center space-x-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <div className="w-16 h-12 bg-slate-200 rounded flex items-center justify-center">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-full h-full">
                                      <Play className="h-5 w-5 text-slate-500" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl w-[90vw]">
                                    <DialogHeader>
                                      <DialogTitle>{video.title || videoData.title || 'Video'}</DialogTitle>
                                    </DialogHeader>
                                    <VideoPlayer 
                                      src={videoData.video_url || '#'}
                                      title={video.title || videoData.title}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-800">
                                  {video.title || videoData.title || 'Video'}
                                </h4>
                                <div className="flex items-center space-x-3 text-sm text-slate-600">
                                  {liveDate && (
                                    <span>{liveDate.toLocaleDateString()}</span>
                                  )}
                                  <span>•</span>
                                  <span>1h 45m</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(videoData.video_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              {videoData.pdf_url && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
                                    <DialogHeader>
                                      <DialogTitle>PDF - {video.title || videoData.title || 'Document'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-auto">
                                      <PDFReader 
                                        src={videoData.pdf_url}
                                        title={video.title || videoData.title}
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Play className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No videos available</p>
                        <p className="text-sm">Sync data to load video content</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Lead Teacher */}
                {leadTeacher && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Teacher</h3>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getTeacherInitials(leadTeacher)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{leadTeacher}</h4>
                          <p className="text-sm text-slate-600">Subject Expert</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Experience</span>
                          <span className="text-slate-800 font-medium">10+ Years</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Rating</span>
                          <div className="flex items-center">
                            <div className="flex text-yellow-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i key={i} className="fas fa-star text-xs"></i>
                              ))}
                            </div>
                            <span className="ml-1 text-slate-600">(4.9)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                      >
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 text-primary mr-3" />
                          <span>Sync Latest Data</span>
                        </div>
                        <i className="fas fa-chevron-right text-slate-400"></i>
                      </Button>
                      <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 text-green-600 mr-3" />
                          <span>Export Data</span>
                        </div>
                        <i className="fas fa-chevron-right text-slate-400"></i>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 text-purple-600 mr-3" />
                          <span>View Analytics</span>
                        </div>
                        <i className="fas fa-chevron-right text-slate-400"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-sm">Last API Sync</span>
                        <span className="text-sm text-green-600 font-medium">{lastSyncTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-sm">Database Status</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-sm">API Status</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Videos & Content</h3>
                  <Button 
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Sync Content
                  </Button>
                </div>

                {itemsLoading ? (
                  <VideoListSkeleton />
                ) : videos.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video) => {
                      const videoData = video.itemData as any;
                      const liveDate = video.liveAt ? new Date(video.liveAt) : null;
                      
                      return (
                        <div key={video.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <div className="w-20 h-14 bg-slate-200 rounded flex items-center justify-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full h-full">
                                  <Play className="h-6 w-6 text-slate-500" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>{video.title || videoData.title || 'Video'}</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 overflow-auto">
                                  <VideoPlayer 
                                    src={videoData.video_url || '#'}
                                    title={video.title || videoData.title}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 mb-1">
                              {video.title || videoData.title || 'Video'}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              {liveDate && (
                                <span>{liveDate.toLocaleDateString()}</span>
                              )}
                              <span>Video Content</span>
                              <span>1h 45m</span>
                            </div>
                            {videoData.pdf_url && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  PDF Available
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {videoData.pdf_url && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                                  <DialogHeader>
                                    <DialogTitle>PDF - {video.title || videoData.title || 'Document'}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex-1 overflow-auto">
                                    <PDFReader 
                                      src={videoData.pdf_url}
                                      title={video.title || videoData.title}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(videoData.video_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Play className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h4 className="text-lg font-medium mb-2">No content available</h4>
                    <p className="mb-4">Sync data from the external API to load video content</p>
                    <Button 
                      onClick={() => syncMutation.mutate()}
                      disabled={syncMutation.isPending}
                      className="bg-primary text-white hover:bg-blue-700"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                      {syncMutation.isPending ? 'Syncing...' : 'Sync Content Now'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Teaching Staff</h3>
                
                {teachers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teachers.map((teacher: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getTeacherInitials(teacher)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{teacher}</h4>
                          <p className="text-sm text-slate-600">Subject Expert</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <i className="fas fa-users text-4xl mb-4 text-slate-300"></i>
                    <p>No teacher information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Analytics & Reports</h3>
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <h4 className="text-lg font-medium mb-2">Analytics Coming Soon</h4>
                  <p>Detailed analytics and reporting features will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
