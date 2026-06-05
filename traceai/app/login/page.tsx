"use client";

import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("family");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const setDemoLogin = (role: string) => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      email: `${role}@traceai.io`,
      password: "demo123",
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.postRaw<{ access_token: string; user: any }>("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as any,
        phone: response.user.phone,
        createdAt: response.user.created_at,
      };

      login(user, response.access_token);
      router.push(`/${user.role}`);
    } catch (err: any) {
      setErrors({ root: err.message || "Invalid credentials" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({
      ...formData,
      role: selectedRole,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.postRaw<{ access_token: string; user: any }>("/api/auth/register", {
        ...formData,
        role: selectedRole,
      });

      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as any,
        phone: response.user.phone,
        createdAt: response.user.created_at,
      };

      login(user, response.access_token);
      router.push(`/${user.role}`);
    } catch (err: any) {
      setErrors({ root: err.message || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const roleIcons: Record<string, React.ElementType> = {
    family: Users,
    citizen: Eye,
    authority: ShieldCheck,
    admin: Building2,
  };

  const roleDescriptions: Record<string, string> = {
    family: "Register a missing person case",
    citizen: "Report sightings and help search",
    authority: "Verify cases and approve matches",
    admin: "Manage system and users",
  };

  return (
    <div className="min-h-screen gradient-primary-light flex items-center justify-center p-4">
      <div className="flex w-full max-w-5xl flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Brand Side */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-[12px] text-white text-xl font-bold shadow-lg">
              T
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#1428A0]">
              TraceAI
            </h1>
          </div>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
            AI-Powered Missing Person Recovery Network
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
            Real-time backend integration enabled. Login with demo users or create a new account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            {Object.keys(roleDescriptions).map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                className={`gap-2 rounded-[10px] ${selectedRole === role ? 'border-[#1428A0] bg-[#1428A0]/5' : ''}`}
                onClick={() => setDemoLogin(role)}
              >
                {roleIcons[role] && <span className="h-4 w-4"><Icon role={roleIcons[role]} /></span>}
                <span className="capitalize">{role}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-heading text-center">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering ? "Join the network" : "Sign in to your portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.root && (
              <div className="mb-4 p-3 rounded-[10px] bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.root}
              </div>
            )}

            {isRegistering ? (
              <form onSubmit={handleRegister} noValidate>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Role *</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family Member</SelectItem>
                        <SelectItem value="citizen">Citizen Volunteer</SelectItem>
                        <SelectItem value="authority">Police / Authority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="Your full name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        required
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setIsRegistering(false)} className="text-[#1428A0] font-medium hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} noValidate>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        required
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="relative my-2">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                      OR
                    </span>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => setIsRegistering(true)} className="text-[#1428A0] font-medium hover:underline">
                      Register
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Icon({ role }: { role: React.ElementType }) {
  const IconComponent = role;
  return <IconComponent className="h-4 w-4" />;
}