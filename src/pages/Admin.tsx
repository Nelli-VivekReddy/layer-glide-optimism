import React from 'react';
import AdminBatchManager from '../components/AdminBatchManager';
import AdminSettings from '../components/AdminSettings';
import { useWallet } from '../hooks/useWallet';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const AdminPage: React.FC = () => {
  const { address, isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8">
        <Card className="glass-card border border-white/10 backdrop-blur-md bg-black/30">
          <CardContent className="py-8">
            <div className="text-center text-white/70">
              Please connect your wallet to access the admin panel
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Admin Panel
      </h1>

      <Tabs defaultValue="batches" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="batches" className="data-[state=active]:bg-white/10">
            Batch Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <AdminBatchManager isAdmin={true} />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
