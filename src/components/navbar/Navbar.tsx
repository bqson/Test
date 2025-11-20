"use client";

import React from 'react';
import { Mountain, Map, Users, MapPin, Book, MessageSquare, Navigation, Phone, Trophy, User, Menu, X } from 'lucide-react';

export default function AdventureMateNavbar() {
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [points, setPoints] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Mountain },
    { name: 'Routes', icon: Map },
    { name: 'Groups', icon: Users },
    { name: 'Destinations', icon: MapPin },
    { name: 'Trips', icon: Book },
    { name: 'Journal', icon: Book },
    { name: 'Forum', icon: MessageSquare },
  ];

  return (
    <div className="w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AdventureMate</span>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Navigation Icon - Hidden on small screens */}
            <button className="hidden sm:block p-2 rounded-lg hover:bg-secondary transition-colors">
              <Navigation className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Phone Icon - Hidden on small screens */}
            <button className="hidden sm:block p-2 rounded-lg hover:bg-secondary transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Points */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-3/10">
              <Trophy className="w-5 h-5 text-chart-3" />
              <span className="text-sm font-semibold text-chart-3">{points}</span>
            </div>

            {/* User Avatar */}
            <button className="w-9 h-9 rounded-full bg-linear-to-br from-accent to-primary flex items-center justify-center hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}