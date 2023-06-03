import { Box, Button, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure, VStack } from "@chakra-ui/react"
import { PanelAdd } from "components/icons/PanelAdd"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Dashboard, DatasourceType, Panel, PanelType } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import { Team } from "types/teams"
import DashboardHeader from "components/dashboard/DashboardHeader"
import DashboardGrid from "components/dashboard/grid/DashboardGrid"
import { cloneDeep, concat, has, isEqual } from "lodash"
import { TimeRange } from "types/time"
import { getInitTimeRange, initTimeRange } from "components/TimePicker"
import { Variable } from "types/variable"
import { setVariableSelected } from "components/variables/SelectVariables"
import { prevQueries, prevQueryData } from "components/dashboard/grid/PanelGrid"
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { unstable_batchedUpdates } from "react-dom"
import storage from "utils/localStorage"
import { StorageCopiedPanelKey } from "src/data/constants"
import { dispatch } from 'use-bus'
import { TimeChangedEvent, VariableChangedEvent } from "src/data/bus-events"

import { useImmer } from "use-immer"
import { setAutoFreeze } from "immer";
import { initGraphSettings } from "./plugins/panel/graph/Editor"
import { initTextSettings } from "./plugins/panel/text/Text"

setAutoFreeze(false)
// All of the paths that is not defined in pages directory will redirect to this page,
// generally these pages are defined in:
// 1. team's side menu, asscessed by a specific url path
// 2. dashboard page, accessed by a dashboard id
export let variables: Variable[] = []
const DashboardWrapper = ({dashboardId}) => {
    const [dashboard, setDashboard] = useImmer<Dashboard>(null)
    const [timeRange, setTimeRange] = useState<TimeRange>(getInitTimeRange())
    const [gVariables, setGVariables] = useState<Variable[]>([])
    
    
    useEffect(() => {
        load()

        return () => {
            for (const k in prevQueries) {
                delete prevQueries[k]
                delete prevQueryData[k]
            }
        }
    }, [])


    const load = async () => {
        const res = await requestApi.get(`/dashboard/byId/${dashboardId}`)
        const res0 = await requestApi.get(`/variable/all`)
        unstable_batchedUpdates(() => {
        setDashboard(cloneDeep(res.data))
        setGVariables(res0.data)
        setCombinedVariables(res0.data)
        })
    }


    // combine variables which defined separately in dashboard and global
    const setCombinedVariables = (gv?) => {
        const combined = concat(cloneDeep(dashboard?.data?.variables) ?? [], gv ?? gVariables)
        for (const v of combined) {
            v.values = v.value.split(",")
            // get the selected value for each variable from localStorage
        }
        setVariableSelected(combined)
        variables = combined
        dispatch(VariableChangedEvent)
      
    }



    useEffect(() => {
        setCombinedVariables()
    }, [dashboard?.data?.variables, gVariables])


    const onDashbardChange = useCallback( f => {
        setDashboard(f)
    },[])

    return (
        <>
            <PageContainer>
                {dashboard && <Box px="3" width="100%">
                    <DashboardHeader dashboard={dashboard} onTimeChange={t => {dispatch({type:  TimeChangedEvent,data: t});setTimeRange(t)}} timeRange={timeRange}  onChange={onDashbardChange} />
                    <Box mt={variables?.length > 0 ? "80px" : "50px"} py="2">
                        {dashboard.data.panels?.length > 0 && <DashboardGrid dashboard={dashboard} onChange={onDashbardChange} variables={variables} />}
                    </Box>
                </Box>}
            </PageContainer>
           
        </>
    )
}

export default DashboardWrapper


