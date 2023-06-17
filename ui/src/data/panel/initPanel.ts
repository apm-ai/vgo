import { DatasourceType, Panel, PanelType } from "types/dashboard";
import { initPanelPlugins } from "./initPlugins";
import { initPanelStyles } from "./initStyles";

export const initPanel = (id?) =>  {
    const p: Panel = {
        desc: "",
        collapsed: false,
        type: PanelType.Text,
        gridPos: { x: 0, y: 0, w: 12, h: 8 },
        plugins: initPanelPlugins,
        datasource: [{
            type: DatasourceType.TestData,
            selected: true,
            queryOptions: {
                interval: '15s'
            },
            queries: []
        }],
        useDatasource: false,
        styles: initPanelStyles
    }

    if (id) {
        p.id = id,
        p.title = `New panel ${id}`
    }

    return p
} 

