import { Link } from "wouter";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBatchStatus, formatDateRange, getExamIcon, getExamColor, getTeacherInitials } from "@/lib/supabase";
import type { Batch } from "@shared/schema";

interface BatchCardProps {
  batch: Batch;
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

export default function BatchCard({ batch }: BatchCardProps) {
  const status = getBatchStatus(batch);
  const examIcon = getExamIcon(batch.exam || '');
  const examColor = getExamColor(batch.exam || '');
  const dateRange = formatDateRange(
    batch.startsAt ? (typeof batch.startsAt === 'string' ? batch.startsAt : batch.startsAt.toISOString()) : null,
    batch.completedAt ? (typeof batch.completedAt === 'string' ? batch.completedAt : batch.completedAt.toISOString()) : null
  );
  
  // Extract teachers from teacherData
  const teachers = (batch.teacherData as any)?.teachers || [];
  const displayTeachers = teachers.slice(0, 3);
  const remainingCount = Math.max(0, teachers.length - 3);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${examColor}`}>
              <i className={`${examIcon} text-lg`}></i>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
                {batch.batchName}
              </h3>
              <p className="text-sm text-slate-500">{batch.exam}</p>
            </div>
          </div>
          <Badge className={`${statusColors[status]} text-xs font-medium border-0`}>
            {statusLabels[status]}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <span>{dateRange}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-400 mr-2" />
            <span>{batch.totalTeachers} Teachers</span>
          </div>
        </div>

        {displayTeachers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex -space-x-2">
              {displayTeachers.map((teacher: string, index: number) => {
                const initials = getTeacherInitials(teacher);
                const colors = [
                  'bg-purple-500', 'bg-green-500', 'bg-blue-500', 
                  'bg-red-500', 'bg-indigo-500', 'bg-pink-500'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div 
                    key={index}
                    className={`w-6 h-6 ${colorClass} rounded-full border-2 border-white flex items-center justify-center`}
                    title={teacher}
                  >
                    <span className="text-xs text-white font-medium">{initials}</span>
                  </div>
                );
              })}
              {remainingCount > 0 && (
                <div className="w-6 h-6 bg-slate-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-medium">+{remainingCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <span>ID: {batch.batchId}</span>
          </div>
          <Link href={`/batch/${batch.batchId}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700 p-0">
              View Details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
