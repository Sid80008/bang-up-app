"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Heart } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 shadow-md w-full">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <Link to="/" className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
          <Heart className="h-6 w-6 mr-2 fill-current" />
          Consent-First Sex
        </Link>
        <nav className="flex space-x-2">
          <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/matches">
              <Users className="h-4 w-4 mr-2" />
              Matches
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;