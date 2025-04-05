import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getTransactionHistory, getLayer2Balance, getLayer1Balance } from '@/lib/ethers';
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to format addresses
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Define the Transaction interface
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: string;
  createdAt: number;
  batchId?: string;
  type?: string;
  isInBatch?: boolean;
}

interface TransactionTrackerProps {
  mode: "user" | "network";
  address?: string;
}

export function TransactionTracker({ mode, address }: TransactionTrackerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address: connectedAddress } = useWallet();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const targetAddress = mode === "user" ? (address || connectedAddress) : undefined;

      if (!targetAddress && mode === "user") {
        console.error("No address provided for user mode");
        return;
      }

      const url = mode === "user"
        ? `http://localhost:5500/api/transactions/user/${targetAddress}`
        : "http://localhost:5500/api/transactions/network";

      console.log(`Fetching transactions from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} transactions:`, data);

      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Set up polling for live updates
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [mode, address, connectedAddress]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Verified</Badge>;
      case "finalized":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">Finalized</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30">{status}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTransactionType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
      default:
        return 'Transfer';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-500";
      case "verified":
        return "text-green-500";
      case "finalized":
        return "text-blue-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        <p>No transactions found.</p>
      </div>
    );
  }

  return (
    <Card className="glass-card border border-white/10 backdrop-blur-md bg-black/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
      <CardHeader className="relative flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {mode === "user" ? "Your Transactions" : "Network Transactions"}
          </CardTitle>
          <CardDescription className="text-white/70">
            {mode === "user"
              ? "View your recent Layer 2 transactions"
              : "View all transactions on the Layer 2 network"}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchTransactions}
          className="rounded-full bg-white/5 hover:bg-white/10"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-10 w-full bg-white/5" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-white/5 p-4 mb-4">
              <ExternalLink className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white/70">No transactions found</h3>
            <p className="text-sm text-white/50 mt-1">
              {mode === "user"
                ? "Your transaction history will appear here"
                : "Network transactions will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Hash</TableHead>
                  <TableHead className="text-white/70">From</TableHead>
                  <TableHead className="text-white/70">To</TableHead>
                  <TableHead className="text-white/70">Amount</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Time</TableHead>
                  {mode === "network" && <TableHead className="text-white/70">Batch ID</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.hash} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-white/80">
                      {formatAddress(tx.hash)}
                    </TableCell>
                    <TableCell className="font-mono text-white/80">
                      {formatAddress(tx.from)}
                    </TableCell>
                    <TableCell className="font-mono text-white/80">
                      {formatAddress(tx.to)}
                    </TableCell>
                    <TableCell className="font-medium text-white/90">
                      {formatEther(tx.value)} ETH
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {formatTimestamp(tx.createdAt)}
                    </TableCell>
                    {mode === "network" && (
                      <TableCell className="font-mono text-white/80">
                        {tx.batchId ? formatAddress(tx.batchId) : "N/A"}
                      </TableCell>
                    )}
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
