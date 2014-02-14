/**
 * Created by ian on 14/02/14.
 */

/**
 *
 * @param tNow the current time
 * @param objectives the array of objectives
 * @param scenario the current scenario state
 */
doObjectives = function (gameState, objectives, scenario, gameState) {
    var res;

    // ok, loop through the objectives
    for (var i = 0; i < objectives.length; i++) {
        var thisObj = objectives[i];
        res = handleThis(tNow, thisObj, scenario)
    }



}

handleThis = function (gameState, objective, scenario) {
    var thisType = objective.type;
    var res;

    switch (thisType) {
        case "SEQUENCE":

            var thisId = 0;

            // loop through all, or until we don't get a result object
            do
            {
                var child = objective.children[thisId++];
                handleThis(gameState, child, scenario);
            }
            while((thisId < objective.children.length) && (gameState.complete))

            // Blah
            break;
        case "PROXIMITY":
            res = handleProximity(gameState, objective, scenario);
            break;
    }

    if(res)
    {
        gameState.state = res;
    }
}

handleProximity = function(gameState, proximity, scenario)
{
    // ok, where has he got to get to?
    var dest = L.latLng(proximity.location);

    // where is v1
    var current = scenario.vessels[0].state.location;

    // what's the range?
    var range = rhumbDistanceFromTo(dest, current);

    console.log("range:" + range + " needs to be: " + proximity.range);

    if(range < proximity.range)
    {
        gameState.complete = "Success";
        gameState.message = proximity.success;
    }
}