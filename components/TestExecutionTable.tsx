'use client';

import React, { useEffect, useState } from 'react';
import { useTestExecution } from '@/context/TestExecutionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, History, Search, Filter, RefreshCw, FileText, Calendar, User, Target } from 'lucide-react';
import { TestExecution } from '@/types/testExecution';

interface TestExecutionTableProps {
  onEditTestExecution: (testExecution: TestExecution) => void;
  onShowHistory: (taskId: string) => void;
}
interface TaskId{
  _id: string;
}
type ExtendedTestExecution = TestExecution & {
  executionCount: number;
  latestExecution: string;
};

export default function TestExecutionTable({ onEditTestExecution, onShowHistory }: TestExecutionTableProps) {
  const { testExecutions, loading, error, getTestExecutions, deleteTestExecution } = useTestExecution();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    getTestExecutions(filters);
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      setDeleteLoading(id);
      await deleteTestExecution(id);
    } catch (error) {
      console.error('Error deleting test execution:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    getTestExecutions(filters);
  };

  const handleRefresh = () => {
    getTestExecutions(filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPassRate = (passed: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((passed / total) * 100)}%`;
  };

  // Group test executions by task to show unique tasks
  const uniqueTasks = testExecutions.reduce(
    (acc: Record<string, ExtendedTestExecution>, execution: TestExecution) => {
      const taskId = execution.taskId && typeof execution.taskId === "object" ? execution.taskId._id : execution.taskId;
  
      if (!taskId) return acc;
  
      const executionCreatedAt = execution.createdAt ?? "";
      const parsedCreatedAt = new Date(executionCreatedAt);
  
      if (!acc[taskId]) {
        acc[taskId] = {
          ...execution,
          executionCount: 1,
          latestExecution: executionCreatedAt,
        };
      } else {
        const accLatest = acc[taskId].latestExecution ?? "";
        const accLatestDate = new Date(accLatest);
  
        if (parsedCreatedAt > accLatestDate) {
          acc[taskId] = {
            ...execution,
            executionCount: acc[taskId].executionCount,
            latestExecution: executionCreatedAt,
          };
        } else {
          acc[taskId].executionCount += 1;
        }
      }
  
      return acc;
    },
    {} as Record<string, ExtendedTestExecution>
  );
  
  
  const uniqueTasksArray: ExtendedTestExecution[] = Object.values(uniqueTasks);
  
  
  if (loading && testExecutions.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Test Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-12 w-12 text-blue-400 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Test Executions</h3>
            <p className="text-gray-500">Please wait while we fetch your data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-red-600" />
            <span>Test Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-red-800 font-semibold mb-2 text-lg">Error Loading Data</h3>
              <p className="text-red-600 text-sm mb-6">{error}</p>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Test Executions</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
              <Filter className="h-4 w-4" />
              <span>{testExecutions.length} total executions</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Enhanced Filters */}
        <div className="mb-8 space-y-6 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Search Test Executions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Test ID, Tester Name, or Feedback..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Status Filter</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="testId">Test ID</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="testerName">Tester Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Order</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({
                  status: 'all',
                  search: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                })}
                variant="outline"
                className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {uniqueTasksArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-12 max-w-lg text-center">
              <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-6">
                <History className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-blue-800 font-bold text-xl mb-3">No Test Executions Found</h3>
              <p className="text-blue-600 mb-6 leading-relaxed">
                {filters.search || filters.status !== 'all' 
                  ? 'No test executions match your current filters. Try adjusting your search criteria.'
                  : 'Create your first test execution using the form above to get started with QA monitoring!'
                }
              </p>
              {(filters.search || filters.status !== 'all') && (
                <Button
                  onClick={() => setFilters({
                    status: 'all',
                    search: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                  })}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                  <TableHead className="font-bold text-gray-800 py-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Task ID</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Test ID</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">Task Description</TableHead>
                  <TableHead className="font-bold text-gray-800">Status</TableHead>
                  <TableHead className="font-bold text-gray-800">Pass Rate</TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Tester</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">Tests</TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last Updated</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueTasksArray.map((execution, index) => (
                  <TableRow key={execution._id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                    <TableCell className="font-medium py-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {(index + 1).toString().padStart(3, '0')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium text-blue-700">
                      {execution.testId}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate text-gray-900">
                          {typeof execution.taskId === 'object' ? execution.taskId.description : 'Task description not available'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(typeof execution.taskId === 'object' ? execution.taskId.tags : []).slice(0, 2).map((tag: string, tagIndex: number) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(typeof execution.taskId === 'object' ? execution.taskId.tags : []).length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{(typeof execution.taskId === 'object' ? execution.taskId.tags : []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {getPassRate(execution.passedTestCases, execution.totalTestCases)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {execution.passedTestCases}/{execution.totalTestCases} passed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-700">
                      {execution.testerName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs font-bold">
                        {execution.executionCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {execution.createdAt && formatDate(execution.createdAt.toString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditTestExecution(execution)}
                          className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShowHistory(typeof execution.taskId === 'object' ? execution.taskId._id : execution.taskId)}
                          className="h-8 w-8 p-0 border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-50"
                              disabled={deleteLoading === execution._id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Test Execution</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this test execution? This action cannot be undone and will remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => execution._id && handleDelete(execution._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteLoading === execution._id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}