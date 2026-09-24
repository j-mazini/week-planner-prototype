"use client";

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import VendorTypeTab from './VendorTypeTab';
import UserTypeTab from './UserTypeTab';
import VendorTypeTab from './VendorTypeTab';
import CostModelTab from './CostModelTab';
import VehicleTypeTab from './VehicleTypeTab';
import AdhocServiceTab from './AdhocServiceTab';

const TypesConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vendor-types');

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Types Configuration</h2>
        <p className="text-slate-600 mt-1">Manage all system types and configurations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-slate-200/60 mb-6">
          <TabsList className="bg-transparent h-auto p-0 w-full justify-start gap-0">
            <TabsTrigger
              value="vendor-types"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-truck me-2"></i>
              Vendor Types
            </TabsTrigger>
            <TabsTrigger
              value="user-types"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-person me-2"></i>
              User Types
            </TabsTrigger>
            <TabsTrigger
              value="vendor-types"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-person-badge me-2"></i>
              Vendor Types
            </TabsTrigger>
            <TabsTrigger
              value="cost-models"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-cash-stack me-2"></i>
              Cost Models
            </TabsTrigger>
            <TabsTrigger
              value="vehicle-types"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-car-front me-2"></i>
              Vehicle Types
            </TabsTrigger>
            <TabsTrigger
              value="adhoc-services"
              className="px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
            >
              <i className="bi bi-puzzle me-2"></i>
              Adhoc Services
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="vendor-types" className="mt-0">
          <VendorTypeTab />
        </TabsContent>

        <TabsContent value="user-types" className="mt-0">
          <UserTypeTab />
        </TabsContent>

        <TabsContent value="vendor-types" className="mt-0">
          <VendorTypeTab />
        </TabsContent>

        <TabsContent value="cost-models" className="mt-0">
          <CostModelTab />
        </TabsContent>

        <TabsContent value="vehicle-types" className="mt-0">
          <VehicleTypeTab />
        </TabsContent>

        <TabsContent value="adhoc-services" className="mt-0">
          <AdhocServiceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TypesConfig;


