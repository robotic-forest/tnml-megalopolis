import { Route, Switch } from "wouter"
import AncientCitySimulation from "./components/AncientCityGenerator/AncientCityGenerator";
import ProceduralTexturesWorkspace from "./components/ProceduralTextures/ProceduralTexturesWorkspace";
import Extrusions from "./components/Extrusions/Extrusions";
import { Shapes } from "./components/Shapes/Shapes";

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
      <Route path="/shapes" exact>
        <Shapes />
      </Route>
    </Switch>
  )
}

export default Mainframe