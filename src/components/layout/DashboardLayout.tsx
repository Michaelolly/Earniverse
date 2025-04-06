
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronDown,
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Settings, 
  User,
  X,
  BarChart2,
  Gamepad2,
  CheckSquare,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const getInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.substring(0, 1).toUpperCase();
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <CheckSquare size={20} />,
    },
    {
      name: "Investments",
      path: "/investments",
      icon: <BarChart2 size={20} />,
    },
    {
      name: "Games",
      path: "/games",
      icon: <Gamepad2 size={20} />,
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: <Wallet size={20} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-border">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <span className="text-xl font-display font-bold gradient-text">Earniverse</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-earniverse-purple/10 text-earniverse-purple font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-earniverse-purple text-white text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {user?.email || "User"}
                </span>
                <ChevronDown size={16} className="ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem>
                  <User size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link to="/billing">
                <DropdownMenuItem>
                  <CreditCard size={16} className="mr-2" />
                  Billing
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut size={16} className="mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-white">
          <span className="text-xl font-display font-bold gradient-text">Earniverse</span>
          
          <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(true)}>
            <Menu size={24} />
            <span className="sr-only">Open menu</span>
          </Button>
        </header>
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xl font-display font-bold gradient-text">Earniverse</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)}>
                <X size={18} />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "bg-earniverse-purple/10 text-earniverse-purple font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-earniverse-purple text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email || ""}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut size={18} />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Page Content */}
        <main className="flex-1 bg-muted/30">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
