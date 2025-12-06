export interface backupRequest{
    type: "UPLOADS" | "DATABASE" | "FULL";
}

export interface backupResponse{
    id: number;
    filename: string;
    file_path?: string;
    filePath?: string; // Backend camelCase de döndürebilir
    file_size?: number;
    fileSize?: number; // Backend camelCase de döndürebilir
    backup_type: string;
    status: "IN_PROGRESS" | "SUCCESS" | "FAILED" | "COMPLETED";
    errorMessage?: string;
    createdAt?: string;
    expiresAt?: string;
}