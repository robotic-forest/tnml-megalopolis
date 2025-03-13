import { Route, Switch } from "wouter"
import AncientCitySimulation from "./components/AncientCityGenerator/AncientCityGenerator";
import ProceduralTexturesWorkspace from "./components/ProceduralTextures/ProceduralTexturesWorkspace";
import Extrusions from "./components/Extrusions/Extrusions";

function Mainframe() {
  return (
    <Switch>
      <Route path="/" exact>
        <AncientCitySimulation />
      </Route>
      <Route path="/textures" exact>
        <ProceduralTexturesWorkspace />
      </Route>
      <Route path="/extrusions" exact>
        <Extrusions />
      </Route>
    </Switch>
  )
}

export default Mainframe