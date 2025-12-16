import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { useLoginState } from "@/hooks/use-login-state";
import { Home, LogOut, Sparkles, UserCog, Globe, UsersRound, Leaf, Handshake, Image, Building, HardDrive, Bell, Mail, Package, Boxes, MessageCircle, FileCode, FileText, Settings } from "lucide-react";

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
		icon: Home,
		end: true,
	},
	{
		to: "/users",
		label: "Kullanıcılar",
		icon: UserCog,
		end: false,
	},
	{
		to: "/languages",
		label: "Diller",
		icon: Globe,
		end: false,
	},
	{
		to: "/team-members",
		label: "Takım Üyeleri",
		icon: UsersRound,
		end: false,
	},
	{
		to: "/eco-partners",
		label: "Eco Partnerler",
		icon: Leaf,
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
		icon: Image,
		end: false,
	},
	{
		to: "/offices",
		label: "Ofisler",
		icon: Building,
		end: false,
	},
	{
		to: "/backups",
		label: "Yedeklemeler",
		icon: HardDrive,
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
		icon: Package,
		end: false,
	},
	{
		to: "/components",
		label: "Bileşenler",
		icon: Boxes,
		end: false,
	},
	{
		to: "/contact-forms",
		label: "İletişim Formları",
		icon: MessageCircle,
		end: false,
	},
	{
		to: "/page-types",
		label: "Sayfa Tipleri",
		icon: FileCode,
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
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/60 bg-background/98 backdrop-blur-md flex flex-col shadow-sm animate-in slide-in-from-left duration-300">
			{/* Header */}
			<header className="flex h-16 items-center justify-between px-5 border-b border-border/60 shrink-0 bg-background/95">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/70 border border-border/70">
						<Sparkles className="h-4 w-4 text-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
							Colt
						</span>
						<span className="text-sm font-semibold text-foreground leading-tight">
							Kontrol Paneli
						</span>
					</div>
				</div>
				{/* Theme Toggle */}
				<DarkModeToggle size="sm" />
			</header>

			{/* Navigation */}
			<nav className="flex flex-col gap-2 px-3 pt-4 pb-3 overflow-y-auto flex-1 min-h-0">
				<div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
					Genel
				</div>
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
							className={`group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
								isActive
									? "bg-foreground text-background shadow-sm"
									: "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
							}`}
						>
							<Icon
								className={`h-4 w-4 transition-transform duration-200 ${
									isActive ? "scale-105" : "group-hover:scale-110"
								}`}
							/>
							<span className="transition-colors duration-200 truncate">
								{item.label}
							</span>
						</NavLink>
					);
				})}
			</nav>

			{/* Footer with logout */}
			<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/60 bg-background/95 backdrop-blur-sm">
				<Button
					variant="ghost"
					onClick={handleLogout}
					disabled={!isActionable || isLoading}
					className="w-full justify-start gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
					aria-busy={isLoading}
				>
					<LogOut className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
					{isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
				</Button>
			</div>
		</aside>
	);
}