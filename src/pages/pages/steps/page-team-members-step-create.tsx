import { useState } from "react";
import { useTeamMembers } from "@/hooks/use-team-members";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Users } from "lucide-react";
import type { TeamMemberResponse } from "@/types/team-members.types";

interface PageTeamMembersStepCreateProps {
	selectedTeamMembers: TeamMemberResponse[];
	onTeamMembersChange: (teamMembers: TeamMemberResponse[]) => void;
}

export function PageTeamMembersStepCreate({
	selectedTeamMembers,
	onTeamMembersChange,
}: PageTeamMembersStepCreateProps) {
	const { data: teamMembersData } = useTeamMembers("", 0, 1000, "id,ASC");

	const teamMembers = teamMembersData?.content || [];

	const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<number | null>(null);

	const handleAddTeamMember = () => {
		if (!selectedTeamMemberId) {
			return;
		}

		const teamMember = teamMembers.find((tm) => tm.id === selectedTeamMemberId);
		if (!teamMember) return;

		// Check if already added
		if (selectedTeamMembers.some((stm) => stm.id === selectedTeamMemberId)) {
			return;
		}

		onTeamMembersChange([...selectedTeamMembers, teamMember]);
		setSelectedTeamMemberId(null);
	};

	const handleRemoveTeamMember = (teamMemberId: number) => {
		onTeamMembersChange(selectedTeamMembers.filter((stm) => stm.id !== teamMemberId));
	};

	return (
		<div className="space-y-6">
			{/* Add Team Member Section */}
			<div className="rounded-lg border border-border p-6 bg-muted/50">
				<h3 className="text-h5 font-semibold text-foreground mb-4 flex items-center gap-2">
					<Plus className="h-5 w-5" />
					Takım Üyesi Ekle
				</h3>
				<div className="space-y-4">
					{/* Team Member Selection */}
					<div className="space-y-2">
						<Label className="text-p3 font-semibold">Takım Üyesi Seç</Label>
						<Select
							value={selectedTeamMemberId?.toString() || ""}
							onValueChange={(value) => setSelectedTeamMemberId(parseInt(value, 10))}
						>
							<SelectTrigger className="h-11">
								<SelectValue placeholder="Takım üyesi seçiniz" />
							</SelectTrigger>
							<SelectContent>
								{teamMembers.map((member) => {
									const isAlreadySelected = selectedTeamMembers.some(
										(stm) => stm.id === member.id
									);
									return (
										<SelectItem
											key={member.id}
											value={member.id.toString()}
											disabled={isAlreadySelected}
										>
											{member.name} ({member.email})
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					<Button
						onClick={handleAddTeamMember}
						disabled={!selectedTeamMemberId}
						className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Plus className="h-4 w-4 mr-2" />
						Takım Üyesi Ekle
					</Button>
				</div>
			</div>

			{/* Selected Team Members List */}
			<div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
				<div className="bg-muted/50 border-b border-border px-6 py-4">
					<h3 className="text-h5 font-semibold text-foreground flex items-center gap-2">
						<Users className="h-5 w-5" />
						Seçilen Takım Üyeleri ({selectedTeamMembers.length})
					</h3>
				</div>
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead>ID</TableHead>
							<TableHead>Ad</TableHead>
							<TableHead>E-posta</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{selectedTeamMembers.length > 0 ? (
							selectedTeamMembers.map((member) => (
								<TableRow key={member.id} className="hover:bg-muted/50 transition-colors">
									<TableCell className="font-medium">{member.id}</TableCell>
									<TableCell className="font-medium">{member.name}</TableCell>
									<TableCell>{member.email}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveTeamMember(member.id)}
											className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
											title="Kaldır"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-p3 text-muted-foreground">
									Henüz takım üyesi seçilmemiş
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

