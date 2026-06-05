"use client";

import { PortalLayout } from "@/components/layout/portal-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  Activity,
  Settings,
  Search,
  UserPlus,
  MoreVertical,
  ShieldAlert,
  Server,
  Database,
  Lock,
  Eye,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { mockAuditLogs, mockUser, mockAuthorityUser, mockAdminUser, mockCitizenUser } from "@/lib/mock-data";

export default function AdminPortal() {
  const users = [mockAdminUser, mockAuthorityUser, mockUser, mockCitizenUser];

  return (
    <PortalLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              System Administration
            </h1>
            <p className="text-gray-500">
              Manage infrastructure, security, and global access controls.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Server className="h-4 w-4" />
              System Status
            </Button>
            <Button className="gap-2 shadow-md">
              <UserPlus className="h-4 w-4" />
              Provision User
            </Button>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "API Gateway",
              status: "operational",
              health: 99.98,
              icon: Activity,
              color: "text-green-500",
            },
            {
              label: "AI Matching Services",
              status: "operational",
              health: 99.95,
              icon: Shield,
              color: "text-green-500",
            },
            {
              label: "Database Clusters",
              status: "operational",
              health: 100,
              icon: Database,
              color: "text-green-500",
            },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-[10px] bg-gray-50 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-[#1428A0]" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none capitalize">
                    {item.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Uptime (30d)</span>
                  <span className="text-xs font-bold text-gray-900">{item.health}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Users and Audit */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading">User Management</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-10 h-9" />
                </div>
              </div>

              <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-600">User</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Role</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Status</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Joined</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span className="text-xs font-medium">Active</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Button variant="ghost" className="w-full text-gray-500 text-xs">
                View All Users (1,428)
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading">Security Audit Log</h2>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Audit Report
                </Button>
              </div>

              <Card className="border-none shadow-sm p-0 overflow-hidden">
                <div className="space-y-0 divide-y">
                  {mockAuditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/50">
                      <div className={cn(
                        "mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        log.action.includes("APPROVED") || log.action.includes("VERIFIED") ? "bg-green-50 text-green-600" : "bg-blue-50 text-[#1428A0]"
                      )}>
                        {log.action.includes("SECURITY") ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-900">
                            {log.userName} <span className="font-normal text-gray-500">performed</span> {log.action}
                          </p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">IP: {log.ipAddress}</span>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ID: {log.resource}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#1428A0]" />
                  Global Configuration
                </CardTitle>
                <CardDescription>Configure system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">AI Match Threshold</span>
                    <Badge className="bg-[#1428A0] text-white">70%</Badge>
                  </div>
                  <Progress value={70} className="h-1.5" />
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    Determines the minimum confidence required for an automated alert to be sent to authorities.
                  </p>
                </div>
                
                <Separator />

                <div className="space-y-4">
                  {[
                    { label: "Community Reporting", enabled: true },
                    { label: "Predictive Analytics", enabled: true },
                    { label: "Gov Identity Sync", enabled: false },
                    { label: "Public API Access", enabled: false },
                  ].map((config, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                      <div className={cn(
                        "h-5 w-10 rounded-full p-1 transition-colors cursor-pointer",
                        config.enabled ? "bg-[#1428A0]" : "bg-gray-200"
                      )}>
                        <div className={cn(
                          "h-3 w-3 rounded-full bg-white transition-all",
                          config.enabled ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4">Save Global Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-[#FFF7ED]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-orange-800">
                    Infrastructure scaling required: <span className="font-bold">CPU usage at 82%</span> in US-East-1 region.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-orange-800">
                    <span className="font-bold">12 accounts flagged</span> for suspicious reporting activity in the last hour.
                  </p>
                </div>
                <Button variant="outline" className="w-full border-orange-200 text-orange-800 hover:bg-orange-100">
                  Open Control Center
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Recent Security Events</h2>
              <div className="space-y-3">
                {[
                  { event: "New Admin provisioned", time: "2h ago", icon: Shield },
                  { event: "Failed login attempt (3)", time: "5h ago", icon: Lock },
                  { event: "System config updated", time: "1d ago", icon: Settings },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-[10px] bg-white border shadow-sm">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{item.event}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
