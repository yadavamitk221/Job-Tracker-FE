import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ImportLogEntry {
  id: string;
  importId: string;
  source: string;
  sourceUrl: string;
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";
  timestamp: string;
  duration: number | null;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  successRate: number;
  errorCount: number;
  warningCount: number;
  triggerType: "manual" | "cron" | "api";
  triggeredBy: string;
  startTime: string;
  endTime: string | null;
  errors: any[];
  warnings: any[];
  metadata: any;
}

interface ImportHistoryTableProps {
  className?: string;
}

interface Filters {
  source: string;
  status: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const ImportHistoryTable: React.FC<ImportHistoryTableProps> = ({
  className = "",
}) => {
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });
  const [filters, setFilters] = useState<Filters>({
    source: "",
    status: "",
    startDate: "",
    endDate: "",
    sortBy: "startTime",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ImportLogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch import logs
  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.source && { source: filters.source }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/import/logs?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch import logs");

      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || "Failed to fetch import logs");
      }
    } catch (error) {
      console.error("Error fetching import logs:", error);
      toast.error("Failed to fetch import logs");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const newOrder =
      filters.sortBy === column && filters.sortOrder === "desc"
        ? "asc"
        : "desc";
    setFilters((prev) => ({ ...prev, sortBy: column, sortOrder: newOrder }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchLogs(page);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      source: "",
      status: "",
      startDate: "",
      endDate: "",
      sortBy: "startTime",
      sortOrder: "desc",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: ClockIcon,
      },
      "in-progress": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: ArrowUpIcon,
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircleIcon,
      },
      failed: { bg: "bg-red-100", text: "text-red-800", icon: XCircleIcon },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: XCircleIcon,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // Format duration
  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Show log details
  const showLogDetails = (log: ImportLogEntry) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === "desc" ? (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Import History
            </h3>
            <p className="text-sm text-gray-500">
              {pagination.totalCount} total imports
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => fetchLogs(pagination.currentPage)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 border-b border-gray-200 bg-gray-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange("source", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Sources</option>
                  <option value="jobicy">Jobicy</option>
                  <option value="higheredjobs">HigherEdJobs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("startTime")}
              >
                <div className="flex items-center">
                  Timestamp
                  <SortIcon column="startTime" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("source")}
              >
                <div className="flex items-center">
                  Source
                  <SortIcon column="source" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Fetched
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Imported
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Failed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No import logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {log.source}
                      </div>
                      <div className="text-xs text-gray-500 ml-1">
                        ({log.triggerType})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(log.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.totalFetched.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.totalImported.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {log.newJobs.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {log.updatedJobs.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {log.failedJobs.toLocaleString()}
                    {log.errorCount > 0 && (
                      <ExclamationTriangleIcon className="w-4 h-4 ml-1 inline" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            log.successRate >= 90
                              ? "bg-green-500"
                              : log.successRate >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${log.successRate}%` }}
                        />
                      </div>
                      <span className="text-xs">{log.successRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => showLogDetails(log)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount,
              )}{" "}
              of {pagination.totalCount} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Import Details: {selectedLog.importId}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Basic Information
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">Source</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.source}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Status</dt>
                        <dd className="text-sm">
                          {getStatusBadge(selectedLog.status)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Trigger Type</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.triggerType}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Triggered By</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.triggeredBy}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Duration</dt>
                        <dd className="text-sm text-gray-900">
                          {formatDuration(selectedLog.duration)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Statistics
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">Total Fetched</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.totalFetched.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">
                          Total Imported
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.totalImported.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">New Jobs</dt>
                        <dd className="text-sm text-green-600 font-medium">
                          {selectedLog.newJobs.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Updated Jobs</dt>
                        <dd className="text-sm text-blue-600 font-medium">
                          {selectedLog.updatedJobs.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Failed Jobs</dt>
                        <dd className="text-sm text-red-600 font-medium">
                          {selectedLog.failedJobs.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Success Rate</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedLog.successRate}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {selectedLog.errors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Errors ({selectedLog.errors.length})
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                      {selectedLog.errors.map((error, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="text-xs text-red-600 font-medium">
                            {format(
                              new Date(error.timestamp),
                              "MMM dd, HH:mm:ss",
                            )}
                          </div>
                          <div className="text-sm text-red-800">
                            {error.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.warnings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Warnings ({selectedLog.warnings.length})
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 max-h-40 overflow-y-auto">
                      {selectedLog.warnings.map((warning, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="text-xs text-yellow-600 font-medium">
                            {format(
                              new Date(warning.timestamp),
                              "MMM dd, HH:mm:ss",
                            )}
                          </div>
                          <div className="text-sm text-yellow-800">
                            {warning.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImportHistoryTable;
