"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  MapPin,
  Shield,
  Activity,
  ArrowRight,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  Globe,
  Bell,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  mockCases,
  mockSightings,
} from "@/lib/mock-data";

export default function LandingPage() {
  const activeCases = mockCases.filter(c => c.status === "active").slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-[8px] text-white text-sm font-bold font-heading">
              T
            </div>
            <span className="font-heading text-xl font-bold text-[#1428A0]">
              TraceAI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-[#1428A0] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[#1428A0] transition-colors">How It Works</Link>
            <Link href="#active-cases" className="hover:text-[#1428A0] transition-colors">Active Search</Link>
            <Link href="#about" className="hover:text-[#1428A0] transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Join Network</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(20,40,160,0.05)_0%,rgba(255,255,255,0)_100%)]" />
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center">
              <Badge variant="outline" className="mb-6 px-4 py-1 text-[#1428A0] bg-[#1428A0]/5 border-[#1428A0]/20 animate-fade-in">
                Empowering Missing Person Recovery with AI
              </Badge>
              <h1 className="font-heading text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl animate-fade-in [animation-delay:200ms]">
                Locate Missing Loved Ones <span className="text-[#1428A0]">Faster</span> Through Intelligence
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mb-10 animate-fade-in [animation-delay:400ms]">
                TraceAI connects families, citizens, and authorities in a unified intelligence network. Using advanced AI matching and predictive search, we reduce response times when every second counts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in [animation-delay:600ms]">
                <Link href="/login" className="flex-1">
                  <Button size="xl" className="w-full text-lg shadow-xl hover:shadow-2xl transition-all">
                    Register a Case
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button size="xl" variant="outline" className="w-full text-lg border-2">
                    Report a Sighting
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
                {[
                  { label: "Match Accuracy", value: ">85%" },
                  { label: "Search Time Reduction", value: "40%" },
                  { label: "Verified Leads", value: "10k+" },
                  { label: "Connected Authorities", value: "500+" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-[#1428A0] font-heading">{stat.value}</span>
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">Core Intelligence Modules</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Advanced technology designed to assist human efforts in recovery operations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI Matching Engine",
                  desc: "Facial recognition and similarity scoring across thousands of citizen-reported sightings and CCTV feeds.",
                  icon: BrainCircuit,
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  title: "Predictive Search",
                  desc: "Movement pattern engines and route prediction to help authorities prioritize search areas effectively.",
                  icon: Activity,
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  title: "Community Reporting",
                  desc: "Empower citizens to report sightings with GPS-stamped photos and videos directly from their mobile devices.",
                  icon: Globe,
                  color: "bg-green-100 text-green-600",
                },
                {
                  title: "Authority Dashboards",
                  desc: "Dedicated portals for police and NGOs to verify leads, coordinate resources, and manage case lifecycles.",
                  icon: Shield,
                  color: "bg-red-100 text-red-600",
                },
                {
                  title: "Missing Person Registry",
                  desc: "Secure, structured registration for families to create high-detail profiles for AI analysis.",
                  icon: Users,
                  color: "bg-indigo-100 text-indigo-600",
                },
                {
                  title: "Instant Notifications",
                  desc: "Geo-fenced alerts to nearby citizens and instant push notifications to families when a match is verified.",
                  icon: Bell,
                  color: "bg-yellow-100 text-yellow-600",
                },
              ].map((feature, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-white">
                  <CardHeader>
                    <div className={cn("w-12 h-12 rounded-[12px] flex items-center justify-center mb-4 transition-transform group-hover:scale-110", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-8">How TraceAI Works</h2>
                <div className="space-y-8">
                  {[
                    {
                      step: "01",
                      title: "Family Registers Case",
                      desc: "Detailed profile creation including photos, clothing descriptions, and last known location.",
                    },
                    {
                      step: "02",
                      title: "Network Activation",
                      desc: "Instant alerts sent to authorities and citizens in the relevant geographical search area.",
                    },
                    {
                      step: "03",
                      title: "AI Analysis & Matching",
                      desc: "System continuously scans reported sightings and media, highlighting high-confidence matches.",
                    },
                    {
                      step: "04",
                      title: "Verified Recovery",
                      desc: "Authorities verify leads through the dashboard and coordinate safe recovery with families.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1428A0] text-white font-bold font-heading">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-[24px] aspect-video flex items-center justify-center relative overflow-hidden border">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1428A0]/10 to-transparent" />
                <MapPin className="h-24 w-24 text-[#1428A0]/20" />
                <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-[16px]">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Matching Engine</p>
                      <p className="text-sm font-bold text-gray-900">Emily Chen match verified (94%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Cases Section */}
        <section id="active-cases" className="py-24 bg-[#1428A0]/5">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-heading text-4xl font-bold text-gray-900 mb-2">Active Searches</h2>
                <p className="text-gray-600">Please help identify these individuals in your area.</p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex border-[#1428A0] text-[#1428A0]">
                  View All Cases
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activeCases.map((caseItem) => (
                <Card key={caseItem.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group">
                  <div className="aspect-[4/3] bg-gray-200 relative">
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white font-bold px-3 py-1">URGENT</Badge>
                    </div>
                    {/* Placeholder for photo */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Users className="h-12 w-12 text-gray-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl">{caseItem.name}</CardTitle>
                      <span className="text-lg font-bold text-gray-400">{caseItem.age}y</span>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 font-medium text-[#1428A0]">
                      <MapPin className="h-4 w-4" />
                      {caseItem.lastSeenLocation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic">
                      &quot;{caseItem.description}&quot;
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 uppercase font-semibold">
                        <span>Last Seen</span>
                        <span>{new Date(caseItem.lastSeenDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 border-t">
                    <Link href="/login" className="w-full">
                      <Button variant="ghost" className="w-full h-14 rounded-none text-[#1428A0] font-bold hover:bg-[#1428A0] hover:text-white transition-colors">
                        REPORT SIGHTING
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="gradient-primary rounded-[32px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Shield className="h-64 w-64 rotate-12" />
              </div>
              <h2 className="font-heading text-4xl lg:text-6xl font-bold mb-8 relative z-10">Join the Search Network</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 relative z-10">
                Whether you are a family seeking help, a concerned citizen, or a law enforcement agency, TraceAI provides the tools you need.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link href="/login">
                  <Button size="xl" className="bg-white text-[#1428A0] hover:bg-blue-50 w-full sm:w-auto font-bold shadow-lg">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto font-bold">
                    For Authorities
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-[8px] text-white text-sm font-bold font-heading">
                  T
                </div>
                <span className="font-heading text-xl font-bold text-[#1428A0]">
                  TraceAI
                </span>
              </div>
              <p className="text-gray-500 max-w-sm mb-8">
                Harnessing artificial intelligence and community collaboration to safely recover missing persons around the globe.
              </p>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-gray-400 hover:text-[#1428A0] cursor-pointer transition-colors shadow-sm">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-gray-400 hover:text-[#1428A0] cursor-pointer transition-colors shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Network</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link href="/login" className="hover:text-[#1428A0]">Family Portal</Link></li>
                <li><Link href="/login" className="hover:text-[#1428A0]">Citizen Portal</Link></li>
                <li><Link href="/login" className="hover:text-[#1428A0]">Authority Portal</Link></li>
                <li><Link href="/login" className="hover:text-[#1428A0]">API Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link href="#" className="hover:text-[#1428A0]">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#1428A0]">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-[#1428A0]">Data Security</Link></li>
                <li><Link href="#" className="hover:text-[#1428A0]">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 TraceAI Intelligence Network. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Verified Security Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
