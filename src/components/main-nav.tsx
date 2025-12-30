'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, QrCode, Star, GitPullRequest } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/confirm-interaction', label: 'Confirm Interaction', icon: QrCode },
  { href: '/give-feedback', label: 'Give Feedback', icon: Star },
  { href: '/requests', label: 'Requests', icon: GitPullRequest },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon;
        // The dashboard link is active only on the exact path. Other links are active if the path starts with their href.
        const isActive = link.href === '/' ? pathname === link.href : pathname.startsWith(link.href);
        
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
