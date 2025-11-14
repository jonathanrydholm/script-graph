import type { NodeBlueprint } from "@script_graph/core"
import { Hexagon } from 'lucide-react'
import { List, ListItemButton, ListItemIcon, ListItemText, Stack } from "@mui/material"
import { useEffect, useMemo, useState } from "react"

const Blueprints = () => {

    const [ blueprints, setBlueprints ] = useState<NodeBlueprint[]>([])

    useEffect(() => {
        window.api.getInstalledNodes().then(setBlueprints)
    }, [])

    const renderedList = useMemo(() => {
            return blueprints.map(blueprint => (
                <ListItemButton key={blueprint.type} draggable
                    onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('application/json', JSON.stringify(blueprint));
                    }}>
                    <ListItemIcon>
                        <Hexagon color="#AFAFB1" />
                    </ListItemIcon>
                    <ListItemText primary={blueprint.name} sx={{ color: '#AFAFB1' }} />
                </ListItemButton>
            ))
        }, [blueprints])

    return (
        <Stack flex={1}>
            <List>
                {renderedList}
            </List>
        </Stack>
    )
}

export default Blueprints