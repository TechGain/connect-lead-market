
import React, { useState } from 'react';
import { useRefundRequests, RefundRequest } from '@/hooks/use-refund-requests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, User, DollarSign } from 'lucide-react';

const AdminRefundRequests: React.FC = () => {
  const { refundRequests, isLoading, isProcessing, processRefundRequest } = useRefundRequests();
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState<'approve' | 'deny' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleProcessRequest = (request: RefundRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setProcessingAction(action);
    setAdminNotes('');
    setDialogOpen(true);
  };

  const confirmProcessRequest = async () => {
    if (!selectedRequest || !processingAction) return;

    const success = await processRefundRequest(
      selectedRequest.id,
      processingAction,
      adminNotes
    );

    if (success) {
      setDialogOpen(false);
      setSelectedRequest(null);
      setProcessingAction(null);
      setAdminNotes('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading refund requests...</p>
      </div>
    );
  }

  const pendingRequests = refundRequests.filter(req => req.status === 'pending');
  const processedRequests = refundRequests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Refund Requests</h2>
        <p className="text-gray-600">
          Manage buyer refund requests for purchased leads
        </p>
      </div>

      {/* Pending Requests */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-yellow-700">
          Pending Requests ({pendingRequests.length})
        </h3>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center">No pending refund requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {request.buyer?.full_name || 'Unknown Buyer'}
                        {getStatusBadge(request.status)}
                      </CardTitle>
                      <CardDescription>
                        Requested {formatDistanceToNow(new Date(request.requested_at))} ago
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleProcessRequest(request, 'approve')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleProcessRequest(request, 'deny')}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Lead Details:</h4>
                        <p className="text-sm">{request.lead?.type} - {request.lead?.location}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${request.lead?.price}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Buyer Info:</h4>
                        <p className="text-sm">{request.buyer?.email}</p>
                        <p className="text-sm text-gray-600">{request.buyer?.company || 'No company'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Refund Reason:</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{request.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Processed Requests ({processedRequests.length})
          </h3>
          <div className="grid gap-4">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {request.buyer?.full_name || 'Unknown Buyer'}
                        {getStatusBadge(request.status)}
                      </CardTitle>
                      <CardDescription>
                        Processed {request.processed_at ? formatDistanceToNow(new Date(request.processed_at)) : 'unknown'} ago
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <p className="text-sm"><strong>Lead:</strong> {request.lead?.type} - {request.lead?.location}</p>
                    <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
                    {request.admin_notes && (
                      <p className="text-sm"><strong>Admin Notes:</strong> {request.admin_notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Process Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {processingAction === 'approve' ? 'Approve' : 'Deny'} Refund Request
            </DialogTitle>
            <DialogDescription>
              {processingAction === 'approve' 
                ? 'This will approve the refund request and may trigger the refund process.'
                : 'This will deny the refund request.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-1">Request Details:</h4>
                <p className="text-sm">{selectedRequest.buyer?.full_name} - {selectedRequest.lead?.type}</p>
                <p className="text-sm text-gray-600">Reason: {selectedRequest.reason}</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={processingAction === 'approve' ? 'default' : 'destructive'}
              onClick={confirmProcessRequest}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `${processingAction === 'approve' ? 'Approve' : 'Deny'} Request`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRefundRequests;
