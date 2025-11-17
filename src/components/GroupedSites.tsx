"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface Site {
  id: string
  name: string
  url: string
}

interface Props {
  groupName: string
  sites: Site[]
  onDelete: (siteId: string) => void
}

export default function GroupedSites({ groupName, sites, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const [expanded, setExpanded] = useState(true)

  const confirmDelete = (site: Site) => {
    setSiteToDelete(site)
    setOpen(true)
  }

  const deleteNow = () => {
    if (siteToDelete) {
      onDelete(siteToDelete.id)
    }
    setOpen(false)
    setSiteToDelete(null)
  }

  return (
    <div className="border rounded-xl p-3 mb-4 bg-white shadow-sm">
      {/* Header del grupo */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{groupName}</h2>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Contenido del grupo */}
        <CollapsibleContent>
          <div className="mt-3 space-y-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{site.name}</p>
                  <p className="text-sm text-gray-500">{site.url}</p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => confirmDelete(site)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {sites.length === 0 && (
              <p className="text-sm text-gray-400 italic">No hay sitios en este grupo</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Modal de confirmación */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar sitio?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            ¿Seguro que deseas eliminar{" "}
            <strong>{siteToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteNow}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
