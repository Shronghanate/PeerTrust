'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Handshake, Star, GitPullRequest } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/log-interaction', label: 'Log Interaction', icon: Handshake },
  { href: '/dashboard/give-feedback', label: 'Give Feedback', icon: Star },
  { href: '/dashboard/requests', label: 'Requests', icon: GitPullRequest },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon;
        // Check if the current pathname starts with the link's href.
        // This makes the 'Dashboard' link active for all sub-pages as well.
        // A special case for exact match on the main dashboard page.
        const isActive = link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);
        
        return (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} passHref>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={link.label}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
