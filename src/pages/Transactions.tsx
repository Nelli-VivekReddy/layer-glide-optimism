import { useState } from 'react';
import { BatchManager } from "@/components/BatchManager";
import { TransactionTracker } from "@/components/TransactionTracker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getLayer2Balance } from "@/lib/ethers";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function Transactions() {
  const [searchAddress, setSearchAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  const handleSearch = async () => {
    if (!searchAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Fetch Layer 2 balance
      const l2Balance = await getLayer2Balance(searchAddress);
      setBalance(l2Balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Transactions</h1>
      <Card className="glass-card border border-white/10 backdrop-blur-md bg-black/30">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Search Transactions
          </CardTitle>
          <CardDescription className="text-white/70">
            View transaction history and balance for any wallet address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="bg-white/5 border-white/10 text-white flex-1"
              disabled={isSearching}
            />
            <Button
              onClick={handleSearch}
              className="bg-purple-500 hover:bg-purple-600"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
          {searchAddress && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm mb-4">
              <div className="text-sm text-white/70 mb-1">Layer 2 Balance</div>
              <div className="text-xl font-medium text-white">
                {Number(balance).toFixed(4)} ETH
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {searchAddress && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-500/20">
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-purple-500/20">
              Network Transactions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <TransactionTracker mode="user" address={searchAddress} />
          </TabsContent>
          <TabsContent value="network">
            <TransactionTracker mode="network" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
