import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Info, FileText, LogIn, Moon, Sun, Menu, MapPin, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CityServe
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" size="sm">
              <Info className="mr-2 h-4 w-4" />
              About
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="ghost" size="sm">
              <MapPin className="mr-2 h-4 w-4" />
              Track
            </Button>
          </Link>
          <Link to="/departments">
            <Button variant="ghost" size="sm">
              <Building2 className="mr-2 h-4 w-4" />
              Departments
            </Button>
          </Link>
          <Link to="/submit">
            <Button variant="ghost" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="default" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-3 mt-8">
                <Link to="/" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <Home className="mr-2 h-5 w-5" />
                    Home
                  </Button>
                </Link>
                <Link to="/about" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <Info className="mr-2 h-5 w-5" />
                    About
                  </Button>
                </Link>
                <Link to="/track" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <MapPin className="mr-2 h-5 w-5" />
                    Track
                  </Button>
                </Link>
                <Link to="/departments" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <Building2 className="mr-2 h-5 w-5" />
                    Departments
                  </Button>
                </Link>
                <Link to="/submit" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Submit
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setOpen(false)}>
                  <Button className="w-full justify-start" size="lg">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
