import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { useLoginState } from "@/hooks/use-login-state";
import { LayoutDashboard, LogOut, Sparkles, Sun, Moon, Users, Languages, UserCircle, Building2, Handshake } from "lucide-react";

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
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-sm dark:bg-card flex flex-col">
			{/* Header */}
			<div className="flex h-16 items-center px-6 border-b border-border shrink-0">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground shadow-sm">
						<Sparkles className="h-4 w-4 text-background" />
					</div>
					<div className="flex flex-col">
						<span className="text-base font-semibold text-foreground leading-tight">
							Colt Panel
						</span>
						<span className="text-xs text-muted-foreground leading-tight">Kontrol Paneli</span>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1 min-h-0">
				{navigationItems.map((item) => {
					const Icon = item.icon;
					const isActive = item.end 
						? location.pathname === item.to 
						: location.pathname.startsWith(item.to);
					
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 relative ${
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							}`}
						>
							<Icon className={`h-4 w-4 shrink-0 transition-colors ${
								isActive 
									? "text-primary-foreground" 
									: "text-muted-foreground group-hover:text-accent-foreground"
							}`} />
							<span>{item.label}</span>
						</NavLink>
					);
				})}
			</nav>

			{/* Footer with dark mode toggle and logout */}
			<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card/50 backdrop-blur-sm dark:bg-card space-y-2">
				{/* Dark Mode Toggle */}
				<div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
					<div className="flex items-center gap-2">
						<Sun className="h-4 w-4 text-muted-foreground dark:hidden" />
						<Moon className="h-4 w-4 text-muted-foreground hidden dark:block" />
						<span className="text-sm font-medium text-foreground">Tema</span>
					</div>
					<DarkModeToggle size="sm" />
				</div>
				
				{/* Logout Button */}
				<Button
					variant="ghost"
					onClick={handleLogout}
					disabled={!isActionable || isLoading}
					className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
					aria-busy={isLoading}
				>
					<LogOut className="h-4 w-4" />
					{isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
				</Button>
			</div>
		</aside>
	);
}