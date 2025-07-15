import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  ChartBarIcon,
  ClockIcon,
  ServerIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import ImportHistoryTable from "../components/ImportHistoryTable";

interface ImportStats {
  totalImports: number;
  totalFetched: number;
  totalImported: number;
  totalNew: number;
  totalUpdated: number;
  totalFailed: number;
  successRate: number;
  avgDuration: number;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface ImportStatus {
  queue: QueueStats;
  scheduler: {
    active: boolean;
    taskCount: number;
    importInterval: string;
  };
  timestamp: string;
}

export default function Dashboard() {
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview",
  );

  // Fetch data
  const fetchData = async () => {
    try {
      const [statsResponse, statusResponse] = await Promise.all([
        fetch("/api/import/stats"),
        fetch("/api/import/status"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setImportStats(statsData.data);
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setImportStatus(statusData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Trigger import
  const triggerImport = async () => {
    setTriggering(true);
    try {
      const response = await fetch("/api/import/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority: 10,
          concurrency: 5,
          batchSize: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Import job triggered successfully! Job ID: ${data.data.jobId}`,
        );
        // Refresh data after a short delay
        setTimeout(fetchData, 1000);
      } else {
        throw new Error("Failed to trigger import");
      }
    } catch (error) {
      console.error("Error triggering import:", error);
      toast.error("Failed to trigger import job");
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Job Import Dashboard</title>
        <meta name="description" content="Monitor and manage job imports" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Import Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={triggerImport}
                  disabled={triggering}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {triggering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Triggering...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Trigger Import
                    </>
                  )}
                </button>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Import History
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "overview" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <motion.div
                  variants={itemVariants}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Imports
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {importStats?.totalImports || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Success Rate
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {importStats?.successRate || 0}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ServerIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Queue Status
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {importStatus?.queue.active || 0} active
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            importStatus?.scheduler.active
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                        />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Scheduler
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {importStatus?.scheduler.active
                              ? "Active"
                              : "Inactive"}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Statistics Overview */}
              <motion.div
                variants={itemVariants}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Import Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {importStats?.totalFetched || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Fetched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-600">
                        {importStats?.totalImported || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Imported
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {importStats?.totalNew || 0}
                      </div>
                      <div className="text-sm text-gray-500">New Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning-600">
                        {importStats?.totalUpdated || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated Records
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Queue Status */}
              <motion.div
                variants={itemVariants}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Queue Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {importStatus?.queue.waiting || 0}
                      </div>
                      <div className="text-sm text-gray-500">Waiting</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {importStatus?.queue.active || 0}
                      </div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importStatus?.queue.completed || 0}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importStatus?.queue.failed || 0}
                      </div>
                      <div className="text-sm text-gray-500">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {importStatus?.queue.total || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* System Info */}
              <motion.div
                variants={itemVariants}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    System Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Scheduler
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`text-sm font-medium ${
                              importStatus?.scheduler.active
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {importStatus?.scheduler.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Import Interval:
                          </span>
                          <span className="text-sm text-gray-900">
                            {importStatus?.scheduler.importInterval || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Last Updated
                      </h4>
                      <div className="text-sm text-gray-900">
                        {importStatus?.timestamp
                          ? format(
                              new Date(importStatus.timestamp),
                              "MMM dd, yyyy HH:mm:ss",
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ImportHistoryTable />
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
