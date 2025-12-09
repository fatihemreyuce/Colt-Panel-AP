import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { useLoginState } from "@/hooks/use-login-state";
import { LayoutDashboard, LogOut, Sparkles, Sun, Moon, Users, Languages, UserCircle, Building2, Handshake, FileImage, Briefcase, Database, Bell, Mail, Layers, Box, MessageSquare, FileType, FileText, Settings } from "lucide-react";

interface NavItem {
	to: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	end?: boolean;
}

const navigationItems: NavItem[] = [
	{
		to: "/",
		label: "Kontrol Paneli",
		icon: LayoutDashboard,
		end: true,
	},
	{
		to: "/users",
		label: "Kullanıcılar",
		icon: Users,
		end: false,
	},
	{
		to: "/languages",
		label: "Diller",
		icon: Languages,
		end: false,
	},
	{
		to: "/team-members",
		label: "Takım Üyeleri",
		icon: UserCircle,
		end: false,
	},
	{
		to: "/eco-partners",
		label: "Eco Partnerler",
		icon: Building2,
		end: false,
	},
	{
		to: "/partners",
		label: "Partnerler",
		icon: Handshake,
		end: false,
	},
	{
		to: "/assets",
		label: "Medya",
		icon: FileImage,
		end: false,
	},
	{
		to: "/offices",
		label: "Ofisler",
		icon: Briefcase,
		end: false,
	},
	{
		to: "/backups",
		label: "Yedeklemeler",
		icon: Database,
		end: false,
	},
	{
		to: "/notifications",
		label: "Bildirimler",
		icon: Bell,
		end: false,
	},
	{
		to: "/notification-subscribers",
		label: "Bildirim Aboneleri",
		icon: Mail,
		end: false,
	},
	{
		to: "/component-types",
		label: "Bileşen Tipleri",
		icon: Layers,
		end: false,
	},
	{
		to: "/components",
		label: "Bileşenler",
		icon: Box,
		end: false,
	},
	{
		to: "/contact-forms",
		label: "İletişim Formları",
		icon: MessageSquare,
		end: false,
	},
	{
		to: "/page-types",
		label: "Sayfa Tipleri",
		icon: FileType,
		end: false,
	},
	{
		to: "/pages",
		label: "Sayfalar",
		icon: FileText,
		end: false,
	},
	{
		to: "/settings",
		label: "Ayarlar",
		icon: Settings,
		end: false,
	},
];

export default function Sidebar() {
	const { logout, isActionable, isLoading } = useLoginState();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch {
			// noop
		}
	};

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-sm dark:bg-card flex flex-col animate-in slide-in-from-left duration-300">
			{/* Header */}
			<div className="flex h-16 items-center px-6 border-b border-border shrink-0">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-foreground to-foreground/90 shadow-md">
						<Sparkles className="h-5 w-5 text-background" />
					</div>
					<div className="flex flex-col">
						<span className="text-base font-bold text-foreground leading-tight">
							Colt Panel
						</span>
						<span className="text-xs text-muted-foreground leading-tight font-medium">Kontrol Paneli</span>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1 min-h-0">
				{navigationItems.map((item, index) => {
					const Icon = item.icon;
					const isActive = item.end 
						? location.pathname === item.to 
						: location.pathname.startsWith(item.to);
					
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							style={{
								animationDelay: `${index * 30}ms`,
							}}
							className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 relative animate-in fade-in slide-in-from-left-4 ${
								isActive
									? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:translate-x-1"
							}`}
						>
							<Icon className={`h-4 w-4 shrink-0 transition-all duration-300 ${
								isActive 
									? "text-primary-foreground scale-110" 
									: "text-muted-foreground group-hover:text-accent-foreground group-hover:scale-110 group-hover:rotate-3"
							}`} />
							<span className="transition-all duration-300">{item.label}</span>
							{isActive && (
								<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full animate-in slide-in-from-left-2 duration-300" />
							)}
						</NavLink>
					);
				})}
			</nav>

			{/* Footer with dark mode toggle and logout */}
			<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card/50 backdrop-blur-sm dark:bg-card space-y-2">
				{/* Dark Mode Toggle */}
				<div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
					<div className="flex items-center gap-2.5">
						<Sun className="h-4 w-4 text-muted-foreground dark:hidden" />
						<Moon className="h-4 w-4 text-muted-foreground hidden dark:block" />
						<span className="text-sm font-semibold text-foreground">Tema</span>
					</div>
					<DarkModeToggle size="sm" />
				</div>
				
				{/* Logout Button */}
				<Button
					variant="ghost"
					onClick={handleLogout}
					disabled={!isActionable || isLoading}
					className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
					aria-busy={isLoading}
				>
					<LogOut className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
					{isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
				</Button>
			</div>
		</aside>
	);
}