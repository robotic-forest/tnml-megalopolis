import { Route, Switch } from "wouter"
import AncientCitySimulation from "./components/AncientCityGenerator/AncientCityGenerator";

function Mainframe() {
  return (
    <Switch>
      <Route path="/" exact>
        <AncientCitySimulation />
      </Route>
    </Switch>
  )
}

export default Mainframe