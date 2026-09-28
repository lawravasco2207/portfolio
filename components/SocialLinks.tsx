import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

const socials = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/lawravasco2207' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/' },
  { name: 'X', icon: Twitter, href: 'https://x.com/lawravasco' },
  { name: 'Email', icon: Mail, href: 'mailto:syokslawrence@gmail.com' },
];

export function SocialLinks({ label = 'Social and contact links' }: { label?: string }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {socials.map((social) => (
          <li key={social.name}>
            <a
              href={social.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <social.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{social.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
