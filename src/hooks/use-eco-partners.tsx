import { useAuthQuery } from "./use-auth-query";
import { getEcoPartners, createEcoPartner, updateEcoPartner, deleteEcoPartner, getEcoPartnerById } from "@/services/eco-partners.service";
import type { EcoPartnerRequest } from "@/types/eco-partners.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEcoPartners = () => {
	return useAuthQuery({
		queryKey: ["eco-partners"],
		queryFn: () => getEcoPartners(),
	});
};

export const useCreateEcoPartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ecoPartner: EcoPartnerRequest) => createEcoPartner(ecoPartner),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
			toast.success("Eco partner başarıyla oluşturuldu");
		},
		onError: () => {
			toast.error("Eco partner oluşturulurken bir hata oluştu");
		},
	});
};

export const useUpdateEcoPartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({id, ecoPartner}: {id: number, ecoPartner: EcoPartnerRequest}) => updateEcoPartner(id, ecoPartner),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
			toast.success("Eco partner başarıyla güncellendi");
		},
		onError: () => {
			toast.error("Eco partner güncellenirken bir hata oluştu");
		},
	});
};

export const useDeleteEcoPartner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteEcoPartner(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["eco-partners"] });
			toast.success("Eco partner başarıyla silindi");
		},
		onError: () => {
			toast.error("Eco partner silinirken bir hata oluştu");
		},
	});
};

export const useGetEcoPartnerById = (id: number) => {
	return useAuthQuery({
		queryKey: ["eco-partner", id],
		queryFn: () => getEcoPartnerById(id),
	});
};
