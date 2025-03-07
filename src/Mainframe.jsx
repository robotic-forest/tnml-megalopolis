import { Route, Switch, Link } from "wouter";

function Mainframe() {
  return (
    <Switch>
      <Route path="/" exact>
        <div className="text-red-500">
          Hello World
        </div>
      </Route>
    </Switch>
  )
}

export default Mainframe