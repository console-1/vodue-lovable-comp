
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Palette, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    resetEmail: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      // Success handled by auth context
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.displayName);
    
    if (!error) {
      setActiveTab('signin');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await resetPassword(formData.resetEmail);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Palette className="h-8 w-8 text-stone-700" />
            <h1 className="text-3xl font-light tracking-tight text-stone-900">VODUE</h1>
          </div>
          <p className="text-stone-600 text-sm font-light">
            Where vibe-coding meets haute couture design
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="border-stone-200 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              <TabsTrigger value="reset" className="text-sm">Reset</TabsTrigger>
            </TabsList>

            <CardContent className="space-y-4">
              {/* Sign In */}
              <TabsContent value="signin" className="space-y-4 mt-0">
                <CardHeader className="text-center p-0 mb-4">
                  <CardTitle className="text-xl font-light">Welcome back</CardTitle>
                  <CardDescription>Sign in to continue creating workflows</CardDescription>
                </CardHeader>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="border-stone-300 focus:border-stone-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="border-stone-300 focus:border-stone-500 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-stone-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-stone-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-stone-700 hover:bg-stone-800 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup" className="space-y-4 mt-0">
                <CardHeader className="text-center p-0 mb-4">
                  <CardTitle className="text-xl font-light">Create account</CardTitle>
                  <CardDescription>Join the vibe-coding revolution</CardDescription>
                </CardHeader>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Your display name"
                      className="border-stone-300 focus:border-stone-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="border-stone-300 focus:border-stone-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a password"
                        required
                        className="border-stone-300 focus:border-stone-500 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-stone-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-stone-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-stone-700 hover:bg-stone-800 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              {/* Reset Password */}
              <TabsContent value="reset" className="space-y-4 mt-0">
                <CardHeader className="text-center p-0 mb-4">
                  <CardTitle className="text-xl font-light">Reset password</CardTitle>
                  <CardDescription>Enter your email to receive reset instructions</CardDescription>
                </CardHeader>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={formData.resetEmail}
                      onChange={(e) => handleInputChange('resetEmail', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="border-stone-300 focus:border-stone-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-stone-700 hover:bg-stone-800 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-stone-500 text-xs font-light flex items-center justify-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Powered by sophisticated automation</span>
          </p>
        </div>
      </div>
    </div>
  );
};
