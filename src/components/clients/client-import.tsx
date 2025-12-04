import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/api"
import { useRouter } from "next/navigation"

interface ClientImportProps {
    workspaceId: string
    onSuccess?: () => void
}

export function ClientImport({ workspaceId, onSuccess }: ClientImportProps) {
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            // Assume Excel columns: Name, Website, DriveLink, Budget, Description, Tier
            for (const row of jsonData as any[]) {
                await createClient({
                    workspace_id: workspaceId,
                    name: row.Name || row.name,
                    website: row.Website || row.website,
                    drive_link: row.DriveLink || row.drive_link,
                    budget: Number(row.Budget || row.budget) || 0,
                    description: row.Description || row.description,
                    tier: (row.Tier || row.tier || "low").toLowerCase(),
                })
            }

            router.refresh()
            onSuccess?.()
            toast.success("Clients imported successfully!")
        } catch (error) {
            console.error("Import failed", error)
            toast.error("Failed to import clients")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="max-w-[200px]"
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">CSV Format</h4>
                        <p className="text-xs text-muted-foreground">
                            Your Excel/CSV file should have the following columns:
                        </p>
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                            Name, Website, DriveLink, Budget, Description, Tier
                        </div>
                        <div className="space-y-1 text-xs">
                            <p><strong>Name:</strong> Client name (required)</p>
                            <p><strong>Website:</strong> Client website URL</p>
                            <p><strong>DriveLink:</strong> Google Drive folder link</p>
                            <p><strong>Budget:</strong> Numeric value</p>
                            <p><strong>Description:</strong> Client description</p>
                            <p><strong>Tier:</strong> Basic, Professional, or Enterprise</p>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {uploading && <span className="text-sm text-muted-foreground">Importing...</span>}
        </div>
    )
}
