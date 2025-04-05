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

  useEffect(() => {
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

    fetchTransactions();
    // Set up polling for live updates
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [mode, address, connectedAddress]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
      case 'confirmed':
      case 'verified':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "user" ? "Your Transactions" : "Network Transactions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hash</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              {mode === "network" && <TableHead>Batch ID</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell className="font-mono">
                  {formatAddress(tx.hash)}
                </TableCell>
                <TableCell className="font-mono">
                  {formatAddress(tx.from)}
                </TableCell>
                <TableCell className="font-mono">
                  {formatAddress(tx.to)}
                </TableCell>
                <TableCell>{formatEther(tx.value)} ETH</TableCell>
                <TableCell className={getStatusColor(tx.status)}>
                  {tx.status}
                </TableCell>
                <TableCell>{formatTimestamp(tx.createdAt)}</TableCell>
                {mode === "network" && (
                  <TableCell className="font-mono">
                    {tx.batchId ? formatAddress(tx.batchId) : "N/A"}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
