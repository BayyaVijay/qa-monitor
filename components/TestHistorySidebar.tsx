'use client';

import React, { useState, useEffect } from 'react';
import { useTestExecution } from '@/context/TestExecutionContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { TestExecution } from '@/types/testExecution';

interface TestHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

export default function TestHistorySidebar({ isOpen, onClose, taskId }: TestHistorySidebarProps) {
  const { getTestExecutionsByTaskId } = useTestExecution();
  const [history, setHistory] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      loadHistory();
    }
  }, [isOpen, taskId]);

  const loadHistory = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const executions = await getTestExecutionsByTaskId(taskId);
      setHistory(executions);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPassRate = (passed: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((passed / total) * 100)}%`;
  };

  if (!isOpen) return null;
  console.log("selectedExecution",selectedExecution);
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Test History</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">No test history found for this task.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((execution) => (
              <Card key={execution._id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Test ID: {execution.testId}
                    </CardTitle>
                    <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {getStatusIcon(execution.status)}
                    <span>{execution.testerName}</span>
                    <span>•</span>
                    <span>{execution.createdAt && formatDate(execution.createdAt.toString())}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate:</span>
                      <span className="font-medium">
                        {getPassRate(execution.passedTestCases, execution.totalTestCases)}
                        <span className="text-gray-500 ml-1">
                          ({execution.passedTestCases}/{execution.totalTestCases})
                        </span>
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Feedback:</span>
                      <p className="mt-1 text-xs text-gray-800 line-clamp-2">
                        {execution.feedback}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setSelectedExecution(execution)}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Show Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Test Execution Details</DialogTitle>
                        </DialogHeader>
                        {selectedExecution && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">Test ID</label>
                                <p className="font-mono text-sm">{selectedExecution.testId}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getStatusIcon(selectedExecution.status)}
                                  <Badge className={`text-xs ${getStatusColor(selectedExecution.status)}`}>
                                    {selectedExecution.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Tester</label>
                                <p className="text-sm">{selectedExecution.testerName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Date</label>
                                <p className="text-sm">
                                  {selectedExecution.createdAt && formatDate(selectedExecution.createdAt.toString())}
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">Test Cases</label>
                              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {selectedExecution.testCases.map((testCase, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-2 border rounded">
                                    {testCase.passed ? (
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm">{testCase.testCase}</p>
                                      {testCase.notes && (
                                        <p className="text-xs text-gray-600 mt-1">{testCase.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">Feedback</label>
                              <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                                {selectedExecution.feedback}
                              </p>
                            </div>

                            {selectedExecution.attachedImages && selectedExecution.attachedImages.length > 0 && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Attached Images</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {selectedExecution.attachedImages.map((image, index) => (
                                    <>
                                    {console.log("->>",image)}
                                    <img
                                      key={index}
                                      src={image}
                                      alt={`Attachment ${index + 1}`}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                    </>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}