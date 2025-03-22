import { Route, Switch } from "wouter"
import AncientCitySimulation from "./components/AncientCityGenerator/AncientCityGenerator";
import ProceduralTexturesWorkspace from "./components/ProceduralTextures/ProceduralTexturesWorkspace";
import Extrusions from "./components/Extrusions/Extrusions";
import { Shapes } from "./components/Shapes/Shapes";
import { Garden } from "./components/Garden/Garden";
import { Cybermap } from "./components/Cybermap/Cybermap";
import Renoviant from "./components/LandingPage/Renoviant";
import Renoviant2 from "./components/LandingPage/Renoviant2";
import Renoviant3 from "./components/LandingPage/Renoviant3";

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
      <Route path="/garden" exact>
        <Garden />
      </Route>
      <Route path="/cybermap" exact>
        <Cybermap/>
      </Route>
      <Route path="/renoviant" exact>
        <Renoviant />
      </Route>
      <Route path="/renoviant2" exact>
        <Renoviant2 />
      </Route>
      <Route path="/renoviant3" exact>
        <Renoviant3 />
      </Route>
    </Switch>
  )
}

export default Mainframe