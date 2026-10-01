export const navLinks = [{ label: 'Projects', href: '#projects' }, { label: 'Skills', href: '#skills' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }]

export const skillGroups = [
  { title: 'Development', code: '01', items: [
    { name: 'HTML', icon: 'html', category: 'Markup Language', description: 'Semantic structure for dependable interfaces.' },
    { name: 'CSS', icon: 'css', category: 'Style Sheet Language', description: 'Responsive layout, typography, and visual systems.' },
    { name: 'JavaScript', icon: 'javascript', category: 'Programming Language', description: 'Interactive behavior for the web.' },
    { name: 'Flutter', icon: 'smartphone', category: 'UI Framework', description: 'Cross-platform mobile application development.' },
    { name: 'Python', icon: 'terminal', category: 'Programming Language', description: 'Automation, scripting, and practical tooling.' },
    { name: 'PHP', icon: 'braces', category: 'Programming Language', description: 'Backend application development.' },
    { name: 'Laravel', icon: 'blocks', category: 'Web Framework', description: 'Structured web systems and dashboards.' },
    { name: 'React', icon: 'react', category: 'UI Library', description: 'Component-based interfaces and interactive state for this portfolio.' },
    { name: 'Tailwind CSS', icon: 'tailwindcss', category: 'CSS Framework', description: 'CSS framework integrated through the Vite plugin and stylesheet.' },
  ] },
  { title: 'Tools & Platforms', code: '02', items: [
    { name: 'Vite', icon: 'vite', category: 'Build Tool', description: 'Development server and production builds for this portfolio.' },
    { name: 'ChatGPT', icon: 'sparkles', category: 'AI Assistant', description: 'AI-assisted research and development.' },
    { name: 'Claude', icon: 'sparkles', category: 'AI Assistant', description: 'AI-assisted analysis and engineering work.' },
    { name: 'Hermes Agent', icon: 'bot', category: 'AI Agent', description: 'Agent workflows, tools, and automation.' },
    { name: 'MariaDB', icon: 'database', category: 'Database', description: 'Relational data for web applications.' },
    { name: 'Telegram', icon: 'send', category: 'Communication', description: 'Messaging integrations and communication.' },
    { name: 'GitHub', icon: 'github', category: 'Code & Collaboration', description: 'Source control and public project collaboration.' },
  ] },
]

export const projects = [
  { number: '01', category: 'ANDROID / FLUTTER', name: 'Micro-Core v5.4', subtitle: 'Android APK release · version 5.4.0+16', description: 'A Flutter project with an Android release branch for Micro Core v5.4. Its release notes identify a ready-to-install APK at build/app/outputs/apk/release/app-release.apk.', details: ['Release branch: v5.4', 'Android APK release: 5.4.0+16', 'Built with Flutter / Dart', 'Release notes mention feature and UI updates merged from main'], tech: ['Flutter', 'Dart', 'Android'], version: 'v5.4', url: 'https://github.com/CeiiAslii/Micro-Core/tree/v5.4', actionLabel: 'View Source', secondaryUrl: 'https://t.me/coreang_kerjaand/13', secondaryLabel: 'View Release', visual: 'mobile', image: '/projects/micro-core-preview.png', imageAlt: 'Micro-Core dashboard showing router status, active connections, and interface traffic.' },
  { number: '02', category: 'ANDROID / KERNEL', name: 'Realme 8i Custom Kernel', subtitle: 'android_kernel_realme_mt6781', description: 'Android kernel source for the Realme 8i / MediaTek MT6781 platform. A systems-level project with kernel build configuration and source directories.', details: ['Repository: android_kernel_realme_mt6781', 'Default branch: lineage-21.0', 'Includes build.sh, Kconfig, and Kbuild', 'Target platform stated in the repository name: Realme MT6781'], tech: ['Android', 'Linux Kernel', 'MT6781', 'C / Build Tools'], url: 'https://github.com/CeiiAslii/android_kernel_realme_mt6781', actionLabel: 'View Source', visual: 'kernel', systemInfo: [['TARGET', 'Realme 8i'], ['PLATFORM', 'MT6781'], ['BRANCH', 'lineage-21.0'], ['TYPE', 'Kernel Source']] },
  { number: '03', category: 'WEB SYSTEM', name: 'PKL Management System', subtitle: 'Attendance, reporting, and workflow', description: 'A PKL management system with Murid, Guru, and Admin dashboards. It covers selfie + GPS attendance, daily reports, leave or sick requests, recaps, and Telegram integration.', details: ['Multi-role dashboards: Murid, Guru, and Admin', 'Selfie attendance with GPS location', 'Daily activity reports and leave / sick requests', 'Recaps and Telegram Bot integration'], tech: ['Laravel', 'PHP', 'MariaDB / MySQL', 'Tailwind CSS', 'Telegram Bot', 'GPS & Camera'], url: 'https://github.com/CeiiAslii/pkl-management-system', actionLabel: 'View Source', visual: 'dashboard', image: '/projects/e-pkl-dashboard.png', imageAlt: 'PKL Management System dashboard screenshot.' },
]
export const githubUrl = 'https://github.com/CeiiAslii'
export const contactLinks = { telegram: 'https://t.me/naniicikiwir', email: 'mailto:ceiingap@gmail.com' }
