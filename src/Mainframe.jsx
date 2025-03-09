import { Route, Switch } from "wouter"
import AncientCitySimulation from "./components/AncientCityGenerator/AncientCityGenerator";
import ProceduralTexturesWorkspace from "./components/ProceduralTextures/ProceduralTexturesWorkspace";

function Mainframe() {
  return (
    <Switch>
      <Route path="/" exact>
        <AncientCitySimulation />
      </Route>
      <Route path="/textures" exact>
        <ProceduralTexturesWorkspace />
      </Route>
    </Switch>
  )
}

export default Mainframe