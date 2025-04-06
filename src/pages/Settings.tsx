
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  CreditCard, 
  Globe, 
  Lock, 
  LogOut, 
  Shield, 
  User,
  AlertCircle
} from "lucide-react";

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-purple"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
              <User size={14} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-2">
              <Lock size={14} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
              <Bell size={14} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2 py-2">
              <CreditCard size={14} />
              <span>Payment</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 py-2">
              <Globe size={14} />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-earniverse-purple text-white flex items-center justify-center text-xl font-bold">
                        {user?.email?.substring(0, 1).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h3 className="font-medium">{user?.email?.split("@")[0] || "User"}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Enter your country" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Authenticator App</div>
                      <div className="text-sm text-muted-foreground">
                        Use an authenticator app to get two-factor authentication codes
                      </div>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">SMS Recovery</div>
                      <div className="text-sm text-muted-foreground">
                        Set up SMS recovery to access your account if you lose your device
                      </div>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Sessions</span>
                    <Button variant="outline" size="sm">Sign Out All Devices</Button>
                  </CardTitle>
                  <CardDescription>Manage your active sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <div className="font-medium flex items-center gap-2">
                        Current Device <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last active: Just now
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>Danger Zone</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Sign out everywhere</h4>
                        <p className="text-sm text-muted-foreground">
                          Sign out from all devices where you're currently logged in
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={signOut}>
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Email Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="account-updates" className="font-medium">Account Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                      </div>
                      <Switch id="account-updates" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="security-alerts" className="font-medium">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">Important notifications about your account security</p>
                      </div>
                      <Switch id="security-alerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="transaction-updates" className="font-medium">Transaction Updates</Label>
                        <p className="text-sm text-muted-foreground">Notifications for deposits, withdrawals, and other transactions</p>
                      </div>
                      <Switch id="transaction-updates" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-updates" className="font-medium">Marketing & Promotions</Label>
                        <p className="text-sm text-muted-foreground">Occasional updates about new features and special offers</p>
                      </div>
                      <Switch id="marketing-updates" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Push Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-transactions" className="font-medium">Transaction Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about your transactions in real time</p>
                      </div>
                      <Switch id="push-transactions" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-security" className="font-medium">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive immediate notifications about security events</p>
                      </div>
                      <Switch id="push-security" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-promotions" className="font-medium">Promotions</Label>
                        <p className="text-sm text-muted-foreground">Notifications about special offers and promotions</p>
                      </div>
                      <Switch id="push-promotions" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Payment Methods</span>
                    <Button size="sm">Add Payment Method</Button>
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <CreditCard className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">Visa ending in 4242</h4>
                        <p className="text-sm text-muted-foreground">Expires 04/2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Default</Badge>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                          <rect width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.2" />
                          <path d="M4 10H16" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Bank Account (****1234)</h4>
                        <p className="text-sm text-muted-foreground">Chase Bank</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>Manage your billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-line1">Address Line 1</Label>
                      <Input id="address-line1" placeholder="123 Main St" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-line2">Address Line 2</Label>
                      <Input id="address-line2" placeholder="Apt 4B" />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="NY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input id="postal-code" placeholder="10001" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Address</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">Allow sharing anonymized usage data to improve our services</p>
                      </div>
                      <Switch id="data-sharing" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="personalized-ads" className="font-medium">Personalized Ads</Label>
                        <p className="text-sm text-muted-foreground">Allow us to show you personalized advertisements</p>
                      </div>
                      <Switch id="personalized-ads" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics-cookies" className="font-medium">Analytics Cookies</Label>
                        <p className="text-sm text-muted-foreground">Allow cookies for analytics purposes</p>
                      </div>
                      <Switch id="analytics-cookies" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Privacy Settings</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Preferences</CardTitle>
                  <CardDescription>Configure advanced security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="login-notifications" className="font-medium">Login Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                      </div>
                      <Switch id="login-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="suspicious-activity" className="font-medium">Suspicious Activity Detection</Label>
                        <p className="text-sm text-muted-foreground">Enhanced monitoring for unusual account activity</p>
                      </div>
                      <Switch id="suspicious-activity" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="ip-restriction" className="font-medium">IP Restrictions</Label>
                        <p className="text-sm text-muted-foreground">Limit account access to specific IP addresses</p>
                      </div>
                      <Switch id="ip-restriction" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Security Settings</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={18} />
                    <span>Data Export</span>
                  </CardTitle>
                  <CardDescription>Download a copy of your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can request a copy of all your personal data that we have stored. 
                    This may take up to 48 hours to process.
                  </p>
                  <Button variant="outline">Request Data Export</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const Badge = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  return (
    <span 
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Settings;
